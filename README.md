# Cinelux

<p>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" alt="HTML5" height="38">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" alt="CSS3" height="38">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" alt="JavaScript" height="38">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg" alt="Bootstrap" height="38">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" alt="Node.js" height="38">
</p>

Cinelux is a static movie and TV-show browsing website. It serves HTML, CSS, JavaScript, images, and JSON files, with Algolia powering the shared search experience. Netlify builds and publishes the static site and syncs its search catalog during deployment.

> **Rendering note:** Devicon icons are loaded from jsDelivr. Bootstrap CSS cannot reliably style a GitHub-rendered `README.md`: GitHub sanitizes external stylesheets and custom styling. This document uses standard Markdown for consistent rendering. The site itself loads Bootstrap 5.3.3 from jsDelivr.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Search catalog](#search-catalog)
- [Run and preview](#run-and-preview)
- [Deploy to Netlify](#deploy-to-netlify)
- [Environment variables](#environment-variables)
- [Update the catalog](#update-the-catalog)
- [Search behavior](#search-behavior)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## Features

- Static, multi-page movie and TV-show browsing.
- Genre landing pages and individual title pages.
- Shared search popup with query, genre and content-type filters.
- Search results with posters, descriptions, title links, and pagination.
- Algolia indexing of movies, TV shows, and shorts.
- Algolia replicas for alphabetical and newest-first sorting.
- Netlify build-time catalog validation, indexing, and static publishing.
- Local catalog search when Algolia is disabled in the site configuration.

The current search catalog contains **138 records**: 83 movies, 44 TV shows, and 11 shorts.

## Technology

| Area | Technology |
| --- | --- |
| Pages and layout | HTML5 |
| Styling | CSS3, Bootstrap 5.3.3 |
| Browser behavior and search UI | Vanilla JavaScript |
| Search service | Algolia |
| Hosting and build | Netlify |
| Build scripts | Node.js 22 |

Bootstrap is loaded by the site from the CDN:

```html
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
  rel="stylesheet"
>
<script
  src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
  defer
></script>
```

Devicon artwork is loaded from [jsDelivr's Devicon package](https://www.jsdelivr.com/package/gh/devicons/devicon).

## Project structure

```text
.
├── index.html                 # Home page
├── App.html                   # App / browsing page
├── Genre/                     # Genre landing pages
├── Genres/                    # Individual movie and TV-show pages
├── Assets/
│   ├── Api/
│   │   ├── Data.json          # Search catalog
│   │   ├── algolia-config.json # Browser config (disabled source placeholder)
│   │   └── ALGOLIA_SETUP.md   # Algolia and Netlify setup details
│   ├── Css/                   # Site styles
│   ├── Js/
│   │   └── site-search.js     # Shared search popup
│   └── Img*/                  # Poster and other image assets
├── scripts/
│   ├── netlify-build.mjs      # Indexes and stages the static site
│   └── sync-algolia.mjs       # Validates and syncs the catalog
├── netlify.toml               # Netlify build configuration
└── .gitignore
```

The Algolia build instructions are in [`Assets/Api/ALGOLIA_SETUP.md`](Assets/Api/ALGOLIA_SETUP.md).

## Search catalog

[`Assets/Api/Data.json`](Assets/Api/Data.json) contains the records used by search. Each record has this general shape:

```json
{
  "objectID": "Genres_Action_300",
  "title": "300",
  "description": "A short description of the title.",
  "genres": ["Action", "Adventure"],
  "type": "Movie",
  "year": 2007,
  "rating": null,
  "poster": "Assets/Img11/300-Info-Card.webp",
  "url": "Genres/Action/300.html"
}
```

Required fields are `objectID`, `title`, `description`, `genres`, `type`, `poster`, and `url`. `year` and `rating` may be omitted or `null`. Supported content types are `Movie`, `TV Show`, and `Short`.

Poster and page paths are relative to the site root. The indexer checks that those local files exist and that IDs are unique before making Algolia requests.

## Run and preview

No frontend package installation is required. The site consists of static files. Open the project with a static-site preview server, such as the VS Code Live Server extension, and browse to `index.html`.

The source Algolia config is intentionally disabled, so a local preview can use the catalog's local search mode. For a live Algolia sync from a developer machine, use Node.js 22 and see [Environment variables](#environment-variables).

## Deploy to Netlify

1. Push the repository to GitHub or another Git provider supported by Netlify.
2. In Netlify, choose **Add new site → Import an existing project** and select the repository.
3. Configure the required environment variables in **Project configuration → Environment variables** for each deploy context that should have working search.
4. Deploy the site.

[`netlify.toml`](netlify.toml) sets the build command to `node scripts/netlify-build.mjs`, selects Node.js 22, and publishes `dist/`.

The build script:

1. Runs the Algolia catalog validation and sync.
2. Configures searchable fields, facets, and sorting replicas.
3. Uploads the current catalog and removes records no longer present.
4. Writes a browser configuration containing only the Search-Only key.
5. Copies the public site into `dist/`, excluding build scripts and setup-only files.

The build fails if credentials are missing or invalid, a record fails validation, or Algolia rejects a request. After editing catalog data, deploy again to refresh the Algolia index.

## Environment variables

Set these variables in the Netlify dashboard; do not commit credentials:

| Variable | Required | Description |
| --- | --- | --- |
| `ALGOLIA_APP_ID` | Yes | Algolia application ID. |
| `ALGOLIA_ADMIN_API_KEY` | Yes | Secret Admin key used only by the build to configure and update the index. |
| `ALGOLIA_SEARCH_ONLY_API_KEY` | Yes | Search-Only key used by the browser. It is public by design. |
| `ALGOLIA_INDEX_NAME` | No | Base index name; defaults to `cinelux_titles`. |

For local indexing, `scripts/sync-algolia.mjs` optionally loads `scripts/.env`. Keep the Admin key in that untracked file. `.gitignore` excludes `scripts/.env`. A local env file does **not** configure Netlify; add the variables in the Netlify dashboard as well.

Example variable names only—use your own values and never commit real credentials:

```dotenv
ALGOLIA_APP_ID=your_algolia_application_id
ALGOLIA_ADMIN_API_KEY=your_secret_admin_key
ALGOLIA_SEARCH_ONLY_API_KEY=your_search_only_key
ALGOLIA_INDEX_NAME=cinelux_titles
```

## Update the catalog

1. Add or edit a record in `Assets/Api/Data.json`.
2. Verify its `objectID` is unique and its `type` is supported.
3. Confirm its poster and page paths point to existing files, relative to the site root.
4. Deploy the site. Netlify validates and syncs the catalog before publishing.

To validate the catalog without sending requests to Algolia, run:

```sh
node scripts/sync-algolia.mjs --dry-run
```

This dry run checks record fields, IDs, supported types, and local poster/page files. It does not configure or update Algolia.

## Search behavior

- Search is initialized by `Assets/Js/site-search.js` on pages that include the shared search script.
- Searchable attributes are title, genres, and description.
- Genre and content type are Algolia facets.
- Results are requested 20 at a time.
- Sorting uses the primary index for relevance, a title-ascending replica, or a year-descending replica.
- When the source config has `enabled: false`, the popup searches the downloaded local catalog without sending Algolia requests.
- The production build writes the Search-Only configuration after a successful index sync.

Do not put the Admin API key in `Assets/Api/algolia-config.json` or any browser-delivered file.

## Security

- Treat `ALGOLIA_ADMIN_API_KEY` as a secret. Store it only in Netlify's environment variables or an ignored local env file.
- Use a Search-Only key in browser requests; restrict it to search permissions and configure allowed origins/referrers where available.
- Never publish `.env` files, API keys, or other credentials in the repository.
- If an Admin key is accidentally exposed, revoke it in Algolia and replace the Netlify environment variable.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Netlify reports a missing variable | Add all three required Algolia variables to the Netlify deploy context. |
| Algolia rejects the build request | Verify the App ID and Admin key, and ensure the key can manage the index and settings. |
| Search is local instead of Algolia-backed | Check that the deployment completed successfully and that the generated browser config contains the correct App ID, index, and Search-Only key. |
| A catalog validation error names a missing file | Correct the `poster` or `url` path in `Data.json`; paths are relative to the site root and case-sensitive on Netlify. |
| Search results do not appear on a page | Check that the page loads `Assets/Js/site-search.js` and that the catalog and config JSON files load successfully. |

For detailed deployment setup, see [`Assets/Api/ALGOLIA_SETUP.md`](Assets/Api/ALGOLIA_SETUP.md).
