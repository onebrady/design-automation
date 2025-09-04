// Phase 8 Design System - Comprehensive API Test Suite
// Complete testing framework for all 64 API endpoints

class ComprehensiveAPITester {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8901/api';
        this.testResults = new Map();
        this.performanceMetrics = [];
        this.issuesFound = [];
        this.totalTests = 64;
        this.testsRun = 0;
        
        this.init();
    }
    
    init() {
        console.log('🚀 Phase 8 Comprehensive API Tester initialized');
        console.log(`Ready to test ${this.totalTests} endpoints`);
        
        this.checkAPIHealth();
        this.updateProgress();
    }
    
    async checkAPIHealth() {
        const statusElement = document.getElementById('api-status');
        const statusDot = statusElement.querySelector('.status-dot');
        const statusText = statusElement.querySelector('.status-text');
        
        try {
            const startTime = performance.now();
            const response = await fetch(`${this.apiBaseUrl}/health`);
            const endTime = performance.now();
            const data = await response.json();
            
            if (data.ok) {
                statusElement.className = 'status-item status-success';
                statusText.textContent = `API Online (${(endTime - startTime).toFixed(0)}ms)`;
                this.logSuccess('System Health', 'API is operational', endTime - startTime);
            } else {
                statusElement.className = 'status-item status-warning';
                statusText.textContent = 'API Degraded';
                this.logWarning('System Health', 'API reports degraded status', endTime - startTime);
            }
        } catch (error) {
            statusElement.className = 'status-item status-error';
            statusText.textContent = 'API Offline';
            this.logError('System Health', 'API health check failed', 0, error.message);
        }
    }
    
    // =================================
    // INDIVIDUAL ENDPOINT TESTING
    // =================================
    
    async testEndpoint(method, endpoint, testId) {
        const statusElement = document.getElementById(testId);
        if (statusElement) statusElement.textContent = '⏳';
        
        console.log(`Testing ${method} ${endpoint}`);
        const startTime = performance.now();
        
        try {
            const url = `${this.apiBaseUrl}${endpoint}`;
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            // Add body for POST requests if needed
            if (method === 'POST' && this.needsTestData(endpoint)) {
                options.body = JSON.stringify(this.getTestData(endpoint));
            }
            
            const response = await fetch(url, options);
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            let data;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }
            
            if (response.ok) {
                if (statusElement) statusElement.textContent = '✅';
                this.logSuccess(endpoint, `${method} request successful`, responseTime, data);
                this.testsRun++;
            } else {
                if (statusElement) statusElement.textContent = '❌';
                this.logError(endpoint, `${method} request failed (${response.status})`, responseTime, data);
                this.testsRun++;
            }
            
        } catch (error) {
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            if (statusElement) statusElement.textContent = '❌';
            this.logError(endpoint, `${method} request error`, responseTime, error.message);
            this.testsRun++;
        }
        
        this.updateProgress();
    }
    
    // =================================
    // SPECIALIZED TESTS
    // =================================
    
    async testEnhancement(type) {
        const testCSS = `
.comprehensive-test {
    padding: 80px 0px;
    margin: 16px auto;
    width: 350px;
    height: 200px;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
}

.hover-test:hover {
    transform: translateY(-4px);
    box-shadow: 0 25px 35px -8px rgba(0, 0, 0, 0.15);
}`;
        
        const endpoint = `/design/${type.replace('enhance-', 'enhance')}`;
        const statusId = type === 'enhance' ? 'enhance-basic' : `enhance-${type.replace('enhance-', '')}`;
        
        await this.testPostEndpoint(endpoint, {
            css: testCSS,
            transformations: ['branding', 'spacing', 'colors'],
            brandPackId: 'western-companies',
            options: {
                enableOptimization: true,
                preserveComments: false,
                outputFormat: 'css'
            }
        }, statusId);
    }
    
    async testComponentGeneration() {
        await this.testPostEndpoint('/design/generate-component', {
            description: 'A modern button component with rounded corners and hover effects',
            componentType: 'button',
            style: 'modern',
            framework: 'html',
            brandPackId: 'western-companies'
        }, 'generate-component');
    }
    
    async testComponentPreview() {
        await this.testPostEndpoint('/design/preview-component', {
            component: '<button class="btn-primary">Test Button</button>',
            options: { width: 300, height: 200 },
            brandPackId: 'western-companies'
        }, 'preview-component');
    }
    
    async testLayoutAnalysis() {
        const testHTML = '<div class="container"><div class="header">Header</div><div class="content">Content</div></div>';
        const testCSS = '.container { display: grid; grid-template-rows: auto 1fr; gap: 20px; }';
        
        await this.testPostEndpoint('/layout/analyze', {
            html: testHTML,
            css: testCSS
        }, 'layout-analyze');
    }
    
    async testGridGeneration() {
        await this.testPostEndpoint('/layout/generate-grid', {
            type: 'css-grid',
            columns: 12,
            gap: '1rem',
            breakpoints: {
                mobile: '768px',
                tablet: '1024px',
                desktop: '1200px'
            }
        }, 'layout-grid');
    }
    
    async testSemanticAnalysis() {
        const testHTML = '<div><h1>Title</h1><p>Content paragraph</p><button>Action</button></div>';
        
        await this.testPostEndpoint('/semantic/analyze', {
            html: testHTML,
            options: { includeAccessibility: true, detectComponents: true }
        }, 'semantic-analyze');
    }
    
    async testAccessibilityAnalysis() {
        const testHTML = '<form><input type="text"><button>Submit</button></form>';
        
        await this.testPostEndpoint('/semantic/analyze-accessibility', {
            html: testHTML,
            options: { wcagLevel: 'AA', includeRecommendations: true }
        }, 'semantic-a11y');
    }
    
    async testComponentDetection() {
        const testHTML = '<div class="card"><h2>Card Title</h2><p>Card content</p><button>Action</button></div>';
        
        await this.testPostEndpoint('/semantic/detect-components', {
            html: testHTML,
            options: { includeMetadata: true }
        }, 'semantic-components');
    }
    
    async testLogoGeneration() {
        // This would normally require a file upload, so we'll test the endpoint availability
        try {
            const response = await fetch(`${this.apiBaseUrl}/brand-packs/generate-from-logo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            
            const statusElement = document.getElementById('logo-generation');
            if (response.status === 400) {
                // Expected response for missing logo file
                if (statusElement) statusElement.textContent = '✅';
                this.logSuccess('/brand-packs/generate-from-logo', 'Endpoint available (expects multipart/form-data)', 0);
            } else {
                if (statusElement) statusElement.textContent = '❓';
                this.logWarning('/brand-packs/generate-from-logo', `Unexpected status: ${response.status}`, 0);
            }
        } catch (error) {
            const statusElement = document.getElementById('logo-generation');
            if (statusElement) statusElement.textContent = '❌';
            this.logError('/brand-packs/generate-from-logo', 'Endpoint test failed', 0, error.message);
        }
        
        this.testsRun++;
        this.updateProgress();
    }
    
    // =================================
    // HELPER METHODS
    // =================================
    
    async testPostEndpoint(endpoint, data, statusId) {
        const statusElement = document.getElementById(statusId);
        if (statusElement) statusElement.textContent = '⏳';
        
        const startTime = performance.now();
        
        try {
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            const responseData = await response.json();
            
            if (response.ok) {
                if (statusElement) statusElement.textContent = '✅';
                this.logSuccess(endpoint, 'POST request successful', responseTime, responseData);
            } else {
                if (statusElement) statusElement.textContent = '❌';
                this.logError(endpoint, `POST request failed (${response.status})`, responseTime, responseData);
            }
        } catch (error) {
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            if (statusElement) statusElement.textContent = '❌';
            this.logError(endpoint, 'POST request error', responseTime, error.message);
        }
        
        this.testsRun++;
        this.updateProgress();
    }
    
    needsTestData(endpoint) {
        // Endpoints that need POST data
        const postEndpoints = [
            '/design/analyze',
            '/design/enhance',
            '/design/enhance-cached',
            '/design/optimize',
            '/design/suggest-proactive'
        ];
        
        return postEndpoints.some(ep => endpoint.includes(ep));
    }
    
    getTestData(endpoint) {
        if (endpoint.includes('/design/analyze')) {
            return { code: '.test { color: red; }' };
        }
        
        if (endpoint.includes('/design/enhance') || endpoint.includes('/design/optimize')) {
            return {
                css: '.test { padding: 80px; margin: 16px; }',
                transformations: ['branding'],
                brandPackId: 'western-companies',
                options: { enableOptimization: true }
            };
        }
        
        return {};
    }
    
    // =================================
    // CATEGORY TESTING
    // =================================
    
    async testCategory(category) {
        console.log(`🔄 Testing ${category} category...`);
        
        const categoryTestMap = {
            'system': [
                () => this.testEndpoint('GET', '/health', 'system-health'),
                () => this.testEndpoint('GET', '/context', 'system-context'),
                () => this.testEndpoint('GET', '/lock', 'system-lock'),
                () => this.testEndpoint('GET', '/project-config', 'system-config')
            ],
            'brand-packs': [
                () => this.testEndpoint('GET', '/brand-packs', 'brand-list'),
                () => this.testEndpoint('GET', '/brand-packs/western-companies', 'brand-get'),
                () => this.testEndpoint('GET', '/brand-packs/western-companies/export/css', 'brand-export-css'),
                () => this.testEndpoint('GET', '/brand-packs/western-companies/export/json', 'brand-export-json'),
                () => this.testEndpoint('GET', '/brand-packs/western-companies/versions', 'brand-versions')
            ],
            'design-enhance': [
                () => this.testEnhancement('enhance'),
                () => this.testEnhancement('enhance-cached'),
                () => this.testEnhancement('enhance-advanced'),
                () => this.testEnhancement('enhance-typography'),
                () => this.testEnhancement('enhance-gradients'),
                () => this.testEnhancement('enhance-animations'),
                () => this.testEnhancement('enhance-states'),
                () => this.testEnhancement('optimize')
            ],
            'ai-generation': [
                () => this.testComponentGeneration(),
                () => this.testEndpoint('GET', '/design/templates', 'design-templates'),
                () => this.testComponentPreview(),
                () => this.testLogoGeneration()
            ],
            'layout': [
                () => this.testLayoutAnalysis(),
                () => this.testGridGeneration(),
                () => this.testEndpoint('GET', '/layout/templates', 'layout-templates')
            ],
            'semantic': [
                () => this.testSemanticAnalysis(),
                () => this.testAccessibilityAnalysis(),
                () => this.testComponentDetection()
            ]
        };
        
        const tests = categoryTestMap[category] || [];
        
        for (const test of tests) {
            await test();
            // Small delay between tests to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`✅ ${category} category testing completed`);
    }
    
    // =================================
    // COMPREHENSIVE TESTING
    // =================================
    
    async runAllTests() {
        console.log('🚀 Starting comprehensive API testing...');
        this.resetResults();
        
        const categories = ['system', 'brand-packs', 'design-enhance', 'ai-generation', 'layout', 'semantic'];
        
        for (const category of categories) {
            await this.testCategory(category);
            
            // Progress update between categories
            this.updateProgress();
            await new Promise(resolve => setTimeout(resolve, 250));
        }
        
        console.log('🎉 Comprehensive testing completed!');
        this.generateSummaryReport();
    }
    
    async runCriticalTests() {
        console.log('⚡ Running critical tests only...');
        this.resetResults();
        
        // Test only the most critical endpoints
        await this.testEndpoint('GET', '/health', 'system-health');
        await this.testEndpoint('GET', '/context', 'system-context');
        await this.testEndpoint('GET', '/brand-packs', 'brand-list');
        await this.testEnhancement('enhance');
        await this.testEnhancement('optimize');
        
        console.log('⚡ Critical tests completed!');
        this.generateSummaryReport();
    }
    
    // =================================
    // LOGGING & RESULTS
    // =================================
    
    logSuccess(endpoint, message, responseTime, data = null) {
        const result = {
            endpoint,
            status: 'success',
            message,
            responseTime: Math.round(responseTime),
            timestamp: new Date().toISOString(),
            data: data ? (typeof data === 'object' ? JSON.stringify(data, null, 2) : data) : null
        };
        
        this.testResults.set(`${endpoint}-${Date.now()}`, result);
        this.performanceMetrics.push({ endpoint, responseTime, status: 'success' });
        
        console.log(`✅ ${endpoint}: ${message} (${Math.round(responseTime)}ms)`);
    }
    
    logError(endpoint, message, responseTime, error = null) {
        const result = {
            endpoint,
            status: 'error',
            message,
            responseTime: Math.round(responseTime),
            timestamp: new Date().toISOString(),
            error: error
        };
        
        this.testResults.set(`${endpoint}-${Date.now()}`, result);
        this.performanceMetrics.push({ endpoint, responseTime, status: 'error' });
        this.issuesFound.push({ endpoint, message, error, severity: 'high' });
        
        console.log(`❌ ${endpoint}: ${message} (${Math.round(responseTime)}ms)`);
    }
    
    logWarning(endpoint, message, responseTime, details = null) {
        const result = {
            endpoint,
            status: 'warning',
            message,
            responseTime: Math.round(responseTime),
            timestamp: new Date().toISOString(),
            details
        };
        
        this.testResults.set(`${endpoint}-${Date.now()}`, result);
        this.performanceMetrics.push({ endpoint, responseTime, status: 'warning' });
        this.issuesFound.push({ endpoint, message, details, severity: 'medium' });
        
        console.log(`⚠️  ${endpoint}: ${message} (${Math.round(responseTime)}ms)`);
    }
    
    // =================================
    // UI UPDATES
    // =================================
    
    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const testsRunElement = document.getElementById('tests-run');
        const progressPercent = (this.testsRun / this.totalTests) * 100;
        
        if (progressFill) {
            progressFill.style.width = `${progressPercent}%`;
        }
        
        if (testsRunElement) {
            testsRunElement.textContent = this.testsRun;
        }
        
        this.updateSummaryStats();
    }
    
    updateSummaryStats() {
        const summaryTested = document.getElementById('summary-tested');
        const summarySuccess = document.getElementById('summary-success');
        const summaryResponse = document.getElementById('summary-response');
        
        const successCount = Array.from(this.testResults.values()).filter(r => r.status === 'success').length;
        const successRate = this.testsRun > 0 ? ((successCount / this.testsRun) * 100).toFixed(1) : 0;
        const avgResponseTime = this.performanceMetrics.length > 0 ? 
            Math.round(this.performanceMetrics.reduce((acc, m) => acc + m.responseTime, 0) / this.performanceMetrics.length) : 0;
        
        if (summaryTested) summaryTested.textContent = `${this.testsRun} / ${this.totalTests}`;
        if (summarySuccess) summarySuccess.textContent = `${successRate}%`;
        if (summaryResponse) summaryResponse.textContent = `${avgResponseTime} ms`;
        
        // Update coverage percentage
        const coverageElement = document.getElementById('coverage-percent');
        if (coverageElement) {
            const coveragePercent = ((this.testsRun / this.totalTests) * 100).toFixed(1);
            coverageElement.textContent = `${coveragePercent}%`;
        }
        
        const testedEndpointsElement = document.getElementById('tested-endpoints');
        if (testedEndpointsElement) {
            testedEndpointsElement.textContent = this.testsRun;
        }
        
        const untestedEndpointsElement = document.getElementById('untested-endpoints');
        if (untestedEndpointsElement) {
            untestedEndpointsElement.textContent = this.totalTests - this.testsRun;
        }
    }
    
    // =================================
    // RESULTS DISPLAY
    // =================================
    
    showResultsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(tabName)) {
                btn.classList.add('active');
            }
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
            
            // Populate content based on tab
            if (tabName === 'details') {
                this.populateDetailedResults();
            } else if (tabName === 'performance') {
                this.populatePerformanceMetrics();
            } else if (tabName === 'issues') {
                this.populateIssuesList();
            }
        }
    }
    
    populateDetailedResults() {
        const container = document.getElementById('detailed-results');
        if (!container) return;
        
        const results = Array.from(this.testResults.values());
        if (results.length === 0) {
            container.innerHTML = '<p>No test results yet. Run some tests to see detailed results.</p>';
            return;
        }
        
        const html = results.map(result => `
            <div class="result-item result-${result.status}">
                <div class="result-header">
                    <span class="result-status">${result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'}</span>
                    <span class="result-endpoint">${result.endpoint}</span>
                    <span class="result-time">${result.responseTime}ms</span>
                </div>
                <div class="result-message">${result.message}</div>
                ${result.error ? `<div class="result-error">Error: ${result.error}</div>` : ''}
                ${result.data && result.data.length < 500 ? `<details class="result-data"><summary>Response Data</summary><pre>${result.data}</pre></details>` : ''}
            </div>
        `).join('');
        
        container.innerHTML = html;
    }
    
    populatePerformanceMetrics() {
        const container = document.getElementById('performance-metrics');
        if (!container) return;
        
        if (this.performanceMetrics.length === 0) {
            container.innerHTML = '<p>No performance data yet. Run tests to see metrics.</p>';
            return;
        }
        
        const avgResponseTime = Math.round(
            this.performanceMetrics.reduce((acc, m) => acc + m.responseTime, 0) / this.performanceMetrics.length
        );
        
        const fastestEndpoint = this.performanceMetrics.reduce((fastest, current) => 
            current.responseTime < fastest.responseTime ? current : fastest
        );
        
        const slowestEndpoint = this.performanceMetrics.reduce((slowest, current) => 
            current.responseTime > slowest.responseTime ? current : slowest
        );
        
        const html = `
            <div class="performance-summary">
                <h4>Performance Summary</h4>
                <div class="perf-stats">
                    <div class="perf-stat">
                        <label>Average Response Time:</label>
                        <span>${avgResponseTime}ms</span>
                    </div>
                    <div class="perf-stat">
                        <label>Fastest Endpoint:</label>
                        <span>${fastestEndpoint.endpoint} (${fastestEndpoint.responseTime}ms)</span>
                    </div>
                    <div class="perf-stat">
                        <label>Slowest Endpoint:</label>
                        <span>${slowestEndpoint.endpoint} (${slowestEndpoint.responseTime}ms)</span>
                    </div>
                </div>
            </div>
            <div class="performance-breakdown">
                <h4>Response Time Breakdown</h4>
                ${this.performanceMetrics.map(metric => `
                    <div class="perf-item">
                        <span class="perf-endpoint">${metric.endpoint}</span>
                        <span class="perf-bar">
                            <span class="perf-fill perf-fill-${metric.status}" style="width: ${(metric.responseTime / slowestEndpoint.responseTime) * 100}%"></span>
                        </span>
                        <span class="perf-time">${metric.responseTime}ms</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    populateIssuesList() {
        const container = document.getElementById('issues-list');
        if (!container) return;
        
        if (this.issuesFound.length === 0) {
            container.innerHTML = '<div class="no-issues">🎉 No issues found! All tested endpoints are working correctly.</div>';
            return;
        }
        
        const html = `
            <div class="issues-summary">
                <h4>Issues Found (${this.issuesFound.length})</h4>
            </div>
            ${this.issuesFound.map(issue => `
                <div class="issue-item issue-${issue.severity}">
                    <div class="issue-header">
                        <span class="issue-severity">${issue.severity === 'high' ? '🔴' : '🟡'}</span>
                        <span class="issue-endpoint">${issue.endpoint}</span>
                        <span class="issue-severity-text">${issue.severity.toUpperCase()}</span>
                    </div>
                    <div class="issue-message">${issue.message}</div>
                    ${issue.error ? `<div class="issue-details">Details: ${issue.error}</div>` : ''}
                </div>
            `).join('')}
        `;
        
        container.innerHTML = html;
    }
    
    // =================================
    // UTILITY METHODS
    // =================================
    
    resetAllTests() {
        this.testResults.clear();
        this.performanceMetrics = [];
        this.issuesFound = [];
        this.testsRun = 0;
        
        // Reset all status indicators
        document.querySelectorAll('.test-status').forEach(status => {
            status.textContent = '⏳';
        });
        
        this.updateProgress();
        console.log('🔄 All tests reset');
    }
    
    resetResults() {
        this.testResults.clear();
        this.performanceMetrics = [];
        this.issuesFound = [];
        this.testsRun = 0;
    }
    
    generateSummaryReport() {
        const successCount = Array.from(this.testResults.values()).filter(r => r.status === 'success').length;
        const errorCount = Array.from(this.testResults.values()).filter(r => r.status === 'error').length;
        const warningCount = Array.from(this.testResults.values()).filter(r => r.status === 'warning').length;
        
        console.log('\n📊 COMPREHENSIVE TEST SUMMARY');
        console.log('='.repeat(50));
        console.log(`Total Tests Run: ${this.testsRun}/${this.totalTests}`);
        console.log(`Success Rate: ${this.testsRun > 0 ? ((successCount / this.testsRun) * 100).toFixed(1) : 0}%`);
        console.log(`✅ Successful: ${successCount}`);
        console.log(`⚠️  Warnings: ${warningCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`Coverage: ${((this.testsRun / this.totalTests) * 100).toFixed(1)}%`);
        
        if (this.performanceMetrics.length > 0) {
            const avgResponseTime = Math.round(
                this.performanceMetrics.reduce((acc, m) => acc + m.responseTime, 0) / this.performanceMetrics.length
            );
            console.log(`Avg Response Time: ${avgResponseTime}ms`);
        }
        
        console.log('='.repeat(50));
    }
    
    generateReport() {
        this.generateSummaryReport();
        
        // Generate detailed report for download
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.totalTests,
                testsRun: this.testsRun,
                successCount: Array.from(this.testResults.values()).filter(r => r.status === 'success').length,
                errorCount: Array.from(this.testResults.values()).filter(r => r.status === 'error').length,
                warningCount: Array.from(this.testResults.values()).filter(r => r.status === 'warning').length,
                coverage: ((this.testsRun / this.totalTests) * 100).toFixed(1)
            },
            results: Array.from(this.testResults.values()),
            performance: this.performanceMetrics,
            issues: this.issuesFound
        };
        
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `phase8-api-test-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('📊 Detailed report exported');
    }
}

// Initialize the comprehensive tester
const comprehensiveTester = new ComprehensiveAPITester();

// Global functions for HTML onclick handlers
window.testEndpoint = (method, endpoint, testId) => comprehensiveTester.testEndpoint(method, endpoint, testId);
window.testCategory = (category) => comprehensiveTester.testCategory(category);
window.testEnhancement = (type) => comprehensiveTester.testEnhancement(type);
window.testComponentGeneration = () => comprehensiveTester.testComponentGeneration();
window.testComponentPreview = () => comprehensiveTester.testComponentPreview();
window.testLayoutAnalysis = () => comprehensiveTester.testLayoutAnalysis();
window.testGridGeneration = () => comprehensiveTester.testGridGeneration();
window.testSemanticAnalysis = () => comprehensiveTester.testSemanticAnalysis();
window.testAccessibilityAnalysis = () => comprehensiveTester.testAccessibilityAnalysis();
window.testComponentDetection = () => comprehensiveTester.testComponentDetection();
window.testLogoGeneration = () => comprehensiveTester.testLogoGeneration();
window.runAllTests = () => comprehensiveTester.runAllTests();
window.runCriticalTests = () => comprehensiveTester.runCriticalTests();
window.generateReport = () => comprehensiveTester.generateReport();
window.resetAllTests = () => comprehensiveTester.resetAllTests();
window.showResultsTab = (tabName) => comprehensiveTester.showResultsTab(tabName);