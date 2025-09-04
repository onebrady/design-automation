// Fresh Design System - Clean Test JavaScript
// Simple functionality for optimization pipeline testing

class DesignSystemTester {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8901/api';
        this.init();
    }
    
    init() {
        console.log('🧪 Design System Clean Tester initialized');
        this.checkAPIStatus();
        
        // Set up smooth scrolling for navigation
        this.setupSmoothScrolling();
    }
    
    setupSmoothScrolling() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    async checkAPIStatus() {
        const statusElement = document.getElementById('api-status');
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            const data = await response.json();
            
            if (data.ok) {
                statusElement.className = 'status-indicator status-success';
                statusElement.innerHTML = '<span class="status-dot"></span><span>Online & Ready</span>';
            } else {
                statusElement.className = 'status-indicator status-warning';
                statusElement.innerHTML = '<span class="status-dot"></span><span>Degraded</span>';
            }
        } catch (error) {
            statusElement.className = 'status-indicator status-error';
            statusElement.innerHTML = '<span class="status-dot"></span><span>Offline</span>';
            console.warn('API health check failed:', error.message);
        }
    }
    
    async runOptimizationTest() {
        console.log('🔧 Running CSS optimization test...');
        
        const cssInput = document.getElementById('css-input');
        const outputElement = document.getElementById('optimization-output');
        
        if (!cssInput || !outputElement) {
            console.error('Required elements not found');
            return;
        }
        
        const inputCSS = cssInput.value.trim();
        if (!inputCSS) {
            alert('Please enter some CSS to test');
            return;
        }
        
        // Update UI to show testing state
        outputElement.textContent = 'Testing optimization pipeline...';
        this.updateStatusIndicators('testing');
        
        const startTime = performance.now();
        
        try {
            // Test the enhancement API with optimization enabled
            const response = await fetch(`${this.apiBaseUrl}/design/enhance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    css: inputCSS,
                    transformations: ['branding', 'spacing', 'colors'],
                    brandPackId: 'fresh-modern-2025',
                    options: {
                        enableOptimization: true,
                        preserveComments: false,
                        outputFormat: 'css'
                    }
                })
            });
            
            const endTime = performance.now();
            const processTime = (endTime - startTime).toFixed(2);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Display results
            this.displayResults(inputCSS, result, processTime);
            
            // Run validation tests
            this.validateOptimizationResults(inputCSS, result.code || inputCSS);
            
            console.log(`✅ Optimization test completed in ${processTime}ms`);
            
        } catch (error) {
            console.error('Optimization test error:', error);
            outputElement.textContent = `❌ Test failed: ${error.message}\n\nThis could indicate:\n- API server is not running\n- Network connectivity issues\n- Optimization pipeline errors`;
            this.updateStatusIndicators('failed');
        }
    }
    
    displayResults(originalCSS, result, processTime) {
        const outputElement = document.getElementById('optimization-output');
        
        const optimizedCSS = result.code || originalCSS;
        const hasChanges = result.changes && result.changes.length > 0;
        
        // Calculate size metrics
        const originalSize = new Blob([originalCSS]).size;
        const optimizedSize = new Blob([optimizedCSS]).size;
        const savings = originalSize - optimizedSize;
        const savingsPercent = originalSize > 0 ? (savings / originalSize * 100).toFixed(1) : 0;
        
        // Display formatted results
        let output = `CSS Optimization Results (${processTime}ms):\n`;
        output += `${'='.repeat(50)}\n\n`;
        
        output += `📊 Metrics:\n`;
        output += `- Original size: ${originalSize} bytes\n`;
        output += `- Optimized size: ${optimizedSize} bytes\n`;
        output += `- Size change: ${savings} bytes (${savingsPercent}%)\n`;
        output += `- Process time: ${processTime}ms\n\n`;
        
        if (hasChanges) {
            output += `🔧 Applied changes:\n`;
            result.changes.forEach((change, index) => {
                output += `${index + 1}. ${change.type}: ${change.description || 'No description'}\n`;
            });
            output += `\n`;
        } else {
            output += `ℹ️  No transformations applied (CSS may not match transformation rules)\n\n`;
        }
        
        output += `📝 Optimized CSS:\n`;
        output += `${'-'.repeat(30)}\n`;
        output += optimizedCSS;
        
        outputElement.textContent = output;
    }
    
    validateOptimizationResults(originalCSS, optimizedCSS) {
        console.log('🔍 Running validation tests...');
        
        const tests = [
            { id: 'status-selectors', name: 'Selector Preservation', test: () => this.testSelectorPreservation(originalCSS, optimizedCSS) },
            { id: 'status-pixels', name: 'Pixel Values', test: () => this.testPixelValues(originalCSS, optimizedCSS) },
            { id: 'status-structure', name: 'CSS Structure', test: () => this.testCSSStructure(optimizedCSS) },
            { id: 'status-zero', name: 'Zero Value Optimization', test: () => this.testZeroValues(originalCSS, optimizedCSS) }
        ];
        
        tests.forEach(({ id, name, test }) => {
            const element = document.getElementById(id);
            if (!element) return;
            
            try {
                const passed = test();
                const statusIcon = element.querySelector('.status-icon');
                
                if (statusIcon) {
                    statusIcon.textContent = passed ? '✅' : '❌';
                }
                
                console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? 'PASSED' : 'FAILED'}`);
            } catch (error) {
                const statusIcon = element.querySelector('.status-icon');
                if (statusIcon) {
                    statusIcon.textContent = '❌';
                }
                console.log(`❌ ${name}: ERROR - ${error.message}`);
            }
        });
    }
    
    testSelectorPreservation(original, optimized) {
        const originalSelectors = this.extractSelectors(original);
        const optimizedSelectors = this.extractSelectors(optimized);
        
        // Should preserve at least 90% of selectors
        const preservationRate = optimizedSelectors.length >= originalSelectors.length * 0.9;
        
        console.log(`Selectors: ${originalSelectors.length} → ${optimizedSelectors.length}`);
        return preservationRate;
    }
    
    testPixelValues(original, optimized) {
        // Test critical pixel values are preserved
        const criticalValues = ['80px', '350px', '16px', '20px', '25px'];
        let preserved = 0;
        let total = 0;
        
        criticalValues.forEach(value => {
            if (original.includes(value)) {
                total++;
                if (optimized.includes(value)) {
                    preserved++;
                    console.log(`✅ Critical value ${value} preserved`);
                } else {
                    console.log(`❌ Critical value ${value} lost`);
                }
            }
        });
        
        return total === 0 || preserved === total;
    }
    
    testCSSStructure(css) {
        // Basic CSS structure validation
        const lines = css.split('\n').filter(line => line.trim());
        let braceBalance = 0;
        let hasSelectors = false;
        let hasProperties = false;
        
        lines.forEach(line => {
            const trimmed = line.trim();
            
            if (trimmed.includes('{')) {
                braceBalance++;
                hasSelectors = true;
            }
            if (trimmed.includes('}')) {
                braceBalance--;
            }
            if (trimmed.includes(':') && trimmed.includes(';')) {
                hasProperties = true;
            }
        });
        
        const structureValid = braceBalance === 0 && hasSelectors && hasProperties;
        console.log(`Structure check: balanced=${braceBalance === 0}, selectors=${hasSelectors}, properties=${hasProperties}`);
        
        return structureValid;
    }
    
    testZeroValues(original, optimized) {
        // Test that zero values are optimized (0px → 0)
        const hasZeroUnits = optimized.includes('0px') || optimized.includes('0rem') || optimized.includes('0em');
        const optimizedZeros = !hasZeroUnits && (original.includes('0px') || original.includes('0rem') || original.includes('0em'));
        
        console.log(`Zero value optimization: ${optimizedZeros ? 'applied' : 'not needed or not working'}`);
        return !hasZeroUnits; // Pass if no zero units remain
    }
    
    extractSelectors(css) {
        const selectors = [];
        const lines = css.split('\n');
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.includes('{') && !trimmed.startsWith('@')) {
                const selector = trimmed.split('{')[0].trim();
                if (selector) {
                    selectors.push(selector);
                }
            }
        });
        
        return selectors;
    }
    
    updateStatusIndicators(state) {
        const indicators = document.querySelectorAll('.validation-status .status-icon');
        
        indicators.forEach(icon => {
            switch (state) {
                case 'testing':
                    icon.textContent = '⏳';
                    break;
                case 'failed':
                    icon.textContent = '❌';
                    break;
                default:
                    icon.textContent = '⏳';
            }
        });
    }
    
    clearOptimizationResults() {
        const outputElement = document.getElementById('optimization-output');
        if (outputElement) {
            outputElement.textContent = 'Click "Test Optimization" to see results';
        }
        
        this.updateStatusIndicators('cleared');
        console.log('🧹 Results cleared');
    }
}

// Initialize the tester
const tester = new DesignSystemTester();

// Global functions for HTML onclick handlers
window.runOptimizationTest = () => tester.runOptimizationTest();
window.clearOptimizationResults = () => tester.clearOptimizationResults();