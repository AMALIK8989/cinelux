(() => {
    const scriptUrl = document.currentScript && document.currentScript.src;
    if (!scriptUrl) {
        console.error("Cinelux search could not determine its script URL.");
        return;
    }

    const siteRoot = new URL("../../", scriptUrl);
    const catalogUrl = new URL("../Api/Data.json", scriptUrl);
    const configUrl = new URL("../Api/algolia-config.json", scriptUrl);
    const hitsPerPage = 20;
    const attributesToRetrieve = [
        "objectID",
        "title",
        "description",
        "genres",
        "type",
        "year",
        "rating",
        "poster",
        "url"
    ];
    const styles = `
        .cx-search-trigger{position:fixed;right:24px;bottom:24px;z-index:1100;display:flex;align-items:center;gap:10px;padding:12px 18px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:#a71930;color:#fff;font:600 14px/1.2 system-ui,sans-serif;box-shadow:0 10px 32px rgba(0,0,0,.35);cursor:pointer}
        .cx-search-trigger:hover,.cx-search-trigger:focus-visible{background:#c52642;outline:2px solid #fff;outline-offset:3px}
        .cx-search-trigger kbd{padding:2px 6px;border:1px solid rgba(255,255,255,.35);border-radius:5px;font:12px/1.5 system-ui,sans-serif}
        .cx-search-overlay[hidden]{display:none}
        .cx-search-overlay{position:fixed;inset:0;z-index:1200;display:flex;align-items:flex-start;justify-content:center;padding:8vh 16px 24px;background:rgba(3,6,12,.82);backdrop-filter:blur(8px);font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
        .cx-search-dialog{width:min(900px,100%);max-height:84vh;overflow:hidden;border:1px solid rgba(255,255,255,.13);border-radius:18px;background:#10141e;color:#f5f6fa;box-shadow:0 24px 80px rgba(0,0,0,.55)}
        .cx-search-top{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid rgba(255,255,255,.1)}
        .cx-search-heading{margin:0;font-size:18px;font-weight:700}
        .cx-search-close{width:36px;height:36px;border:0;border-radius:8px;background:transparent;color:#ddd;font-size:25px;line-height:1;cursor:pointer}
        .cx-search-close:hover,.cx-search-close:focus-visible{background:rgba(255,255,255,.1);outline:2px solid #fff}
        .cx-search-controls{padding:18px 22px 14px}
        .cx-search-input-wrap{display:flex;align-items:center;gap:10px;padding:0 14px;border:1px solid rgba(255,255,255,.2);border-radius:10px;background:#090c13}
        .cx-search-input-wrap span{color:#c7c9d1;font-size:20px}
        .cx-search-input{width:100%;padding:14px 0;border:0;outline:0;background:transparent;color:#fff;font:16px system-ui,sans-serif}
        .cx-search-input::placeholder{color:#979ba7}
        .cx-search-filters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}
        .cx-search-filter{width:100%;padding:10px 12px;border:1px solid rgba(255,255,255,.16);border-radius:8px;background:#191e2a;color:#f4f4f6;font:14px system-ui,sans-serif}
        .cx-search-results{max-height:calc(84vh - 190px);overflow:auto;padding:0 22px 22px}
        .cx-search-count{margin:0 0 10px;color:#b9bdc8;font-size:13px}
        .cx-search-list{display:grid;gap:10px}
        .cx-search-result{display:grid;grid-template-columns:66px minmax(0,1fr) auto;align-items:center;gap:14px;padding:10px;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:rgba(255,255,255,.035);color:inherit;text-decoration:none}
        .cx-search-result:hover,.cx-search-result:focus-visible{border-color:#d23a54;background:rgba(255,255,255,.075);outline:none}
        .cx-search-poster{width:66px;height:88px;border-radius:7px;background:#272b35;object-fit:cover}
        .cx-search-result-title{margin:0 0 4px;color:#fff;font-size:15px;font-weight:700}
        .cx-search-result-meta{margin:0 0 5px;color:#ed8292;font-size:12px}
        .cx-search-result-description{display:-webkit-box;overflow:hidden;margin:0;color:#c0c3cc;font-size:13px;line-height:1.45;-webkit-box-orient:vertical;-webkit-line-clamp:2}
        .cx-search-result-arrow{padding:0 8px;color:#e57384;font-size:20px}
        .cx-search-empty{padding:24px 8px;color:#c0c3cc;text-align:center}
        .cx-search-more{display:block;margin:14px auto 0;padding:10px 18px;border:1px solid rgba(255,255,255,.2);border-radius:8px;background:#191e2a;color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer}
        .cx-search-more:hover,.cx-search-more:focus-visible{border-color:#d23a54;outline:none}
        .cx-search-more[hidden]{display:none}
        @media(max-width:600px){.cx-search-trigger{right:14px;bottom:14px;padding:11px 15px}.cx-search-trigger kbd{display:none}.cx-search-overlay{padding:3vh 10px}.cx-search-dialog{max-height:94vh}.cx-search-results{max-height:calc(94vh - 220px)}.cx-search-controls{padding:14px}.cx-search-top{padding:14px}.cx-search-filters{grid-template-columns:1fr}.cx-search-results{padding:0 14px 14px}.cx-search-result{grid-template-columns:52px minmax(0,1fr);gap:10px}.cx-search-poster{width:52px;height:72px}.cx-search-result-arrow{display:none}}
    `;

    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    document.head.append(styleElement);

    const trigger = document.createElement("button");
    trigger.className = "cx-search-trigger";
    trigger.type = "button";
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", "cx-search-overlay");
    trigger.innerHTML = '<span aria-hidden="true">⌕</span><span>Search titles</span><kbd>Ctrl K</kbd>';

    const overlay = document.createElement("div");
    overlay.className = "cx-search-overlay";
    overlay.id = "cx-search-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
        <section class="cx-search-dialog" role="dialog" aria-modal="true" aria-labelledby="cx-search-heading">
            <header class="cx-search-top">
                <h2 class="cx-search-heading" id="cx-search-heading">Find something to watch</h2>
                <button class="cx-search-close" type="button" aria-label="Close search">&times;</button>
            </header>
            <div class="cx-search-controls">
                <label class="cx-search-input-wrap">
                    <span aria-hidden="true">⌕</span>
                    <input class="cx-search-input" type="search" placeholder="Search movies and shows..." autocomplete="off" aria-label="Search movies and shows">
                </label>
                <div class="cx-search-filters">
                    <select class="cx-search-filter cx-search-genre" aria-label="Filter by genre">
                        <option value="">All genres</option>
                    </select>
                    <select class="cx-search-filter cx-search-type" aria-label="Filter by content type">
                        <option value="">All types</option>
                    </select>
                    <select class="cx-search-filter cx-search-sort" aria-label="Sort search results">
                        <option value="relevance">Most relevant</option>
                        <option value="title">Title A–Z</option>
                        <option value="newest">Newest first</option>
                    </select>
                </div>
            </div>
            <div class="cx-search-results" aria-live="polite">
                <p class="cx-search-count" role="status">Loading catalog…</p>
                <div class="cx-search-list"></div>
                <button class="cx-search-more" type="button" hidden>Load more</button>
            </div>
        </section>`;

    document.body.append(trigger, overlay);

    const input = overlay.querySelector(".cx-search-input");
    const genreFilter = overlay.querySelector(".cx-search-genre");
    const typeFilter = overlay.querySelector(".cx-search-type");
    const sortFilter = overlay.querySelector(".cx-search-sort");
    const count = overlay.querySelector(".cx-search-count");
    const results = overlay.querySelector(".cx-search-list");
    const moreButton = overlay.querySelector(".cx-search-more");
    const closeButton = overlay.querySelector(".cx-search-close");
    let initialization;
    let initialized = false;
    let catalog = [];
    let algoliaConfig;
    let requestController;
    let searchSequence = 0;
    let debounceTimer;
    let previousFocus;
    let currentPage = 0;
    let totalPages = 0;
    let totalHits = 0;

    const textOf = value => String(value || "").trim().toLocaleLowerCase();
    const typeLabel = value => ({ Movie: "Movies", "TV Show": "TV Shows", Short: "Short Films" })[value] || value;

    function closeSearch() {
        overlay.hidden = true;
        if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    }

    function openSearch() {
        previousFocus = document.activeElement;
        overlay.hidden = false;
        input.focus();
        if (!initialization) initialization = initialize();
    }

    function option(label, value) {
        const element = document.createElement("option");
        element.value = value;
        element.textContent = label;
        return element;
    }

    function isAlgoliaConfigured(config) {
        return config.enabled === true &&
            typeof config.appId === "string" &&
            /^[A-Za-z0-9]+$/.test(config.appId) &&
            typeof config.searchOnlyApiKey === "string" &&
            config.searchOnlyApiKey.length > 0 &&
            !config.searchOnlyApiKey.startsWith("YOUR_") &&
            typeof config.indexName === "string" &&
            /^[A-Za-z0-9_-]+$/.test(config.indexName);
    }

    async function initialize() {
        try {
            const [catalogResponse, configResponse] = await Promise.all([
                fetch(catalogUrl),
                fetch(configUrl)
            ]);
            if (!catalogResponse.ok) {
                throw new Error(`Catalog request failed with HTTP ${catalogResponse.status}.`);
            }
            if (!configResponse.ok) {
                throw new Error(`Algolia configuration request failed with HTTP ${configResponse.status}.`);
            }

            const [payload, config] = await Promise.all([
                catalogResponse.json(),
                configResponse.json()
            ]);
            if (!payload || !Array.isArray(payload.data)) {
                throw new Error("The catalog must contain a data array.");
            }
            if (!config || typeof config !== "object") {
                throw new Error("The Algolia configuration must be a JSON object.");
            }
            catalog = payload.data;
            algoliaConfig = config;

            if (config.enabled === true && !isAlgoliaConfigured(config)) {
                throw new Error("Algolia is enabled, but its App ID, Search-Only API Key, or index name is invalid.");
            }

            const genres = [...new Set(catalog.flatMap(item => Array.isArray(item.genres) ? item.genres : []))]
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b));
            const types = [...new Set(catalog.map(item => item.type).filter(Boolean))]
                .sort((a, b) => a.localeCompare(b));
            genres.forEach(value => genreFilter.append(option(value, value)));
            types.forEach(value => typeFilter.append(option(typeLabel(value), value)));
            initialized = true;
            await search({ append: false });
        } catch (error) {
            initialized = false;
            console.error("Cinelux search initialization failed.", error);
            count.textContent = error.message || "Search could not be initialized.";
        }
    }

    function score(item, query) {
        if (!query) return 0;
        const title = textOf(item.title);
        const genres = (item.genres || []).map(textOf);
        const description = textOf(item.description);
        if (title === query) return 3;
        if (title.startsWith(query)) return 2;
        if (title.includes(query) || genres.some(value => value.includes(query))) return 1;
        if (description.includes(query)) return 0.5;
        return -1;
    }

    function makeResult(item) {
        if (!item || typeof item.url !== "string" || !item.url.trim() || typeof item.title !== "string") {
            throw new Error("Algolia returned a result with an invalid title or URL.");
        }

        const link = document.createElement("a");
        link.className = "cx-search-result";
        link.href = new URL(item.url, siteRoot).href;

        const poster = document.createElement("img");
        poster.className = "cx-search-poster";
        poster.alt = "";
        poster.loading = "lazy";
        if (typeof item.poster === "string" && item.poster) {
            poster.src = new URL(item.poster, siteRoot).href;
        }
        poster.addEventListener("error", () => poster.removeAttribute("src"), { once: true });

        const content = document.createElement("div");
        const title = document.createElement("h3");
        title.className = "cx-search-result-title";
        title.textContent = item.title;

        const meta = document.createElement("p");
        meta.className = "cx-search-result-meta";
        const genres = Array.isArray(item.genres) ? item.genres.join(" · ") : "";
        meta.textContent = [typeLabel(item.type), item.year, genres].filter(Boolean).join(" · ");

        const description = document.createElement("p");
        description.className = "cx-search-result-description";
        description.textContent = item.description || "Open this title to see more details.";

        content.append(title, meta, description);
        const arrow = document.createElement("span");
        arrow.className = "cx-search-result-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "›";
        link.append(poster, content, arrow);
        return link;
    }

    function render(items, append) {
        if (!append) results.replaceChildren();
        if (items.length) {
            items.forEach(item => results.append(makeResult(item)));
        } else if (!append) {
            const empty = document.createElement("p");
            empty.className = "cx-search-empty";
            empty.textContent = "No titles match your search. Try another keyword or filter.";
            results.append(empty);
        }
        moreButton.hidden = currentPage + 1 >= totalPages;
    }

    function selectedFilters() {
        return [
            genreFilter.value ? `genres:${JSON.stringify(genreFilter.value)}` : "",
            typeFilter.value ? `type:${JSON.stringify(typeFilter.value)}` : ""
        ].filter(Boolean).join(" AND ");
    }

    function selectedIndex() {
        if (sortFilter.value === "title") return `${algoliaConfig.indexName}_title_asc`;
        if (sortFilter.value === "newest") return `${algoliaConfig.indexName}_year_desc`;
        return algoliaConfig.indexName;
    }

    async function searchAlgolia(query, page, signal) {
        const parameters = new URLSearchParams({
            query,
            page: String(page),
            hitsPerPage: String(hitsPerPage),
            facets: JSON.stringify(["genres", "type"]),
            attributesToRetrieve: JSON.stringify(attributesToRetrieve)
        });
        const filters = selectedFilters();
        if (filters) parameters.set("filters", filters);

        const endpoint = `https://${algoliaConfig.appId}-dsn.algolia.net/1/indexes/${encodeURIComponent(selectedIndex())}/query`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-algolia-application-id": algoliaConfig.appId,
                "x-algolia-api-key": algoliaConfig.searchOnlyApiKey
            },
            body: JSON.stringify({ params: parameters.toString() }),
            signal
        });
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload.message || `Algolia search failed with HTTP ${response.status}.`);
        }
        if (!Array.isArray(payload.hits) || !Number.isInteger(payload.nbPages) || !Number.isInteger(payload.nbHits)) {
            throw new Error("Algolia returned an invalid search response.");
        }
        return payload;
    }

    function searchLocal(query, page) {
        const filtered = catalog
            .filter(item => {
                const matchesQuery = !query || score(item, query) >= 0;
                const matchesGenre = !genreFilter.value || (item.genres || []).includes(genreFilter.value);
                const matchesType = !typeFilter.value || item.type === typeFilter.value;
                return matchesQuery && matchesGenre && matchesType;
            })
            .sort((a, b) => {
                if (sortFilter.value === "title") return a.title.localeCompare(b.title);
                if (sortFilter.value === "newest") return (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title);
                return score(b, query) - score(a, query) || a.title.localeCompare(b.title);
            });

        totalHits = filtered.length;
        totalPages = Math.ceil(totalHits / hitsPerPage);
        currentPage = page;
        return filtered.slice(page * hitsPerPage, (page + 1) * hitsPerPage);
    }

    async function search({ append = false } = {}) {
        if (!initialized) return;
        if (requestController) requestController.abort();
        requestController = new AbortController();
        const controller = requestController;
        const sequence = ++searchSequence;
        const query = input.value.trim();
        const page = append ? currentPage + 1 : 0;

        if (!append) {
            currentPage = 0;
            totalPages = 0;
            totalHits = 0;
            results.replaceChildren();
            count.textContent = "Searching…";
        } else {
            moreButton.disabled = true;
            moreButton.textContent = "Loading…";
        }

        try {
            let items;
            const hasFilters = Boolean(genreFilter.value || typeFilter.value);
            if (algoliaConfig && isAlgoliaConfigured(algoliaConfig) && query && !hasFilters) {
                const response = await searchAlgolia(query, page, controller.signal);
                currentPage = response.page;
                totalPages = response.nbPages;
                totalHits = response.nbHits;
                items = response.hits;
            } else {
                items = searchLocal(query, page);
            }

            if (sequence !== searchSequence) return;
            count.textContent = `${totalHits} ${totalHits === 1 ? "title" : "titles"} found`;
            render(items, append);
        } catch (error) {
            if (error.name === "AbortError" || sequence !== searchSequence) return;
            console.error("Cinelux search request failed.", error);
            if (!append) results.replaceChildren();
            count.textContent = error.message || "Search request failed. Please try again.";
            moreButton.hidden = true;
        } finally {
            if (sequence === searchSequence) {
                moreButton.disabled = false;
                moreButton.textContent = "Load more";
            }
        }
    }

    function scheduleSearch() {
        window.clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(() => {
            if (initialization) {
                void search();
            }
        }, 180);
    }

    trigger.addEventListener("click", openSearch);
    closeButton.addEventListener("click", closeSearch);
    moreButton.addEventListener("click", () => void search({ append: true }));
    overlay.addEventListener("click", event => {
        if (event.target === overlay) closeSearch();
    });
    input.addEventListener("input", scheduleSearch);
    genreFilter.addEventListener("change", () => void search());
    typeFilter.addEventListener("change", () => void search());
    sortFilter.addEventListener("change", () => void search());
    document.addEventListener("keydown", event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            if (overlay.hidden) openSearch();
            else input.focus();
        } else if (event.key === "Escape" && !overlay.hidden) {
            closeSearch();
        }
    });
})();
