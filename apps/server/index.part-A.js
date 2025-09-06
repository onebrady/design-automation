#!/usr/bin/env node
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const { MongoClient } = require('mongodb');
const { Anthropic } = require('@anthropic-ai/sdk');
const { resolveProjectContext } = require('../../packages/discovery');

const PORT = process.env.PORT || 8901;
const mongoUri = process.env.AGENTIC_MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.AGENTIC_DB_NAME || 'agentic_design';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

// AI Configuration
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, JPEG, and SVG are allowed.'));
    }
  }
});


async function mongoHealth() {
  let client;
  try {
    client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 1000 });
    await client.connect();
    await client.db(dbName).command({ ping: 1 });
    return { mongoAvailable: true, lastOkAt: new Date().toISOString() };
  } catch {
    return { mongoAvailable: false, lastOkAt: null };
  } finally {
    if (client) await client.close().catch(() => {});
  }
}

async function generateBrandPackFromLogo(imageBuffer, mimeType, brandName, description = '') {
  console.log('=== generateBrandPackFromLogo ===');
  console.log('API Key present:', !!process.env.ANTHROPIC_API_KEY);
  console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length || 0);
  
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not configured');
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  console.log('Converting image to base64...');
  const base64Image = imageBuffer.toString('base64');
  const mediaType = mimeType === 'image/svg+xml' ? 'image/svg+xml' : 
                   mimeType === 'image/jpeg' || mimeType === 'image/jpg' ? 'image/jpeg' : 'image/png';
  
  console.log('Media type determined:', mediaType);
  console.log('Base64 image length:', base64Image.length);

  const prompt = `You are an expert brand designer and design system architect. Please analyze this logo image and create a comprehensive brand pack schema.

Generate a complete brand pack JSON that includes:

1. **Core Identity**:
   - id: kebab-case version of brand name
   - name: "${brandName}"
   - version: "1.0.0"
   - description: "${description || 'AI-generated brand pack from logo analysis'}"

2. **Brand Personality** (0-10 scales):
   - modern_traditional: How modern vs traditional the brand feels
   - playful_serious: How playful vs serious the brand appears
   - trustworthy_innovative: How trustworthy vs innovative the brand seems

3. **Complete Token System**:

   **Colors** (extract and expand from logo):
   - Primary: Main brand color from logo + variations (light/dark)
   - Secondary: Complementary color + variations
   - Accent: Attention-grabbing color for CTAs + variations
   - Background: Light and dark versions (#ffffff, #0f0f0f)
   - Surface: Subtle backgrounds (#f8fafc, #1a1a1a)
   - Text: High contrast text colors (#0f172a, #ffffff)
   - Success: Green tone (#22c55e, #16a34a for dark)
   - Warning: Yellow/orange tone (#f59e0b, #d97706 for dark)
   - Danger: Red tone (#ef4444, #dc2626 for dark)
   - Neutral: Grayscale variations (#64748b, #94a3b8, #cbd5e1, #e2e8f0)
   - Brand variations: Include 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 weight variations of main colors

   **Typography**:
   - heading: { family: "recommended font", weights: [600, 700] }
   - body: { family: "readable font", weights: [400, 500] }
   - scale: 1.25 (modular scale ratio)

   **Spacing** (comprehensive scale):
   - px: "1px", 0: "0", 0.5: "0.125rem", 1: "0.25rem", 1.5: "0.375rem", 2: "0.5rem", 2.5: "0.625rem", 3: "0.75rem", 3.5: "0.875rem", 4: "1rem", 5: "1.25rem", 6: "1.5rem", 7: "1.75rem", 8: "2rem", 9: "2.25rem", 10: "2.5rem", 11: "2.75rem", 12: "3rem", 14: "3.5rem", 16: "4rem", 20: "5rem", 24: "6rem"
   - Named tokens: xs: "0.25rem", sm: "0.5rem", md: "1rem", lg: "2rem", xl: "3rem", 2xl: "4rem", 3xl: "6rem"

   **Radii** (comprehensive scale):
   - none: "0", xs: "0.125rem", sm: "0.25rem", md: "0.375rem", lg: "0.5rem", xl: "0.75rem", 2xl: "1rem", 3xl: "1.5rem", full: "9999px"
   - Named: "2px", "4px", "6px", "8px", "10px", "12px", "16px", "20px", "24px"

   **Elevation**:
   - sm: "0 1px 2px rgba(0,0,0,0.06)"
   - md: "0 4px 8px rgba(0,0,0,0.08)"
   - lg: "0 10px 25px rgba(0,0,0,0.1)"

4. **Both Light & Dark Modes**: Provide appropriate color variations for both themes

5. **Accessibility**: Ensure all color combinations meet WCAG AA standards (4.5:1 contrast ratio minimum)

Return ONLY a valid JSON object that matches this exact schema:

{
  "id": "brand-id",
  "name": "Brand Name",
  "version": "1.0.0", 
  "description": "Description",
  "personality": {
    "modern_traditional": 8,
    "playful_serious": 4,
    "trustworthy_innovative": 7
  },
  "tokens": {
    "colors": {
      "roles": {
        "primary": { "value": "#hex", "light": "#hex", "dark": "#hex" },
        "primary-50": { "value": "#hex", "light": "#hex", "dark": "#hex" },
        "primary-100": { "value": "#hex", "light": "#hex", "dark": "#hex" },
        "primary-200": { "value": "#hex", "light": "#hex", "dark": "#hex" },
        "primary-300": { "value": "#hex", "light": "#hex", "dark": "#hex" },
        "primary-400": { "value": "#hex", "light": "#hex", "dark": "#hex" },
        "primary-500": { "value": "#hex", "light": "#hex", "dark": "#hex" },
        "primary-600": { "value": "#hex", "light": "#hex", "dark": "#hex" },
        "primary-700": { "value": "#hex", "light": "#hex", "dark": "#hex" },
        "primary-800": { "value": "#hex", "light": "#hex", "dark": "#hex" },
        "primary-900": { "value": "#hex", "light": "#hex", "dark": "#hex" },
        "secondary": { "value": "#hex", "light": "#hex", "dark": "#hex" },
        "accent": { "value": "#hex", "light": "#hex", "dark": "#hex" },
        "background": { "value": "#ffffff", "light": "#ffffff", "dark": "#0f0f0f" },
        "surface": { "value": "#f8fafc", "light": "#f8fafc", "dark": "#1a1a1a" },
        "text": { "value": "#0f172a", "light": "#0f172a", "dark": "#ffffff" },
        "text-muted": { "value": "#64748b", "light": "#64748b", "dark": "#94a3b8" },
        "neutral-100": { "value": "#f1f5f9", "light": "#f1f5f9", "dark": "#0f172a" },
        "neutral-200": { "value": "#e2e8f0", "light": "#e2e8f0", "dark": "#1e293b" },
        "neutral-300": { "value": "#cbd5e1", "light": "#cbd5e1", "dark": "#334155" },
        "neutral-400": { "value": "#94a3b8", "light": "#94a3b8", "dark": "#475569" },
        "neutral-500": { "value": "#64748b", "light": "#64748b", "dark": "#64748b" },
        "neutral-600": { "value": "#475569", "light": "#475569", "dark": "#94a3b8" },
        "neutral-700": { "value": "#334155", "light": "#334155", "dark": "#cbd5e1" },
        "neutral-800": { "value": "#1e293b", "light": "#1e293b", "dark": "#e2e8f0" },
        "neutral-900": { "value": "#0f172a", "light": "#0f172a", "dark": "#f1f5f9" },
        "success": { "value": "#22c55e", "light": "#22c55e", "dark": "#16a34a" },
        "warning": { "value": "#f59e0b", "light": "#f59e0b", "dark": "#d97706" },
        "danger": { "value": "#ef4444", "light": "#ef4444", "dark": "#dc2626" }
      }
    },
    "typography": {
      "heading": { "family": "Inter", "weights": [600, 700] },
      "body": { "family": "system-ui", "weights": [400, 500] },
      "scale": 1.25
    },
    "spacing": {
      "tokens": {
        "px": { "value": "1px" },
        "0": { "value": "0" },
        "0.5": { "value": "0.125rem" },
        "1": { "value": "0.25rem" },
        "1.5": { "value": "0.375rem" },
        "2": { "value": "0.5rem" },
        "2.5": { "value": "0.625rem" },
        "3": { "value": "0.75rem" },
        "3.5": { "value": "0.875rem" },
        "4": { "value": "1rem" },
        "5": { "value": "1.25rem" },
        "6": { "value": "1.5rem" },
        "7": { "value": "1.75rem" },
        "8": { "value": "2rem" },
        "9": { "value": "2.25rem" },
        "10": { "value": "2.5rem" },
        "11": { "value": "2.75rem" },
        "12": { "value": "3rem" },
        "14": { "value": "3.5rem" },
        "16": { "value": "4rem" },
        "20": { "value": "5rem" },
        "24": { "value": "6rem" },
        "xs": { "value": "0.25rem" },
        "sm": { "value": "0.5rem" },
        "md": { "value": "1rem" },
        "lg": { "value": "2rem" },
        "xl": { "value": "3rem" },
        "2xl": { "value": "4rem" },
        "3xl": { "value": "6rem" }
      }
    },
    "radii": {
      "none": { "value": "0" },
      "xs": { "value": "0.125rem" },
      "sm": { "value": "0.25rem" },
      "md": { "value": "0.375rem" },
      "lg": { "value": "0.5rem" },
      "xl": { "value": "0.75rem" },
      "2xl": { "value": "1rem" },
      "3xl": { "value": "1.5rem" },
      "full": { "value": "9999px" },
      "2": { "value": "2px" },
      "4": { "value": "4px" },
      "6": { "value": "6px" },
      "8": { "value": "8px" },
      "10": { "value": "10px" },
      "12": { "value": "12px" },
      "16": { "value": "16px" },
      "20": { "value": "20px" },
      "24": { "value": "24px" }
    },
    "elevation": {
      "sm": { "value": "0 1px 2px rgba(0,0,0,0.06)" },
      "md": { "value": "0 4px 8px rgba(0,0,0,0.08)" },
      "lg": { "value": "0 10px 25px rgba(0,0,0,0.1)" }
    }
  }
}

Analyze the logo carefully for:
- Extract exact dominant colors using color theory principles
- Create harmonious palettes with proper color relationships (complementary, triadic, analogous)
- Assess brand personality and industry context for appropriate color psychology
- Suggest typography that matches the brand's visual weight and personality
- Ensure all color combinations meet WCAG AA accessibility standards (4.5:1 minimum contrast)
- Create sophisticated light and dark theme variations with proper semantic color roles
- Consider color temperature, saturation levels, and visual hierarchy
- Apply professional design system principles for scalable token architecture`;

  try {
    console.log('Making request to Claude API...');
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Image
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }]
    });

    console.log('Claude API response received, length:', response.content[0].text.length);
    const jsonResponse = response.content[0].text;
    
    // Parse and validate the JSON response
    let brandPack;
    try {
      brandPack = JSON.parse(jsonResponse);
    } catch (parseError) {
      // Try to extract JSON from response if it's wrapped in text
      const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        brandPack = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from Claude response');
      }
    }

    // Add timestamps and default fields
    brandPack.created = new Date();
    brandPack.updated = new Date();

    return brandPack;
  } catch (error) {
    console.error('Error generating brand pack from logo:', error);
    throw error;
  }
}

async function main() {
  const app = express();
  app.use(express.json());
  
  // Add CORS support for cross-origin requests
  const cors = require('cors');
  app.use(cors({
    origin: true, // Allow all origins for development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  const pkg = readJsonSafe(path.join(process.cwd(), 'package.json')) || { version: '0.0.0' };

  async function withDb(fn) {
    let client;
    try {
      client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 1500 });
      await client.connect();
      const db = client.db(dbName);
      return await fn(db);
    } catch (e) {
      console.error('DB error', e.message);
      throw new Error(`Database error: ${e.message}`);
    } finally {
      if (client) await client.close().catch(() => {});
    }
  }

  app.get('/api/health', async (req, res) => {
    const h = await mongoHealth();
    res.json({ ok: true, version: pkg.version, degraded: !h.mongoAvailable, ...h });
  });

  app.get('/api/context', async (req, res) => {
    const ctx = await resolveProjectContext(process.cwd());
    const response = {
      brandPack: ctx.brandPack || { id: null, version: null, source: 'unknown' },
      projectId: ctx.projectId || null,
      overrides: ctx.overrides || {},
      mongoAvailable: ctx.mongoAvailable,
      degraded: ctx.degraded,
      lastSync: new Date().toISOString()
    };
    res.json(response);
  });

  // Phase 1: Brand Pack CRUD + versioning
  app.get('/api/brand-packs', async (req, res) => {
    await withDb(async (db) => {
      const cursor = db.collection('brand_packs').find({}, { projection: { _id: 0 } });
      const items = await cursor.toArray();
      res.json(items);
    }, res);
  });

  app.post('/api/brand-packs', async (req, res) => {
    try {
      const body = req.body || {};
      const id = body.id;
      if (!id) return res.status(400).json({ error: 'invalid_request', message: 'id required' });
      const version = body.version || '1.0.0';
      const baseDoc = {
        id,
        name: body.name || id,
        version,
        description: body.description || '',
        tokens: body.tokens || {},
        updated: new Date()
      };
      
      await withDb(async (db) => {
        // Simple upsert without created field conflicts
        await db.collection('brand_packs').replaceOne(
          { id }, 
          { ...baseDoc, created: new Date() }, 
          { upsert: true }
        );
        await db.collection('brand_pack_versions').replaceOne(
          { id, version },
          { ...baseDoc, created: new Date(), updated: new Date() },
          { upsert: true }
        );
        // Write lock snapshot
        const lockDir = path.join(process.cwd(), '.agentic');
        try {
          fs.mkdirSync(lockDir, { recursive: true });
          fs.writeFileSync(
            path.join(lockDir, 'brand-pack.lock.json'),
            JSON.stringify({ id, version, etag: null, lastSync: new Date().toISOString(), source: 'mongo' }, null, 2)
          );
        } catch (e) {
          console.warn('Failed to write lock snapshot:', e.message);
        }
      });
      
      res.status(201).json({ id, version });
    } catch (error) {
      console.error('Brand pack creation failed:', error.message);
      res.status(500).json({ error: 'brand_pack_creation_failed', message: error.message });
    }
  });

  // AI Brand Pack Generation Endpoint
  app.post('/api/brand-packs/generate-from-logo', upload.single('logo'), async (req, res) => {
    try {
      console.log('=== AI Brand Pack Generation Request ===');
      console.log('API Key configured:', !!process.env.ANTHROPIC_API_KEY);
      console.log('File received:', !!req.file);
      console.log('Request body:', req.body);

      if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ error: 'invalid_request', message: 'logo file required' });
      }

      const { brandName, description } = req.body;
      if (!brandName) {
        console.error('No brand name provided');
        return res.status(400).json({ error: 'invalid_request', message: 'brandName required' });
      }

      console.log(`Generating brand pack for: ${brandName}`);
      console.log('File info:', { 
        mimetype: req.file.mimetype, 
        size: req.file.buffer.length,
        filename: req.file.originalname 
      });
      
      // Generate brand pack using AI
      const generatedBrandPack = await generateBrandPackFromLogo(
        req.file.buffer, 
        req.file.mimetype, 
        brandName, 
        description
      );

      // Save to MongoDB
      await withDb(async (db) => {
        const doc = {
          ...generatedBrandPack,
          updated: new Date()
        };

        await db.collection('brand_packs').updateOne(
          { id: generatedBrandPack.id }, 
          { $set: doc }, 
          { upsert: true }
        );
        
        await db.collection('brand_pack_versions').updateOne(
          { id: generatedBrandPack.id, version: generatedBrandPack.version },
          { $set: { ...doc, updated: new Date() } },
          { upsert: true }
        );

        // Write lock snapshot
        const lockDir = path.join(process.cwd(), '.agentic');
        try {
          fs.mkdirSync(lockDir, { recursive: true });
          fs.writeFileSync(
            path.join(lockDir, 'brand-pack.lock.json'),
            JSON.stringify({ 
              id: generatedBrandPack.id, 
              version: generatedBrandPack.version, 
              etag: null, 
              lastSync: new Date().toISOString(), 
              source: 'ai_generated' 
            }, null, 2)
          );
        } catch (e) {
          console.warn('Failed to write lock snapshot:', e.message);
        }

        res.status(201).json({
          success: true,
          brandPack: generatedBrandPack,
          message: 'Brand pack generated successfully from logo'
        });
      }, res);

    } catch (error) {
      console.error('Error in AI brand pack generation:', error);
      res.status(500).json({ 
        error: 'generation_failed', 
        message: error.message || 'Failed to generate brand pack from logo'
      });
    }
  });

  app.get('/api/brand-packs/:id', async (req, res) => {
    const id = req.params.id;
    await withDb(async (db) => {
      const doc = await db.collection('brand_packs').findOne({ id }, { projection: { _id: 0 } });
      if (!doc) return res.status(404).json({ error: 'not_found' });
      res.json(doc);
    }, res);
  });

  app.post('/api/brand-packs/:id/version', async (req, res) => {
    try {
      const id = req.params.id;
      const body = req.body || {};
      const version = body.version;
      if (!version) return res.status(400).json({ error: 'invalid_request', message: 'version required' });
      
      await withDb(async (db) => {
        const active = await db.collection('brand_packs').findOne({ id });
        const newDoc = {
          ...(active || {}),
          id,
          version,
          tokens: body.tokens || (active ? active.tokens : {}),
          updated: new Date()
        };
        
        // Use replaceOne to avoid field conflicts
        await db.collection('brand_pack_versions').replaceOne(
          { id, version },
          { ...newDoc, created: new Date(), updated: new Date() },
          { upsert: true }
        );
        await db.collection('brand_packs').replaceOne(
          { id }, 
          { ...newDoc, created: new Date() }, 
          { upsert: true }
        );
        
        // Write lock snapshot
        const lockDir = path.join(process.cwd(), '.agentic');
        try {
          fs.mkdirSync(lockDir, { recursive: true });
          fs.writeFileSync(
            path.join(lockDir, 'brand-pack.lock.json'),
            JSON.stringify({ id, version, etag: null, lastSync: new Date().toISOString(), source: 'mongo' }, null, 2)
          );
        } catch (e) {
          console.warn('Failed to write lock snapshot:', e.message);
        }
      });
      
      res.status(201).json({ id, version });
    } catch (error) {
      console.error('Brand pack version creation failed:', error.message);
      res.status(500).json({ 
        error: 'version_creation_failed', 
        message: error.message 
      });
    }
  });

  app.get('/api/brand-packs/:id/versions', async (req, res) => {
    const id = req.params.id;
    await withDb(async (db) => {
      const cursor = db.collection('brand_pack_versions').find({ id }, { projection: { _id: 0 } }).sort({ updated: -1 });
      res.json(await cursor.toArray());
    }, res);
  });

  // Export helpers
  function cssFromTokens(tokens = {}) {
    const lines = [":root {"]; 
    const pushVar = (name, value) => {
      if (value == null) return;
      lines.push(`  --${name}: ${value};`);
    };
    const colors = tokens.colors?.roles || {};
    Object.entries(colors).forEach(([k, v]) => pushVar(`color-${k}`, v.value || v));
    const spacing = tokens.spacing?.tokens || {};
    Object.entries(spacing).forEach(([k, v]) => pushVar(`spacing-${k}`, v.value || v));
    const radii = tokens.radii || {};
    Object.entries(radii).forEach(([k, v]) => pushVar(`radius-${k}`, v.value || v));
    const elevation = tokens.elevation || {};
    Object.entries(elevation).forEach(([k, v]) => pushVar(`elevation-${k}`, v.value || v));
    const typography = tokens.typography || {};
    if (typography.heading?.family) pushVar('font-heading', typography.heading.family);
    if (typography.body?.family) pushVar('font-body', typography.body.family);
    lines.push('}');
    return lines.join('\n') + '\n';
  }

  app.get('/api/brand-packs/:id/export/css', async (req, res) => {
    const id = req.params.id;
    await withDb(async (db) => {
      const bp = await db.collection('brand_packs').findOne({ id });
      if (!bp) return res.status(404).type('text/plain').send('not_found');
      const css = cssFromTokens(bp.tokens || {});
      res.setHeader('Content-Type', 'text/css');
      res.send(css);
    }, res);
  });

  app.get('/api/brand-packs/:id/export/json', async (req, res) => {
    const id = req.params.id;
    await withDb(async (db) => {
      const bp = await db.collection('brand_packs').findOne({ id }, { projection: { _id: 0 } });
      if (!bp) return res.status(404).json({ error: 'not_found' });
      const payload = {
        brandPack: bp,
        tokens: bp.tokens || {},
        analytics: bp.analytics || {},
        patterns: bp.patterns || {}
      };
      res.json(payload);
    }, res);
  });

  // DELETE brand pack endpoint
  app.delete('/api/brand-packs/:id', async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'invalid_request', message: 'id required' });
    }

    await withDb(async (db) => {
      console.log('Deleting brand pack:', id);
      
      // Delete from both collections
      const brandPackResult = await db.collection('brand_packs').deleteOne({ id });
      const versionsResult = await db.collection('brand_pack_versions').deleteMany({ id });
      
      console.log('Brand pack deletion result:', { 
        brandPack: brandPackResult.deletedCount, 
        versions: versionsResult.deletedCount 
      });
      
      if (brandPackResult.deletedCount === 0) {
        return res.status(404).json({ error: 'not_found', message: 'Brand pack not found' });
      }
      
      res.json({ 
        success: true, 
        deletedBrandPack: brandPackResult.deletedCount > 0,
        deletedVersions: versionsResult.deletedCount 
      });
    }, res);
  });

  // Phase 2: Engine API contracts (MVP)
  const { enhanceCss } = require('../../packages/engine');
  const { enhanceCached } = require('../../packages/sdk');

  app.post('/api/design/analyze', express.json(), async (req, res) => {
    const body = req.body || {};
    const code = body.code || '';
    const metrics = {
      tokenAdherence: 0, // placeholder
      contrastAA: 1, // not computed here
      typeScaleFit: 1,
      spacingConsistency: 1,
      patternEffectiveness: 0,
      size: { rawBytes: Buffer.byteLength(code, 'utf8') }
    };
    res.json({ metrics, issues: [], opportunities: [], patterns: {}, size: metrics.size });
  });

  app.post('/api/design/enhance', express.json(), async (req, res) => {
    const body = req.body || {};
    const code = body.code || '';
    const codeType = body.codeType || 'css';
    const brandPackId = body.brandPackId || '';
    const projectPath = body.projectPath || process.cwd();
    
    console.log('Request brandPackId:', brandPackId, 'projectPath:', projectPath);
    
    if (codeType !== 'css') return res.status(400).json({ error: 'unsupported_codeType' });
    
    // Resolve brand pack tokens using discovery system or explicit brandPackId
    let tokens = body.tokens || {};
    if (!Object.keys(tokens).length) {
      try {
        let resolvedBrandPackId = brandPackId;
        
        // If no explicit brandPackId, use discovery system
        if (!resolvedBrandPackId) {
          console.log('Using discovery system for projectPath:', projectPath);
          const context = await resolveProjectContext(projectPath);
          console.log('Discovery context:', JSON.stringify(context, null, 2));
          resolvedBrandPackId = context.brandPack?.id;
          console.log('Resolved brand pack ID:', resolvedBrandPackId);
        }
        
        // Fetch brand pack tokens from MongoDB
        if (resolvedBrandPackId) {
          console.log('Fetching tokens for brand pack:', resolvedBrandPackId);
          await withDb(async (db) => {
            const brandPack = await db.collection('brand_packs').findOne(
              { id: resolvedBrandPackId }, 
              { projection: { tokens: 1 } }
            );
            console.log('Found brand pack:', !!brandPack, 'has tokens:', !!brandPack?.tokens);
            if (brandPack?.tokens) {
              tokens = brandPack.tokens;
              console.log('Loaded tokens, color roles count:', Object.keys(brandPack.tokens?.colors?.roles || {}).length);
            }
          });
        }
      } catch (err) {
        console.warn('Could not resolve brand pack tokens:', err.message);
      }
    }
    
    console.log('About to call enhanceCss with tokens keys:', Object.keys(tokens));
    const result = enhanceCss({ code, tokens });
    console.log('Enhancement result - changes:', result.changes.length);
    res.json({ code: result.code, changes: result.changes, metricsDelta: {}, brandCompliance: {} });
  });

  app.post('/api/design/enhance-cached', express.json(), async (req, res) => {
    const body = req.body || {};
    const code = body.code || '';
    const codeType = body.codeType || 'css';
    const componentType = body.componentType || '';
    const brandPackId = body.brandPackId || '';
    const projectPath = body.projectPath || process.cwd();
    
    console.log('Request brandPackId:', brandPackId, 'projectPath:', projectPath);
    
    // Support both CSS and HTML content types
    if (!['css', 'html'].includes(codeType)) {
      return res.status(400).json({ 
        error: 'unsupported_codeType',
        message: `Code type '${codeType}' not supported`,
        supported: ['css', 'html']
      });
    }
    
    // Resolve brand pack tokens using discovery system or explicit brandPackId
    let tokens = body.tokens || {};
    let resolvedBrandPackId = brandPackId;
    if (!Object.keys(tokens).length) {
      try {
        
        // If no explicit brandPackId, use discovery system
        if (!resolvedBrandPackId) {
          console.log('Using discovery system for projectPath:', projectPath);
          const context = await resolveProjectContext(projectPath);
          console.log('Discovery context:', JSON.stringify(context, null, 2));
          resolvedBrandPackId = context.brandPack?.id;
          console.log('Resolved brand pack ID:', resolvedBrandPackId);
        }
        
        // Fetch brand pack tokens from MongoDB
        if (resolvedBrandPackId) {
          console.log('Fetching tokens for brand pack:', resolvedBrandPackId);
          await withDb(async (db) => {
            const brandPack = await db.collection('brand_packs').findOne(
              { id: resolvedBrandPackId }, 
              { projection: { tokens: 1 } }
            );
            console.log('Found brand pack:', !!brandPack, 'has tokens:', !!brandPack?.tokens);
            if (brandPack?.tokens) {
              tokens = brandPack.tokens;
              console.log('Loaded tokens, color roles count:', Object.keys(brandPack.tokens?.colors?.roles || {}).length);
            }
          });
        }
      } catch (err) {
        console.warn('Could not resolve brand pack tokens:', err.message);
      }
    }
    
    // Handle HTML by extracting and enhancing embedded CSS
    let enhancedCode = code;
    let changes = [];
    let cacheHit = false;
    
    if (codeType === 'html') {
      // Extract CSS from HTML (style tags and inline styles)
      const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
      const matches = [...code.matchAll(styleRegex)];
      
      if (matches.length > 0) {
        enhancedCode = code;
        for (const match of matches) {
          const cssContent = match[1];
          try {
            const enhanced = await enhanceCached({ 
              code: cssContent, 
              tokens, 
              filePath: body.filePath || '', 
              brandPackId: resolvedBrandPackId || body.brandPackId || '', 
              brandVersion: body.brandVersion || '', 
              componentType 
            });
            if (enhanced && enhanced.code) {
              enhancedCode = enhancedCode.replace(match[0], `<style>${enhanced.code}</style>`);
              changes = changes.concat(enhanced.changes || []);
              cacheHit = enhanced.cacheHit || false;
            }
          } catch (err) {
            console.warn('Failed to enhance CSS in HTML:', err.message);
          }
        }
      }
    } else {
      // CSS enhancement
      const out = await enhanceCached({ code, tokens, filePath: body.filePath || '', brandPackId: resolvedBrandPackId || body.brandPackId || '', brandVersion: body.brandVersion || '', componentType });
      enhancedCode = out.code;
      changes = out.changes;
      cacheHit = out.cacheHit;
    }
    
    res.json({ code: enhancedCode, changes, cacheHit, patternsApplied: [] });
  });

  // Phase 3: Suggestions (advisory) and learning endpoints (minimal)
  function suggestProactiveLocal({ code = '', tokens: _tokens = {}, componentType: _componentType = '' }) {
    const suggestions = [];
    let confidence = 0.0;
    // Heuristic: map padding pairs like 16px 32px to spacing tokens md/lg
    const m = /padding\s*:\s*([0-9.]+px)\s+([0-9.]+px)/.exec(code);
    if (m) {
      const mapPx = (px) => {
        const n = parseFloat(px);
        if (Math.abs(n - 16) <= 0.8) return { token: 'var(--spacing-md)', conf: 0.92 };
        if (Math.abs(n - 32) <= 1.6) return { token: 'var(--spacing-lg)', conf: 0.9 };
        if (Math.abs(n - 8) <= 0.4) return { token: 'var(--spacing-sm)', conf: 0.85 };
        return { token: null, conf: 0.5 };
      };
      const a = mapPx(m[1]);
      const b = mapPx(m[2]);
      if (a.token && b.token) {
        confidence = Math.min(a.conf, b.conf);
        suggestions.push({
          type: 'spacing-token',
          target: 'padding',
          suggestedToken: `${a.token} ${b.token}`,
          confidence,
          basedOn: 'heuristics'
        });
      }
    }
    // Gating: suppress <0.8; 0.8–0.9 advisory; ≥0.9 eligible (still advisory for non-safe classes)
    const gated = suggestions.filter((s) => s.confidence >= 0.8);
    return { suggestions: gated, confidence: confidence || 0.0, basedOn: 'heuristics' };
  }

  app.post('/api/design/suggest-proactive', express.json(), async (req, res) => {
    const body = req.body || {};
    const code = body.code || '';
    const componentType = body.componentType || '';
    const tokens = body.tokens || {};
    const out = suggestProactiveLocal({ code, tokens, componentType });
    res.json(out);
  });

  const learnedPath = path.join(process.cwd(), 'reports', 'patterns-learned.json');
  function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
  function writeJsonSafe(p, obj) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(obj, null, 2)); }

  app.get('/api/design/patterns/learned', async (req, res) => {
    const data = readJsonSafe(learnedPath) || { preferences: {}, updated: null };
    res.json(data);
  });

  app.post('/api/design/patterns/track', express.json(), async (req, res) => {
    const body = req.body || {};
    const componentType = body.componentType || 'unknown';
    const prefs = readJsonSafe(learnedPath) || { preferences: {}, updated: null };
    prefs.preferences[componentType] = (prefs.preferences[componentType] || 0) + 1;
    prefs.updated = new Date().toISOString();
    writeJsonSafe(learnedPath, prefs);
    // append log
    const trackLog = path.join(process.cwd(), 'logs', 'patterns-track.log');
    fs.mkdirSync(path.dirname(trackLog), { recursive: true });
    fs.appendFileSync(trackLog, JSON.stringify({ at: prefs.updated, componentType }) + '\n');
    res.status(204).end();
  });

  // Utility: expose lock and project config for UI Settings view
  app.get('/api/lock', (req, res) => {
    const p = path.join(process.cwd(), '.agentic', 'brand-pack.lock.json');
    try {
      const s = fs.readFileSync(p, 'utf8');
      return res.json(JSON.parse(s));
    } catch {
      return res.json({});
    }
  });

  app.get('/api/project-config', (req, res) => {
    const p = path.join(process.cwd(), '.agentic', 'config.json');
    try {
      const s = fs.readFileSync(p, 'utf8');
      return res.json(JSON.parse(s));
    } catch {
      return res.json({});
    }
  });

  // Phase 8: Component Generation Endpoints
  const { ComponentGenerator } = require('../../packages/generator');
  const componentGenerator = new ComponentGenerator({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Initialize generator (non-blocking with error handling)
  componentGenerator.loadTemplates().catch(err => {
    console.warn('Template loading failed, will use fallback templates:', err.message);
  });

  // Generate component from description
  app.post('/api/design/generate-component', async (req, res) => {
    try {
      const { description, componentType, style, framework, brandPackId } = req.body;
      
      if (!description) {
        return res.status(400).json({ error: 'Description is required' });
      }

      // Get brand pack tokens if specified
      if (brandPackId) {
        await withDb(async (db) => {
          const brandPack = await db.collection('brand_packs').findOne({ id: brandPackId });
          if (brandPack?.tokens) {
            componentGenerator.setBrandTokens(brandPack.tokens);
          }
        }, res);
      }

      const result = await componentGenerator.generateComponent({
        description,
        componentType,
        style,
        framework,
        brandPackId
      });

      res.json(result);
    } catch (error) {
      console.error('Component generation error:', error.message);
      res.status(500).json({ error: 'Component generation failed', message: error.message });
    }
  });

  // List available templates
  app.get('/api/design/templates', async (req, res) => {
    try {
      const templates = componentGenerator.listTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Templates list error:', error.message);
      res.status(500).json({ error: 'Failed to list templates', message: error.message });
    }
  });

  // Customize template with brand tokens
  app.post('/api/design/customize-template', async (req, res) => {
    try {
      const { templateId, customizations, brandPackId } = req.body;
      
      if (!templateId) {
        return res.status(400).json({ error: 'Template ID is required' });
      }

      // Get brand pack tokens if specified
      if (brandPackId) {
        await withDb(async (db) => {
          const brandPack = await db.collection('brand_packs').findOne({ id: brandPackId });
          if (brandPack?.tokens) {
            componentGenerator.setBrandTokens(brandPack.tokens);
          }
        });
      }
