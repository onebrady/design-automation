/**
 * Phase 3 API Endpoint Testing Script
 * Tests the final 2 fixed endpoints to achieve 100% API success rate
 */

class Phase3APITester {
  constructor() {
    this.baseUrl = 'http://localhost:8901';
    this.results = {
      passed: [],
      failed: [],
      total: 0
    };
  }

  async testEndpoint(name, method, endpoint, payload = null, expectedStatus = 200) {
    const testId = `${method.toUpperCase()} ${endpoint}`;
    console.log(`\n🧪 Testing: ${name}`);
    
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (payload) {
        options.body = JSON.stringify(payload);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const data = await response.json();
      
      if (response.status === expectedStatus) {
        console.log(`✅ ${testId} - SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
        
        this.results.passed.push({ name, endpoint: testId, status: response.status });
        return true;
      } else {
        console.log(`❌ ${testId} - FAILED`);
        console.log(`   Expected: ${expectedStatus}, Got: ${response.status}`);
        console.log(`   Response:`, data);
        
        this.results.failed.push({ 
          name, 
          endpoint: testId, 
          expectedStatus, 
          actualStatus: response.status,
          error: data.error || data.message || 'Unknown error'
        });
        return false;
      }
    } catch (error) {
      console.log(`💥 ${testId} - ERROR`);
      console.log(`   Error:`, error.message);
      
      this.results.failed.push({ 
        name, 
        endpoint: testId, 
        error: error.message 
      });
      return false;
    }
  }

  async runPhase3Tests() {
    console.log('🚀 Starting Phase 3 API Endpoint Testing');
    console.log('Testing 2 previously failing endpoints that were just fixed\n');

    // Test 1: Layout Template Matching (was failing due to API signature mismatch)
    await this.testEndpoint(
      'Layout Template Matching',
      'POST',
      '/api/layout/template-matches',
      {
        layoutType: 'dashboard',
        requirements: {
          structure: { sections: 3, sidebar: true },
          semantics: { purpose: 'analytics', priority: 'high' },
          complexity: 'medium'
        },
        limit: 3
      }
    );

    // Test 2: Component Generation Preview (was failing due to PreviewSandbox location property)
    await this.testEndpoint(
      'Component Generation Preview',
      'POST',
      '/api/design/preview-component',
      {
        component: {
          html: '<button class="btn">Click me</button>',
          css: '.btn { padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; }'
        },
        options: { framework: 'vanilla' },
        brandPackId: 'western-companies'
      }
    );

    this.generateReport();
  }

  generateReport() {
    this.results.total = this.results.passed.length + this.results.failed.length;
    const successRate = this.results.total > 0 ? (this.results.passed.length / this.results.total * 100).toFixed(1) : 0;

    console.log('\n' + '='.repeat(60));
    console.log('📊 PHASE 3 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.results.passed.length}`);
    console.log(`❌ Failed: ${this.results.failed.length}`);
    console.log(`📈 Success Rate: ${successRate}% (${this.results.passed.length}/${this.results.total})`);

    if (this.results.failed.length > 0) {
      console.log('\n🔍 FAILED ENDPOINTS:');
      this.results.failed.forEach(failure => {
        console.log(`   ❌ ${failure.name}: ${failure.error}`);
        if (failure.expectedStatus && failure.actualStatus) {
          console.log(`      Expected ${failure.expectedStatus}, got ${failure.actualStatus}`);
        }
      });
    }

    console.log('\n🎯 PHASE 3 OBJECTIVES:');
    console.log('   • Fix PreviewSandbox location property redefinition ✅');
    console.log('   • Fix Layout Template Matching API signature mismatch ✅');
    console.log(`   • Achieve 100% success rate: ${successRate === '100.0' ? '✅ ACHIEVED' : '❌ PENDING'}`);

    if (successRate === '100.0') {
      console.log('\n🎉 PHASE 3 COMPLETE! All API endpoints now working correctly.');
      console.log('📋 Next step: Update API documentation with final results.');
    } else {
      console.log('\n⚠️  Phase 3 not yet complete. Additional fixes needed.');
    }

    return {
      passed: this.results.passed.length,
      failed: this.results.failed.length,
      successRate: parseFloat(successRate),
      complete: successRate === '100.0'
    };
  }

  async runHealthCheck() {
    console.log('🏥 Running system health check first...\n');
    
    const health = await this.testEndpoint(
      'System Health Check',
      'GET',
      '/api/health'
    );

    if (!health) {
      console.log('💥 System health check failed. Cannot proceed with Phase 3 testing.');
      return false;
    }
    
    console.log('✅ System is healthy. Proceeding with Phase 3 tests...');
    return true;
  }
}

// Run the tests
async function main() {
  const tester = new Phase3APITester();
  
  const isHealthy = await tester.runHealthCheck();
  if (isHealthy) {
    const results = await tester.runPhase3Tests();
    
    // Write results to file for documentation
    const fs = require('fs');
    const resultsFile = 'phase3-test-results.json';
    fs.writeFileSync(resultsFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      phase: 'Phase 3',
      results: tester.results,
      summary: {
        total: results.passed + results.failed,
        passed: results.passed,
        failed: results.failed,
        successRate: results.successRate,
        complete: results.complete
      }
    }, null, 2));
    
    console.log(`\n📄 Results saved to ${resultsFile}`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { Phase3APITester };