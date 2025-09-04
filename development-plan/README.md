# Development Plan — Agent-Only Quick Guide

- Source of truth: `prd.md`, `docs/**`, `development plan/**`.
- Status JSON: `development plan/.status/phase-<n>.json` (update `status`, `updatedAt`, add `ciRunId` when done).
- Evidence JSON: `development plan/.evidence/phase-<n>.json` (populate `checks[]`, `endpoints`, `metrics`, `artifacts`).
- Schemas: `development plan/templates/phase-status.schema.json`, `phase-evidence.schema.json`.
- Phase docs: `development plan/phase-<n>.md` (objectives, deliverables, checklist, references).
- Samples: `development plan/.evidence/samples/health.json`, `context.json`.
- CI = reviewer: validates evidence JSON, runs gates (lint, type, tests, size, doctor, index-ensure, smoke).

Minimal workflow per phase
1) Set `.status/phase-<n>.json` → `in_progress` with current timestamp.
2) Implement tasks from `phase-<n>.md` exactly; create artifacts in stable paths (reports/, logs/).
3) Update `.evidence/phase-<n>.json` with one `checks[]` entry per checklist item; include endpoints/metrics.
4) Run CI. When green, set status → `done`, add `ciRunId`.

Environment knobs
- `AGENTIC_MONGO_URI`, `AGENTIC_DB_NAME`
- `AGENTIC_AUTO_APPLY=safe|off` (default safe), `AGENTIC_AUTO_APPLY_MAX_CHANGES` (default 5)
- `AGENTIC_STRICT=1` to fail on guardrail violations or unresolved brand


Recommended prompts

- Start now:
  “Open development plan/orchestrator.json and development plan/.state.json. Set development plan/.status/phase-0.json to in_progress with updatedAt. Use development plan/phase-0.md and development plan/phase-0.tasks.json to execute tasks in order. For each task, produce artifacts, then append a checks[] entry (passed=true, evidence paths, refs) in development plan/.evidence/phase-0.json. When all tasks complete, run CI as defined in phase-0.md. If green, set status=done with ciRunId in development plan/.status/phase-0.json and advance development plan/.state.json currentPhase to phase-1.”

- Resume later:
  “Read development plan/.state.json to get currentPhase and currentTaskId. Load the corresponding phase doc and development plan/phase-<n>.tasks.json. Continue from currentTaskId. For each completed task, update development plan/.evidence/phase-<n>.json checks[] with evidence and refs. When all tasks are done and CI is green, set development plan/.status/phase-<n>.json to status=done with ciRunId and advance development plan/.state.json.”

- Verify and mark done:
  “Validate development plan/.evidence/phase-<n>.json against development plan/templates/phase-evidence.schema.json. Confirm all Checklist items in development plan/phase-<n>.md have matching checks[]. Ensure CI jobs (lint, typecheck, tests, size, doctor, indexEnsure, smoke) are green. Then set development plan/.status/phase-<n>.json to status=done, add ciRunId, and advance development plan/.state.json currentPhase.”

- Start a specific phase (example: Phase 1):
  “Set development plan/.status/phase-1.json to in_progress with updatedAt. Execute development plan/phase-1.tasks.json in order using development plan/phase-1.md. Update development plan/.evidence/phase-1.json checks[] with artifacts and refs. Run CI gates. If green, set status=done with ciRunId, and advance development plan/.state.json currentPhase to phase-2.”

- Single task:
  “In phase <n>, execute task <taskId> from development plan/phase-<n>.tasks.json. Produce listed artifacts. Append a checks[] entry to development plan/.evidence/phase-<n>.json (id, name, passed=true, evidence paths, refs). Update development plan/.state.json currentTaskId to the next task.”

- Environment/guardrails preface:
  “Ensure local Mongo is running. Use env: AGENTIC_MONGO_URI, AGENTIC_DB_NAME; optional AGENTIC_AUTO_APPLY (safe|off), AGENTIC_AUTO_APPLY_MAX_CHANGES, AGENTIC_STRICT=1. Do not change scope—if a doc inconsistency is found, propose minimal edits to prd.md or docs/*, then proceed.”

File paths to rely on (agent-only)

- Orchestrator: development plan/orchestrator.json
- State: development plan/.state.json
- Phase docs: development plan/phase-<n>.md
- Tasks: development plan/phase-<n>.tasks.json
- Status JSON: development plan/.status/phase-<n>.json
- Evidence JSON: development plan/.evidence/phase-<n>.json
- Schemas: development plan/templates/phase-status.schema.json, phase-evidence.schema.json, tasks.schema.json
- Sample endpoint payloads: development plan/.evidence/samples/health.json, context.json

Use these templates verbatim with the correct phase number. They keep work deterministic, update status/evidence automatically, and let CI be the reviewer.
