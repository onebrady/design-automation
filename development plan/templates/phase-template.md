# Phase X — Title (Week N)

Status: planned | in_progress | blocked | done
Owner: Agent
Start:
Target:
Completed:
CI: (link to latest run)

## Objectives
- 

## Scope
- In: 
- Out: 

## Deliverables
- 

## Interfaces
- Endpoints:
- SDK:
- Env/config:

## Data & DB
- Collections/indexes/migrations:

## Performance & Size Targets
- Cached target: <100ms (if applicable)
- Size budgets: per docs/file-size-management.md

## Tests & CI Gates
- Lint/type/tests/size-limit:
- Preflight Doctor (env/DB/index ensure):
- Endpoint smoke:
- Feature tests:

## Agent Procedures (AI‑Only)
- Update status JSON: `development plan/.status/phase-<n>.json` (schema: `templates/phase-status.schema.json`).
- Produce evidence JSON: `development plan/.evidence/phase-<n>.json` (schema: `templates/phase-evidence.schema.json`).
- Map each Checklist item to a `checks[]` entry with `passed=true` and evidence artifact paths.
- Do not mark status `done` until CI verifies evidence JSON and all gates are green.

## Risks & Mitigations
- 

## Exit Criteria
- 

## Checklist
- [ ] Item → Evidence:
  - When completed, add a `checks[]` entry in evidence JSON with refs to PRD/doc sections used.

## Review Gate
- Automated: CI validates evidence JSON against schema and ensures all Checklist items are present with `passed=true`.
- Evidence links:
- Notes:

## References
- PRD section(s):
- Discovery/doc links:
- Roadmap phase:
- Build Quality Plan:
- Data Schemas:
