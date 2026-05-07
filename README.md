# dzr-tab

Monorepo of Deezer browser extensions.

## Extensions

### `extensions/dzr-tab` — Deezer Tab

Replaces your new tab page with a random Deezer track and a dynamic gradient extracted from the album art.

Available on [Chrome Web Store](https://chrome.google.com/webstore/detail/deezer-tab/meiclleccmfmheoplgelombebilpndea) and [Firefox Add-ons](https://addons.mozilla.org/fr/firefox/addon/deezer-tab/).

## Getting started

```bash
# Install dependencies
pnpm install

# Dev mode (Chrome)
pnpm dev

# Dev mode (Firefox)
pnpm dev:firefox

# Production build (both targets)
pnpm build

# Create zip archives for store submission
pnpm zip
```

## Stack

- **[WXT](https://wxt.dev/)** — Vite-based browser extension framework (MV3 Chrome / MV2 Firefox)
- **[pnpm workspaces](https://pnpm.io/workspaces)** — monorepo
- **TypeScript** throughout
- **`browser.storage.session`** for in-session track caching (Firefox 115+)

## Structure

```
extensions/
  dzr-tab/          ← New Tab extension
packages/
  deezer-api/       ← Shared Deezer API client (fetch + types)
```
