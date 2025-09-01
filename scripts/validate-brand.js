#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function srgbToLin(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  const m = hex.trim().match(/^#([0-9a-fA-F]{6})$/);
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function contrastRatio(hex1, hex2) {
  const a = hexToRgb(hex1), b = hexToRgb(hex2);
  if (!a || !b) return null;
  const L1 = 0.2126 * srgbToLin(a.r) + 0.7152 * srgbToLin(a.g) + 0.0722 * srgbToLin(a.b) + 0.05;
  const L2 = 0.2126 * srgbToLin(b.r) + 0.7152 * srgbToLin(b.g) + 0.0722 * srgbToLin(b.b) + 0.05;
  const hi = Math.max(L1, L2), lo = Math.min(L1, L2);
  return +(hi / lo).toFixed(2);
}

function validateNaming(tokens) {
  const issues = [];
  // Basic: keys under colors.roles should be lowercase kebab or simple words
  const roles = tokens?.colors?.roles || {};
  for (const key of Object.keys(roles)) {
    if (!/^[a-z][a-z0-9-]*$/.test(key)) {
      issues.push({ type: 'naming', field: `colors.roles.${key}`, message: 'Use lowercase kebab-case' });
    }
  }
  return issues;
}

function validateContrast(tokens) {
  const issues = [];
  const roles = tokens?.colors?.roles || {};
  const text = roles.text?.value || roles.text;
  const background = roles.background?.value || roles.background;
  if (text && background) {
    const ratio = contrastRatio(text, background);
    if (ratio != null && ratio < 4.5) {
      issues.push({ type: 'contrast', pair: 'text/background', ratio, required: 4.5 });
    }
  }
  return issues;
}

function validateSchema(doc) {
  const issues = [];
  const required = ['id', 'version'];
  for (const k of required) {
    if (!doc || !doc[k]) issues.push({ type: 'schema', field: k, message: 'missing' });
  }
  return issues;
}

function main() {
  const outDir = path.join(process.cwd(), 'reports');
  const outPath = path.join(outDir, 'validator-results.json');
  fs.mkdirSync(outDir, { recursive: true });

  // Prefer active lock brand if present, else snapshots/brand-pack.json brandPack
  const lockPath = path.join(process.cwd(), '.agentic', 'brand-pack.lock.json');
  const lock = readJsonSafe(lockPath);
  let doc = null;
  if (lock && lock.id) {
    // In Phase 1, we lack DB fetch here; validate minimal fields
    doc = { id: lock.id, version: lock.version || 'latest', tokens: {} };
  } else {
    const snap = readJsonSafe(path.join(process.cwd(), 'snapshots', 'brand-pack.json'));
    doc = snap?.brandPack || null;
  }

  const issues = [];
  issues.push(...validateSchema(doc));
  issues.push(...validateNaming(doc?.tokens || {}));
  issues.push(...validateContrast(doc?.tokens || {}));

  const result = {
    generatedAt: new Date().toISOString(),
    ok: issues.length === 0,
    issues
  };
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log('Validator report:', outPath, 'ok=', result.ok, 'issues=', issues.length);
  if (!result.ok) process.exitCode = 1;
}

main();

