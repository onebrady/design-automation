// Deterministic CSS transforms: safe auto-apply classes only
// - Exact token mappings (colors, spacing, radius, elevation)
// - Spacing normalization (px->token) with 5% tolerance
// - Radius/elevation tokenization with 5% tolerance

function buildLookup(tokens = {}) {
  const colorMap = new Map();
  const roles = tokens?.colors?.roles || {};
  for (const [k, v] of Object.entries(roles)) {
    const val = typeof v === 'string' ? v : v.value;
    if (val) colorMap.set(val.toLowerCase(), `var(--color-${k})`);
  }

  const spacingMap = new Map();
  const spacing = tokens?.spacing?.tokens || {};
  for (const [k, v] of Object.entries(spacing)) {
    const val = typeof v === 'string' ? v : v.value;
    if (val) spacingMap.set(val, k); // value → name mapping for lookup
  }

  const radiusMap = new Map();
  const radii = tokens?.radii || {};
  for (const [k, v] of Object.entries(radii)) {
    const val = typeof v === 'string' ? v : v.value;
    if (val) radiusMap.set(val, k); // value → name mapping for lookup
  }

  const elevationMap = new Map();
  const elevation = tokens?.elevation || {};
  for (const [k, v] of Object.entries(elevation)) {
    const val = typeof v === 'string' ? v : v.value;
    if (val) elevationMap.set(val, k); // value → name mapping for lookup
  }

  return { colorMap, spacingMap, radiusMap, elevationMap };
}

function withinTolerance(target, candidate, tol = 0.05) {
  // candidate and target strings like '16px' or '1rem'
  const toPx = (s) => {
    const m = /^([0-9]*\.?[0-9]+)(px|rem)$/.exec(String(s).trim());
    if (!m) return null;
    const n = parseFloat(m[1]);
    const unit = m[2];
    return unit === 'px' ? n : n * 16; // base 16
  };
  const a = toPx(target);
  const b = toPx(candidate);
  if (a == null || b == null) return false;
  const diff = Math.abs(a - b) / a;
  return diff <= tol;
}

function nearestSpacingToken(value, spacingMap) {
  // value like '16px' or '1rem'
  // spacingMap now has value → name mapping
  for (const [tokenVal, name] of spacingMap.entries()) {
    if (withinTolerance(tokenVal, value)) {
      return name;
    }
  }
  return null;
}

function nearestRadiusToken(value, radiusMap) {
  // radiusMap now has value → name mapping  
  for (const [tokenVal, name] of radiusMap.entries()) {
    if (withinTolerance(tokenVal, value)) return name;
  }
  return null;
}

function enhanceCss({ code, tokens = {}, filePath = '', maxChanges = 5, ignoreMarkers = true }) {
  // Exclusions: vendor/generated paths
  const excluded = /node_modules|\/dist\b|\/build\b|\bvendo r\b|\.gen\./i.test(filePath);
  if (excluded) return { code, changes: [] };
  if (ignoreMarkers && /agentic:\s*ignore|agentic-ignore-line|agentic:\s*ignore-next/.test(code)) {
    return { code, changes: [] };
  }
  const { colorMap, spacingMap, radiusMap, elevationMap } = buildLookup(tokens);
  const changes = [];
  let out = code;
  let applied = 0;

  // Exact color tokenization (safe)
  out = out.replace(/(#([0-9a-fA-F]{6}))/g, (m, full) => {
    if (applied >= maxChanges) return m;
    const mapped = colorMap.get(full.toLowerCase());
    if (mapped) {
      changes.push({ type: 'color-tokenization', before: full, after: mapped, location: 'css:color' });
      applied++;
      return mapped;
    }
    return m;
  });

  // Spacing normalization (single value and pairs)
  out = out.replace(/(padding|margin)\s*:\s*([^;]+);/g, (m, prop, vals) => {
    if (applied >= maxChanges) return m;
    const parts = vals.trim().split(/\s+/);
    if (parts.length > 2) return m; // keep simple for MVP (pairs)
    const mapped = parts.map((p) => {
      const name = nearestSpacingToken(p, spacingMap);
      return name ? `var(--spacing-${name})` : null;
    });
    if (mapped.every(Boolean)) {
      const after = `${prop}:${mapped.join(' ')};`;
      changes.push({ type: 'spacing-normalization', before: `${prop}:${vals};`, after, location: `css:${prop}` });
      applied++;
      return after;
    }
    return m;
  });

  // Radius normalization
  out = out.replace(/border-radius\s*:\s*([^;]+);/g, (m, val) => {
    if (applied >= maxChanges) return m;
    const name = nearestRadiusToken(val.trim(), radiusMap);
    if (name) {
      const after = `border-radius: var(--radius-${name});`;
      changes.push({ type: 'radius-normalization', before: m, after, location: 'css:border-radius' });
      applied++;
      return after;
    }
    return m;
  });

  // Elevation normalization (exact match only, safe)
  out = out.replace(/box-shadow\s*:\s*([^;]+);/g, (m, val) => {
    if (applied >= maxChanges) return m;
    // elevationMap now has value → name mapping
    for (const [tokenVal, name] of elevationMap.entries()) {
      if (String(val).trim() === String(tokenVal).trim()) {
        const after = `box-shadow: var(--elevation-${name});`;
        changes.push({ type: 'elevation-normalization', before: m, after, location: 'css:box-shadow' });
        applied++;
        return after;
      }
    }
    return m;
  });

  return { code: out, changes };
}

// Export advanced transformation systems
const { TypographyScaleSystem } = require('./typography');
const { AnimationTokenSystem } = require('./animations');
const { GradientSystem } = require('./gradients');
const { StateVariationSystem } = require('./states');
const { CompositionalTransformSystem } = require('./compositor');
const { CSSOptimizer } = require('./optimizer');

// Advanced transformation function with all systems
function enhanceAdvanced({ code, tokens = {}, filePath = '', options = {} }) {
  const compositor = new CompositionalTransformSystem();
  
  return compositor.composeTransformations(code, tokens, {
    filePath,
    enableTypography: options.enableTypography !== false,
    enableAnimations: options.enableAnimations !== false,
    enableGradients: options.enableGradients !== false,
    enableStates: options.enableStates !== false,
    enableOptimization: options.enableOptimization !== false,
    ...options
  });
}

// Typography-focused enhancement
function enhanceTypography({ code, tokens = {}, filePath = '' }) {
  const typography = new TypographyScaleSystem();
  return typography.transformTypography(code, tokens);
}

// Animation-focused enhancement
function enhanceAnimations({ code, tokens = {}, filePath = '' }) {
  const animations = new AnimationTokenSystem();
  return animations.transformAnimations(code, tokens);
}

// Gradient-focused enhancement
function enhanceGradients({ code, tokens = {}, filePath = '' }) {
  const gradients = new GradientSystem();
  return gradients.transformGradients(code, tokens);
}

// State variations enhancement
function enhanceStates({ code, tokens = {}, filePath = '' }) {
  const states = new StateVariationSystem();
  return states.transformStateVariations(code, tokens);
}

// CSS optimization only
function optimizeCSS({ code, level = 2, options = {} }) {
  const optimizer = new CSSOptimizer({ level, ...options });
  return optimizer.optimize(code);
}

module.exports = { 
  enhanceCss,
  enhanceAdvanced,
  enhanceTypography,
  enhanceAnimations,
  enhanceGradients,
  enhanceStates,
  optimizeCSS,
  // Export transformation classes for direct use
  TypographyScaleSystem,
  AnimationTokenSystem,
  GradientSystem,
  StateVariationSystem,
  CompositionalTransformSystem,
  CSSOptimizer
};
