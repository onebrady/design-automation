# Design Intelligence Engine Specification (Pattern Learning + Caching)

## Purpose

Provide intelligent, pattern-learning enhancements for frontend code that proactively suggest optimizations, cache results for instant performance, and seamlessly integrate with AI agents for zero-friction design automation.

## Capabilities (Enhanced)

- **Analyze**: Compute comprehensive metrics with pattern learning — token adherence %, contrast scores, type scale conformity, spacing consistency, component correlations, usage patterns.
- **Enhance**: Apply intelligent transforms with caching — deterministic AST-based enhancements, pattern-aware optimizations, instant cached results, proactive suggestions.
- **Suggest (Proactive)**: Pattern-learning recommendations — usage-based suggestions, component correlations, brand evolution recommendations, performance optimizations.
- **Cache**: Intelligent result caching — hash-based change detection, multi-level caching (memory → MongoDB → file), instant re-enhancement for repeated operations.
- **Learn**: Pattern recognition engine — user preference analysis, component usage tracking, design habit learning, proactive optimization suggestions.

## Transform Rules (Intelligent + Pattern-Aware)

- **Colors (Enhanced)**
  - Map literal colors to role-based tokens with usage pattern analysis
  - Upgrade insufficient contrast using learned user preferences
  - Suggest color additions based on component usage patterns
  - Optimize color choices based on accessibility and performance data

- **Typography (Pattern-Learning)**
  - Conform headings to modular scale with component-specific optimizations
  - Normalize font stacks based on usage patterns and performance metrics
  - Suggest font weight combinations based on user design habits
  - Optimize font loading with usage-based subset recommendations

- **Spacing (Component-Aware)**
  - Normalize spacing using learned component preferences
  - Remove margin conflicts with pattern-based resolution
  - Suggest spacing tokens based on similar component usage
  - Optimize density presets based on user workflow patterns

- **Elevation & Radius (Usage-Optimized)**
  - Replace ad-hoc values with tokens based on component correlations
  - Suggest elevation/radius combinations from usage patterns
  - Optimize for performance with usage-based caching hints

- **Responsiveness (Adaptive)**
  - Apply responsive patterns based on learned user preferences
  - Suggest breakpoint optimizations from usage analytics
  - Adaptive container sizing based on component usage patterns

## Safety & Guarantees (Enhanced)

- **AST-Only Core**: Deterministic transformations (PostCSS+csstree for CSS; Babel/SWC/HAST for HTML/JSX)
- **Semantic Preservation**: Never change component logic or DOM structure; props/handlers remain intact
- **Idempotency**: Second run produces no diff; enhanced with intelligent caching signatures
- **Reversibility**: Source maps and change lists for IDE undo; cached rollback capabilities
- **Cache Safety**: Hash-based change detection prevents stale cache usage
- **Pattern Learning Boundaries**: User preferences always override learned suggestions
  - **Safe Auto-Apply (MVP)**: Auto-apply only safe classes (spacing normalization, radius/elevation tokenization, exact token mappings) when confidence ≥ 0.9 and guardrails pass
  - **Confidence Gating**: Suppress suggestions < 0.8; keep 0.8–0.9 advisory; allow configuration via settings
  - **Change Caps**: Apply ≤ 5 changes per file and respect per-commit caps; vendor/third-party code excluded
  - **Traceability**: Every auto-apply records confidence, guardrail checks (e.g., AA maintained), and reversible diff

## Confidence Scoring Inputs (MVP)

- Exact token match (unique mapping) → strong positive signal
- Contrast delta (AA maintained/improved) → positive signal when color-adjacent
- Layout safety (non-fragile patterns) → positive; fragile layouts → negative
- Project consistency (same-component usage alignment) → positive
- Progressive apply passes (no metric regression after first changes) → positive
- User feedback (accepts/reverts) → adaptive boost/decay per rule/component
- Overrides alignment → positive; conflict → negative/suppress
- Ambiguity (multiple tokens fit) → suppress auto-apply

## Progressive Application (MVP)

1. Propose ranked safe changes for a file.
2. Apply 1–2 changes; recompute key metrics (token adherence, spacing consistency, basic AA checks).
3. If non-regressive, proceed until reaching cap; otherwise stop and keep remaining changes advisory.

- **Performance Guards**: Automatic fallback to deterministic transforms if caching fails
- **Privacy Protection**: Pattern learning data stays local; no external transmission

## API Contracts (Enhanced)

### Core Analysis & Enhancement

- `POST /api/design/analyze` → `{ metrics, issues, opportunities, patterns, size }`
- `POST /api/design/enhance` → `{ code, changes[], metricsDelta, brandCompliance, cachingSignature }`
- `POST /api/design/enhance-cached` → Instant results using intelligent caching
- `GET /api/context` → Current brand/project context and availability `{ brandPack, projectId, degraded, mongoAvailable, lastSync }`

### Pattern Learning & Intelligence

- `POST /api/design/suggest-proactive` → `{ suggestions, confidence, basedOnPatterns }`
- `GET /api/design/patterns/learned` → User's learned design preferences
- `POST /api/design/patterns/track` → Record component usage for learning
- (Optional, post-MVP) `GET /api/design/patterns/settings` → thresholds and auto-apply flags
- (Optional, post-MVP) `PATCH /api/design/patterns/settings` → update thresholds/flags

### Auto-Apply Policy (MVP)

- Default env controls:
  - `AGENTIC_AUTO_APPLY`: `safe` (default) | `off` | `all` (not recommended)
  - `AGENTIC_AUTO_APPLY_MAX_CHANGES`: integer (default 5)
  - `AGENTIC_STRICT`: `1` to fail on guardrail violations

### Caching & Performance

- `GET /api/design/cache/status` → Cache hit rates and performance metrics
- `POST /api/design/cache/invalidate` → Smart cache invalidation with pattern updates
- `GET /api/design/cache/optimize` → Automated cache optimization recommendations

### Enhanced Request/Response Examples

**Analyze Request (with Pattern Learning):**

```json
{
  "code": "<section class=\"hero\">...</section>",
  "codeType": "html",
  "brandPackId": "my-startup-brand",
  "context": {
    "componentType": "hero",
    "projectPath": "/current/project",
    "usePatterns": true
  }
}
```

**Analyze Response (Pattern-Enhanced):**

```json
{
  "metrics": {
    "tokenAdherence": 0.87,
    "contrastAA": 0.95,
    "typeScaleFit": 0.92,
    "spacingConsistency": 0.89,
    "patternEffectiveness": 0.94,
    "size": { "rawBytes": 5840 }
  },
  "patterns": {
    "similarComponents": ["hero", "landing-section"],
    "suggestedOptimizations": ["spacing-lg", "color-primary"],
    "usageConfidence": 0.85
  },
  "issues": [
    {
      "type": "contrast",
      "severity": "high",
      "location": "h1",
      "details": { "ratio": 3.5, "required": 4.5 },
      "patternSuggestion": "Use --color-text for better consistency"
    }
  ],
  "opportunities": [
    {
      "type": "tokenize-color",
      "target": "#1f2937",
      "suggestedToken": "var(--color-text)",
      "confidence": 0.92,
      "basedOn": "hero components in your projects"
    }
  ]
}
```

**Enhance Request (with Caching & Patterns):**

```json
{
  "code": ".btn{background:#1f2937;padding:14px 18px;border-radius:10px}",
  "codeType": "css",
  "componentType": "button",
  "context": {
    "pageType": "landing",
    "projectPath": "/current/project",
    "usePatterns": true,
    "cacheResults": true
  },
  "preserveStructure": true,
  "brandPackId": "my-startup-brand"
}
```

**Enhance Response (Intelligent & Cached):**

```json
{
  "code": ".btn{background:var(--color-primary);padding:var(--spacing-md) var(--spacing-lg);border-radius:var(--radius-md)}",
  "changes": [
    {
      "type": "color-tokenization",
      "before": "#1f2937",
      "after": "var(--color-primary)",
      "location": ".btn:background",
      "confidence": 0.95,
      "basedOn": "button patterns in your projects"
    },
    {
      "type": "spacing-normalization",
      "before": "14px 18px",
      "after": "var(--spacing-md) var(--spacing-lg)",
      "location": ".btn:padding",
      "patternMatch": "primary-button-spacing"
    },
    {
      "type": "radius-normalization",
      "before": "10px",
      "after": "var(--radius-md)",
      "location": ".btn:border-radius",
      "usageCorrelation": "button radius in 89% of components"
    }
  ],
  "metricsDelta": {
    "tokenAdherence": +0.38,
    "spacingConsistency": +0.21,
    "patternEffectiveness": +0.15
  },
  "brandCompliance": { "before": 0.45, "after": 0.93 },
  "cachingSignature": "sha256:cached-result-123",
  "patternsApplied": ["primary-button-style", "consistent-spacing"],
  "performanceImpact": { "bundleDelta": 0.01, "cacheHit": true }
}
```

**Cached Enhancement (Instant Results):**

```json
{
  "cached": true,
  "cacheHitRate": 0.87,
  "responseTime": 45,
  "code": ".btn{background:var(--color-primary);padding:var(--spacing-md) var(--spacing-lg);border-radius:var(--radius-md)}",
  "lastEnhanced": "2025-01-15T10:30:00Z"
}
```

## Enhanced Change List Schema

```json
{
  "type": "object",
  "required": ["type", "location"],
  "properties": {
    "type": { "type": "string" },
    "location": { "type": "string" },
    "before": {},
    "after": {},
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
    "basedOn": { "type": "string" },
    "patternMatch": { "type": "string" },
    "usageCorrelation": { "type": "string" },
    "impact": { "type": "string" }
  }
}
```

## Enhanced Metrics Schema

```json
{
  "tokenAdherence": { "type": "number", "minimum": 0, "maximum": 1 },
  "contrastAA": { "type": "number", "minimum": 0, "maximum": 1 },
  "typeScaleFit": { "type": "number", "minimum": 0, "maximum": 1 },
  "spacingConsistency": { "type": "number", "minimum": 0, "maximum": 1 },
  "patternEffectiveness": { "type": "number", "minimum": 0, "maximum": 1 },
  "performanceImpact": {
    "type": "object",
    "properties": {
      "bundleDelta": { "type": "number" },
      "cacheHit": { "type": "boolean" },
      "responseTime": { "type": "number" }
    }
  },
  "size": {
    "type": "object",
    "properties": { "rawBytes": { "type": "integer" } }
  }
}
```

## Failure Handling (Enhanced)

- **Graceful Degradation**: If analysis/enhancement fails, return original code with fallback to deterministic transforms
- **Degraded Context**: If MongoDB is unreachable, operate using the lock snapshot when available; expose `degraded: true` via `/api/context`
- **Cache Recovery**: Automatic cache invalidation and rebuild on failures
- **Pattern Learning Boundaries**: Conservative pattern application with confidence thresholds
- **Auto-Fix Intelligence**: `canAutoFix` flags enhanced with pattern confidence scores
- **Comprehensive Logging**: Timing, signatures, and pattern effectiveness tracking
- **Recovery Mechanisms**: Automatic rollback to previous working state on critical failures

## Performance Targets (Optimized)

- **Cached Enhancement**: <100ms response time for cached operations; instant re-enhancement
- **New Enhancement**: p95 <300ms per file in dev; <2s for large files with intelligent chunking
- **Pattern Learning**: <100ms pattern analysis and suggestion generation
- **Memory Optimization**: Multi-level caching with automatic cleanup; minimal memory footprint
- **Cache Hit Rate**: >70% for repeat operations; intelligent pre-warming
- **Bundle Impact**: <2% bundle size increase with tree-shaking optimizations

## Testing Strategy (Comprehensive)

- **Golden Fixtures**: Enhanced before/after snapshots with pattern learning validation
- **Idempotency Suite**: Cache-aware idempotency testing with signature verification
- **Pattern Learning Tests**: Confidence threshold validation and suggestion accuracy testing
  - Advisory-first: assert no changes are applied without explicit opt-in
  - Precision/Recall sampling on accepted suggestions; drift monitoring
- **Caching Tests**: Cache hit/miss scenarios, invalidation testing, performance validation
- **Property-Based Testing**: CSS value normalization with pattern correlation testing
- **Accessibility Testing**: Contrast validation with usage pattern optimization
- **Integration Tests**: End-to-end agent workflows with caching and pattern learning
- **Performance Tests**: Cache hit rates, response times, memory usage validation
- **MongoDB Tests**: Data persistence, migration testing, query performance validation

## Deterministic Transform Contracts (MVP)

- General
  - Idempotent; no DOM/logic changes; ≤5 changes/file; vendor/generated excluded; honor ignore markers
  - Ignore markers: `/* agentic: ignore */`, `/* agentic: ignore-next */`, `// agentic-ignore-line`

- Color tokenization
  - Auto-apply only on exact 1:1 token match (normalized, case-insensitive); multiple candidates → advisory
  - Contrast guardrail: maintain/improve AA; otherwise skip
  - No semantic shifts (states/accents) without exact tokens

- Spacing normalization
  - px→rem at base 16; nearest token within 5% tolerance
  - Shorthands: expand→normalize→collapse if all sides map; otherwise advisory
  - Leave dynamic values (`calc()`, `var()`) unless exact token replacement

- Radius & elevation
  - Map numeric values/shadows to nearest token within 5% tolerance
  - Ambiguity → advisory

- Coverage
  - CSS, CSS-in-JS (template literals), inline styles where unambiguous
  - Skip third-party and generated artifacts

- Tests
  - Golden/idempotency suites per rule; contrast/ambiguity/shorthand fixtures; vendor exclusion checks
