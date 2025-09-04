/**
 * About Page Enhancement Testing
 * Tests various Agentic Design System API endpoints
 */

(async () => {
    const agentic = new AgenticClient();
    await agentic.initialize();
    
    console.log('🚀 Testing Agentic Design System Endpoints for About Page');
    console.log('================================================');
    
    // 1. Test CSS Analysis Endpoint
    console.log('\n📊 1. Testing /api/design/analyze');
    try {
        const aboutStyles = document.querySelector('link[href*="about.css"]');
        if (aboutStyles) {
            const cssText = await fetch('css/about.css').then(r => r.text());
            const analysis = await fetch('http://localhost:8901/api/design/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: cssText,
                    filePath: 'css/about.css'
                })
            }).then(r => r.json());
            
            console.log('Analysis Results:', {
                tokenAdherence: analysis.tokenAdherence,
                brandCompliance: analysis.brandCompliance,
                accessibility: analysis.accessibility,
                suggestions: analysis.suggestions?.length || 0
            });
        }
    } catch (error) {
        console.error('Analysis failed:', error);
    }
    
    // 2. Test Component Generation
    console.log('\n🎨 2. Testing /api/design/generate-component');
    try {
        const componentRequest = {
            description: "A testimonial card component with customer photo, quote, and company name",
            componentType: "testimonial-card",
            framework: "vanilla",
            brandPackId: "western-companies"
        };
        
        const component = await fetch('http://localhost:8901/api/design/generate-component', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(componentRequest)
        }).then(r => r.json());
        
        console.log('Component Generated:', {
            hasHTML: !!component.html,
            hasCSS: !!component.css,
            brandCompliance: component.brandCompliance?.score
        });
        
        // Store generated component for later use
        window.generatedTestimonial = component;
        
    } catch (error) {
        console.error('Component generation failed:', error);
    }
    
    // 3. Test Semantic Analysis
    console.log('\n🔍 3. Testing /api/semantic/analyze');
    try {
        const pageHTML = document.documentElement.outerHTML;
        const semanticAnalysis = await fetch('http://localhost:8901/api/semantic/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html: pageHTML
            })
        }).then(r => r.json());
        
        console.log('Semantic Analysis:', {
            components: semanticAnalysis.components?.length || 0,
            landmarks: semanticAnalysis.landmarks,
            score: semanticAnalysis.score,
            headingStructure: semanticAnalysis.headingStructure
        });
    } catch (error) {
        console.error('Semantic analysis failed:', error);
    }
    
    // 4. Test Layout Analysis
    console.log('\n📐 4. Testing /api/layout/analyze');
    try {
        const layoutAnalysis = await fetch('http://localhost:8901/api/layout/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html: document.querySelector('.team-section').outerHTML
            })
        }).then(r => r.json());
        
        console.log('Layout Analysis:', {
            layoutType: layoutAnalysis.layoutType,
            gridType: layoutAnalysis.gridType,
            responsive: layoutAnalysis.responsive,
            recommendations: layoutAnalysis.recommendations?.length || 0
        });
    } catch (error) {
        console.error('Layout analysis failed:', error);
    }
    
    // 5. Test Advanced Enhancement
    console.log('\n⚡ 5. Testing /api/design/enhance-advanced');
    try {
        const sampleCSS = `
            .test-card {
                background: #1B3668;
                padding: 20px;
                font-size: 16px;
                border-radius: 8px;
                transition: all 0.3s;
                animation: fadeIn 1s;
            }
            .test-card:hover {
                background: #2A4F8F;
                transform: scale(1.05);
            }
        `;
        
        const enhanced = await fetch('http://localhost:8901/api/design/enhance-advanced', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: sampleCSS,
                enableTypography: true,
                enableAnimations: true,
                enableGradients: true,
                enableStates: true,
                enableOptimization: true
            })
        }).then(r => r.json());
        
        console.log('Advanced Enhancement:', {
            original: sampleCSS.length + ' chars',
            enhanced: enhanced.css?.length + ' chars',
            changes: enhanced.changes?.length || 0,
            transformations: enhanced.transformations
        });
        
        // Apply enhanced CSS to page
        const style = document.createElement('style');
        style.textContent = enhanced.css || '';
        document.head.appendChild(style);
        
    } catch (error) {
        console.error('Advanced enhancement failed:', error);
    }
    
    // 6. Test Pattern Learning
    console.log('\n🧠 6. Testing Pattern Learning Endpoints');
    try {
        // Track a pattern
        const trackResult = await fetch('http://localhost:8901/api/design/patterns/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: 'western-truck',
                patterns: [{
                    type: 'component',
                    name: 'team-member-card',
                    css: '.team-member { text-align: center; }',
                    confidence: 0.9
                }]
            })
        }).then(r => r.json());
        
        console.log('Pattern Tracking:', trackResult);
        
        // Get learned patterns
        const learned = await fetch('http://localhost:8901/api/design/patterns/learned', {
            method: 'GET'
        }).then(r => r.json());
        
        console.log('Learned Patterns:', {
            total: learned.patterns?.length || 0,
            categories: Object.keys(learned.byCategory || {})
        });
        
    } catch (error) {
        console.error('Pattern learning failed:', error);
    }
    
    // 7. Test Accessibility Report
    console.log('\n♿ 7. Testing /api/semantic/accessibility-report');
    try {
        const accessibilityReport = await fetch('http://localhost:8901/api/semantic/accessibility-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html: document.documentElement.outerHTML,
                level: 'AA'
            })
        }).then(r => r.json());
        
        console.log('Accessibility Report:', {
            wcagCompliance: accessibilityReport.wcagCompliance,
            score: accessibilityReport.score,
            issues: accessibilityReport.issues?.length || 0,
            critical: accessibilityReport.issues?.filter(i => i.severity === 'critical').length || 0
        });
    } catch (error) {
        console.error('Accessibility report failed:', error);
    }
    
    // 8. Test Suggestions
    console.log('\n💡 8. Testing /api/design/suggest-proactive');
    try {
        const suggestions = await fetch('http://localhost:8901/api/design/suggest-proactive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: '.team-member { padding: 20px; color: #333; }',
                context: { componentType: 'card' }
            })
        }).then(r => r.json());
        
        console.log('Proactive Suggestions:', {
            total: suggestions.suggestions?.length || 0,
            categories: suggestions.suggestions?.map(s => s.type) || []
        });
    } catch (error) {
        console.error('Suggestions failed:', error);
    }
    
    // 9. Test Typography Enhancement
    console.log('\n📝 9. Testing /api/design/enhance-typography');
    try {
        const typographyCSS = `
            h1 { font-size: 48px; }
            h2 { font-size: 36px; }
            p { font-size: 16px; line-height: 1.5; }
        `;
        
        const enhanced = await fetch('http://localhost:8901/api/design/enhance-typography', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: typographyCSS })
        }).then(r => r.json());
        
        console.log('Typography Enhancement:', {
            changes: enhanced.changes?.length || 0,
            scaleApplied: enhanced.transformations?.typographyScale
        });
    } catch (error) {
        console.error('Typography enhancement failed:', error);
    }
    
    // 10. Test Batch Enhancement
    console.log('\n📦 10. Testing /api/design/enhance-batch');
    try {
        const batchResult = await fetch('http://localhost:8901/api/design/enhance-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                files: [
                    { path: 'about.css', code: '.header { color: blue; }' },
                    { path: 'team.css', code: '.team { padding: 10px; }' }
                ]
            })
        }).then(r => r.json());
        
        console.log('Batch Enhancement:', {
            filesProcessed: batchResult.results?.length || 0,
            totalChanges: batchResult.results?.reduce((sum, r) => sum + (r.changes?.length || 0), 0) || 0
        });
    } catch (error) {
        console.error('Batch enhancement failed:', error);
    }
    
    // Summary
    console.log('\n================================================');
    console.log('✅ Endpoint Testing Complete!');
    console.log('Check the console for detailed results from each endpoint.');
    console.log('All enhancements have been applied to the page.');
    
    // Create a visual indicator
    const indicator = document.createElement('div');
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1B3668, #2A4F8F);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 9999;
        animation: slideIn 0.5s;
    `;
    indicator.textContent = '✅ Agentic Enhanced';
    document.body.appendChild(indicator);
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
})();