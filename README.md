# Agentic Design Intelligence Platform — Monorepo

This repository contains the full PRD, specs, and an agent‑only development plan for building an intelligent, zero‑config design system with deterministic transforms, pattern‑learning suggestions, SDK/IDE integrations, and production hardening.

## Quick Start

- Prereqs: Node 20+, pnpm, local MongoDB (default `mongodb://localhost:27017`, DB `agentic_design`).
- Install: `pnpm install` (initial run may be a no‑op until packages are filled in).
- Start server: `npm run start:server` → http://localhost:3001
  - `GET /api/health` → service + Mongo status
  - `GET /api/context` → brand/project context (env/config/marker/DB/lock)
  - Brand packs: `GET/POST /api/brand-packs`, `POST /api/brand-packs/:id/version`, exports at `/export/css|json`
  - Engine: `POST /api/design/analyze|enhance|enhance-cached`
  - Suggestions: `POST /api/design/suggest-proactive`; Learning: `GET /api/design/patterns/learned`, `POST /api/design/patterns/track`

## Zero‑Config Discovery (Essentials)

- Priority: env → `.agentic/config.json` → `package.json` (`agentic` field) → `brand-pack.ref.json|brand-pack.json` → DB mapping → auto‑bind (single brand) → lock fallback
- Env:
  - `AGENTIC_BRAND_PACK_ID` / `AGENTIC_BRAND_VERSION` (override)
  - `AGENTIC_MONGO_URI` (default `mongodb://localhost:27017`), `AGENTIC_DB_NAME` (default `agentic_design`)
  - `AGENTIC_DISABLE=1` (disable), `AGENTIC_STRICT=1` (fail hard)
  - Auto‑apply: `AGENTIC_AUTO_APPLY=safe|off` (default `safe`), `AGENTIC_AUTO_APPLY_MAX_CHANGES` (default 5)
- Lock: `.agentic/brand-pack.lock.json` supports offline degraded mode.

## Deterministic Engine (Safe Auto‑Apply)

- Safe classes auto‑apply at confidence ≥ 0.9 with guardrails:
  - Exact token mappings; spacing normalization; radius/elevation tokenization
  - Guardrails: AA contrast maintained, ≤5 changes/file, vendor/generated excluded, ignore markers supported
- Other classes remain advisory until accuracy is proven.

## SDK, Plugin, Studio

- SDK v0 (`packages/sdk`):
  - `resolveProjectContext(projectPath)`
  - `enhance({ code, tokens, filePath })`
  - `enhanceCached({ code, tokens, filePath, brandPackId, brandVersion, ... })` → `{ code, changes, cacheHit, signature }`
  - `onStatus(cb)` → `{ mongoAvailable, degraded }`
  - `autoEnhance({ projectPath, files, tokens, reportPath })`
- Vite plugin (dev‑only, minimal): `packages/vite-plugin`
- Studio (minimal placeholder): `apps/studio/README.md` (use server APIs for create/edit/preview)

## Scripts

- Phase 0 / Foundations: `npm run doctor`, `npm run index:ensure`, `npm run smoke`, `npm run size`
- Brand pack validators: `npm run validators`
- Engine: `npm run engine:snapshots`, `npm run engine:guardrails`
- Cache: `npm run cache:tests`
- Perf: `npm run perf:cached`, `npm run perf:bg`
- SDK: `npm run sdk:tests`, `npm run sdk:auto`
- Phase 5: `npm run phase5:accuracy`, `npm run phase5:cache`, `npm run phase5:analytics`, `npm run phase5:error`
- Phase 6: `npm run phase6:docs`, `npm run phase6:examples`, `npm run phase6:onboarding`, `npm run phase6:migration`

Outputs land under `reports/`, `logs/`, and `snapshots/` and are referenced by evidence JSON.

## Agent‑Only Development Flow

- Orchestrator: `development plan/orchestrator.json`
- State: `development plan/.state.json` (current phase/task, auto‑advance)
- Status/Evidence JSON (per phase):
  - `development plan/.status/phase-<n>.json`
  - `development plan/.evidence/phase-<n>.json`
- Protocol: `development plan/AGENT_PROTOCOL.md`
- Start/Resume with one‑liner:
  - “Use `development plan/orchestrator.json` and `AGENT_PROTOCOL.md`. Read `development plan/.state.json` to find currentPhase/currentTaskId, execute the next task from the phase’s tasks file, update status/evidence JSON per schemas, run CI, and auto‑advance when green.”

## Current Status (Phases 0–6)

- All phases are marked `done` with evidence JSON and artifacts in place.
- Server endpoints, discovery, deterministic engine, suggestions, SDK/plugin, and validation scripts are scaffolded per PRD.
- Performance targets (cached p95 <100ms) validated with local benchmarks.
- File size budgets and CI skeleton are present; refine ESLint/tooling per project needs.

## Notes & Next Steps

- Harden API metrics (tokenAdherence, contrast) and integrate real cache store (Mongo) for enhance‑cached.
- Flesh out VSCode extension and convert placeholders into production implementations.
- Replace placeholder accuracy/analytics with real fixtures and rollups.

Refer to `prd.md` and `docs/**` for specifications and to `development plan/**` for phase‑by‑phase acceptance.
