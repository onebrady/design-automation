const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { withDb } = require('../utils/database');
const { getRedisDataLayer, redisHealth } = require('../utils/redis');
const { generateBrandPackFromLogo } = require('../utils/ai');
const { upload } = require('../utils/upload');
const { writeJsonSafe } = require('../utils/files');

// Initialize Redis data layer
const redis = getRedisDataLayer();

// Get all brand packs
router.get('/', async (req, res) => {
  try {
    // Try Redis first, fallback to MongoDB if needed
    const redisHealthCheck = await redisHealth();
    
    if (redisHealthCheck.redisAvailable) {
      const items = await redis.getAllBrandPacks();
      res.json(items);
    } else {
      // Fallback to MongoDB
      await withDb(async (db) => {
        const cursor = db.collection('brand_packs').find({}, { projection: { _id: 0 } });
        const items = await cursor.toArray();
        res.json(items);
      });
    }
  } catch (error) {
    console.error('Brand packs fetch error:', error.message);
    res.status(500).json({ error: 'fetch_failed', message: error.message });
  }
});

// Create brand pack
router.post('/', async (req, res) => {
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
      created: new Date(),
      updated: new Date()
    };
    
    // Try Redis first, fallback to MongoDB if needed
    const redisHealthCheck = await redisHealth();
    
    if (redisHealthCheck.redisAvailable) {
      const success = await redis.saveBrandPack(id, baseDoc);
      if (success) {
        console.log(`Brand pack ${id} saved to Redis successfully`);
      } else {
        console.warn(`Failed to save brand pack ${id} to Redis, falling back to MongoDB`);
        // Fallback to MongoDB
        await withDb(async (db) => {
          await db.collection('brand_packs').replaceOne(
            { id }, 
            baseDoc, 
            { upsert: true }
          );
          await db.collection('brand_pack_versions').replaceOne(
            { id, version },
            baseDoc,
            { upsert: true }
          );
        });
      }
    } else {
      // Fallback to MongoDB
      await withDb(async (db) => {
        await db.collection('brand_packs').replaceOne(
          { id }, 
          baseDoc, 
          { upsert: true }
        );
        await db.collection('brand_pack_versions').replaceOne(
          { id, version },
          baseDoc,
          { upsert: true }
        );
      });
    }
    
    // Write lock snapshot
    const lockDir = path.join(process.cwd(), '.agentic');
    try {
      fs.mkdirSync(lockDir, { recursive: true });
      fs.writeFileSync(
        path.join(lockDir, 'brand-pack.lock.json'),
        JSON.stringify({ 
          id, 
          version, 
          etag: null, 
          lastSync: new Date().toISOString(), 
          source: redisHealthCheck.redisAvailable ? 'redis' : 'mongo' 
        }, null, 2)
      );
    } catch (e) {
      console.warn('Failed to write lock snapshot:', e.message);
    }
    
    res.status(201).json({ id, version });
  } catch (error) {
    console.error('Brand pack creation failed:', error.message);
    res.status(500).json({ error: 'brand_pack_creation_failed', message: error.message });
  }
});

// AI Brand Pack Generation Endpoint  
router.post('/generate-from-logo', upload.single('logo'), async (req, res) => {
  try {
    console.log('=== AI Brand Pack Generation Request ===');
    console.log('API Key configured:', !!process.env.ANTHROPIC_API_KEY);
    console.log('File received:', !!req.file);
    console.log('Request body:', req.body);

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'invalid_request', message: 'logo file required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return res.status(500).json({ error: 'server_error', message: 'AI service not configured' });
    }

    const { brandName, description } = req.body;
    if (!brandName) {
      return res.status(400).json({ error: 'invalid_request', message: 'brandName required' });
    }

    console.log('Processing file:', {
      type: req.file.mimetype,
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

    console.log('Generated brand pack:', {
      id: generatedBrandPack.id,
      hasTokens: !!generatedBrandPack.tokens,
      tokensKeys: generatedBrandPack.tokens ? Object.keys(generatedBrandPack.tokens) : []
    });

    // Store in database
    await withDb(async (db) => {
      const doc = {
        ...generatedBrandPack,
        source: 'ai-generated',
        originalFilename: req.file.originalname,
        generatedAt: new Date()
      };

      await db.collection('brand_packs').replaceOne(
        { id: generatedBrandPack.id }, 
        doc,
        { upsert: true }
      );

      await db.collection('brand_pack_versions').insertOne({
        ...doc,
        version: generatedBrandPack.version || '1.0.0'
      });

      console.log('Brand pack stored in database');
    });

    // Write lock file
    const lockDir = path.join(process.cwd(), '.agentic');
    try {
      const lockData = {
        id: generatedBrandPack.id,
        version: generatedBrandPack.version || '1.0.0',
        etag: null,
        lastSync: new Date().toISOString(),
        source: 'ai-generated'
      };
      writeJsonSafe(path.join(lockDir, 'brand-pack.lock.json'), lockData);
      console.log('Lock file updated');
    } catch (lockError) {
      console.warn('Failed to write lock file:', lockError.message);
    }

    res.status(201).json({
      success: true,
      brandPack: generatedBrandPack,
      message: 'Brand pack generated successfully from logo'
    });

  } catch (error) {
    console.error('Logo generation error:', error);
    res.status(500).json({ 
      error: 'generation_failed', 
      message: error.message || 'AI generation failed' 
    });
  }
});

module.exports = router;