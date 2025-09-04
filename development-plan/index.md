# Development Plan — Phase Tracker (AI‑Only)

This development plan is optimized for AI agents. Human steps are not required. Progress and reviews are machine‑verifiable via JSON files.

## Conventions (Required)

- Status file: `development plan/.status/phase-<n>.json` (schema: `templates/phase-status.schema.json`)
- Evidence file: `development plan/.evidence/phase-<n>.json` (schema: `templates/phase-evidence.schema.json`)
- Only update status → in_progress/done after writing evidence JSON and passing CI checks mapped in the phase doc.
- Agents must cite doc references (file + section) in evidence notes to avoid hallucinations.

## Phases

- Phase 0 — Intelligent Foundation: doc=./phase-0.md | status in `.status/phase-0.json` | evidence in `.evidence/phase-0.json`
- Phase 1 — Brand Pack Intelligence: doc=./phase-1.md | status `.status/phase-1.json` | evidence `.evidence/phase-1.json`
- Phase 2 — Design Intelligence Engine (Deterministic): doc=./phase-2.md | status `.status/phase-2.json` | evidence `.evidence/phase-2.json`
- Phase 3 — Pattern Learning (Advisory + Confidence): doc=./phase-3.md | status `.status/phase-3.json` | evidence `.evidence/phase-3.json`
- Phase 4 — Seamless Integration: doc=./phase-4.md | status `.status/phase-4.json` | evidence `.evidence/phase-4.json`
- Phase 5 — Intelligence & Optimization: doc=./phase-5.md | status `.status/phase-5.json` | evidence `.evidence/phase-5.json`
- Phase 6 — Production Hardening: doc=./phase-6.md | status `.status/phase-6.json` | evidence `.evidence/phase-6.json`
- Phase 7 — Studio UI (Vite + React): doc=./phase-7.md | status `.status/phase-7.json` | evidence `.evidence/phase-7.json`
- Phase 8 — AI-Driven Design Automation: doc=./phase-8.md | status `.status/phase-8.json` | evidence `.evidence/phase-8.json`
- Phase 9 — Final API Endpoint Resolution: doc=./phase-9.md | status `.status/phase-9.json` | evidence `.evidence/phase-9.json`

## Orchestration

- Orchestrator: `development plan/orchestrator.json` defines phase → tasks mapping.
- State: `development plan/.state.json` tracks `currentPhase`, `currentTaskId`, and `autoAdvance`.
- Tasks: `development plan/phase-<n>.tasks.json` conform to `templates/tasks.schema.json`.
- Protocol: see `development plan/AGENT_PROTOCOL.md` for agent execution steps.

## Automated Review Gate

- CI validates evidence JSON against schema and checks that all required Checklist items in the phase doc have corresponding `checks[].passed=true` with artifacts.
- Phase is considered done when:
  - Status JSON shows `status: "done"` and references the final CI run id
  - Evidence JSON includes all mandatory checks for that phase
  - CI jobs mapped in the phase doc are green
