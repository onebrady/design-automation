# Agent Orchestration Protocol

This repo is designed for AI-only development. Follow this protocol to automate execution and status tracking.

## Orchestrator & State
- Orchestrator: `development plan/orchestrator.json` lists phases and their tasks JSON files.
- State: `development plan/.state.json` tracks `currentPhase`, `currentTaskId`, and `autoAdvance`.

## Per-Phase Tasks
- Tasks JSON: `development plan/phase-<n>.tasks.json` (schema: `templates/tasks.schema.json`) lists ordered tasks.
- For each task:
  1. Read `id`, `description`, and `refs` (docs to consult precisely).
  2. Implement deliverables and produce `artifacts` in the specified paths.
  3. Append a `checks[]` entry in `development plan/.evidence/phase-<n>.json` with:
     - `id` (match task id), `name`, `passed: true`, `evidence` (artifact paths), `refs` (doc sections), `timestamp`.
  4. Update `development plan/.status/phase-<n>.json` `updatedAt` timestamp.
  5. Update `development plan/.state.json` `currentTaskId` to the next task (or null when done).
- After all tasks finish:
  - Run CI; when green, set `.status/phase-<n>.json` to `status: "done"` and add `ciRunId`.
  - Advance `development plan/.state.json` `currentPhase` to the next phase if `autoAdvance` is true.

## Evidence & Validation
- Evidence schema: `development plan/templates/phase-evidence.schema.json`.
- CI validates evidence JSON and all required gates for the phase.

## Guardrails to Prevent Hallucinations
- Always cite `refs` to exact doc sections when adding `checks[]`.
- Only write artifacts in documented paths; prefer copying sample shapes from `development plan/.evidence/samples/*`.
- If a doc gap is found, update PRD/docs first, then proceed.

## Environment & Controls
- Discovery + Health endpoints must be reachable when claimed in evidence.
- Use env: `AGENTIC_MONGO_URI`, `AGENTIC_DB_NAME`, `AGENTIC_AUTO_APPLY`, `AGENTIC_AUTO_APPLY_MAX_CHANGES`, `AGENTIC_STRICT`.

