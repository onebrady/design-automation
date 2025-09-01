# Core Data Schemas, Indexes, and Cache Signatures

This document defines MongoDB schemas, required indexes, cache signature rules, and invalidation policies to ensure determinism, performance, and reliable learning.

## Conventions

- Database: `agentic_design` (override with `AGENTIC_DB_NAME`).
- Timestamps: `createdAt`, `updatedAt` stored as ISO dates; write code updates `updatedAt` on change.
- IDs: `projectId` is UUIDv4; brand packs identified by `brandPackId` and resolved `brandVersion`.
- Consistency: Startup creates all required indexes if missing.

## Collections

### 1) `projects`

Purpose: Bind a project root to its brand pack and store optional overrides.

Document shape:

```json
{
  "_id": { "$oid": "..." },
  "projectId": "uuid-v4",
  "rootHash": "sha256:...",           // canonicalized repo root path hash
  "gitRemoteHash": "sha256:...",      // optional: normalized remote URL hash
  "brandPackId": "acme-brand",
  "brandVersionPolicy": "pinned|range",
  "brandVersion": "2.3.1",            // resolved version if pinned
  "versionRange": "^2",               // used when policy = range
  "overrides": { "tokens": { /* ... */ } },
  "notes": "optional",
  "createdAt": { "$date": "..." },
  "updatedAt": { "$date": "..." }
}
```

Indexes:
- Unique: `{ rootHash: 1 }`
- Secondary: `{ gitRemoteHash: 1 }`, `{ brandPackId: 1 }`

### 2) `cache`

Purpose: Store enhancement results for instant re-use.

Document shape:

```json
{
  "_id": { "$oid": "..." },
  "signature": "sha256:...",           // unique cache key (see signature rules)
  "codeHash": "sha256:...",            // raw code content hash
  "filePath": "/abs/or/rel/path.css",  // optional for diagnostics
  "projectId": "uuid-v4",
  "brandPackId": "acme-brand",
  "brandVersion": "2.3.1",
  "engineVersion": "1.0.0",
  "rulesetVersion": "1.0.0",           // transforms/rules version
  "overridesHash": "sha256:...",       // hash of merged overrides
  "componentType": "button|card|...",
  "result": {
    "code": "...",
    "changes": [ /* change list */ ],
    "metricsDelta": { /* ... */ },
    "brandCompliance": { "before": 0.45, "after": 0.93 }
  },
  "responseTimeMs": 42,                 // cached response time when stored
  "hitCount": 7,
  "lastHit": { "$date": "..." },
  "sizeBytes": 2048,                    // approximate payload size
  "createdAt": { "$date": "..." }
}
```

Indexes:
- Unique: `{ signature: 1 }`
- Secondary: `{ lastHit: 1 }`
- Optional TTL: `{ lastHit: 1 }` with expireAfterSeconds for cold entries (e.g., 30 days).

### 3) `transforms`

Purpose: Persist transform executions for diagnostics, idempotency checks, and analytics.

Document shape:

```json
{
  "_id": { "$oid": "..." },
  "signature": "sha256:...",           // same composition as cache
  "projectId": "uuid-v4",
  "filePath": "/.../Button.css",
  "brandPackId": "acme-brand",
  "brandVersion": "2.3.1",
  "engineVersion": "1.0.0",
  "rulesetVersion": "1.0.0",
  "componentType": "button",
  "autoApplied": true,
  "autoApplyClass": "spacing|radius|tokenization",
  "guardrails": { "contrastAA": true, "changeCount": 3 },
  "changes": [
    { "type": "color-tokenization", "location": ".btn:background", "before": "#1f2937", "after": "var(--color-primary)" }
  ],
  "metricsDelta": { "tokenAdherence": 0.38 },
  "timings": { "analyzeMs": 52, "enhanceMs": 73 },
  "status": "ok|error",
  "error": { "message": "...", "stack": "..." },
  "createdAt": { "$date": "..." }
}
```

Indexes:
- Unique: `{ signature: 1 }`
- Secondary: `{ projectId: 1, filePath: 1 }`, `{ brandPackId: 1 }`

### 4) `patterns`

Purpose: Capture learned user preferences and component correlations.

Document shape:

```json
{
  "_id": { "$oid": "..." },
  "projectId": "uuid-v4",
  "componentType": "button",
  "preferences": {
    "spacing": { "padding": "md lg" },
    "radius": { "value": "md" },
    "colors": { "primaryUsage": 0.82 }
  },
  "confidence": 0.87,
  "sampleCount": 123,
  "decayPolicy": { "halfLifeDays": 30 },
  "modelVersion": "1.0.0",               // algorithm version
  "features": { "tokens": ["--spacing-md", "--radius-md"] },
  "threshold": 0.8,                        // default advisory threshold
  "autoApplyEnabled": false,               // opt-in only (post-MVP)
  "validated": {                           // evaluation snapshot
    "at": { "$date": "..." },
    "precision": 0.86,
    "recall": 0.78
  },
  "lastUpdated": { "$date": "..." }
}
```

Indexes:
- Secondary: `{ projectId: 1, componentType: 1 }`
- Secondary: `{ confidence: 1 }`

### 5) `analytics` (optional rollups)

Purpose: Summary documents for dashboards (cache hit rates, response times, usage). Only if needed.

Document shape: free-form, but prefer append-only + date bucketing.

## Cache Signature Rules

Signature inputs (concatenate and hash, e.g., sha256):
- `codeHash` (raw content)
- `brandPackId`
- `brandVersion` (resolved exact version, not range)
- `engineVersion`
- `rulesetVersion`
- `overridesHash` (merged effective overrides)
- `componentType` (if affects transforms)
- `environmentFlags` hash (e.g., `AGENTIC_STRICT`, discovery source)
- Optional: `filePath` normalized (only if path-sensitive transforms exist)

Rationale: Ensures idempotency and prevents stale cache reuse when any relevant factor changes.

## Invalidation Policy

Invalidate (i.e., must miss cache) when any of the following change:
- Code content
- Brand pack resolved version (or brandPackId)
- Engine or ruleset version
- Effective overrides
- Transform-relevant env flags (strict/degraded toggles that affect output)
- Discovery source change that alters effective config
- Pattern policy change that affects outputs (if/when patterns influence deterministic transforms)

Retention/TTL:
- Optional TTL on `cache.lastHit` for cold entries (e.g., 30 days) to keep DB small.
- No TTL on `transforms` unless storage is constrained; consider archiving policies.

## Startup Index Checklist (create if missing)

Pseudocode steps executed on service start:
1. `projects`: ensure indexes (unique rootHash; secondary gitRemoteHash, brandPackId)
2. `cache`: ensure indexes (unique signature; secondary lastHit; optional TTL)
3. `transforms`: ensure indexes (unique signature; secondary projectId+filePath, brandPackId)
4. `patterns`: ensure indexes (projectId+componentType; confidence)

Example (Mongo shell or driver):

```js
db.projects.createIndex({ rootHash: 1 }, { unique: true });
db.projects.createIndex({ gitRemoteHash: 1 });
db.projects.createIndex({ brandPackId: 1 });

db.cache.createIndex({ signature: 1 }, { unique: true });
db.cache.createIndex({ lastHit: 1 });
// Optional TTL for cold cache entries (30 days):
// db.cache.createIndex({ lastHit: 1 }, { expireAfterSeconds: 2592000 });

db.transforms.createIndex({ signature: 1 }, { unique: true });
db.transforms.createIndex({ projectId: 1, filePath: 1 });
db.transforms.createIndex({ brandPackId: 1 });

db.patterns.createIndex({ projectId: 1, componentType: 1 });
db.patterns.createIndex({ confidence: 1 });
```

## Testing & CI Gates

- Idempotency: Re-run transform with same signature → no diff.
- Cache: Validate hit/miss and all invalidation triggers.
- Index presence: Startup must ensure indexes; CI can assert via a health endpoint or integration test.
- Performance: Measure cached response times with discovery context resolved; verify target (e.g., p95 < 100ms).
