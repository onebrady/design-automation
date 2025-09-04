// Phase 8 Design System - Comprehensive Endpoint Testing Framework
// Tests all 60+ implemented endpoints with proper parameters and authentication

class ComprehensiveEndpointTester {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8901/api';
        this.testResults = new Map();
        this.passedTests = [];
        this.failedTests = [];
        this.totalTests = 0;
        this.testsRun = 0;
        this.projectPath = 'D:/Projects/Tools/Designs/fresh-project';
        this.brandPackId = 'western-companies';
        
        // Sample data for testing
        this.sampleCSS = '.test { color: red; background: blue; padding: 10px; }';
        this.sampleHTML = '<div class="container"><h1>Hello World</h1><button class="btn">Click me</button></div>';
        this.sampleComponent = {
            description: 'A modern button with primary styling',
            componentType: 'button',
            style: 'modern',
            framework: 'html'
        };
    }

    async runAllTests() {
        console.log('🚀 Starting Comprehensive Phase 8 API Testing');
        console.log('=' * 60);
        
        await this.testSystemHealth();
        await this.testBrandPackManagement();
        await this.testDesignEnhancement();
        await this.testPatternLearning();
        await this.testComponentGeneration();
        await this.testLayoutIntelligence();
        await this.testSemanticAnalysis();
        await this.testAdvancedTransformations();
        
        this.generateFinalReport();
    }

    // ===== SYSTEM HEALTH TESTS =====
    async testSystemHealth() {
        console.log('\n🏥 Testing System Health & Configuration...');
        
        const tests = [
            { name: 'Health Check', method: 'GET', endpoint: '/health' },
            { name: 'Project Context', method: 'GET', endpoint: '/context' },
            { name: 'Project Config', method: 'GET', endpoint: '/project-config' },
            { name: 'Lock File Status', method: 'GET', endpoint: '/lock' }
        ];
        
        for (const test of tests) {
            await this.testEndpoint(test.name, test.method, test.endpoint);
        }
    }

    // ===== BRAND PACK MANAGEMENT TESTS =====
    async testBrandPackManagement() {
        console.log('\n🎨 Testing Brand Pack Management...');
        
        const tests = [
            // Basic CRUD operations
            { name: 'List Brand Packs', method: 'GET', endpoint: '/brand-packs' },
            { name: 'Get Specific Brand Pack', method: 'GET', endpoint: `/brand-packs/${this.brandPackId}` },
            { name: 'Create Brand Pack', method: 'POST', endpoint: '/brand-packs', data: {
                id: 'test-brand-pack',
                name: 'Test Brand Pack',
                tokens: { colors: { primary: '#ff0000' } }
            }},
            
            // Brand pack versions
            { name: 'Get Brand Pack Versions', method: 'GET', endpoint: `/brand-packs/${this.brandPackId}/versions` },
            { name: 'Create Brand Pack Version', method: 'POST', endpoint: `/brand-packs/${this.brandPackId}/version`, data: {
                version: '1.1.0',
                changes: ['Updated primary color']
            }},
            
            // Export functionality
            { name: 'Export Brand Pack as CSS', method: 'GET', endpoint: `/brand-packs/${this.brandPackId}/export/css` },
            { name: 'Export Brand Pack as JSON', method: 'GET', endpoint: `/brand-packs/${this.brandPackId}/export/json` },
            
            // AI Generation (requires file upload - will test with mock)
            { name: 'Generate from Logo (Mock)', method: 'POST', endpoint: '/brand-packs/generate-from-logo', data: {
                brandName: 'Test Brand',
                description: 'Test brand description'
            }, expectFail: true } // Will fail without file upload
        ];
        
        for (const test of tests) {
            await this.testEndpoint(test.name, test.method, test.endpoint, test.data, test.expectFail);
        }
    }

    // ===== DESIGN ENHANCEMENT TESTS =====
    async testDesignEnhancement() {
        console.log('\n✨ Testing Design Enhancement...');
        
        const tests = [
            // Basic enhancement
            { name: 'CSS Analysis', method: 'POST', endpoint: '/design/analyze', data: {
                code: this.sampleCSS
            }},
            { name: 'Basic Enhancement', method: 'POST', endpoint: '/design/enhance', data: {
                code: this.sampleCSS,
                brandPackId: this.brandPackId,
                projectPath: this.projectPath
            }},
            { name: 'Cached Enhancement', method: 'POST', endpoint: '/design/enhance-cached', data: {
                code: this.sampleCSS,
                brandPackId: this.brandPackId,
                projectPath: this.projectPath
            }},
            
            // Proactive suggestions
            { name: 'Proactive Suggestions', method: 'POST', endpoint: '/design/suggest-proactive', data: {
                code: this.sampleCSS,
                componentType: 'button'
            }},
            
            // Pattern learning
            { name: 'Get Learned Patterns', method: 'GET', endpoint: '/design/patterns/learned' },
            { name: 'Track Pattern Usage', method: 'POST', endpoint: '/design/patterns/track', data: {
                componentType: 'button',
                pattern: 'primary-button-style'
            }},
        ];
        
        for (const test of tests) {
            await this.testEndpoint(test.name, test.method, test.endpoint, test.data);
        }
    }

    // ===== PATTERN LEARNING TESTS =====
    async testPatternLearning() {
        console.log('\n🧠 Testing Pattern Learning System...');
        
        const projectId = 'test-project';
        const tests = [
            // Pattern management
            { name: 'Get Project Patterns', method: 'GET', endpoint: `/design/patterns/${projectId}` },
            { name: 'Submit Pattern Feedback', method: 'POST', endpoint: '/design/feedback', data: {
                patternId: 'test-pattern',
                feedback: 'positive',
                context: { action: 'applied_suggestion', componentType: 'button' }
            }},
            { name: 'Get Improvement Suggestions', method: 'POST', endpoint: '/design/suggest-improvements', data: {
                code: this.sampleCSS,
                context: { componentType: 'button', usage: 'call-to-action' },
                projectPath: this.projectPath
            }},
            
            // Advanced pattern analysis
            { name: 'Pattern Correlations', method: 'GET', endpoint: `/design/patterns/${projectId}/correlations` },
            { name: 'Pattern Calibration', method: 'GET', endpoint: `/design/patterns/${projectId}/calibration` },
            { name: 'Batch Pattern Learning', method: 'POST', endpoint: `/design/patterns/${projectId}/batch-learn`, data: {
                patterns: [
                    { selector: '.btn', properties: { padding: '10px', color: 'blue' } },
                    { selector: '.card', properties: { borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } }
                ]
            }}
        ];
        
        for (const test of tests) {
            await this.testEndpoint(test.name, test.method, test.endpoint, test.data);
        }
    }

    // ===== COMPONENT GENERATION TESTS =====
    async testComponentGeneration() {
        console.log('\n🧩 Testing Component Generation...');
        
        const tests = [
            // Component generation
            { name: 'Generate Component', method: 'POST', endpoint: '/design/generate-component', data: this.sampleComponent },
            { name: 'Get Component Templates', method: 'GET', endpoint: '/design/templates', params: {
                type: 'button',
                style: 'modern',
                limit: 10
            }},
            { name: 'Customize Template', method: 'POST', endpoint: '/design/customize-template', data: {
                templateId: 'modern-button',
                customizations: { variant: 'primary', size: 'large' },
                framework: 'html',
                projectPath: this.projectPath
            }},
            
            // Preview and visual diff
            { name: 'Preview Component', method: 'POST', endpoint: '/design/preview-component', data: {
                html: this.sampleHTML,
                css: this.sampleCSS
            }},
            { name: 'Visual Diff', method: 'POST', endpoint: '/design/visual-diff', data: {
                before: { html: this.sampleHTML, css: this.sampleCSS },
                after: { html: this.sampleHTML, css: this.sampleCSS.replace('red', 'blue') }
            }},
            
            // Sandbox functionality
            { name: 'Create Sandbox', method: 'POST', endpoint: '/design/create-sandbox', data: {
                html: this.sampleHTML,
                css: this.sampleCSS,
                projectPath: this.projectPath
            }},
            { name: 'Get Sandbox Stats', method: 'GET', endpoint: '/design/sandbox-stats' }
        ];
        
        for (const test of tests) {
            await this.testEndpoint(test.name, test.method, test.endpoint, test.data, false, test.params);
        }
    }

    // ===== LAYOUT INTELLIGENCE TESTS =====
    async testLayoutIntelligence() {
        console.log('\n📐 Testing Layout Intelligence...');
        
        const tests = [
            // Layout analysis
            { name: 'Analyze Layout', method: 'POST', endpoint: '/layout/analyze', data: {
                html: this.sampleHTML,
                css: this.sampleCSS,
                options: { detectGrid: true, detectFlexbox: true, analyzeResponsive: true }
            }},
            { name: 'Grid Recommendations', method: 'POST', endpoint: '/layout/grid-recommendations', data: {
                requirements: { columns: 12, responsive: true, gutters: 'medium' },
                content: [
                    { type: 'header', span: 12 },
                    { type: 'sidebar', span: 3 },
                    { type: 'main', span: 9 }
                ],
                projectPath: this.projectPath
            }},
            { name: 'Template Matches', method: 'POST', endpoint: '/layout/template-matches', data: {
                html: this.sampleHTML,
                requirements: { type: 'card-grid', responsive: true }
            }},
            { name: 'Apply Layout Template', method: 'POST', endpoint: '/layout/apply-template', data: {
                templateId: 'hero-section',
                content: { title: 'Hello World', subtitle: 'Welcome to our site' },
                projectPath: this.projectPath
            }},
            
            // Templates and generation
            { name: 'Get Layout Templates', method: 'GET', endpoint: '/layout/templates', params: {
                type: 'hero-section',
                responsive: true,
                complexity: 'medium'
            }},
            { name: 'Generate Grid System', method: 'POST', endpoint: '/layout/generate-grid', data: {
                columns: 12,
                breakpoints: ['768px', '1024px'],
                gutters: '20px'
            }},
            { name: 'Flexbox Analysis', method: 'POST', endpoint: '/layout/flexbox-analysis', data: {
                css: '.container { display: flex; flex-direction: row; }'
            }}
        ];
        
        for (const test of tests) {
            await this.testEndpoint(test.name, test.method, test.endpoint, test.data, false, test.params);
        }
    }

    // ===== SEMANTIC ANALYSIS TESTS =====
    async testSemanticAnalysis() {
        console.log('\n🔍 Testing Semantic Analysis...');
        
        const tests = [
            // Core semantic analysis
            { name: 'Semantic Analysis', method: 'POST', endpoint: '/semantic/analyze', data: {
                html: this.sampleHTML,
                options: { includeAccessibility: true, includeComponents: true, includeRelationships: true }
            }},
            { name: 'Detect Components', method: 'POST', endpoint: '/semantic/detect-components', data: {
                html: this.sampleHTML
            }},
            { name: 'Accessibility Analysis', method: 'POST', endpoint: '/semantic/analyze-accessibility', data: {
                html: this.sampleHTML
            }},
            { name: 'Generate ARIA', method: 'POST', endpoint: '/semantic/generate-aria', data: {
                html: '<div class="modal">Modal content</div>',
                componentAnalysis: { type: 'modal', role: 'dialog' }
            }},
            
            // Enhancement and relationships
            { name: 'Enhance HTML Semantics', method: 'POST', endpoint: '/semantic/enhance-html', data: {
                html: this.sampleHTML
            }},
            { name: 'Component Relationships', method: 'POST', endpoint: '/semantic/component-relationships', data: {
                html: this.sampleHTML
            }},
            { name: 'Semantic Score', method: 'POST', endpoint: '/semantic/score', data: {
                html: this.sampleHTML
            }},
            { name: 'Get Recommendations', method: 'POST', endpoint: '/semantic/recommendations', data: {
                html: this.sampleHTML,
                context: { pageType: 'landing', userType: 'general' }
            }},
            
            // Quick checks and utilities
            { name: 'Quick Accessibility Check', method: 'POST', endpoint: '/semantic/quick-accessibility-check', data: {
                html: this.sampleHTML
            }},
            { name: 'Detect Component Type', method: 'POST', endpoint: '/semantic/detect-component-type', data: {
                html: '<button class="btn-primary">Submit</button>'
            }},
            { name: 'Analyze Context', method: 'POST', endpoint: '/semantic/analyze-context', data: {
                html: this.sampleHTML,
                surrounding: '<main><section>...</section></main>'
            }},
            { name: 'Accessibility Report', method: 'POST', endpoint: '/semantic/accessibility-report', data: {
                html: this.sampleHTML,
                wcagLevel: 'AA'
            }},
            { name: 'Batch Semantic Analysis', method: 'POST', endpoint: '/semantic/batch-analyze', data: {
                pages: [
                    { url: '/home', html: this.sampleHTML },
                    { url: '/about', html: '<div><h1>About</h1><p>About us</p></div>' }
                ]
            }},
            { name: 'Get Semantic Stats', method: 'GET', endpoint: '/semantic/stats' }
        ];
        
        for (const test of tests) {
            await this.testEndpoint(test.name, test.method, test.endpoint, test.data);
        }
    }

    // ===== ADVANCED TRANSFORMATIONS TESTS =====
    async testAdvancedTransformations() {
        console.log('\n⚡ Testing Advanced Transformations...');
        
        const tests = [
            // Advanced enhancement systems
            { name: 'Advanced Enhancement', method: 'POST', endpoint: '/design/enhance-advanced', data: {
                code: this.sampleCSS,
                options: { enableTypography: true, enableAnimations: true, enableGradients: true },
                projectPath: this.projectPath
            }},
            { name: 'Typography Enhancement', method: 'POST', endpoint: '/design/enhance-typography', data: {
                code: 'h1 { font-size: 32px; }',
                projectPath: this.projectPath
            }},
            { name: 'Animation Enhancement', method: 'POST', endpoint: '/design/enhance-animations', data: {
                code: '.button { transition: none; }',
                projectPath: this.projectPath
            }},
            { name: 'Gradient Enhancement', method: 'POST', endpoint: '/design/enhance-gradients', data: {
                code: '.header { background: #ff0000; }',
                projectPath: this.projectPath
            }},
            { name: 'State Enhancement', method: 'POST', endpoint: '/design/enhance-states', data: {
                code: '.button { color: blue; }',
                projectPath: this.projectPath
            }},
            
            // Optimization and batch processing
            { name: 'CSS Optimization', method: 'POST', endpoint: '/design/optimize', data: {
                code: this.sampleCSS,
                level: 2,
                options: { removeComments: true, removeWhitespace: true, mergeDuplicates: true }
            }},
            { name: 'Batch Enhancement', method: 'POST', endpoint: '/design/enhance-batch', data: {
                files: [
                    { path: 'styles/main.css', css: this.sampleCSS },
                    { path: 'styles/components.css', css: '.card { padding: 20px; }' }
                ],
                options: { enableTypography: true, enableOptimization: true },
                projectPath: this.projectPath
            }}
        ];
        
        for (const test of tests) {
            await this.testEndpoint(test.name, test.method, test.endpoint, test.data);
        }
    }

    // ===== CORE TESTING INFRASTRUCTURE =====
    async testEndpoint(testName, method, endpoint, data = null, expectFail = false, params = null) {
        const startTime = performance.now();
        this.testsRun++;
        
        try {
            let url = `${this.apiBaseUrl}${endpoint}`;
            
            // Add query parameters if provided
            if (params && method === 'GET') {
                const queryString = new URLSearchParams(params).toString();
                url += `?${queryString}`;
            }
            
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };
            
            if (data && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(url, options);
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            let result;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    result = await response.json();
                } catch (e) {
                    result = `JSON Parse Error: ${e.message}`;
                }
            } else {
                result = await response.text();
            }
            
            const testResult = {
                testName,
                method,
                endpoint,
                status: response.status,
                statusText: response.statusText,
                responseTime: Math.round(responseTime),
                success: response.ok,
                result,
                timestamp: new Date().toISOString(),
                expectFail
            };
            
            this.testResults.set(`${testName}_${Date.now()}`, testResult);
            
            if (response.ok) {
                this.passedTests.push(testResult);
                console.log(`✅ ${testName}: ${response.status} (${testResult.responseTime}ms)`);
            } else {
                this.failedTests.push(testResult);
                if (expectFail) {
                    console.log(`⚠️  ${testName}: ${response.status} (Expected failure - ${testResult.responseTime}ms)`);
                } else {
                    console.log(`❌ ${testName}: ${response.status} - ${response.statusText} (${testResult.responseTime}ms)`);
                }
            }
            
        } catch (error) {
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            const testResult = {
                testName,
                method,
                endpoint,
                status: 0,
                statusText: 'Network Error',
                responseTime: Math.round(responseTime),
                success: false,
                result: error.message,
                timestamp: new Date().toISOString(),
                expectFail
            };
            
            this.testResults.set(`${testName}_${Date.now()}`, testResult);
            this.failedTests.push(testResult);
            
            console.log(`💥 ${testName}: Network Error - ${error.message} (${testResult.responseTime}ms)`);
        }
    }

    generateFinalReport() {
        console.log('\n' + '=' * 80);
        console.log('📊 COMPREHENSIVE PHASE 8 API TEST REPORT');
        console.log('=' * 80);
        
        const successCount = this.passedTests.length;
        const failureCount = this.failedTests.length;
        const successRate = ((successCount / this.testsRun) * 100).toFixed(1);
        
        console.log(`\n📈 SUMMARY STATISTICS:`);
        console.log(`   Total Tests Run: ${this.testsRun}`);
        console.log(`   ✅ Passed: ${successCount}`);
        console.log(`   ❌ Failed: ${failureCount}`);
        console.log(`   📊 Success Rate: ${successRate}%`);
        
        if (this.passedTests.length > 0) {
            const avgResponseTime = this.passedTests.reduce((acc, test) => acc + test.responseTime, 0) / this.passedTests.length;
            const maxResponseTime = Math.max(...this.passedTests.map(test => test.responseTime));
            console.log(`   ⚡ Avg Response Time: ${Math.round(avgResponseTime)}ms`);
            console.log(`   ⏱️  Max Response Time: ${maxResponseTime}ms`);
        }
        
        // Group failures by category
        console.log(`\n🔍 FAILURE ANALYSIS:`);
        const failuresByCategory = {};
        this.failedTests.forEach(test => {
            const category = test.endpoint.split('/')[1] || 'unknown';
            if (!failuresByCategory[category]) failuresByCategory[category] = [];
            failuresByCategory[category].push(test);
        });
        
        Object.entries(failuresByCategory).forEach(([category, failures]) => {
            console.log(`\n   ${category.toUpperCase()} (${failures.length} failures):`);
            failures.forEach(failure => {
                const status = failure.status === 0 ? 'Network Error' : `${failure.status} ${failure.statusText}`;
                console.log(`   - ${failure.testName}: ${status}`);
            });
        });
        
        // Success by category
        console.log(`\n✅ WORKING ENDPOINTS:`);
        const successesByCategory = {};
        this.passedTests.forEach(test => {
            const category = test.endpoint.split('/')[1] || 'unknown';
            if (!successesByCategory[category]) successesByCategory[category] = [];
            successesByCategory[category].push(test);
        });
        
        Object.entries(successesByCategory).forEach(([category, successes]) => {
            console.log(`\n   ${category.toUpperCase()} (${successes.length} working):`);
            successes.forEach(success => {
                console.log(`   - ${success.testName}: ${success.status} (${success.responseTime}ms)`);
            });
        });
        
        console.log('\n' + '=' * 80);
        console.log('🎯 Testing Complete! Results logged above.');
        console.log('=' * 80);
        
        return {
            totalTests: this.testsRun,
            passed: successCount,
            failed: failureCount,
            successRate: successRate,
            testResults: Array.from(this.testResults.values())
        };
    }
}

// Execute comprehensive testing
async function main() {
    const tester = new ComprehensiveEndpointTester();
    return await tester.runAllTests();
}

// Run if called directly
if (typeof module !== 'undefined' && require.main === module) {
    main().catch(console.error);
}

module.exports = ComprehensiveEndpointTester;