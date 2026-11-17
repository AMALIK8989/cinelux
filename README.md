<h1 align="center">🎬 Cinelux</h1>

<p align="center">
  <strong>Your next movie night starts here.</strong><br>
  Browse movies and TV shows, explore genres, and search one shared catalog.
</p>

<p align="center">
  <a href="https://cineluxx.netlify.app/" target="_blank" rel="noopener noreferrer">
    <strong>▶ Visit Cinelux</strong>
  </a>
</p>

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" alt="HTML5" height="44">
  &nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" alt="CSS3" height="44">
  &nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" alt="JavaScript" height="44">
  &nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg" alt="Bootstrap" height="44">
  &nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" alt="Node.js" height="44">
  &nbsp;&nbsp;
  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpUwva4l5u1aBVXMYCRbaHYz41hSUXWVRx_PoYy3Lr8zPZTHQUPiltcog&s=10" alt="Algolia" height="38">
</p>

<p align="center">
  <strong>HTML5 · CSS3 · JavaScript · Bootstrap · Node.js · Algolia · Netlify</strong>
</p>

<p align="center">
  <em>Static site · No frontend package installation required</em>
</p>

---

## ✨ Features

- Browse movies and TV shows across genre landing pages and individual title pages.
- Search through a shared popup with query, genre, and content-type filters.
- View results with posters, descriptions, title links, and pagination.
- Sort results by relevance, title, or newest first.
- Search the local catalog when Algolia is disabled in the site configuration.
- Validate and sync the search catalog during Netlify builds.
- Publish a static site without a frontend framework or package-install step.

> **Catalog:** 138 records — 83 movies, 44 TV shows, and 11 shorts.

## 🧰 Technology

| Area | Technology |
| --- | --- |
| Pages and layout | HTML5 |
| Styling | CSS3, Bootstrap 5.3.3 |
| Browser behavior and search UI | Vanilla JavaScript |
| Search service | Algolia |
| Hosting and deployment | Netlify |
| Build scripts | Node.js 22 |

The website loads Bootstrap 5.3.3 from jsDelivr:

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

> **README styling note:** GitHub sanitizes README content and does not reliably load external stylesheets or scripts. Bootstrap styles the website itself, but Bootstrap classes alone won’t style this GitHub-rendered README.

## 📁 Project structure

```text
.
├── index.html                  # Home page
├── App.html                    # Browsing page
├── Genre/                      # Genre landing pages
├── Genres/                     # Individual movie and TV-show pages
├── Assets/
│   ├── Api/
│   │   ├── Data.json           # Search catalog
│   │   ├── algolia-config.json # Browser config (disabled source placeholder)
│   │   └── ALGOLIA_SETUP.md    # Algolia and Netlify setup guide
│   ├── Css/                    # Site styles
│   ├── Js/
│   │   └── site-search.js      # Shared search popup
│   └── Img*/                   # Posters and other image assets
├── scripts/
│   ├── netlify-build.mjs       # Indexes and stages the static site
│   └── sync-algolia.mjs        # Validates and syncs the catalog
├── netlify.toml                # Netlify build configuration
└── .gitignore
```

For the detailed Algolia setup, see [`Assets/Api/ALGOLIA_SETUP.md`](Assets/Api/ALGOLIA_SETUP.md).

## 🚀 Run locally

Cinelux is a static site, so no frontend package installation is required.

1. Open the project with a static-site preview server, such as the VS Code Live Server extension.
2. Browse to `index.html`.

The source Algolia configuration is intentionally disabled. A local preview can therefore search the downloaded catalog without sending requests to Algolia.

To validate the catalog locally, use Node.js 22 and run:

```sh
node scripts/sync-algolia.mjs --dry-run
```

The dry run checks record fields, unique IDs, supported content types, and local poster and page files. It does **not** configure or update Algolia.

## 🔎 Search catalog

[`Assets/Api/Data.json`](Assets/Api/Data.json) contains the records used by search. A record follows this general structure:

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

**Required fields:** `objectID`, `title`, `description`, `genres`, `type`, `poster`, and `url`.

`year` and `rating` may be omitted or set to `null`. Supported content types are `Movie`, `TV Show`, and `Short`.

Poster and page paths are relative to the site root. Before making Algolia requests, the indexer checks that those local files exist and that record IDs are unique.

### Add or update a title

1. Add or edit a record in `Assets/Api/Data.json`.
2. Make sure its `objectID` is unique and its `type` is supported.
3. Check that the poster and page paths exist and are relative to the site root.
4. Run the dry-run validation command.
5. Deploy the site to sync the catalog to Algolia.

## 🌐 Deploy to Netlify

1. Push the repository to GitHub or another Git provider supported by Netlify.
2. In Netlify, select **Add new site → Import an existing project** and choose the repository.
3. Add the required Algolia environment variables for each deploy context that should have working search.
4. Deploy the site.

[`netlify.toml`](netlify.toml) sets the build command to `node scripts/netlify-build.mjs`, selects Node.js 22, and publishes `dist/`.

During the build, the script:

1. Validates the catalog and syncs it to Algolia.
2. Configures searchable fields, facets, and sorting replicas.
3. Uploads the current catalog and removes records no longer present.
4. Writes browser configuration containing only the Search-Only key.
5. Copies the public site into `dist/`, excluding build scripts and setup-only files.

The build fails if credentials are missing or invalid, a record fails validation, or Algolia rejects a request. Deploy again after editing the catalog to refresh the Algolia index.

## 🔐 Environment variables

Set these variables in the Netlify dashboard. **Do not commit credentials.**

| Variable | Required | Description |
| --- | :---: | --- |
| `ALGOLIA_APP_ID` | Yes | Algolia application ID |
| `ALGOLIA_ADMIN_API_KEY` | Yes | Secret Admin key used by the build to configure and update the index |
| `ALGOLIA_SEARCH_ONLY_API_KEY` | Yes | Search-Only key used by browser search |
| `ALGOLIA_INDEX_NAME` | No | Base index name; defaults to `cinelux_titles` |

For local indexing, `scripts/sync-algolia.mjs` optionally loads `scripts/.env`. Keep the Admin key in that untracked file. `.gitignore` excludes `scripts/.env`; a local env file does not configure Netlify.

Example variable names only—use your own values and never commit real credentials:

```dotenv
ALGOLIA_APP_ID=your_algolia_application_id
ALGOLIA_ADMIN_API_KEY=your_secret_admin_key
ALGOLIA_SEARCH_ONLY_API_KEY=your_search_only_key
ALGOLIA_INDEX_NAME=cinelux_titles
```

## ⚙️ Search behavior

- `Assets/Js/site-search.js` initializes search on pages that include the shared search script.
- Searchable attributes are title, genres, and description.
- Genre and content type are Algolia facets.
- Results are requested 20 at a time.
- The primary index provides relevance sorting; replicas provide title-ascending and year-descending sorting.
- When the source config has `enabled: false`, the popup searches the downloaded local catalog without making Algolia requests.
- The production build writes the Search-Only configuration after a successful index sync.

**Never put the Admin API key in `Assets/Api/algolia-config.json` or any other browser-delivered file.**

## 🛡️ Security

- Store `ALGOLIA_ADMIN_API_KEY` only in Netlify environment variables or an ignored local env file.
- Use a Search-Only key in browser requests. Restrict its permissions and configure allowed origins or referrers where available.
- Never publish `.env` files, API keys, or other credentials in the repository.
- If an Admin key is exposed, revoke it in Algolia and replace the Netlify environment variable.

## 🧯 Troubleshooting

| Symptom | Check |
| --- | --- |
| Netlify reports a missing variable | Add all three required Algolia variables to the relevant deploy context. |
| Algolia rejects a build request | Verify the App ID and Admin key, and confirm the key can manage the index and its settings. |
| Search uses local mode instead of Algolia | Check that the deployment succeeded and that the generated browser config contains the correct App ID, index, and Search-Only key. |
| Catalog validation reports a missing file | Correct the `poster` or `url` path in `Data.json`. Paths are relative to the site root and case-sensitive on Netlify. |
| Search results don’t appear | Confirm the page loads `Assets/Js/site-search.js` and that the catalog and config JSON files load successfully. |

For the full deployment guide, see [`Assets/Api/ALGOLIA_SETUP.md`](Assets/Api/ALGOLIA_SETUP.md).

---

<p align="center">
  <sub>Devicon icons are served from jsDelivr. The Algolia logo image is loaded from the URL provided for this README.</sub>
</p>
