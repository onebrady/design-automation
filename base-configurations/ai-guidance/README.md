# Comprehensive AI Agent Guidance

This document provides comprehensive guidance for AI agents working with the AI-Driven Design Automation System. It serves as the definitive reference for understanding how, when, where, and why to use the system effectively.

## System Overview

The AI-Driven Design Automation System is a comprehensive platform that automates design consistency, enhances CSS with design tokens, and maintains brand compliance across projects. It consists of:

- **59 API Endpoints** across 8 functional areas
- **Brand Pack System** for design token management
- **Real-time Enhancement Engine** for CSS transformation
- **Component Generation** capabilities
- **Pattern Learning** and suggestion system

## Core Principles for AI Agents

### 1. Context-First Approach
Always establish project context before making changes:
```javascript
// Step 1: Get project context
const context = await api.get('/api/context');

// Step 2: Validate brand pack availability  
const brandPack = await api.get(`/api/brand-packs/${context.brandPackId}`);

// Step 3: Proceed with context-aware operations
const enhanced = await api.post('/api/design/enhance', {
  css: content,
  brandPackId: context.brandPackId,
  projectType: context.type
});
```

### 2. Safety-First Enhancement
Always prioritize safety and user approval:
```javascript
// Check if changes are safe to auto-apply
if (suggestions.safety.score > 0.8 && suggestions.changes.length <= 5) {
  // Safe to auto-apply
  await api.post('/api/design/enhance-cached', payload);
} else {
  // Require user approval
  const approval = await requestUserApproval(suggestions);
  if (approval) {
    await api.post('/api/design/enhance', payload);
  }
}
```

### 3. Progressive Enhancement
Build features incrementally:
```javascript
// Start with basic enhancement
let enhanced = await api.post('/api/design/enhance', {
  css: content,
  level: 'basic'
});

// Add advanced features if needed
if (projectRequirements.advancedFeatures) {
  enhanced = await api.post('/api/design/enhance', {
    css: enhanced.css,
    level: 'advanced'
  });
}
```

## Decision Making Framework

### Project Type Detection
```javascript
function detectProjectType(projectStructure) {
  const indicators = {
    'web-application': [
      'src/pages', 'src/components', 'authentication', 
      'dashboard', 'forms', 'user management'
    ],
    'component-library': [
      'src/components', 'stories', 'dist', 'package.json',
      'storybook', 'rollup.config', 'library build'
    ],
    'marketing-site': [
      'landing pages', 'hero sections', 'conversion',
      'SEO', 'marketing', 'static generation'
    ],
    'dashboard': [
      'charts', 'data visualization', 'analytics',
      'admin interface', 'reporting', 'metrics'
    ]
  };
  
  let maxScore = 0;
  let detectedType = 'web-application';
  
  for (const [type, keywords] of Object.entries(indicators)) {
    const score = keywords.filter(keyword => 
      projectStructure.includes(keyword)
    ).length;
    
    if (score > maxScore) {
      maxScore = score;
      detectedType = type;
    }
  }
  
  return detectedType;
}
```

### Brand Pack Selection
```javascript
async function selectBrandPack(projectContext) {
  // 1. Check for explicit brand pack ID
  if (projectContext.brandPackId) {
    try {
      return await api.get(`/api/brand-packs/${projectContext.brandPackId}`);
    } catch (error) {
      console.warn('Specified brand pack not found, falling back...');
    }
  }
  
  // 2. Try auto-resolution
  try {
    const context = await api.get('/api/context');
    if (context.brandPack) {
      return context.brandPack;
    }
  } catch (error) {
    console.warn('Auto-resolution failed, creating new brand pack...');
  }
  
  // 3. Create new brand pack
  const newBrandPack = await createBrandPackFromProjectAnalysis(projectContext);
  return newBrandPack;
}
```

### Enhancement Strategy Selection
```javascript
function selectEnhancementStrategy(fileContext) {
  const strategy = {
    endpoint: null,
    config: {},
    requiresApproval: false
  };
  
  // Large files or many changes - use batch processing
  if (fileContext.size > 50000 || fileContext.fileCount > 5) {
    strategy.endpoint = '/api/design/enhance-batch';
    strategy.config.batchProcessing = true;
    strategy.config.maxConcurrent = 3;
  }
  
  // Development environment - enable auto-apply
  else if (process.env.NODE_ENV === 'development') {
    strategy.endpoint = '/api/design/enhance-cached';
    strategy.config.autoApply = 'safe';
    strategy.config.enableCache = true;
  }
  
  // Production or critical files - manual approval
  else if (process.env.NODE_ENV === 'production' || fileContext.critical) {
    strategy.endpoint = '/api/design/suggest-proactive';
    strategy.requiresApproval = true;
  }
  
  // Default enhancement
  else {
    strategy.endpoint = '/api/design/enhance';
    strategy.config.validation = true;
  }
  
  return strategy;
}
```

## API Usage Patterns

### Pattern 1: Health Check and Validation
```javascript
async function ensureSystemHealth() {
  // Check system health
  const health = await api.get('/api/health');
  if (health.status !== 'healthy') {
    throw new Error(`System unhealthy: ${health.message}`);
  }
  
  // Validate configuration
  const config = await api.post('/api/validate-config', {
    configPath: './.agentic/config.json'
  });
  
  if (!config.valid) {
    throw new Error(`Invalid configuration: ${config.errors.join(', ')}`);
  }
  
  return { health, config };
}
```

### Pattern 2: Batch File Processing
```javascript
async function processManyFiles(files, options = {}) {
  const batches = chunk(files, options.batchSize || 10);
  const results = [];
  
  for (const batch of batches) {
    const batchResults = await Promise.allSettled(
      batch.map(file => api.post('/api/design/enhance-cached', {
        css: file.content,
        filePath: file.path,
        brandPackId: options.brandPackId
      }))
    );
    
    // Handle batch results
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push({
          file: batch[index],
          enhanced: result.value,
          success: true
        });
      } else {
        results.push({
          file: batch[index],
          error: result.reason,
          success: false
        });
        console.error(`Failed to process ${batch[index].path}:`, result.reason);
      }
    });
    
    // Rate limiting - small delay between batches
    if (batches.indexOf(batch) < batches.length - 1) {
      await sleep(100);
    }
  }
  
  return results;
}
```

### Pattern 3: Component Generation with Validation
```javascript
async function generateValidatedComponent(componentSpec) {
  // Generate component
  const generated = await api.post('/api/components/generate', {
    name: componentSpec.name,
    type: componentSpec.type,
    brandPackId: componentSpec.brandPackId,
    framework: componentSpec.framework || 'react'
  });
  
  // Enhance generated styles
  const enhanced = await api.post('/api/design/enhance', {
    css: generated.styles,
    brandPackId: componentSpec.brandPackId,
    componentContext: true
  });
  
  // Validate component
  const validation = await api.post('/api/components/validate', {
    component: {
      ...generated,
      styles: enhanced.css
    },
    brandPackId: componentSpec.brandPackId
  });
  
  if (!validation.valid) {
    throw new Error(`Component validation failed: ${validation.errors.join(', ')}`);
  }
  
  return {
    ...generated,
    styles: enhanced.css,
    validation
  };
}
```

### Pattern 4: Real-time Collaboration Setup
```javascript
async function setupRealtimeCollaboration(projectId) {
  // Establish WebSocket connection
  const socket = await api.websocket('/api/realtime/connect', {
    projectId,
    features: ['live-preview', 'collaborative-editing', 'design-sync']
  });
  
  // Handle real-time events
  socket.on('design-change', (change) => {
    // Apply design changes in real-time
    applyDesignChange(change);
  });
  
  socket.on('brand-pack-update', (update) => {
    // Refresh design tokens
    refreshDesignTokens(update.brandPack);
  });
  
  socket.on('team-suggestion', (suggestion) => {
    // Show team member suggestions
    displayTeamSuggestion(suggestion);
  });
  
  return socket;
}
```

## Error Handling and Recovery

### Graceful Degradation
```javascript
async function enhanceWithFallback(css, options) {
  try {
    // Try primary enhancement
    return await api.post('/api/design/enhance-cached', {
      css,
      ...options
    });
  } catch (error) {
    console.warn('Cached enhancement failed, trying basic enhancement:', error);
    
    try {
      // Fallback to basic enhancement
      return await api.post('/api/design/enhance', {
        css,
        level: 'basic',
        ...options
      });
    } catch (fallbackError) {
      console.error('All enhancement methods failed:', fallbackError);
      
      // Final fallback - return original with warning
      return {
        css,
        enhanced: false,
        warning: 'Enhancement unavailable, using original CSS',
        error: fallbackError.message
      };
    }
  }
}
```

### Retry with Exponential Backoff
```javascript
async function apiCallWithRetry(endpoint, payload, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await api.post(endpoint, payload);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.warn(`API call failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}
```

## Performance Optimization

### Caching Strategy
```javascript
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour

async function getCachedBrandPack(brandPackId) {
  const cacheKey = `brandpack-${brandPackId}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const brandPack = await api.get(`/api/brand-packs/${brandPackId}`);
  
  cache.set(cacheKey, {
    data: brandPack,
    timestamp: Date.now()
  });
  
  return brandPack;
}
```

### Smart Request Batching
```javascript
class RequestBatcher {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 10;
    this.batchDelay = options.batchDelay || 100;
    this.pendingRequests = [];
    this.batchTimer = null;
  }
  
  async enqueue(request) {
    return new Promise((resolve, reject) => {
      this.pendingRequests.push({ request, resolve, reject });
      this.scheduleBatch();
    });
  }
  
  scheduleBatch() {
    if (this.batchTimer) return;
    
    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, this.batchDelay);
  }
  
  async processBatch() {
    const batch = this.pendingRequests.splice(0, this.batchSize);
    this.batchTimer = null;
    
    if (batch.length === 0) return;
    
    try {
      const results = await api.post('/api/design/enhance-batch', {
        requests: batch.map(item => item.request)
      });
      
      results.forEach((result, index) => {
        batch[index].resolve(result);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
    
    // Schedule next batch if there are more requests
    if (this.pendingRequests.length > 0) {
      this.scheduleBatch();
    }
  }
}
```

## Quality Assurance

### Pre-deployment Validation
```javascript
async function validateBeforeDeployment(projectPath) {
  const validationResults = {
    brandPackValid: false,
    cssValid: false,
    accessibilityCompliant: false,
    performanceOptimal: false,
    errors: []
  };
  
  try {
    // Validate brand pack
    const brandPackValidation = await api.post('/api/brand-packs/validate', {
      brandPackId: await getBrandPackId(projectPath)
    });
    validationResults.brandPackValid = brandPackValidation.valid;
    if (!brandPackValidation.valid) {
      validationResults.errors.push(...brandPackValidation.errors);
    }
    
    // Validate CSS
    const cssValidation = await api.post('/api/design/validate', {
      projectPath,
      strict: true
    });
    validationResults.cssValid = cssValidation.valid;
    if (!cssValidation.valid) {
      validationResults.errors.push(...cssValidation.errors);
    }
    
    // Check accessibility
    const a11yValidation = await api.post('/api/semantic/validate-accessibility', {
      projectPath,
      wcagLevel: 'AA'
    });
    validationResults.accessibilityCompliant = a11yValidation.compliant;
    if (!a11yValidation.compliant) {
      validationResults.errors.push(...a11yValidation.violations);
    }
    
    // Performance check
    const perfValidation = await api.post('/api/performance/validate', {
      projectPath,
      budgets: {
        css: '50kb',
        js: '250kb'
      }
    });
    validationResults.performanceOptimal = perfValidation.withinBudget;
    if (!perfValidation.withinBudget) {
      validationResults.errors.push(...perfValidation.budgetExceeded);
    }
    
  } catch (error) {
    validationResults.errors.push(`Validation failed: ${error.message}`);
  }
  
  return validationResults;
}
```

## Monitoring and Analytics

### Usage Tracking
```javascript
async function trackUsage(action, metadata = {}) {
  try {
    await api.post('/api/analytics/track', {
      action,
      metadata: {
        ...metadata,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        projectId: await getProjectId()
      }
    });
  } catch (error) {
    // Don't fail the main operation if tracking fails
    console.warn('Failed to track usage:', error);
  }
}

// Usage examples
await trackUsage('enhancement-applied', { 
  fileType: 'css', 
  changeCount: 5,
  autoApplied: true 
});

await trackUsage('brand-pack-created', { 
  type: 'web-application',
  tokensCount: 120 
});
```

## Best Practices Summary

### 1. Always Check System Health First
- Verify API availability before operations
- Validate configuration integrity
- Handle service degradation gracefully

### 2. Context-Aware Operations
- Establish project context before enhancement
- Use appropriate brand pack for project type
- Consider team collaboration settings

### 3. Safety and User Control
- Require approval for significant changes
- Provide clear change previews
- Enable easy rollback mechanisms

### 4. Performance Consciousness
- Use caching appropriately
- Batch operations when possible
- Monitor performance impact

### 5. Error Resilience
- Implement graceful fallbacks
- Use retry strategies with backoff
- Preserve user work during failures

### 6. Quality Assurance
- Validate before applying changes
- Test accessibility compliance
- Monitor performance budgets

This comprehensive guide ensures AI agents can effectively and safely use the AI-Driven Design Automation System while maintaining high quality standards and user trust.