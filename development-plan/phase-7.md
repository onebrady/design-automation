# Phase 7 — Studio UI (Vite + React) — Weeks 15–16

Status: planned | in_progress | blocked | done
Owner: Agent
Start:
Target:
Completed:
CI: (link to latest run)

## Objectives
- Ship a scalable Vite React app (Studio) to manage brand packs, run engine playground, view suggestions, and monitor status/analytics.
- Consume existing server endpoints and SDK without breaking prior functionality.
- Keep bundle within size budgets; enable zero‑config dev via proxy.

## Scope
- In: Vite React TS app, dev proxy `/api` → `http://localhost:3001`, views (Dashboard, Brand Packs, Playground, Suggestions, Analytics, Settings), API client, minimal SDK integration, size budgets, e2e smoke.
- Out: Advanced extension UI, org dashboards, real-time streaming; Mongo assignment/migration debugging (next step after Phase 7 per plan).

## Deliverables
- App: `apps/studio` (Vite + React + TS) with routes: `/`, `/brand-packs`, `/playground`, `/suggestions`, `/analytics`, `/settings`.
- Dev proxy: vite config proxy `/api` to `http://localhost:3001`.
- API client: `src/lib/api.ts` (REST fetchers), optional `src/lib/sdk.ts` (wrap SDK enhanceCached).
- Components: StatusBar, BrandPackTable, PlaygroundEditor+Diff, SuggestionsList, AnalyticsCards, SettingsPanel.
- Scripts: `npm run studio:dev`, `npm run studio:build`, `npm run studio:preview`.
- Size budget & report for studio; e2e smoke logs; basic a11y check.

## Interfaces
- Endpoints consumed: `/api/health`, `/api/context`, `/api/brand-packs*`, `/api/design/analyze|enhance|enhance-cached`, `/api/design/suggest-proactive`, `/api/design/patterns/*`.
- SDK (optional): `enhanceCached`, `resolveProjectContext`.
- Dev proxy: configured in Vite config for seamless `/api/*` calls.

## Performance & Size Targets
- UI bundle delta: < 2% (gzip) vs baseline.
- Route code‑splitting; lazy load Playground.
- Keep third‑party deps minimal; prefer native fetch + React Query.

## Tests & CI Gates
- Build succeeds: `studio:build`.
- E2E smoke (dev): health/context visible; list brand packs; run enhance on sample CSS.
- Size‑limit: studio bundle within budget; report committed.
- A11y basics: contrast and keyboard focus for key components.

## Risks & Mitigations
- CORS: use dev proxy; for prod, document `API_BASE_URL`.
- Performance: code‑split routes; cache fetches via React Query; avoid heavy deps.
- Offline/degraded: show banner and disable actions that require Mongo.

## Exit Criteria
- Studio builds and runs with dev proxy; all views reachable and function with current server endpoints.
- E2E smoke passes; size budget enforced; a11y basics OK.
- No regressions to existing server/SDK/plugin behavior.

## Agent Procedures (AI‑Only)
- Update status JSON: `development plan/.status/phase-7.json`.
- Produce evidence JSON: `development plan/.evidence/phase-7.json` with checks[] and artifacts.
- Implement tasks in `development plan/phase-7.tasks.json` order.
- Do not set `done` until CI validates evidence and gates.

## Checklist
- [ ] Scaffold Vite React TS app → Evidence: app tree, vite config
- [ ] Configure dev proxy `/api` → Evidence: vite config snippet
- [ ] Implement API client → Evidence: `src/lib/api.ts`
- [ ] Dashboard view (health/context) → Evidence: screenshot/log
- [ ] Brand Packs view (list/create/version/export) → Evidence: screenshot/log
- [ ] Playground view (analyze/enhance/enhance‑cached) → Evidence: screenshot/log
- [ ] Suggestions view (advisory) → Evidence: screenshot/log
- [ ] Analytics view (local rollups) → Evidence: screenshot/log
- [ ] Settings view (env/auto‑apply mode/caps) → Evidence: screenshot/log
- [ ] Build & E2E smoke → Evidence: logs
- [ ] Size budget report → Evidence: report
- [ ] A11y basics → Evidence: report/note

## Review Gate (Automated)
- CI validates `development plan/.evidence/phase-7.json` against schema.
- Status JSON indicates `done` with `ciRunId`.
- Checklist mapped to `checks[]` with `passed=true` and artifacts.

## References
- PRD: Architecture, Deterministic Contracts, Pattern Learning Scope, MVP Scope Checklist
- Docs: `docs/integration-protocol.md`, `docs/discovery.md`, `docs/design-engine-spec.md`, `docs/build-quality-plan.md`, `docs/file-size-management.md`, `docs/roadmap.md`
