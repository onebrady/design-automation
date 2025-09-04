// Test script for Phase 1 fixes - 5 critical server errors (500) 

class Phase1TestRunner {
  constructor() {
    this.baseUrl = 'http://localhost:8901';
    this.results = [];
  }

  async runTests() {
    console.log('🚀 Testing Phase 1 Fixes - Critical Server Errors (500)');
    console.log('==================================================\n');

    const tests = [
      { name: 'Brand Pack Creation', method: 'testBrandPackCreation' },
      { name: 'Brand Pack Version Creation', method: 'testBrandPackVersionCreation' },
      { name: 'Template Customization', method: 'testTemplateCustomization' },
      { name: 'Grid Recommendations', method: 'testGridRecommendations' }
    ];

    for (const test of tests) {
      try {
        console.log(`🔍 Testing: ${test.name}...`);
        const result = await this[test.method]();
        this.results.push({ ...result, test: test.name });
        
        if (result.success) {
          console.log(`✅ ${test.name}: FIXED`);
        } else {
          console.log(`❌ ${test.name}: STILL FAILING - ${result.error}`);
        }
        console.log(`   Response time: ${result.responseTime}ms\n`);
      } catch (error) {
        console.log(`❌ ${test.name}: ERROR - ${error.message}\n`);
        this.results.push({
          test: test.name,
          success: false,
          error: error.message,
          responseTime: 0
        });
      }
    }

    this.printSummary();
  }

  async testBrandPackCreation() {
    const startTime = Date.now();
    
    const testData = {
      id: `test-pack-${Date.now()}`,
      name: 'Test Pack Phase 1',
      tokens: {
        colors: { primary: '#ff0000' }
      }
    };

    const response = await fetch(`${this.baseUrl}/api/brand-packs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      responseTime,
      error: response.ok ? null : data.message || 'Unknown error',
      data: response.ok ? data : null
    };
  }

  async testBrandPackVersionCreation() {
    const startTime = Date.now();
    
    // First create a brand pack, then create a version
    const packId = `test-version-pack-${Date.now()}`;
    
    // Create initial pack
    await fetch(`${this.baseUrl}/api/brand-packs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: packId,
        name: 'Test Version Pack',
        tokens: { colors: { primary: '#0066cc' } }
      })
    });

    // Create version
    const versionData = {
      version: '1.1.0',
      changes: ['Updated primary color'],
      tokens: { colors: { primary: '#0088cc', secondary: '#666' } }
    };

    const response = await fetch(`${this.baseUrl}/api/brand-packs/${packId}/version`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(versionData)
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      responseTime,
      error: response.ok ? null : data.message || 'Unknown error',
      data: response.ok ? data : null
    };
  }

  async testTemplateCustomization() {
    const startTime = Date.now();
    
    const customizationData = {
      templateId: 'button-primary',
      customizations: {
        variant: 'primary',
        size: 'large'
      },
      brandPackId: 'western-companies'
    };

    const response = await fetch(`${this.baseUrl}/api/design/customize-template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customizationData)
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      responseTime,
      error: response.ok ? null : data.message || 'Unknown error',
      data: response.ok ? data : null
    };
  }

  async testGridRecommendations() {
    const startTime = Date.now();
    
    const gridData = {
      content: {
        html: '<div class="container"><div class="item">Item 1</div><div class="item">Item 2</div></div>',
        css: '.container { display: flex; } .item { flex: 1; }'
      },
      options: {
        columns: 12,
        responsive: true
      }
    };

    const response = await fetch(`${this.baseUrl}/api/layout/grid-recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gridData)
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      responseTime,
      error: response.ok ? null : data.message || 'Unknown error',
      data: response.ok ? data : null
    };
  }

  printSummary() {
    console.log('\n📊 PHASE 1 TEST SUMMARY');
    console.log('========================');
    
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    const successRate = Math.round((passed / total) * 100);
    
    console.log(`Tests passed: ${passed}/${total} (${successRate}%)`);
    console.log(`Average response time: ${Math.round(this.results.reduce((sum, r) => sum + r.responseTime, 0) / total)}ms\n`);
    
    if (passed === total) {
      console.log('🎉 ALL PHASE 1 FIXES SUCCESSFUL!');
      console.log('Ready to proceed to Phase 2 (parameter validation fixes)');
    } else {
      console.log('❌ Some endpoints still failing:');
      this.results.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.test}: ${r.error}`);
      });
    }
  }
}

// Run tests if called directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.runPhase1Tests = async () => {
    const runner = new Phase1TestRunner();
    await runner.runTests();
    return runner.results;
  };
} else {
  // Node.js environment
  const runner = new Phase1TestRunner();
  runner.runTests().catch(console.error);
}