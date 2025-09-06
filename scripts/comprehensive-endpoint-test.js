#!/usr/bin/env node

/**
 * Comprehensive API Endpoint Testing Script
 *
 * Systematically tests all claimed API endpoints to validate functionality
 * and document actual responses vs. documentation claims.
 *
 * Usage: node scripts/comprehensive-endpoint-test.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3001';
const OUTPUT_DIR = 'reports/endpoint-testing';
const TIMEOUT = 30000; // 30 seconds for AI operations
const RETRY_COUNT = 2;

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
};

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  endpoints: [],
};

// Helper functions
function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logResult(status, endpoint, responseTime, message = '') {
  const statusColor = status === '✅' ? 'green' : status === '❌' ? 'red' : 'yellow';
  const timeColor = responseTime < 100 ? 'green' : responseTime < 1000 ? 'yellow' : 'red';
  log(
    `${status} ${endpoint} ${colors[timeColor]}(${responseTime}ms)${colors.reset} ${message}`,
    statusColor
  );
}

async function makeRequest(method, endpoint, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const url = `${BASE_URL}${endpoint}`;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'comprehensive-endpoint-test/1.0',
        ...headers,
      },
      timeout: TIMEOUT,
    };

    const req = http.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        let parsedData;

        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          parsedData = { raw: data, parseError: e.message };
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsedData,
          responseTime,
          success: res.statusCode >= 200 && res.statusCode < 300,
        });
      });
    });

    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      reject({
        error: error.message,
        responseTime,
        success: false,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      reject({
        error: 'Request timeout',
        responseTime,
        success: false,
      });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function testEndpoint(endpoint, retryCount = RETRY_COUNT) {
  for (let i = 0; i <= retryCount; i++) {
    try {
      const result = await makeRequest(endpoint.method, endpoint.path, endpoint.body);

      // Store test result
      const testResult = {
        ...endpoint,
        ...result,
        attempt: i + 1,
        timestamp: new Date().toISOString(),
      };

      testResults.endpoints.push(testResult);

      if (result.success) {
        testResults.passed++;
        logResult(
          '✅',
          `${endpoint.method} ${endpoint.path}`,
          result.responseTime,
          endpoint.description || ''
        );
        return testResult;
      } else {
        if (i === retryCount) {
          testResults.failed++;
          logResult(
            '❌',
            `${endpoint.method} ${endpoint.path}`,
            result.responseTime,
            `HTTP ${result.statusCode} - ${endpoint.description || ''}`
          );
        }
      }
    } catch (error) {
      if (i === retryCount) {
        testResults.failed++;
        logResult(
          '❌',
          `${endpoint.method} ${endpoint.path}`,
          error.responseTime || 0,
          `Error: ${error.error} - ${endpoint.description || ''}`
        );

        testResults.endpoints.push({
          ...endpoint,
          error: error.error,
          responseTime: error.responseTime || 0,
          success: false,
          attempt: i + 1,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  return null;
}

// Comprehensive endpoint definitions based on docs/api documentation
const endpoints = [
  // System Health & Configuration
  {
    method: 'GET',
    path: '/api/health',
    description: 'System health check',
    category: 'system',
  },
  {
    method: 'GET',
    path: '/api/context',
    description: 'Project context resolution',
    category: 'system',
  },

  // Brand Pack Management
  {
    method: 'GET',
    path: '/api/brand-packs',
    description: 'List all brand packs',
    category: 'brand-packs',
  },
  {
    method: 'POST',
    path: '/api/brand-packs',
    description: 'Create new brand pack',
    category: 'brand-packs',
    body: {
      id: 'test-brand-pack',
      name: 'Test Brand Pack',
      version: '1.0.0',
      tokens: {
        primary: '#007bff',
        secondary: '#6c757d',
      },
    },
  },
  {
    method: 'POST',
    path: '/api/brand-packs/generate-from-logo',
    description: 'AI brand pack generation from logo',
    category: 'brand-packs',
    skip: true, // Skip file upload test for now
    skipReason: 'File upload endpoint - requires multipart form data',
  },

  // Design Enhancement
  {
    method: 'POST',
    path: '/api/design/analyze',
    description: 'CSS analysis without transformation',
    category: 'design',
    body: {
      code: '.button { color: red; background: blue; padding: 10px; }',
    },
  },
  {
    method: 'POST',
    path: '/api/design/enhance',
    description: 'Basic CSS enhancement with brand tokens',
    category: 'design',
    body: {
      code: '.button { color: red; background: blue; padding: 10px; }',
      projectPath: '/test/project',
    },
  },
  {
    method: 'POST',
    path: '/api/design/enhance-cached',
    description: 'Enhanced CSS with caching',
    category: 'design',
    body: {
      code: '.btn { color: red; }',
      projectPath: '/test/project',
      signature: 'test-signature-123',
    },
  },
  {
    method: 'POST',
    path: '/api/design/suggest-proactive',
    description: 'Proactive design suggestions',
    category: 'design',
    body: {
      code: '.header { font-size: 12px; color: #999; }',
      context: { projectType: 'web-app' },
    },
  },

  // Advanced Design Features
  {
    method: 'POST',
    path: '/api/design/enhance-typography',
    description: 'Typography enhancement',
    category: 'design-advanced',
    body: {
      code: 'h1 { font-size: 24px; line-height: 1.2; }',
      options: { scaleSystem: 'modular' },
    },
  },
  {
    method: 'POST',
    path: '/api/design/enhance-animations',
    description: 'Animation system integration',
    category: 'design-advanced',
    body: {
      code: '.button { transition: none; }',
      options: { enableMicroInteractions: true },
    },
  },
  {
    method: 'POST',
    path: '/api/design/enhance-gradients',
    description: 'Gradient system enhancement',
    category: 'design-advanced',
    body: {
      code: '.hero { background: linear-gradient(45deg, red, blue); }',
      options: { brandCompliant: true },
    },
  },
  {
    method: 'POST',
    path: '/api/design/enhance-states',
    description: 'Interactive state enhancement',
    category: 'design-advanced',
    body: {
      code: '.button { background: blue; }',
      options: { generateHoverStates: true },
    },
  },

  // Component Generation
  {
    method: 'POST',
    path: '/api/design/generate-component',
    description: 'AI component generation',
    category: 'components',
    body: {
      prompt: 'Create a primary button component',
      framework: 'react',
      styling: 'css-modules',
    },
  },
  {
    method: 'POST',
    path: '/api/design/customize-template',
    description: 'Template customization',
    category: 'components',
    body: {
      templateId: 'button-primary',
      customizations: {
        variant: 'large',
        icon: 'arrow-right',
      },
      framework: 'react',
    },
  },
  {
    method: 'POST',
    path: '/api/design/create-sandbox',
    description: 'Component sandbox creation',
    category: 'components',
    body: {
      html: '<button class="btn">Test Button</button>',
      css: '.btn { background: blue; color: white; padding: 12px; }',
      options: { secure: true },
    },
  },

  // Semantic Analysis
  {
    method: 'POST',
    path: '/api/semantic/analyze-accessibility',
    description: 'WCAG accessibility analysis',
    category: 'semantic',
    body: {
      html: '<button>Click me</button>',
      projectPath: '/test/project',
    },
  },
  {
    method: 'POST',
    path: '/api/semantic/detect-component-type',
    description: 'Component type detection',
    category: 'semantic',
    body: {
      html: '<button class="btn btn-primary">Submit</button>',
      context: { purpose: 'form-submission' },
    },
  },
  {
    method: 'POST',
    path: '/api/semantic/batch-analyze',
    description: 'Batch semantic analysis',
    category: 'semantic',
    body: {
      files: [
        {
          path: 'components/Button.html',
          html: '<button class="btn">Button</button>',
        },
      ],
    },
  },
  {
    method: 'POST',
    path: '/api/semantic/generate-aria',
    description: 'ARIA attribute generation',
    category: 'semantic',
    body: {
      html: '<nav><ul><li><a href="#">Home</a></li></ul></nav>',
      options: { level: 'AAA' },
    },
  },

  // Layout Intelligence
  {
    method: 'POST',
    path: '/api/layout/analyze',
    description: 'Layout structure analysis',
    category: 'layout',
    body: {
      html: '<div class="container"><h1>Title</h1><p>Content</p></div>',
      css: '.container { padding: 20px; }',
      projectPath: '/test/project',
    },
  },
  {
    method: 'POST',
    path: '/api/layout/grid-recommendations',
    description: 'CSS Grid recommendations',
    category: 'layout',
    body: {
      requirements: {
        columns: 12,
        responsive: true,
        contentTypes: ['text', 'images'],
      },
    },
  },
  {
    method: 'POST',
    path: '/api/layout/template-matches',
    description: 'Layout template matching',
    category: 'layout',
    body: {
      html: '<div class="card"><h2>Title</h2><p>Content</p></div>',
      css: '.card { padding: 20px; border: 1px solid #ccc; }',
    },
  },
  {
    method: 'POST',
    path: '/api/layout/flexbox-suggestions',
    description: 'Flexbox optimization suggestions',
    category: 'layout',
    body: {
      html: '<div class="flex-container"><div>Item 1</div><div>Item 2</div></div>',
      css: '.flex-container { display: block; }',
    },
  },
  {
    method: 'POST',
    path: '/api/layout/spacing-optimization',
    description: 'Spacing system optimization',
    category: 'layout',
    body: {
      code: '.component { margin: 15px; padding: 23px; }',
      options: { systemType: 'scale-based' },
    },
  },

  // Visual Analysis System
  {
    method: 'GET',
    path: '/api/visual/health',
    description: 'Visual analysis system health',
    category: 'visual',
  },
  {
    method: 'POST',
    path: '/api/visual/analyze',
    description: 'Visual design analysis with GPT-4',
    category: 'visual',
    timeout: 45000, // Extended timeout for AI operations
    body: {
      html: '<div style="padding: 20px;"><h1 style="color: red; font-size: 14px;">Small Red Title</h1><p>Content here</p></div>',
      options: { aggressive: true },
    },
  },
  {
    method: 'POST',
    path: '/api/visual/analyze-responsive',
    description: 'Multi-viewport visual analysis',
    category: 'visual',
    timeout: 60000,
    body: {
      html: '<div class="responsive-test"><h1>Title</h1><p>Content</p></div>',
      viewports: ['mobile', 'tablet', 'desktop'],
    },
  },
  {
    method: 'POST',
    path: '/api/visual/validate-improvements',
    description: 'Before/after improvement validation',
    category: 'visual',
    timeout: 45000,
    body: {
      originalCode: '<h1 style="font-size: 12px; color: #999;">Title</h1>',
      improvedCode: '<h1 style="font-size: 24px; color: #333;">Title</h1>',
    },
  },
  {
    method: 'GET',
    path: '/api/visual/stats',
    description: 'Visual analysis statistics',
    category: 'visual',
  },
  {
    method: 'POST',
    path: '/api/visual/maintenance',
    description: 'Visual system maintenance',
    category: 'visual',
    body: {
      action: 'cleanup',
      options: { screenshots: true },
    },
  },

  // Pattern Learning
  {
    method: 'POST',
    path: '/api/design/feedback',
    description: 'Pattern learning feedback',
    category: 'patterns',
    body: {
      enhancementId: 'test-enhancement-123',
      feedback: {
        rating: 4,
        helpful: true,
        comments: 'Good suggestions',
      },
      context: {
        beforeCode: '.btn { color: red; }',
        afterCode: '.btn { color: var(--primary); }',
        accepted: true,
      },
    },
  },
  {
    method: 'GET',
    path: '/api/design/patterns/learned',
    description: 'Retrieve learned patterns',
    category: 'patterns',
  },
  {
    method: 'POST',
    path: '/api/design/patterns/track',
    description: 'Track design pattern usage',
    category: 'patterns',
    body: {
      pattern: 'color-token-replacement',
      context: { framework: 'react', success: true },
      metadata: { confidence: 0.95 },
    },
  },
];

async function runTests() {
  log('\n🧪 Starting Comprehensive API Endpoint Testing', 'cyan');
  log('='.repeat(60), 'cyan');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Initialize test results
  testResults.total = endpoints.length;
  testResults.startTime = new Date().toISOString();

  log(`\n📊 Testing ${endpoints.length} endpoints...`, 'blue');
  log(`🔗 Base URL: ${BASE_URL}`, 'blue');
  log(`📁 Output Directory: ${OUTPUT_DIR}`, 'blue');

  // Group endpoints by category for organized testing
  const categorizedEndpoints = endpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = [];
    }
    acc[endpoint.category].push(endpoint);
    return acc;
  }, {});

  // Test each category
  for (const [category, categoryEndpoints] of Object.entries(categorizedEndpoints)) {
    log(
      `\n🔍 Testing ${category.toUpperCase()} endpoints (${categoryEndpoints.length})`,
      'magenta'
    );
    log('-'.repeat(50), 'magenta');

    for (const endpoint of categoryEndpoints) {
      if (endpoint.skip) {
        log(`⏭️  Skipping ${endpoint.method} ${endpoint.path} - ${endpoint.skipReason}`, 'yellow');
        testResults.skipped++;
        continue;
      }

      await testEndpoint(endpoint);

      // Small delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Generate comprehensive report
  await generateReport();

  // Print summary
  printSummary();
}

async function generateReport() {
  const report = {
    metadata: {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      totalEndpoints: testResults.total,
      testDuration: Date.now() - new Date(testResults.startTime).getTime(),
    },
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped,
      successRate: Math.round(
        (testResults.passed / (testResults.passed + testResults.failed)) * 100
      ),
    },
    endpoints: testResults.endpoints,
    categories: {},
  };

  // Generate category statistics
  const categories = [...new Set(endpoints.map((e) => e.category))];
  for (const category of categories) {
    const categoryEndpoints = testResults.endpoints.filter((e) => e.category === category);
    const categoryPassed = categoryEndpoints.filter((e) => e.success).length;
    const categoryTotal = categoryEndpoints.length;

    report.categories[category] = {
      total: categoryTotal,
      passed: categoryPassed,
      failed: categoryTotal - categoryPassed,
      successRate: Math.round((categoryPassed / categoryTotal) * 100),
    };
  }

  // Write detailed JSON report
  const reportPath = path.join(OUTPUT_DIR, 'comprehensive-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Write human-readable summary
  const summaryPath = path.join(OUTPUT_DIR, 'test-summary.md');
  const summaryContent = generateMarkdownSummary(report);
  fs.writeFileSync(summaryPath, summaryContent);

  log(`\n📄 Reports generated:`, 'blue');
  log(`   JSON: ${reportPath}`, 'blue');
  log(`   Summary: ${summaryPath}`, 'blue');
}

function generateMarkdownSummary(report) {
  const { metadata, summary, categories } = report;

  return `# API Endpoint Testing Results

**Generated**: ${metadata.timestamp}  
**Base URL**: ${metadata.baseUrl}  
**Test Duration**: ${Math.round(metadata.testDuration / 1000)}s

## Summary

- **Total Endpoints**: ${metadata.totalEndpoints}
- **Passed**: ${summary.passed} ✅
- **Failed**: ${summary.failed} ❌  
- **Skipped**: ${summary.skipped} ⏭️
- **Success Rate**: ${summary.successRate}%

## Results by Category

${Object.entries(categories)
  .map(
    ([category, stats]) =>
      `### ${category.toUpperCase()}
- **Success Rate**: ${stats.successRate}% (${stats.passed}/${stats.total})
- **Passed**: ${stats.passed}
- **Failed**: ${stats.failed}`
  )
  .join('\n\n')}

## Detailed Results

${report.endpoints
  .map((endpoint) => {
    const status = endpoint.success ? '✅' : '❌';
    const responseTime = endpoint.responseTime || 0;
    const error = endpoint.error ? ` (${endpoint.error})` : '';
    return `${status} \`${endpoint.method} ${endpoint.path}\` - ${responseTime}ms${error}`;
  })
  .join('\n')}
`;
}

function printSummary() {
  log('\n📊 TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');

  log(`Total Endpoints Tested: ${testResults.total}`, 'white');
  log(`✅ Passed: ${testResults.passed}`, 'green');
  log(`❌ Failed: ${testResults.failed}`, 'red');
  log(`⏭️  Skipped: ${testResults.skipped}`, 'yellow');

  const successRate = Math.round(
    (testResults.passed / (testResults.passed + testResults.failed)) * 100
  );
  const rateColor = successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red';
  log(`📈 Success Rate: ${successRate}%`, rateColor);

  if (testResults.failed > 0) {
    log('\n❌ FAILED ENDPOINTS:', 'red');
    testResults.endpoints
      .filter((e) => !e.success)
      .forEach((e) =>
        log(`   ${e.method} ${e.path} - ${e.error || `HTTP ${e.statusCode}`}`, 'red')
      );
  }

  log('\n🎉 Testing completed! Check reports/ directory for detailed results.', 'green');
}

// Run the tests
if (require.main === module) {
  runTests().catch((error) => {
    log(`\n💥 Test runner error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint, endpoints };
