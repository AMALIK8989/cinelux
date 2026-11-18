import { execFileSync } from "node:child_process";
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const publishDirectory = resolve(projectRoot, "dist");
const excludedRootEntries = new Set([
    ".git",
    ".kilo",
    ".netlify",
    ".vscode",
    "dist",
    "netlify.toml",
    "node_modules",
    "scripts"
]);
const excludedFiles = new Set([
    "Assets/Api/ALGOLIA_SETUP.md"
]);

execFileSync(process.execPath, [resolve(projectRoot, "scripts", "sync-algolia.mjs")], {
    cwd: projectRoot,
    stdio: "inherit"
});

await rm(publishDirectory, { recursive: true, force: true });
await mkdir(publishDirectory, { recursive: true });

for (const entry of await readdir(projectRoot, { withFileTypes: true })) {
    if (excludedRootEntries.has(entry.name) || entry.name.startsWith(".env")) continue;
    await cp(resolve(projectRoot, entry.name), resolve(publishDirectory, entry.name), {
        recursive: true,
        filter(source) {
            const relativePath = relative(projectRoot, source).replaceAll("\\", "/");
            return !excludedFiles.has(relativePath) && !relativePath.split("/").some(part => part.startsWith(".env"));
        }
    });
}

console.log(`Prepared static Netlify publish directory: ${relative(projectRoot, publishDirectory)}.`);
