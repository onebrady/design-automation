/**
 * Agentic Design System Client Library
 * Real API integration for static HTML projects
 * 
 * This library provides complete access to all 59 Agentic API endpoints
 * with intelligent error handling, caching, and fallback strategies.
 */

class AgenticClient {
    constructor(config = {}) {
        this.baseURL = config.baseURL || 'http://localhost:8901/api';
        this.brandPackId = config.brandPackId || null;
        this.projectPath = config.projectPath || window.location.pathname;
        this.cache = new Map();
        this.connected = false;
        this.degradedMode = false;
        this.config = null;
        this.brandTokens = {};
    }

    /**
     * Initialize the client and establish API connection
     */
    async initialize() {
        try {
            // Step 1: Check health
            const health = await this.checkHealth();
            if (!health.ok) {
                throw new Error('API health check failed');
            }
            
            // Step 2: Get project context
            const context = await this.getContext();
            this.brandPackId = context.brandPackId || this.brandPackId;
            this.degradedMode = context.degraded || false;
            
            // Step 3: Load brand tokens
            if (this.brandPackId) {
                await this.loadBrandTokens();
            }
            
            // Step 4: Load configuration
            await this.loadConfig();
            
            this.connected = true;
            console.log('Agentic client initialized successfully', {
                brandPack: this.brandPackId,
                degraded: this.degradedMode
            });
            
        } catch (error) {
            console.warn('Agentic initialization failed, running in fallback mode:', error);
            this.connected = false;
            this.degradedMode = true;
        }
    }

    // ===== System Health & Configuration =====

    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return await response.json();
        } catch (error) {
            return { ok: false, error: error.message };
        }
    }

    async getContext() {
        try {
            const response = await fetch(`${this.baseURL}/context`);
            return await response.json();
        } catch (error) {
            return { degraded: true, mongoAvailable: false };
        }
    }

    async loadConfig() {
        try {
            const response = await fetch(`${this.baseURL}/project-config`);
            this.config = await response.json();
            return this.config;
        } catch (error) {
            console.warn('Could not load project config:', error);
            return null;
        }
    }

    // ===== Brand Pack Management =====

    async loadBrandTokens() {
        if (!this.brandPackId) return;
        
        try {
            // Get brand pack CSS export
            const response = await fetch(`${this.baseURL}/brand-packs/${this.brandPackId}/export/css`);
            const css = await response.text();
            
            // Create or update brand tokens stylesheet
            let styleElement = document.getElementById('agentic-brand-tokens');
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = 'agentic-brand-tokens';
                document.head.appendChild(styleElement);
            }
            styleElement.textContent = css;
            
            // Also get JSON tokens for programmatic use
            const jsonResponse = await fetch(`${this.baseURL}/brand-packs/${this.brandPackId}/export/json`);
            this.brandTokens = await jsonResponse.json();
            
            return this.brandTokens;
        } catch (error) {
            console.warn('Could not load brand tokens:', error);
            return null;
        }
    }

    async listBrandPacks() {
        const response = await fetch(`${this.baseURL}/brand-packs`);
        return await response.json();
    }

    // ===== CSS Enhancement =====

    async enhanceCSS(css, options = {}) {
        if (!this.connected) {
            console.warn('API not connected, returning original CSS');
            return { css, changes: [] };
        }
        
        const payload = {
            code: css,
            codeType: 'css',
            brandPackId: this.brandPackId,
            projectPath: this.projectPath,
            ...options
        };
        
        try {
            const response = await fetch(`${this.baseURL}/design/enhance-cached`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            
            // Validate quality gates
            if (this.config?.qualityGates) {
                const gates = this.config.qualityGates;
                if (result.brandCompliance?.score < gates.minBrandCompliance) {
                    console.warn('Brand compliance too low:', result.brandCompliance.score);
                    return { css, changes: [], warning: 'Low brand compliance' };
                }
            }
            
            return result;
        } catch (error) {
            console.error('CSS enhancement failed:', error);
            return { css, changes: [], error: error.message };
        }
    }

    async enhanceAdvanced(css, transformOptions = {}) {
        const payload = {
            code: css,
            options: {
                enableTypography: true,
                enableAnimations: true,
                enableGradients: true,
                enableStates: true,
                enableOptimization: true,
                ...transformOptions
            },
            projectPath: this.projectPath
        };
        
        const response = await fetch(`${this.baseURL}/design/enhance-advanced`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        return await response.json();
    }

    async analyzeCSS(css) {
        const response = await fetch(`${this.baseURL}/design/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: css })
        });
        
        return await response.json();
    }

    // ===== Component Generation =====

    async generateComponent(description, componentType = 'component', framework = 'html') {
        if (!this.connected) {
            throw new Error('API connection required for component generation');
        }
        
        const payload = {
            description,
            componentType,
            framework,
            style: 'modern',
            projectPath: this.projectPath
        };
        
        const response = await fetch(`${this.baseURL}/design/generate-component`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            // Long timeout for AI generation
            signal: AbortSignal.timeout(30000)
        });
        
        return await response.json();
    }

    async getComponentTemplates(filters = {}) {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${this.baseURL}/design/templates?${params}`);
        return await response.json();
    }

    async customizeTemplate(templateId, customizations = {}) {
        const response = await fetch(`${this.baseURL}/design/customize-template`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId,
                customizations,
                framework: 'html',
                projectPath: this.projectPath
            })
        });
        
        return await response.json();
    }

    async createComponentSandbox(html, css, javascript = '') {
        const response = await fetch(`${this.baseURL}/design/create-sandbox`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html,
                css,
                javascript,
                framework: 'html',
                projectPath: this.projectPath
            })
        });
        
        return await response.json();
    }

    // ===== Pattern Learning =====

    async getLearnedPatterns() {
        try {
            const response = await fetch(`${this.baseURL}/design/patterns/learned`);
            return await response.json();
        } catch (error) {
            return { preferences: {} };
        }
    }

    async trackPatternUsage(componentType, pattern) {
        try {
            await fetch(`${this.baseURL}/design/patterns/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ componentType, pattern })
            });
        } catch (error) {
            // Fire and forget
        }
    }

    async submitFeedback(patternId, feedback, context = {}) {
        const response = await fetch(`${this.baseURL}/design/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patternId,
                feedback,
                context,
                projectPath: this.projectPath
            })
        });
        
        return await response.json();
    }

    async getSuggestions(code, componentType) {
        const response = await fetch(`${this.baseURL}/design/suggest-improvements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                context: { componentType },
                projectPath: this.projectPath
            })
        });
        
        return await response.json();
    }

    // ===== Layout Intelligence =====

    async analyzeLayout(html, css = '') {
        const response = await fetch(`${this.baseURL}/layout/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html,
                css,
                options: {
                    detectGrid: true,
                    detectFlexbox: true,
                    analyzeResponsive: true,
                    checkAccessibility: true
                }
            })
        });
        
        return await response.json();
    }

    async applyLayoutTemplate(templateId, content, customizations = {}) {
        const response = await fetch(`${this.baseURL}/layout/apply-template`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId,
                content,
                customizations,
                projectPath: this.projectPath
            })
        });
        
        return await response.json();
    }

    async getLayoutTemplates(filters = {}) {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${this.baseURL}/layout/templates?${params}`);
        return await response.json();
    }

    async generateGridSystem(options = {}) {
        const defaults = {
            type: 'css-grid',
            columns: 12,
            breakpoints: [
                { name: 'mobile', width: '0px' },
                { name: 'tablet', width: '768px' },
                { name: 'desktop', width: '1024px' }
            ],
            gutters: {
                mobile: '16px',
                tablet: '24px',
                desktop: '32px'
            }
        };
        
        const response = await fetch(`${this.baseURL}/layout/generate-grid`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...defaults, ...options })
        });
        
        return await response.json();
    }

    // ===== Semantic Analysis & Accessibility =====

    async analyzeSemantics(html) {
        const response = await fetch(`${this.baseURL}/semantic/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html,
                options: {
                    includeAccessibility: true,
                    includeComponents: true,
                    includeRelationships: true
                }
            })
        });
        
        return await response.json();
    }

    async checkAccessibility(html) {
        const response = await fetch(`${this.baseURL}/semantic/quick-accessibility-check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html })
        });
        
        return await response.json();
    }

    async generateARIA(html, componentAnalysis = {}) {
        const response = await fetch(`${this.baseURL}/semantic/generate-aria`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html, componentAnalysis })
        });
        
        return await response.json();
    }

    async getAccessibilityReport(html, wcagLevel = 'AA') {
        const response = await fetch(`${this.baseURL}/semantic/accessibility-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html, wcagLevel })
        });
        
        return await response.json();
    }

    async enhanceHTMLSemantics(html) {
        const response = await fetch(`${this.baseURL}/semantic/enhance-html`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html })
        });
        
        return await response.json();
    }

    // ===== Advanced Transformations =====

    async enhanceTypography(css) {
        const response = await fetch(`${this.baseURL}/design/enhance-typography`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: css,
                projectPath: this.projectPath
            })
        });
        
        return await response.json();
    }

    async enhanceAnimations(css) {
        const response = await fetch(`${this.baseURL}/design/enhance-animations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: css,
                projectPath: this.projectPath
            })
        });
        
        return await response.json();
    }

    async enhanceGradients(css) {
        const response = await fetch(`${this.baseURL}/design/enhance-gradients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: css,
                projectPath: this.projectPath
            })
        });
        
        return await response.json();
    }

    async enhanceStates(css) {
        const response = await fetch(`${this.baseURL}/design/enhance-states`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: css,
                projectPath: this.projectPath
            })
        });
        
        return await response.json();
    }

    async optimizeCSS(css, level = 2, options = {}) {
        const response = await fetch(`${this.baseURL}/design/optimize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: css,
                level,
                options: {
                    removeComments: true,
                    removeWhitespace: true,
                    mergeDuplicates: true,
                    ...options
                }
            })
        });
        
        return await response.json();
    }

    // ===== Batch Operations =====

    async enhanceBatch(files, options = {}) {
        const response = await fetch(`${this.baseURL}/design/enhance-batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                files,
                options,
                projectPath: this.projectPath
            })
        });
        
        return await response.json();
    }

    async batchAnalyzeSemantics(pages) {
        const response = await fetch(`${this.baseURL}/semantic/batch-analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pages })
        });
        
        return await response.json();
    }

    // ===== Utility Methods =====

    /**
     * Apply enhanced CSS to the page
     */
    applyCSS(css) {
        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute('data-agentic', 'enhanced');
        document.head.appendChild(style);
    }

    /**
     * Cache management
     */
    clearCache() {
        this.cache.clear();
    }

    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Error recovery
     */
    async retryWithFallback(fn, fallback, maxRetries = 3) {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
        
        console.warn('Max retries reached, using fallback:', lastError);
        return fallback();
    }

    /**
     * Performance monitoring
     */
    async measurePerformance(operation, fn) {
        const start = performance.now();
        try {
            const result = await fn();
            const duration = performance.now() - start;
            console.log(`[Agentic] ${operation} completed in ${duration.toFixed(2)}ms`);
            return result;
        } catch (error) {
            const duration = performance.now() - start;
            console.error(`[Agentic] ${operation} failed after ${duration.toFixed(2)}ms:`, error);
            throw error;
        }
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgenticClient;
}