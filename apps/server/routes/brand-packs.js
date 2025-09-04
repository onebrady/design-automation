const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const { withDb } = require('../utils/database');
const { getRedisDataLayer, redisHealth } = require('../utils/redis');
const { generateBrandPackFromLogo } = require('../utils/ai');
const { upload } = require('../utils/upload');
const { writeJsonSafe } = require('../utils/files');
const { ErrorResponse, SuccessResponse } = require('../middleware/error-handler');
const Logger = require('../utils/logger');

// Initialize Redis data layer
const redis = getRedisDataLayer();

// Get all brand packs
router.get('/', async (req, res) => {
  try {
    // Try Redis first, fallback to MongoDB if needed
    const redisHealthCheck = await redisHealth();
    
    if (redisHealthCheck.redisAvailable) {
      const items = await redis.getAllBrandPacks();
      return SuccessResponse.send(res, items, 'Brand packs retrieved successfully');
    } else {
      // Fallback to MongoDB
      await withDb(async (db) => {
        const cursor = db.collection('brand_packs').find({}, { projection: { _id: 0 } });
        const items = await cursor.toArray();
        return SuccessResponse.send(res, items, 'Brand packs retrieved successfully');
      });
    }
  } catch (error) {
    Logger.error('Brand packs fetch error', { operation: 'getAllBrandPacks' }, error);
    return ErrorResponse.send(res, 'DATABASE_ERROR', 'Failed to fetch brand packs', {
      originalError: error.message
    });
  }
});

// Create brand pack
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const id = body.id;
    if (!id) {
      return ErrorResponse.send(res, 'INVALID_REQUEST', 'Brand pack ID is required');
    }
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
        Logger.info('Brand pack saved to Redis', { id, source: 'redis' });
      } else {
        Logger.warn('Brand pack save failed, falling back to MongoDB', { id, source: 'redis' });
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
      Logger.warn('Failed to write lock snapshot', { id }, e);
    }
    
    return SuccessResponse.send(res, { id, version }, 'Brand pack created successfully', 201);
  } catch (error) {
    Logger.error('Brand pack creation failed', { operation: 'createBrandPack' }, error);
    return ErrorResponse.send(res, 'BRAND_PACK_CREATION_FAILED', 'Failed to create brand pack', {
      originalError: error.message
    });
  }
});

// AI Brand Pack Generation Endpoint  
router.post('/generate-from-logo', upload.single('logo'), async (req, res) => {
  try {
    Logger.info('AI Brand Pack Generation Request', {
      apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
      fileReceived: !!req.file,
      brandName: req.body?.brandName,
      hasDescription: !!req.body?.description
    });

    if (!req.file) {
      Logger.error('AI generation failed: no file uploaded', { operation: 'generateFromLogo' });
      return ErrorResponse.send(res, 'FILE_UPLOAD_ERROR', 'Logo file is required for AI brand pack generation');
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      Logger.error('AI generation failed: API key not configured', { operation: 'generateFromLogo' });
      return ErrorResponse.send(res, 'AI_SERVICE_ERROR', 'AI service not configured - ANTHROPIC_API_KEY required');
    }

    const { brandName, description } = req.body;
    if (!brandName) {
      return ErrorResponse.send(res, 'INVALID_REQUEST', 'Brand name is required for AI generation');
    }

    Logger.info('Processing logo file', {
      operation: 'generateFromLogo',
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

    Logger.business('AI brand pack generated', {
      operation: 'generateFromLogo',
      id: generatedBrandPack.id,
      hasTokens: !!generatedBrandPack.tokens,
      tokensCount: generatedBrandPack.tokens ? Object.keys(generatedBrandPack.tokens).length : 0
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

      Logger.database('save', 'brand_packs', { id: generatedBrandPack.id, operation: 'aiGenerated' });
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
      Logger.info('Lock file updated', { id: generatedBrandPack.id, source: 'ai-generated' });
    } catch (lockError) {
      Logger.warn('Failed to write lock file', { id: generatedBrandPack.id }, lockError);
    }

    return SuccessResponse.send(res, {
      brandPack: generatedBrandPack
    }, 'Brand pack generated successfully from logo', 201);

  } catch (error) {
    Logger.error('AI logo generation error', { operation: 'generateFromLogo' }, error);
    return ErrorResponse.send(res, 'AI_SERVICE_ERROR', 'AI brand pack generation failed', {
      originalError: error.message || 'AI generation failed'
    });
  }
});

module.exports = router;