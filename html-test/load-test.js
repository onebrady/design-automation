#!/usr/bin/env node

/**
 * Load Testing Script for Agentic Design System
 *
 * Tests API performance under various load conditions to validate
 * Redis migration benefits and production readiness.
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:8901',
  maxConcurrentUsers: 50,
  testDurationMs: 60000, // 1 minute
  warmupRequests: 10,
  endpoints: [
    { path: '/api/health', method: 'GET', weight: 1 },
    { path: '/api/brand-packs', method: 'GET', weight: 3 },
    { path: '/api/context', method: 'GET', weight: 2 },
  ],
  brandPackCreate: {
    path: '/api/brand-packs',
    method: 'POST',
    body: {
      id: 'load-test-brand-' + Date.now(),
      name: 'Load Test Brand',
      version: '1.0.0',
      description: 'Generated during load testing',
      tokens: {
        colors: {
          primary: '#1B3668',
          secondary: '#2A4F8F',
        },
      },
    },
  },
};

// Test Results Storage
const results = {
  requests: [],
  errors: [],
  startTime: null,
  endTime: null,
  concurrentUsers: 0,
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
};

// Performance Metrics
class PerformanceTracker {
  constructor() {
    this.responseTimes = [];
    this.requestsPerSecond = [];
    this.errorRate = 0;
    this.activeConnections = 0;
  }

  addResponse(duration, success) {
    this.responseTimes.push(duration);
    if (success) {
      results.successfulRequests++;
    } else {
      results.failedRequests++;
      this.errorRate = results.failedRequests / results.totalRequests;
    }
  }

  getStats() {
    if (this.responseTimes.length === 0) return null;

    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const count = sorted.length;

    return {
      totalRequests: results.totalRequests,
      successfulRequests: results.successfulRequests,
      failedRequests: results.failedRequests,
      errorRate: ((results.failedRequests / results.totalRequests) * 100).toFixed(2) + '%',
      avgResponseTime: (sorted.reduce((a, b) => a + b, 0) / count).toFixed(2) + 'ms',
      minResponseTime: sorted[0].toFixed(2) + 'ms',
      maxResponseTime: sorted[count - 1].toFixed(2) + 'ms',
      p50: sorted[Math.floor(count * 0.5)].toFixed(2) + 'ms',
      p95: sorted[Math.floor(count * 0.95)].toFixed(2) + 'ms',
      p99: sorted[Math.floor(count * 0.99)].toFixed(2) + 'ms',
      requestsPerSecond: (
        results.totalRequests /
        ((Date.now() - results.startTime) / 1000)
      ).toFixed(2),
    };
  }
}

const tracker = new PerformanceTracker();

// HTTP Request Helper
function makeRequest(endpoint, body = null) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.path, CONFIG.baseUrl);
    const startTime = performance.now();

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Agentic-Load-Test/1.0',
      },
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const duration = performance.now() - startTime;
        const success = res.statusCode >= 200 && res.statusCode < 300;

        results.totalRequests++;
        tracker.addResponse(duration, success);

        if (!success) {
          results.errors.push({
            endpoint: endpoint.path,
            method: endpoint.method,
            statusCode: res.statusCode,
            duration,
            timestamp: new Date().toISOString(),
          });
        }

        resolve({
          success,
          statusCode: res.statusCode,
          duration,
          size: data.length,
          endpoint: endpoint.path,
        });
      });
    });

    req.on('error', (err) => {
      const duration = performance.now() - startTime;
      results.totalRequests++;
      results.failedRequests++;
      results.errors.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        error: err.message,
        duration,
        timestamp: new Date().toISOString(),
      });

      resolve({
        success: false,
        error: err.message,
        duration,
        endpoint: endpoint.path,
      });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Weighted Random Endpoint Selection
function selectRandomEndpoint() {
  const totalWeight = CONFIG.endpoints.reduce((sum, ep) => sum + ep.weight, 0);
  let random = Math.random() * totalWeight;

  for (const endpoint of CONFIG.endpoints) {
    random -= endpoint.weight;
    if (random <= 0) {
      return endpoint;
    }
  }

  return CONFIG.endpoints[0]; // Fallback
}

// Simulate User Session
async function simulateUser(userId, duration) {
  const endTime = Date.now() + duration;
  const userRequests = [];

  console.log(`👤 User ${userId} started session`);

  while (Date.now() < endTime) {
    const endpoint = selectRandomEndpoint();
    const result = await makeRequest(endpoint);
    userRequests.push(result);

    // Random delay between requests (100ms - 2s)
    const delay = Math.random() * 1900 + 100;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  console.log(`👤 User ${userId} completed ${userRequests.length} requests`);
  return userRequests;
}

// Warmup Phase
async function warmup() {
  console.log('\n🔥 Starting warmup phase...');

  for (let i = 0; i < CONFIG.warmupRequests; i++) {
    const endpoint = CONFIG.endpoints[i % CONFIG.endpoints.length];
    await makeRequest(endpoint);
    console.log(`   Warmup request ${i + 1}/${CONFIG.warmupRequests} completed`);
  }

  console.log('🔥 Warmup completed!\n');
}

// Stress Test - Test Brand Pack Creation
async function stressTestBrandPackCreation() {
  console.log('\n💾 Testing brand pack creation performance...');
  const createResults = [];
  const concurrentCreations = 10;

  const createPromises = Array.from({ length: concurrentCreations }, async (_, i) => {
    const brandPack = {
      ...CONFIG.brandPackCreate.body,
      id: `load-test-brand-${Date.now()}-${i}`,
      name: `Load Test Brand ${i + 1}`,
    };

    const result = await makeRequest(CONFIG.brandPackCreate, brandPack);
    createResults.push(result);
    return result;
  });

  await Promise.all(createPromises);

  const successful = createResults.filter((r) => r.success).length;
  const avgTime = createResults.reduce((sum, r) => sum + r.duration, 0) / createResults.length;

  console.log(`💾 Created ${successful}/${concurrentCreations} brand packs`);
  console.log(`💾 Average creation time: ${avgTime.toFixed(2)}ms`);

  return createResults;
}

// Real-time Statistics Display
function displayStats() {
  const stats = tracker.getStats();
  if (!stats) return;

  console.clear();
  console.log('🚀 AGENTIC DESIGN SYSTEM - LOAD TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`📊 Total Requests: ${stats.totalRequests}`);
  console.log(`✅ Successful: ${stats.successfulRequests}`);
  console.log(`❌ Failed: ${stats.failedRequests}`);
  console.log(`📈 Requests/sec: ${stats.requestsPerSecond}`);
  console.log(`⚡ Error Rate: ${stats.errorRate}`);
  console.log('');
  console.log('⏱️  RESPONSE TIMES:');
  console.log(`   Average: ${stats.avgResponseTime}`);
  console.log(`   Min: ${stats.minResponseTime}`);
  console.log(`   Max: ${stats.maxResponseTime}`);
  console.log(`   P50: ${stats.p50}`);
  console.log(`   P95: ${stats.p95}`);
  console.log(`   P99: ${stats.p99}`);
  console.log('');
  console.log(`🔄 Active Users: ${results.concurrentUsers}`);
  console.log(`⏰ Elapsed: ${((Date.now() - results.startTime) / 1000).toFixed(1)}s`);
}

// Main Load Test
async function runLoadTest() {
  console.log('🚀 Starting Agentic Design System Load Test');
  console.log(`📍 Target: ${CONFIG.baseUrl}`);
  console.log(`👥 Max Concurrent Users: ${CONFIG.maxConcurrentUsers}`);
  console.log(`⏱️  Duration: ${CONFIG.testDurationMs / 1000}s`);

  // Warmup
  await warmup();

  // Start load test
  results.startTime = Date.now();
  const testPromises = [];

  // Start statistics display
  const statsInterval = setInterval(displayStats, 2000);

  // Gradually ramp up concurrent users
  for (let i = 1; i <= CONFIG.maxConcurrentUsers; i++) {
    results.concurrentUsers = i;

    // Start user session
    const userPromise = simulateUser(i, CONFIG.testDurationMs).finally(() => {
      results.concurrentUsers--;
    });
    testPromises.push(userPromise);

    // Gradual ramp-up (add user every 100ms)
    if (i < CONFIG.maxConcurrentUsers) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Run stress tests while users are active
  setTimeout(async () => {
    await stressTestBrandPackCreation();
  }, CONFIG.testDurationMs / 2);

  // Wait for all users to complete
  await Promise.all(testPromises);

  clearInterval(statsInterval);
  results.endTime = Date.now();

  // Final results
  displayFinalResults();
}

// Display Final Results
function displayFinalResults() {
  const stats = tracker.getStats();
  const duration = (results.endTime - results.startTime) / 1000;

  console.clear();
  console.log('🎉 LOAD TEST COMPLETED!');
  console.log('='.repeat(60));
  console.log(`⏱️  Total Duration: ${duration.toFixed(1)}s`);
  console.log(`📊 Total Requests: ${stats.totalRequests}`);
  console.log(
    `✅ Success Rate: ${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}%`
  );
  console.log(`📈 Throughput: ${stats.requestsPerSecond} requests/sec`);
  console.log('');

  console.log('🏆 PERFORMANCE METRICS:');
  console.log(
    `   P50 Response Time: ${stats.p50} (${stats.p50 < 50 ? '🟢 EXCELLENT' : stats.p50 < 100 ? '🟡 GOOD' : '🔴 NEEDS IMPROVEMENT'})`
  );
  console.log(
    `   P95 Response Time: ${stats.p95} (${stats.p95 < 100 ? '🟢 EXCELLENT' : stats.p95 < 200 ? '🟡 GOOD' : '🔴 NEEDS IMPROVEMENT'})`
  );
  console.log(
    `   P99 Response Time: ${stats.p99} (${stats.p99 < 500 ? '🟢 EXCELLENT' : stats.p99 < 1000 ? '🟡 GOOD' : '🔴 NEEDS IMPROVEMENT'})`
  );
  console.log(`   Average Response: ${stats.avgResponseTime}`);
  console.log('');

  // Redis Performance Assessment
  const p95 = parseFloat(stats.p95);
  const p99 = parseFloat(stats.p99);
  const errorRate = parseFloat(stats.errorRate);

  console.log('🔬 REDIS MIGRATION VALIDATION:');
  if (p95 < 100 && errorRate < 1) {
    console.log('   ✅ REDIS PERFORMANCE: EXCELLENT - Migration goals exceeded!');
  } else if (p95 < 200 && errorRate < 5) {
    console.log('   🟡 REDIS PERFORMANCE: GOOD - Meeting production targets');
  } else {
    console.log('   🔴 REDIS PERFORMANCE: NEEDS ATTENTION - Review configuration');
  }

  console.log('');

  if (results.errors.length > 0) {
    console.log(`⚠️  ERRORS (${results.errors.length} total):`);
    const errorTypes = {};
    results.errors.forEach((err) => {
      const key = `${err.statusCode || 'Connection'} - ${err.endpoint}`;
      errorTypes[key] = (errorTypes[key] || 0) + 1;
    });

    Object.entries(errorTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} occurrences`);
    });
  }

  // Save results to file
  const resultsFile = {
    testConfig: CONFIG,
    stats,
    duration,
    timestamp: new Date().toISOString(),
    errors: results.errors,
  };

  require('fs').writeFileSync('./load-test-results.json', JSON.stringify(resultsFile, null, 2));
  console.log('\n💾 Results saved to: load-test-results.json');
}

// Error Handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Test interrupted by user');
  if (results.startTime) {
    results.endTime = Date.now();
    displayFinalResults();
  }
  process.exit(0);
});

// Run the load test
if (require.main === module) {
  runLoadTest().catch(console.error);
}

module.exports = { runLoadTest, tracker, results };
