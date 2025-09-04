# Common Scenarios Guide

This guide provides AI agents with step-by-step instructions for handling common scenarios when working with the AI-Driven Design Automation System.

## Scenario 1: Setting Up a New Web Application

### Context
User wants to create a new web application with integrated design automation.

### Steps

1. **Analyze Requirements**
   ```javascript
   const requirements = {
     projectType: 'web-application',
     framework: 'React', // or Vue, Angular, etc.
     features: ['authentication', 'dashboard', 'forms'],
     targetAudience: 'business users'
   };
   ```

2. **Initialize Project Structure**
   ```bash
   # Copy web-app template
   cp -r base-configurations/projects/web-app/* ./new-project/
   
   # Replace placeholders
   PROJECT_NAME="MyWebApp"
   BRAND_PACK_ID="mywebapp-brand-pack"
   ```

3. **Create Brand Pack**
   ```javascript
   // POST /api/brand-packs
   const brandPack = {
     id: "mywebapp-brand-pack",
     name: "MyWebApp Brand Pack",
     type: "web-application",
     personality: {
       modern_traditional: 7,
       playful_serious: 5,
       minimal_decorative: 7,
       trustworthy_innovative: 6,
       casual_professional: 6,
       energetic_calm: 5
     },
     tokens: { /* design tokens */ }
   };
   ```

4. **Configure Development Environment**
   ```javascript
   // vite.config.js
   export default defineConfig({
     plugins: [
       agenticPlugin({
         enabled: true,
         configPath: './.agentic/config.json',
         enhancement: {
           autoApply: 'safe',
           watchMode: true
         }
       })
     ]
   });
   ```

5. **Validate Setup**
   ```bash
   # Check system health
   curl http://localhost:8901/api/health
   
   # Validate configuration
   npm run agentic:validate
   ```

### Expected Outcome
- Fully configured web application project
- Brand pack created and validated
- Development environment ready with hot reloading
- Design tokens available for use

---

## Scenario 2: Migrating Legacy CSS to Design System

### Context
User has an existing project with custom CSS that needs to be migrated to use design tokens.

### Steps

1. **Audit Existing CSS**
   ```bash
   # Analyze current CSS structure
   npm run agentic:analyze src/styles/
   ```

2. **Create Migration Brand Pack**
   ```javascript
   // Analyze existing styles to create appropriate brand pack
   const analysis = await api.post('/api/design/analyze-legacy', {
     cssFiles: ['src/styles/main.css', 'src/components/**/*.css']
   });
   
   const brandPack = {
     id: 'migration-brand-pack',
     tokens: {
       colors: extractedColors,
       typography: extractedTypography,
       spacing: extractedSpacing
     }
   };
   ```

3. **Incremental Migration**
   ```javascript
   // Migrate files one by one
   for (const file of cssFiles) {
     const enhanced = await api.post('/api/design/enhance', {
       css: file.content,
       brandPackId: 'migration-brand-pack',
       mode: 'migration',
       preserveCustom: true
     });
     
     // Review changes before applying
     if (enhanced.changes.length > 5) {
       // Require manual review
       await showMigrationDiff(enhanced);
     } else {
       // Auto-apply safe changes
       fs.writeFileSync(file.path, enhanced.css);
     }
   }
   ```

4. **Validation and Cleanup**
   ```bash
   # Validate migrated CSS
   npm run agentic:validate
   
   # Check for unused tokens
   npm run agentic:audit --unused-tokens
   ```

### Expected Outcome
- Legacy CSS converted to use design tokens
- Consistent styling across the application
- Maintained visual appearance with improved maintainability

---

## Scenario 3: Creating a Component Library

### Context
Team needs to create a reusable component library with consistent design patterns.

### Steps

1. **Setup Component Library Project**
   ```bash
   # Use component library template
   cp -r base-configurations/projects/component-library/* ./my-components/
   ```

2. **Define Component Patterns**
   ```javascript
   // Create comprehensive brand pack for components
   const componentBrandPack = {
     id: 'component-library-brand-pack',
     type: 'component-library',
     components: {
       button: {
         variants: ['primary', 'secondary', 'danger'],
         sizes: ['sm', 'md', 'lg'],
         states: ['default', 'hover', 'disabled']
       },
       card: {
         variants: ['default', 'elevated'],
         padding: ['sm', 'md', 'lg']
       }
     }
   };
   ```

3. **Generate Base Components**
   ```javascript
   // Generate component templates
   const components = ['Button', 'Card', 'Input', 'Modal'];
   
   for (const component of components) {
     const generated = await api.post('/api/components/generate', {
       name: component,
       brandPackId: 'component-library-brand-pack',
       framework: 'react',
       includeStories: true,
       includeTests: true
     });
     
     // Save generated files
     fs.writeFileSync(`src/components/${component}.tsx`, generated.component);
     fs.writeFileSync(`src/stories/${component}.stories.tsx`, generated.story);
   }
   ```

4. **Build and Export**
   ```bash
   # Build component library
   npm run build
   
   # Export design tokens
   npm run build:tokens
   
   # Generate documentation
   npm run build-storybook
   ```

### Expected Outcome
- Complete component library with consistent patterns
- Storybook documentation
- Exported design tokens for consumers
- TypeScript definitions included

---

## Scenario 4: Optimizing Marketing Site Performance

### Context
Marketing site needs performance optimization while maintaining visual impact.

### Steps

1. **Performance Audit**
   ```bash
   # Analyze current performance
   npm run agentic:audit --performance
   ```

2. **Optimize Design Tokens**
   ```javascript
   // Minimize token usage
   const optimized = await api.post('/api/design/optimize', {
     brandPackId: 'marketing-brand-pack',
     target: 'performance',
     constraints: {
       maxBundleSize: '50kb',
       criticalCSS: true,
       unusedTokens: 'remove'
     }
   });
   ```

3. **Implement Critical CSS**
   ```javascript
   // Extract critical CSS for above-the-fold content
   const critical = await api.post('/api/design/critical-css', {
     url: 'https://staging.example.com',
     viewport: { width: 1200, height: 800 },
     brandPackId: 'marketing-brand-pack'
   });
   
   // Inject critical CSS inline
   const html = injectCriticalCSS(baseHTML, critical.css);
   ```

4. **Enable Advanced Optimizations**
   ```javascript
   // vite.config.js for marketing site
   export default defineConfig({
     plugins: [
       agenticPlugin({
         build: {
           optimize: true,
           purgeUnused: true,
           minify: true,
           generateReport: true
         },
         performance: {
           budgets: {
             css: '50kb',
             js: '250kb'
           }
         }
       })
     ]
   });
   ```

### Expected Outcome
- Reduced bundle size by 40-60%
- Improved Core Web Vitals scores
- Maintained visual design integrity
- Better SEO performance

---

## Scenario 5: Team Collaboration and Consistency

### Context
Large team needs to maintain design consistency across multiple projects.

### Steps

1. **Establish Shared Brand Pack**
   ```javascript
   // Create master brand pack
   const masterBrandPack = {
     id: 'company-master-brand-pack',
     name: 'Company Design System',
     shared: true,
     permissions: {
       read: ['developer', 'designer'],
       write: ['design-team-lead'],
       admin: ['design-system-team']
     }
   };
   ```

2. **Configure Pattern Learning**
   ```javascript
   // Enable shared pattern learning
   const config = {
     patterns: {
       learning: true,
       sharing: true,
       suggestions: true,
       conflictResolution: 'design-team-review'
     },
     team: {
       sharedPatterns: true,
       reviewRequired: true,
       metricsCollection: true
     }
   };
   ```

3. **Setup CI/CD Validation**
   ```yaml
   # .github/workflows/design-consistency.yml
   design-validation:
     runs-on: ubuntu-latest
     steps:
       - name: Validate Design Consistency
         run: |
           npm run agentic:validate --strict
           npm run agentic:check-patterns --shared
           
       - name: Generate Consistency Report
         run: npm run agentic:report --team-metrics
   ```

4. **Monitor and Report**
   ```javascript
   // Setup monitoring dashboard
   const monitor = new AgenticMonitor({
     metrics: [
       'team-consistency-score',
       'pattern-adoption-rate',
       'token-usage-compliance',
       'cross-project-alignment'
     ],
     alerts: {
       consistencyViolations: true,
       patternDeviations: true
     }
   });
   ```

### Expected Outcome
- Consistent design language across all projects
- Reduced design debt and technical debt
- Improved team productivity
- Better user experience consistency

---

## Scenario 6: Accessibility Compliance

### Context
Project needs to meet WCAG AA compliance requirements.

### Steps

1. **Enable Accessibility Features**
   ```javascript
   // .agentic/config.json
   {
     "features": {
       "semantics": {
         "enabled": true,
         "accessibility": true,
         "wcagLevel": "AA"
       }
     },
     "accessibility": {
       "enabled": true,
       "wcagLevel": "AA", 
       "testing": true,
       "reporting": true,
       "validation": "strict"
     }
   }
   ```

2. **Audit Current State**
   ```bash
   # Run comprehensive accessibility audit
   npm run agentic:audit --accessibility --wcag-aa
   ```

3. **Fix Accessibility Issues**
   ```javascript
   // Auto-fix common accessibility issues
   const fixes = await api.post('/api/semantic/fix-accessibility', {
     files: ['src/**/*.css', 'src/**/*.html'],
     brandPackId: 'accessible-brand-pack',
     wcagLevel: 'AA',
     autoFix: [
       'color-contrast',
       'focus-indicators', 
       'semantic-markup',
       'aria-labels'
     ]
   });
   
   // Apply fixes
   for (const fix of fixes.changes) {
     await applyFix(fix);
   }
   ```

4. **Continuous Monitoring**
   ```javascript
   // Setup accessibility testing in CI
   const accessibilityTest = {
     on: ['push', 'pull_request'],
     jobs: {
       'accessibility-test': {
         runs: 'ubuntu-latest',
         steps: [
           'npm run agentic:validate --accessibility',
           'npm run test:a11y'
         ]
       }
     }
   };
   ```

### Expected Outcome
- Full WCAG AA compliance
- Automated accessibility testing
- Improved user experience for all users
- Reduced legal compliance risk

---

## Error Recovery Scenarios

### Scenario 7: API Service Unavailable

#### Situation
The design automation API is temporarily unavailable.

#### Recovery Steps
1. **Detect Service Unavailability**
   ```javascript
   const healthCheck = await fetch('/api/health').catch(() => null);
   if (!healthCheck || !healthCheck.ok) {
     // Service unavailable
     enableFallbackMode();
   }
   ```

2. **Enable Fallback Mode**
   ```javascript
   const fallbackConfig = {
     enhancementDisabled: true,
     useLocalCache: true,
     skipValidation: true,
     notifyUser: true
   };
   ```

3. **Queue Operations for Later**
   ```javascript
   const operationQueue = [];
   
   function queueOperation(operation) {
     operationQueue.push({
       ...operation,
       timestamp: Date.now()
     });
   }
   
   // Retry when service is back
   setInterval(retryQueuedOperations, 30000);
   ```

### Expected Outcome
- Continuous development despite service outage
- Operations queued and executed when service returns
- User informed of degraded functionality

---

## Performance Optimization Scenarios

### Scenario 8: Large Codebase Processing

#### Situation
Project has 500+ CSS files that need processing.

#### Optimization Steps
1. **Enable Batch Processing**
   ```javascript
   const batchConfig = {
     batchSize: 20,
     maxConcurrent: 3,
     cacheStrategy: 'aggressive',
     prioritizeChanges: true
   };
   ```

2. **Implement Progressive Processing**
   ```javascript
   // Process high-priority files first
   const prioritizedFiles = files.sort((a, b) => {
     return getPriority(b) - getPriority(a);
   });
   
   for (const batch of chunk(prioritizedFiles, 20)) {
     await processBatch(batch);
     // Allow UI updates between batches
     await sleep(100);
   }
   ```

3. **Monitor Progress**
   ```javascript
   const progressTracker = {
     total: files.length,
     processed: 0,
     errors: 0,
     
     updateProgress(result) {
       this.processed++;
       if (result.error) this.errors++;
       
       const progress = (this.processed / this.total) * 100;
       updateUI({ progress, errors: this.errors });
     }
   };
   ```

This comprehensive scenarios guide helps AI agents handle common situations effectively and provides fallback strategies for edge cases.