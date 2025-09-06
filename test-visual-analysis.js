#!/usr/bin/env node

/**
 * Visual Analysis Test Script
 *
 * Tests the core visual analysis functionality including:
 * - Screenshot engine
 * - Playwright integration
 * - Visual analysis manager
 * - API endpoint integration
 */

const path = require('path');
const { ScreenshotEngine, VisionAI, VisualAnalysisManager } = require('./packages/visual-analysis');

console.log('🧪 Testing Visual Analysis Implementation');
console.log('='.repeat(60));

// Test HTML samples
const testHtmlSamples = {
  simple: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #1B3668; margin-bottom: 16px;">Welcome</h1>
      <p style="color: #333; line-height: 1.5;">This is a simple test page.</p>
      <button style="background: #1B3668; color: white; padding: 12px 24px; border: none; border-radius: 4px;">
        Click me
      </button>
    </div>
  `,

  complex: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Design</title>
      <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .header { background: #1B3668; color: white; padding: 20px; text-align: center; }
        .content { padding: 40px 20px; max-width: 800px; margin: 0 auto; }
        .card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .button { background: #2A4F8F; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }
        .button:hover { background: #1B3668; }
      </style>
    </head>
    <body>
      <header class="header">
        <h1>Design System Test</h1>
        <p>Testing visual analysis capabilities</p>
      </header>
      <main class="content">
        <div class="card">
          <h2>Component Testing</h2>
          <p>This card tests various design elements and their visual quality.</p>
          <button class="button">Primary Action</button>
        </div>
        <div class="card">
          <h3>Typography Hierarchy</h3>
          <p>Testing different heading levels and text content for proper visual hierarchy.</p>
          <small>This is smaller text for additional information.</small>
        </div>
      </main>
    </body>
    </html>
  `,
};

async function testScreenshotEngine() {
  console.log('\n📸 Testing Screenshot Engine');
  console.log('-'.repeat(40));

  try {
    const engine = new ScreenshotEngine({
      cleanup: { autoCleanup: false }, // Disable for testing
    });

    console.log('✅ Screenshot engine initialized');

    // Test simple HTML capture
    const result = await engine.capture(testHtmlSamples.simple);

    if (result.success) {
      console.log('✅ Screenshot captured successfully');
      console.log(`   📁 File: ${result.filepath}`);
      console.log(`   📏 Size: ${Math.round(result.metadata.size / 1024)}KB`);
      console.log(`   ⏱️  Duration: ${result.metadata.duration}ms`);

      // Get stats
      const stats = await engine.getStats();
      console.log(`   📊 Total screenshots: ${stats.count}`);

      return { success: true, result };
    } else {
      console.log('❌ Screenshot capture failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log('❌ Screenshot engine test failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testVisionAI() {
  console.log('\n🧠 Testing Vision AI');
  console.log('-'.repeat(40));

  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️  OpenAI API key not configured - skipping Vision AI test');
      return { success: false, skipped: true, reason: 'No API key' };
    }

    const visionAI = new VisionAI();
    console.log('✅ Vision AI initialized');

    // Create a simple test screenshot first
    const engine = new ScreenshotEngine();
    const screenshot = await engine.capture(testHtmlSamples.simple);

    if (!screenshot.success) {
      throw new Error('Failed to create test screenshot');
    }

    console.log('✅ Test screenshot created for AI analysis');

    // Test visual analysis (this will use actual OpenAI API)
    const analysis = await visionAI.analyzeDesign(screenshot.base64, {
      brandContext: {
        tokens: {
          colors: { primary: '#1B3668', surface: '#F8FAFC' },
          spacing: { md: '16px', lg: '24px' },
        },
      },
      analysisType: 'comprehensive',
    });

    if (analysis.success) {
      console.log('✅ Visual analysis completed');
      console.log(`   📊 Overall Score: ${analysis.overallScore}/100`);
      console.log(`   🔍 Critical Issues: ${analysis.criticalIssues?.length || 0}`);
      console.log(`   💡 Improvements: ${analysis.improvementOpportunities?.length || 0}`);
      console.log(`   ⏱️  Duration: ${analysis.duration}ms`);

      return { success: true, analysis };
    } else {
      console.log('❌ Visual analysis failed:', analysis.error);
      return { success: false, error: analysis.error };
    }
  } catch (error) {
    console.log('❌ Vision AI test failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testVisualAnalysisManager() {
  console.log('\n🎯 Testing Visual Analysis Manager');
  console.log('-'.repeat(40));

  try {
    const manager = new VisualAnalysisManager({
      screenshot: { cleanup: { autoCleanup: false } },
      vision: { retryAttempts: 1 }, // Reduce retries for testing
    });

    console.log('✅ Visual Analysis Manager initialized');

    // Test complete analysis workflow
    const analysisResult = await manager.analyzeCode(testHtmlSamples.complex, {
      brandContext: {
        tokens: {
          colors: { primary: '#1B3668', secondary: '#2A4F8F' },
          spacing: { sm: '12px', md: '16px', lg: '24px' },
        },
      },
      analysisType: 'comprehensive',
    });

    if (analysisResult.success) {
      console.log('✅ Complete analysis workflow successful');
      console.log(`   📊 Overall Score: ${analysisResult.analysis.overallScore}/100`);
      console.log(`   🔍 Critical Issues: ${analysisResult.analysis.criticalIssues.length}`);
      console.log(`   📸 Screenshot ID: ${analysisResult.screenshot.id}`);
      console.log(`   ⏱️  Total Duration: ${analysisResult.duration}ms`);

      // Test stats
      const stats = await manager.getStats();
      if (stats.success) {
        console.log(`   📊 Screenshots managed: ${stats.screenshot.count}`);
      }

      return { success: true, result: analysisResult };
    } else {
      console.log('❌ Analysis workflow failed:', analysisResult.error);
      return { success: false, error: analysisResult.error };
    }
  } catch (error) {
    console.log('❌ Visual Analysis Manager test failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testAPIHealthCheck() {
  console.log('\n🌐 Testing Visual API Health Check');
  console.log('-'.repeat(40));

  try {
    // Start a test server temporarily
    const express = require('express');
    const visualRoutes = require('./apps/server/routes/visual');

    const app = express();
    app.use(express.json());
    app.use('/api/visual', visualRoutes);

    const server = app.listen(0); // Random available port
    const port = server.address().port;

    console.log(`✅ Test server started on port ${port}`);

    // Test health endpoint
    const response = await fetch(`http://localhost:${port}/api/visual/health`);
    const healthData = await response.json();

    console.log(`✅ Health check response: ${response.status}`);
    console.log(`   Status: ${healthData.status}`);
    console.log(`   OpenAI Configured: ${healthData.openaiConfigured}`);
    console.log(`   Playwright Available: ${healthData.playwrightAvailable}`);

    server.close();

    return {
      success: true,
      health: healthData,
      apiWorking: response.status < 400,
    };
  } catch (error) {
    console.log('❌ API health check failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Running Visual Analysis Tests\n');

  const results = {
    screenshotEngine: await testScreenshotEngine(),
    visionAI: await testVisionAI(),
    analysisManager: await testVisualAnalysisManager(),
    apiHealth: await testAPIHealthCheck(),
  };

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(60));

  let passedTests = 0;
  let totalTests = 0;

  Object.entries(results).forEach(([testName, result]) => {
    totalTests++;
    const status = result.success ? '✅ PASS' : result.skipped ? '⏭️  SKIP' : '❌ FAIL';

    console.log(`${status} - ${testName}`);

    if (result.success) passedTests++;
    if (result.skipped) console.log(`   Reason: ${result.reason}`);
    if (!result.success && !result.skipped) console.log(`   Error: ${result.error}`);
  });

  console.log('\n' + '-'.repeat(60));
  console.log(`📈 Overall: ${passedTests}/${totalTests} tests passed`);

  // System readiness assessment
  console.log('\n🎯 Visual Analysis System Status:');

  if (results.screenshotEngine.success && results.apiHealth.success) {
    if (results.visionAI.success) {
      console.log('🟢 FULLY OPERATIONAL - All systems ready for visual analysis');
    } else if (results.visionAI.skipped) {
      console.log(
        '🟡 PARTIALLY READY - Screenshots work, needs OpenAI API key for full functionality'
      );
    } else {
      console.log('🟡 PARTIALLY READY - Screenshots work, Vision AI has issues');
    }
  } else {
    console.log('🔴 NOT READY - Core systems have issues');
  }

  console.log('\n📚 Next Steps:');
  if (!process.env.OPENAI_API_KEY) {
    console.log('1. Set OPENAI_API_KEY environment variable for full visual analysis');
  }
  if (results.screenshotEngine.success) {
    console.log('2. Screenshot system is ready - screenshots will be saved to temp/screenshots/');
  }
  if (results.apiHealth.success) {
    console.log('3. API endpoints are available at /api/visual/*');
  }

  console.log('\n🧹 Cleanup Note:');
  console.log('Test screenshots are saved with autoCleanup disabled.');
  console.log('Run maintenance endpoint or manually clean temp/screenshots/ directory.');

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error.message);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

// Run tests
runAllTests().catch(console.error);
