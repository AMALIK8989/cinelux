import { access, readFile, writeFile } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dataPath = resolve(projectRoot, "Assets", "Api", "Data.json");
const localEnvPath = resolve(projectRoot, "scripts", ".env");
try {
    await access(localEnvPath);
    process.loadEnvFile(localEnvPath);
} catch (error) {
    if (error.code !== "ENOENT") throw error;
}

const appId = process.env.ALGOLIA_APP_ID;
const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY;
const searchOnlyApiKey = process.env.ALGOLIA_SEARCH_ONLY_API_KEY;
const indexName = process.env.ALGOLIA_INDEX_NAME || "cinelux_titles";
const dryRun = process.argv.includes("--dry-run");

if (!/^[A-Za-z0-9_-]+$/.test(indexName)) {
    throw new Error("ALGOLIA_INDEX_NAME may only contain letters, numbers, underscores, and hyphens.");
}

const catalog = JSON.parse(await readFile(dataPath, "utf8"));
if (!Array.isArray(catalog.data) || catalog.data.length === 0) {
    throw new Error(`${dataPath} must contain a non-empty data array.`);
}

const seenIds = new Set();
const records = await Promise.all(catalog.data.map(async (record, position) => {
    const label = `Data.json record ${position + 1}`;
    if (!record || typeof record !== "object" || Array.isArray(record)) {
        throw new Error(`${label} must be an object.`);
    }

    const { objectID, title, description, genres, type, poster, url } = record;
    if (typeof objectID !== "string" || !objectID.trim()) {
        throw new Error(`${label} is missing a non-empty string objectID.`);
    }
    if (seenIds.has(objectID)) {
        throw new Error(`Duplicate Algolia objectID "${objectID}".`);
    }
    seenIds.add(objectID);

    if (typeof title !== "string" || !title.trim()) {
        throw new Error(`${label} (${objectID}) is missing a non-empty title.`);
    }
    if (typeof description !== "string" || !description.trim()) {
        throw new Error(`${label} (${objectID}) must have a non-empty string description.`);
    }
    if (!Array.isArray(genres) || genres.some(genre => typeof genre !== "string" || !genre.trim())) {
        throw new Error(`${label} (${objectID}) must have a genres array of non-empty strings.`);
    }
    if (!["Movie", "TV Show", "Short"].includes(type)) {
        throw new Error(`${label} (${objectID}) has an unsupported type "${type}".`);
    }
    if (typeof poster !== "string" || !poster.trim() || typeof url !== "string" || !url.trim()) {
        throw new Error(`${label} (${objectID}) must have non-empty poster and url values.`);
    }

    async function validateLocalFile(value, attribute) {
        if (value.startsWith("/") || value.includes("\\") || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(value)) {
            throw new Error(`${label} (${objectID}) ${attribute} must be a site-root-relative local file path.`);
        }
        let decoded;
        try {
            decoded = decodeURIComponent(value);
        } catch {
            throw new Error(`${label} (${objectID}) ${attribute} contains invalid URL encoding.`);
        }
        const filePath = resolve(projectRoot, decoded);
        const relativePath = relative(projectRoot, filePath);
        if (relativePath.startsWith(`..${sep}`) || relativePath === ".." || isAbsolute(relativePath)) {
            throw new Error(`${label} (${objectID}) ${attribute} must stay within the project directory.`);
        }
        try {
            await access(filePath);
        } catch {
            throw new Error(`${label} (${objectID}) ${attribute} does not exist: ${value}`);
        }
    }

    await Promise.all([
        validateLocalFile(poster.trim(), "poster"),
        validateLocalFile(url.trim(), "url")
    ]);

    const normalized = {
        objectID,
        title: title.trim(),
        description: description.trim(),
        genres: [...new Set(genres.map(genre => genre.trim()))],
        type,
        poster: poster.trim(),
        url: url.trim()
    };

    if (record.year !== null && record.year !== undefined) {
        if (!Number.isInteger(record.year) || record.year < 1888 || record.year > 2200) {
            throw new Error(`${label} (${objectID}) has an invalid year.`);
        }
        normalized.year = record.year;
    }
    if (record.rating !== null && record.rating !== undefined) {
        if (typeof record.rating !== "number" || !Number.isFinite(record.rating) || record.rating < 0 || record.rating > 10) {
            throw new Error(`${label} (${objectID}) has an invalid rating; expected a number from 0 to 10.`);
        }
        normalized.rating = record.rating;
    }

    return normalized;
}));

if (dryRun) {
    const typeCounts = Object.fromEntries(
        [...new Set(records.map(record => record.type))]
            .sort()
            .map(type => [type, records.filter(record => record.type === type).length])
    );
    console.log(`Validation passed: ${records.length} Algolia records.`);
    console.log("Content types:", typeCounts);
    console.log("All objectIDs are unique; required fields and local poster/page files are valid.");
    console.log("No Algolia requests were made (--dry-run).");
    process.exit(0);
}

if (!appId || !/^[A-Za-z0-9]+$/.test(appId)) {
    throw new Error("Set ALGOLIA_APP_ID to a valid Algolia application ID.");
}
if (!adminApiKey) {
    throw new Error("Set ALGOLIA_ADMIN_API_KEY in the deployment environment.");
}
if (!searchOnlyApiKey || searchOnlyApiKey.startsWith("YOUR_")) {
    throw new Error("Set ALGOLIA_SEARCH_ONLY_API_KEY to an Algolia Search-Only API Key.");
}
if (adminApiKey === searchOnlyApiKey) {
    throw new Error("ALGOLIA_SEARCH_ONLY_API_KEY must not be the Admin API Key.");
}

const headers = {
    "content-type": "application/json",
    "x-algolia-application-id": appId,
    "x-algolia-api-key": adminApiKey
};
const baseUrl = `https://${appId}.algolia.net/1/indexes`;
const encodeIndex = name => encodeURIComponent(name);
const replicas = [`${indexName}_title_asc`, `${indexName}_year_desc`];
const primarySettings = {
    searchableAttributes: ["title", "unordered(genres)", "description"],
    attributesForFaceting: ["searchable(genres)", "searchable(type)"],
    attributesToRetrieve: [
        "objectID",
        "title",
        "description",
        "genres",
        "type",
        "year",
        "rating",
        "poster",
        "url"
    ],
    attributesToHighlight: ["title"],
    replicas,
    hitsPerPage: 20,
    maxValuesPerFacet: 100
};

async function algoliaRequest(path, body, method = "POST") {
    const response = await fetch(`${baseUrl}/${path}`, {
        method,
        headers,
        ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
    const responseText = await response.text();
    let result;
    try {
        result = responseText ? JSON.parse(responseText) : {};
    } catch {
        result = { message: responseText };
    }
    if (!response.ok) {
        const message = result.message || result.error || response.statusText;
        throw new Error(`Algolia request failed (${response.status}): ${message}`);
    }
    return result;
}

async function waitForTask(taskId, targetIndex) {
    const path = `${encodeIndex(targetIndex)}/task/${taskId}`;
    for (let attempt = 0; attempt < 120; attempt += 1) {
        const result = await algoliaRequest(path, undefined, "GET");
        if (result.status === "published") return;
        await new Promise(resolvePromise => setTimeout(resolvePromise, 1000));
    }
    throw new Error(`Timed out waiting for Algolia task ${taskId} on "${targetIndex}".`);
}

const settingsTask = await algoliaRequest(`${encodeIndex(indexName)}/settings`, primarySettings, "PUT");
if (!Number.isInteger(settingsTask.taskID)) {
    throw new Error(`Algolia did not return a task ID while updating "${indexName}" settings.`);
}
await waitForTask(settingsTask.taskID, indexName);
console.log(`Applied searchable fields, facets, and replica settings to "${indexName}".`);

for (const [replicaName, customRanking] of [
    [replicas[0], ["asc(title)"]],
    [replicas[1], ["desc(year)"]]
]) {
    const task = await algoliaRequest(`${encodeIndex(replicaName)}/settings`, {
        searchableAttributes: primarySettings.searchableAttributes,
        attributesForFaceting: primarySettings.attributesForFaceting,
        attributesToRetrieve: primarySettings.attributesToRetrieve,
        customRanking,
        hitsPerPage: 20
    }, "PUT");
    if (!Number.isInteger(task.taskID)) {
        throw new Error(`Algolia did not return a task ID while updating "${replicaName}" settings.`);
    }
    await waitForTask(task.taskID, replicaName);
    console.log(`Configured sort replica "${replicaName}".`);
}

const batchSize = 500;
const desiredIds = new Set(records.map(record => record.objectID));
const existingIds = new Set();
let cursor;
do {
    const browseRequest = cursor
        ? { cursor }
        : { attributesToRetrieve: ["objectID"], hitsPerPage: 1000 };
    const page = await algoliaRequest(`${encodeIndex(indexName)}/browse`, browseRequest);
    if (!Array.isArray(page.hits)) {
        throw new Error(`Algolia returned an invalid browse response for "${indexName}".`);
    }
    for (const hit of page.hits) {
        if (typeof hit.objectID === "string") existingIds.add(hit.objectID);
    }
    cursor = page.cursor;
} while (cursor);

const staleIds = [...existingIds].filter(objectID => !desiredIds.has(objectID));
for (let offset = 0; offset < staleIds.length; offset += batchSize) {
    const chunk = staleIds.slice(offset, offset + batchSize);
    const task = await algoliaRequest(`${encodeIndex(indexName)}/batch`, {
        requests: chunk.map(objectID => ({ action: "deleteObject", body: { objectID } }))
    });
    if (!Number.isInteger(task.taskID)) {
        throw new Error(`Algolia did not return a task ID while removing stale records from "${indexName}".`);
    }
    await waitForTask(task.taskID, indexName);
}
if (staleIds.length) console.log(`Removed ${staleIds.length} stale records.`);

for (let offset = 0; offset < records.length; offset += batchSize) {
    const chunk = records.slice(offset, offset + batchSize);
    const task = await algoliaRequest(`${encodeIndex(indexName)}/batch`, {
        requests: chunk.map(body => ({ action: "addObject", body }))
    });
    if (!Number.isInteger(task.taskID)) {
        throw new Error(`Algolia did not return a task ID while indexing "${indexName}".`);
    }
    await waitForTask(task.taskID, indexName);
    console.log(`Indexed ${Math.min(offset + chunk.length, records.length)} / ${records.length} records.`);
}

console.log(`Algolia sync completed for "${indexName}" (${records.length} records).`);

const publicConfig = {
    enabled: true,
    appId,
    searchOnlyApiKey,
    indexName
};
const configPath = resolve(projectRoot, "Assets", "Api", "algolia-config.json");
await writeFile(configPath, `${JSON.stringify(publicConfig, null, 2)}\n`, "utf8");
console.log("Generated the public search-only configuration for the static site.");
