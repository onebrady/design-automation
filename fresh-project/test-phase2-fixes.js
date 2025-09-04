// Test script for Phase 2 fixes - 8 parameter validation (400) endpoints

class Phase2TestRunner {
  constructor() {
    this.baseUrl = 'http://localhost:8901';
    this.results = [];
  }

  async runTests() {
    console.log('🚀 Testing Phase 2 Fixes - Parameter Validation (400) Endpoints');
    console.log('================================================================\n');

    const tests = [
      // Pattern Learning (2 endpoints)
      { name: 'Submit Pattern Feedback', method: 'testPatternFeedback' },
      { name: 'Get Improvement Suggestions', method: 'testImprovementSuggestions' },
      
      // Component Generation (2 endpoints) 
      { name: 'Preview Component', method: 'testPreviewComponent' },
      { name: 'Create Sandbox', method: 'testCreateSandbox' },
      
      // Layout Intelligence (2 endpoints)
      { name: 'Template Matches', method: 'testTemplateMatches' },
      { name: 'Flexbox Analysis', method: 'testFlexboxAnalysis' },
      
      // Semantic Analysis (2 endpoints)
      { name: 'Detect Component Type', method: 'testDetectComponentType' },
      { name: 'Batch Analyze', method: 'testBatchAnalyze' }
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

  async testPatternFeedback() {
    const startTime = Date.now();
    
    const testData = {
      projectId: `test-project-${Date.now()}`,
      patternId: 'btn-primary-pattern',
      feedback: 'positive'
    };

    const response = await fetch(`${this.baseUrl}/api/design/feedback`, {
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

  async testImprovementSuggestions() {
    const startTime = Date.now();
    
    const testData = {
      projectId: `test-project-${Date.now()}`,
      component: {
        html: '<button class="btn">Click me</button>',
        css: '.btn { background: blue; padding: 10px; }'
      },
      context: {
        componentType: 'button',
        usage: 'call-to-action'
      }
    };

    const response = await fetch(`${this.baseUrl}/api/design/suggest-improvements`, {
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

  async testPreviewComponent() {
    const startTime = Date.now();
    
    const testData = {
      component: {
        html: '<button class="test-btn">Test Button</button>',
        css: '.test-btn { background: #007bff; color: white; padding: 8px 16px; border: none; border-radius: 4px; }'
      },
      options: {
        width: 400,
        height: 200
      },
      brandPackId: 'western-companies'
    };

    const response = await fetch(`${this.baseUrl}/api/design/preview-component`, {
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

  async testCreateSandbox() {
    const startTime = Date.now();
    
    const testData = {
      code: {
        html: '<div class="container"><h1>Hello World</h1></div>',
        css: '.container { padding: 20px; background: #f5f5f5; }'
      },
      context: {
        framework: 'html',
        options: { secure: true }
      }
    };

    const response = await fetch(`${this.baseUrl}/api/design/create-sandbox`, {
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

  async testTemplateMatches() {
    const startTime = Date.now();
    
    const testData = {
      layoutType: 'content-layout',
      requirements: {
        type: 'content-layout',
        responsive: true,
        columns: 2
      },
      limit: 5
    };

    const response = await fetch(`${this.baseUrl}/api/layout/template-matches`, {
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

  async testFlexboxAnalysis() {
    const startTime = Date.now();
    
    const testData = {
      html: '<div class="container"><div class="item">Item 1</div><div class="item">Item 2</div></div>',
      css: '.container { display: flex; justify-content: space-between; } .item { flex: 1; margin: 0 10px; }',
      options: {
        detectPatterns: true,
        includeRecommendations: true
      }
    };

    const response = await fetch(`${this.baseUrl}/api/layout/flexbox-analysis`, {
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

  async testDetectComponentType() {
    const startTime = Date.now();
    
    const testData = {
      elementHtml: '<button class="btn btn-primary">Submit Form</button>',
      context: 'form submission'
    };

    const response = await fetch(`${this.baseUrl}/api/semantic/detect-component-type`, {
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

  async testBatchAnalyze() {
    const startTime = Date.now();
    
    const testData = {
      htmlFragments: [
        '<button class="btn-primary">Submit</button>',
        '<nav class="navbar"><a href="#home">Home</a></nav>',
        '<article class="card"><h3>Title</h3><p>Content</p></article>'
      ],
      options: {
        includeAccessibility: true,
        includeSemantics: true
      }
    };

    const response = await fetch(`${this.baseUrl}/api/semantic/batch-analyze`, {
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

  printSummary() {
    console.log('\n📊 PHASE 2 TEST SUMMARY');
    console.log('========================');
    
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    const successRate = Math.round((passed / total) * 100);
    
    console.log(`Tests passed: ${passed}/${total} (${successRate}%)`);
    console.log(`Average response time: ${Math.round(this.results.reduce((sum, r) => sum + r.responseTime, 0) / total)}ms\n`);
    
    // Show results by category
    console.log('📋 Results by Category:');
    console.log('-----------------------');
    
    const categories = [
      { name: 'Pattern Learning', tests: this.results.slice(0, 2) },
      { name: 'Component Generation', tests: this.results.slice(2, 4) },
      { name: 'Layout Intelligence', tests: this.results.slice(4, 6) },
      { name: 'Semantic Analysis', tests: this.results.slice(6, 8) }
    ];
    
    categories.forEach(category => {
      const categoryPassed = category.tests.filter(t => t.success).length;
      const categoryTotal = category.tests.length;
      const categoryRate = Math.round((categoryPassed / categoryTotal) * 100);
      console.log(`  ${category.name}: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`);
    });
    
    if (passed === total) {
      console.log('\n🎉 ALL PHASE 2 FIXES SUCCESSFUL!');
      console.log('Combined with Phase 1: Ready for production deployment');
    } else {
      console.log('\n❌ Some endpoints still failing:');
      this.results.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.test}: ${r.error}`);
      });
      console.log('\nThese may require additional implementation in the underlying classes.');
    }
  }
}

// Run tests if called directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.runPhase2Tests = async () => {
    const runner = new Phase2TestRunner();
    await runner.runTests();
    return runner.results;
  };
} else {
  // Node.js environment
  const runner = new Phase2TestRunner();
  runner.runTests().catch(console.error);
}