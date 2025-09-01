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
    if (val) spacingMap.set(k, val);
  }

  const radiusMap = new Map();
  const radii = tokens?.radii || {};
  for (const [k, v] of Object.entries(radii)) {
    const val = typeof v === 'string' ? v : v.value;
    if (val) radiusMap.set(k, val);
  }

  const elevationMap = new Map();
  const elevation = tokens?.elevation || {};
  for (const [k, v] of Object.entries(elevation)) {
    const val = typeof v === 'string' ? v : v.value;
    if (val) elevationMap.set(k, val);
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
  let best = null;
  for (const [name, tokenVal] of spacingMap.entries()) {
    if (withinTolerance(tokenVal, value)) {
      best = name;
      break;
    }
  }
  return best;
}

function nearestRadiusToken(value, radiusMap) {
  for (const [name, tokenVal] of radiusMap.entries()) {
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
  let changes = [];
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
    for (const [name, tokenVal] of elevationMap.entries()) {
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

module.exports = { enhanceCss };
