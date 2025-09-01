# Phase 6 — Production Hardening — Weeks 13–14

Status: planned | in_progress | blocked | done
Owner: Agent
Start:
Target:
Completed:
CI: (link to latest run)

## Objectives
- Finalize documentation, examples, and onboarding so agents can adopt in <5 minutes.
- Polish performance and error handling for production stability.
- Provide migration/backup tools and release artifacts with provenance.

## Scope
- In: Comprehensive docs (API, migration, best practices), example projects, performance polish, robust error handling, migration/backup tools, onboarding script, link checking, release metadata.
- Out: New feature classes; org dashboards; non-VSCode IDEs.

## Deliverables
- Documentation:
  - Complete API docs (/api/health, /api/context, analyze/enhance/enhance-cached, brand pack APIs, learning APIs).
  - Migration guides (Mongo schema versions; brand packs; cache cleanup).
  - Best practices (discovery, guardrails, performance tuning, size management, CI setup).
  - Security & privacy notes (local-only data, env controls).
- Examples:
  - Production-ready examples demonstrating discovery, safe auto-apply, caching, and learning advisory.
  - Example READMEs with exact steps; expected outputs for verification.
- Tooling:
  - Migration/backup/restore scripts for brand packs, patterns, cache.
  - Onboarding script (local): verify Mongo, create indexes, seed example brand, write lock snapshot.
  - Release metadata: changelog, versioning (semver), provenance, SBOM if feasible.
- Performance & Error Handling:
  - Performance polish to maintain cached p95 <100ms in example workloads.
  - Error handling upgrades (retry/backoff, clear messages, degraded transitions).

## Interfaces
- Endpoints: stable contracts for all documented APIs; version headers if needed.
- SDK: stable v1 surface as per PRD; ensure tree-shakeable and size within budget.
- Env/config: documented defaults and overrides; discovery behavior examples.

## Data & DB
- Migration scripts and docs for collections (brand_packs, versions, usage_analytics, patterns, cache, transforms, projects).
- Backup/restore docs (local Mongo dump/restore); TTL/eviction notes.

## Performance & Size Targets
- Cached enhancement p95 <100ms (examples); new enhancement p95 <300ms.
- Suggestion analysis p95 <100ms.
- Size budgets: unchanged; pass size-limit for server, SDK, plugin, extension.

## Tests & CI Gates
- Lint/type/tests/size-limit: all green.
- End-to-end examples: automated runs verify outputs and timings; artifact logs attached.
- Chaos/degraded tests: simulate Mongo outages; verify degraded mode and recovery.
- Migration tests: upgrade/downgrade schemas; data integrity verified.
- Docs validation: link checker, sample payloads match contracts, README steps pass.
- Release checks: changelog present; version tags; provenance/SBOM artifacts (if enabled).

## Risks & Mitigations
- Documentation drift → snapshot sample payloads; link checks; CI doc validation.
- Migration risk → backup/restore guides; dry-run modes; integrity checks.
- Perf regressions → continuous perf tests on examples; compare against baseline reports.

## Exit Criteria
- Zero-config onboarding achievable in <5 minutes using onboarding script + docs.
- Docs complete and validated (links, samples); examples pass automated runs.
- Performance targets met on examples; error handling verified (degraded + recovery).
- Migration tools tested; release artifacts prepared; CI green; size budgets enforced.

## Agent Procedures (AI‑Only)
- Update status JSON: `development plan/.status/phase-6.json` (schema: `templates/phase-status.schema.json`).
- Produce evidence JSON: `development plan/.evidence/phase-6.json` (schema: `templates/phase-evidence.schema.json`).
- Include:
  - `checks[]` mapped to Checklist
  - Example run logs and timings; docs link-check report; migration test outputs
  - `refs` to PRD/doc sections for each check
- Do not set status `done` until CI validates evidence and all gates are green.

## Checklist
- [ ] Docs complete (API, migration, best practices, privacy) → Evidence: link-check + sample payloads
- [ ] Examples pass automated runs with expected outputs/timings → Evidence: logs
- [ ] Onboarding script achieves <5 minutes setup → Evidence: timed run log
- [ ] Performance targets met on examples → Evidence: perf report (p95 cached/new; suggestions)
- [ ] Error handling verified (degraded + recovery) → Evidence: chaos test logs
- [ ] Migration tools tested (backup/restore; upgrade/downgrade) → Evidence: migration logs
- [ ] Release artifacts ready (changelog, versions, provenance/SBOM if applicable) → Evidence: artifacts
- [ ] CI green; size budgets enforced → Evidence: CI link + size-limit report

## Review Gate (Automated)
- CI validates `development plan/.evidence/phase-6.json` against `templates/phase-evidence.schema.json`.
- Status JSON indicates `done` with `ciRunId` of final run.
- Checklist mapped to `checks[]` with `passed=true` and artifacts.

## References
- PRD: Milestones M6; Bootstrap & Health; Success Metrics; File Size Strategy; MVP Scope Checklist
- Docs: `docs/design-engine-spec.md`, `docs/integration-protocol.md`, `docs/discovery.md`, `docs/build-quality-plan.md`, `docs/file-size-management.md`, `docs/data-schemas.md`, `docs/roadmap.md`
