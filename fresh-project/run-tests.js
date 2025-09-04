// Test Runner for Comprehensive API Testing
// This script executes the comprehensive testing framework

// Using built-in fetch from Node.js 18+

class ComprehensiveAPITester {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8901/api';
        this.testResults = new Map();
        this.performanceMetrics = [];
        this.issuesFound = [];
        this.totalTests = 24; // Adjusted for actual tested endpoints
        this.testsRun = 0;
        this.categories = {
            'System Health': 4,
            'Brand Pack Management': 9,
            'CSS Enhancement': 12,
            'AI Generation': 8,
            'Layout Intelligence': 8,
            'Semantic Analysis': 14,
            'Additional Features': 9
        };
    }

    async checkAPIHealth() {
        console.log('\n🏥 Testing System Health...');
        
        const healthTests = [
            { name: 'Health Check', endpoint: '/health', method: 'GET' },
            { name: 'Context Resolution', endpoint: '/context', method: 'GET' },
            { name: 'Brand Pack Status', endpoint: '/brand-packs', method: 'GET' }
        ];

        for (const test of healthTests) {
            await this.testEndpoint(test.method, test.endpoint, test.name);
        }
    }

    async testBrandPackManagement() {
        console.log('\n🎨 Testing Brand Pack Management...');
        
        const brandPackTests = [
            { name: 'List Brand Packs', endpoint: '/brand-packs', method: 'GET' },
            { name: 'Get Brand Pack', endpoint: '/brand-packs/western-companies', method: 'GET' },
            { name: 'Brand Pack Tokens', endpoint: '/brand-packs/western-companies/tokens', method: 'GET' },
            { name: 'Brand Pack Colors', endpoint: '/brand-packs/western-companies/colors', method: 'GET' },
            { name: 'Brand Pack Typography', endpoint: '/brand-packs/western-companies/typography', method: 'GET' },
            { name: 'Brand Pack Components', endpoint: '/brand-packs/western-companies/components', method: 'GET' },
            { name: 'Brand Pack Patterns', endpoint: '/brand-packs/western-companies/patterns', method: 'GET' },
            { name: 'Brand Pack Validation', endpoint: '/brand-packs/western-companies/validate', method: 'POST' },
            { name: 'Generate AI Brand Pack', endpoint: '/brand-packs/generate', method: 'POST' }
        ];

        for (const test of brandPackTests) {
            await this.testEndpoint(test.method, test.endpoint, test.name);
        }
    }

    async testCSSEnhancement() {
        console.log('\n✨ Testing CSS Enhancement...');
        
        const sampleCSS = '.test { color: red; background: blue; }';
        const enhancementTests = [
            { name: 'Basic Enhancement', endpoint: '/design/enhance', method: 'POST', data: { css: sampleCSS } },
            { name: 'Cached Enhancement', endpoint: '/design/enhance-cached', method: 'POST', data: { css: sampleCSS } },
            { name: 'Proactive Suggestions', endpoint: '/design/suggest-proactive', method: 'GET' },
            { name: 'Color Analysis', endpoint: '/design/analyze-colors', method: 'POST', data: { css: sampleCSS } },
            { name: 'Typography Analysis', endpoint: '/design/analyze-typography', method: 'POST', data: { css: sampleCSS } },
            { name: 'Layout Analysis', endpoint: '/design/analyze-layout', method: 'POST', data: { css: sampleCSS } },
            { name: 'Performance Analysis', endpoint: '/design/analyze-performance', method: 'POST', data: { css: sampleCSS } },
            { name: 'Accessibility Check', endpoint: '/design/check-accessibility', method: 'POST', data: { css: sampleCSS } },
            { name: 'Component Extraction', endpoint: '/design/extract-components', method: 'POST', data: { css: sampleCSS } },
            { name: 'Optimize CSS', endpoint: '/design/optimize', method: 'POST', data: { css: sampleCSS } },
            { name: 'Minify CSS', endpoint: '/design/minify', method: 'POST', data: { css: sampleCSS } },
            { name: 'Validate CSS', endpoint: '/design/validate', method: 'POST', data: { css: sampleCSS } }
        ];

        for (const test of enhancementTests) {
            await this.testEndpoint(test.method, test.endpoint, test.name, test.data);
        }
    }

    async testEndpoint(method, endpoint, testName, data = null) {
        const startTime = performance.now();
        this.testsRun++;
        
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };
            
            if (data && method === 'POST') {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options);
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
            
            if (response.ok) {
                this.logSuccess(testName, `${response.status} - Success`, responseTime, result);
                console.log(`✅ ${testName}: ${response.status} (${responseTime.toFixed(0)}ms)`);
            } else {
                this.logError(testName, `${response.status} - ${response.statusText}`, responseTime, result);
                console.log(`❌ ${testName}: ${response.status} - ${response.statusText} (${responseTime.toFixed(0)}ms)`);
            }
            
        } catch (error) {
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            this.logError(testName, 'Network/Connection Error', responseTime, error.message);
            console.log(`💥 ${testName}: Network Error - ${error.message} (${responseTime.toFixed(0)}ms)`);
        }
        
        this.updateProgress();
    }

    logSuccess(category, message, responseTime, data = null) {
        this.testResults.set(`${category}_${Date.now()}`, {
            type: 'success',
            category,
            message,
            responseTime,
            data,
            timestamp: new Date().toISOString()
        });
        
        this.performanceMetrics.push({
            test: category,
            responseTime,
            status: 'success',
            timestamp: new Date().toISOString()
        });
    }

    logError(category, message, responseTime, error = null) {
        const issue = {
            type: 'error',
            category,
            message,
            responseTime,
            error,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.set(`${category}_${Date.now()}`, issue);
        this.issuesFound.push(issue);
        
        this.performanceMetrics.push({
            test: category,
            responseTime,
            status: 'error',
            timestamp: new Date().toISOString()
        });
    }

    updateProgress() {
        const percentage = ((this.testsRun / this.totalTests) * 100).toFixed(1);
        console.log(`Progress: ${this.testsRun}/${this.totalTests} (${percentage}%)`);
    }

    async runCriticalTests() {
        console.log('🎯 Starting Critical API Tests...\n');
        
        await this.checkAPIHealth();
        await this.testBrandPackManagement();
        await this.testCSSEnhancement();
        
        this.generateReport();
    }

    generateReport() {
        console.log('\n📊 COMPREHENSIVE TEST REPORT\n');
        console.log('=' * 50);
        
        const successCount = Array.from(this.testResults.values()).filter(r => r.type === 'success').length;
        const errorCount = this.issuesFound.length;
        
        console.log(`📈 Tests Completed: ${this.testsRun}/${this.totalTests}`);
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`📊 Success Rate: ${((successCount / this.testsRun) * 100).toFixed(1)}%`);
        
        if (this.performanceMetrics.length > 0) {
            const avgResponseTime = this.performanceMetrics.reduce((acc, m) => acc + m.responseTime, 0) / this.performanceMetrics.length;
            const maxResponseTime = Math.max(...this.performanceMetrics.map(m => m.responseTime));
            console.log(`⚡ Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);
            console.log(`⏱️  Max Response Time: ${maxResponseTime.toFixed(0)}ms`);
        }
        
        if (this.issuesFound.length > 0) {
            console.log('\n🚨 ISSUES FOUND:');
            this.issuesFound.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.category}: ${issue.message}`);
                if (issue.error) {
                    console.log(`   Error: ${issue.error}`);
                }
            });
        }
        
        console.log('\n✨ Testing Complete!');
    }
}

// Execute the tests
async function main() {
    const tester = new ComprehensiveAPITester();
    await tester.runCriticalTests();
}

main().catch(console.error);