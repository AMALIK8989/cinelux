# Algolia + Netlify setup

The site stays static. Netlify runs the Algolia indexing script during every deploy, then publishes the static site from `dist/`. No PowerShell or local indexing command is needed to deploy.

## 1. Create Algolia keys

In Algolia, create an application and two API keys:

- **Admin API Key**: used only during the Netlify build to configure and update the index.
- **Search-Only API Key**: used by the browser for search requests. Restrict its permissions to search and, where supported, restrict it to your production site's HTTP referrer.

Choose an application ID and index name (`cinelux_titles` by default).

## 2. Add Netlify environment variables

In Netlify, open your site's **Project configuration → Environment variables** and add these variables for every deploy context that should have working search:

| Variable | Value | Secret? |
| --- | --- | --- |
| `ALGOLIA_APP_ID` | Algolia application ID | No |
| `ALGOLIA_ADMIN_API_KEY` | Algolia Admin API Key | **Yes — sensitive** |
| `ALGOLIA_SEARCH_ONLY_API_KEY` | Algolia Search-Only API Key | Public search key |
| `ALGOLIA_INDEX_NAME` | `cinelux_titles` | No |

Do not add the Admin API Key to the site's files, browser code, or a chat message. Netlify's build uses it only on the server side.

For local testing, `scripts/sync-algolia.mjs` can load an optional `scripts/.env` file. Keep that file uncommitted; it is ignored by Git. It must include `ALGOLIA_ADMIN_API_KEY` as well as the other required variables to run a live sync. A local `.env` file does not configure Netlify.

## 3. Deploy

The repository's `netlify.toml` runs `node scripts/netlify-build.mjs`. Each deploy:

1. Validates the catalog records, object IDs, poster files, and title pages.
2. Configures searchable fields, genre/type facets, and title/year sorting replicas in Algolia.
3. Removes stale records and syncs the current `Assets/Api/Data.json` records.
4. Generates the browser configuration using only the Search-Only API Key.
5. Publishes the site from `dist/`, excluding the private indexing scripts and this setup document.

The Netlify build fails with a clear error if required environment variables are missing or the catalog cannot be indexed. After changing movie/show data, deploy again to sync Algolia.

## Security note

If a value shared in chat or another public place was the Admin API Key, revoke/rotate it in Algolia, then update `ALGOLIA_ADMIN_API_KEY` in Netlify. Do not reuse an exposed Admin key.
