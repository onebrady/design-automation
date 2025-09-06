# Zero-Config Discovery Specification

## Goals

- Automatic, deterministic brand selection per project with minimal setup.
- Reuse brand packs across multiple projects.
- Notify when MongoDB is unreachable; continue in degraded mode if possible.

## Discovery Order (Highest Priority First)

1. `AGENTIC_DISABLE=1` → disable entirely.
2. `AGENTIC_BRAND_PACK_ID` (+ optional `AGENTIC_BRAND_VERSION`) → force brand for the session.
3. Nearest `.agentic/config.json` (from current file up to repo root).
4. `package.json` → `agentic.brandPackId` (fallback only).
5. Repository file: nearest `brand-pack.ref.json` or `brand-pack.json` with `{ "id": "...", "version?": "..." }`.
6. MongoDB `projects` mapping by repository root hash (and/or git remote hash).
7. If unresolved:
   - If exactly one brand pack exists in DB → auto-bind to it and persist.
   - Otherwise: degraded mode (non-interactive) or prompt to bind (interactive).

Notes:

- Env overrides always take precedence and do not modify on-disk config.
- The nearest config wins in monorepos (sub-apps can bind different brands).

## Configuration Files

### `.agentic/config.json` (committed)

```json
{
  "brandPackId": "acme-brand",
  "brandVersion": "^2",
  "projectId": "8b9c2d9f-4a8a-4e1f-9f2a-0795e1a3f5f1",
  "overrides": {
    "tokens": {
      "colors": { "accent": "#06b6d4" }
    }
  }
}
```

### `package.json` (fallback only)

```json
{
  "agentic": { "brandPackId": "acme-brand", "brandVersion": "^2" }
}
```

### `brand-pack.ref.json` (repo marker)

```json
{ "id": "acme-brand", "version": "^2" }
```

### `.agentic/brand-pack.lock.json` (generated, not committed)

```json
{
  "id": "acme-brand",
  "version": "2.3.1",
  "etag": "W/\"c8f...\"",
  "lastSync": "2025-01-15T10:30:00Z",
  "source": "mongo"
}
```

## Environment Variables

- `AGENTIC_BRAND_PACK_ID`: force a brand pack id.
- `AGENTIC_BRAND_VERSION`: optional version (exact or semver range).
- `AGENTIC_PROJECT_ID`: explicit project id (optional).
- `AGENTIC_MONGO_URI`: Mongo connection (default `mongodb://localhost:27017`).
- `AGENTIC_DB_NAME`: database name (default `agentic_design`).
- `AGENTIC_DISABLE=1`: disable the system for the session.
- `AGENTIC_STRICT=1`: fail hard if Mongo is unreachable or brand is unresolved.

## MongoDB Availability & Notifications

- Health checks:
  - On startup (and periodically, e.g., every 15s), ping Mongo.
  - Expose `GET /api/health` with `{ mongoAvailable, lastOkAt }`.
- Notifications:
  - SDK emits status via `onStatus({ mongoAvailable, degraded, message })`.
  - CLI prints a warning once per session and on state change.
  - IDE extension can show a status bar indicator (e.g., "Design: Degraded").
- Behavior:
  - Mongo up: resolve from DB and refresh `.agentic/brand-pack.lock.json`.
  - Mongo down: if lock exists → proceed using lock (`degraded: true`); otherwise → deterministic transforms only + notify.
  - `AGENTIC_STRICT=1`: throw on Mongo down or unresolved brand.

## Resolution Algorithm (Pseudocode)

```
resolveProjectContext(projectPath):
  if env.AGENTIC_DISABLE: return { disabled: true }
  if env.AGENTIC_BRAND_PACK_ID: return fromEnv()
  if nearest .agentic/config.json: return fromConfig()
  if nearest package.json agentic: return fromPackage()
  if nearest brand-pack.ref.json or brand-pack.json: return fromRepoMarker()
  if mongoAvailable():
    ctx = lookupProjectsMapping(rootHash(projectPath))
    if ctx: return ctx
    if count(brand_packs) == 1: return autoBindAndPersist()
  if lockExists(): return fromLock(degraded=true)
  return { degraded: true, brandResolved: false }
```

## Monorepos & Subprojects

- Use "nearest config wins". Subprojects can include their own `.agentic/config.json` and bind to different brands.
- DB `projects` collection uses root hashes keyed to subpaths when necessary.

## Automation Defaults

- Auto-bind on first run only when exactly one brand exists in DB and nothing else is configured.
- Auto-heal when Mongo becomes reachable again (refresh lock, clear degraded).
- Env overrides always win (useful for CI or ad-hoc tasks).

## SDK & HTTP Contracts

### HTTP

- `GET /api/context` →

```json
{
  "brandPack": {
    "id": "acme-brand",
    "version": "2.3.1",
    "source": "mongo|lock|env|config|package|marker"
  },
  "projectId": "8b9c2d9f-...",
  "overrides": {
    "tokens": {
      /* ... */
    }
  },
  "mongoAvailable": true,
  "degraded": false,
  "lastSync": "2025-01-15T10:30:00Z"
}
```

### SDK

- `resolveProjectContext(projectPath)` → same shape as `/api/context`.
- `onStatus(cb)` → emits Mongo/brand resolution state changes.
