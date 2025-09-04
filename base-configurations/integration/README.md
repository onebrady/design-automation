# Integration Patterns

This guide provides comprehensive integration patterns for connecting the AI-Driven Design Automation System with various build tools, frameworks, and development environments.

## Overview

The system provides multiple integration points:
- **Build tool plugins** (Vite, Webpack, Rollup)
- **Framework integrations** (React, Vue, Svelte)
- **Development server middleware** (Express, Fastify)
- **CI/CD pipeline integration**
- **IDE/Editor extensions**

## Build Tool Integration

### Vite Plugin Integration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import agenticPlugin from '@agentic/vite-plugin';

export default defineConfig({
  plugins: [
    agenticPlugin({
      enabled: true,
      configPath: './.agentic/config.json',
      
      // Enhancement settings
      enhancement: {
        autoEnhance: process.env.NODE_ENV === 'development',
        watch: true,
        batchProcessing: true
      },
      
      // Development features
      dev: {
        hmr: true,
        notifications: true,
        validation: true
      }
    })
  ]
});
```

**Integration Benefits:**
- Hot module replacement for CSS changes
- Real-time design token updates
- Development notifications
- Build-time optimization

### Webpack Plugin Integration

```javascript
// webpack.config.js
const AgenticWebpackPlugin = require('@agentic/webpack-plugin');

module.exports = {
  plugins: [
    new AgenticWebpackPlugin({
      configPath: './.agentic/config.json',
      
      // Webpack-specific options
      optimization: {
        extractCSS: true,
        minifyCSS: process.env.NODE_ENV === 'production',
        generateSourceMaps: process.env.NODE_ENV === 'development'
      },
      
      // Performance settings
      performance: {
        cacheEnabled: true,
        parallelProcessing: true,
        maxConcurrent: 3
      }
    })
  ]
};
```

### Rollup Plugin Integration

```javascript
// rollup.config.js
import agenticPlugin from '@agentic/rollup-plugin';

export default {
  plugins: [
    agenticPlugin({
      configPath: './.agentic/config.json',
      
      // Component library specific
      componentLibrary: {
        extractTokens: true,
        generateTypes: true,
        validateConsistency: true
      },
      
      // Build optimization
      build: {
        treeshaking: true,
        minify: false, // Let consumers decide
        generateReport: true
      }
    })
  ]
};
```

## Framework Integration Patterns

### React Integration

```jsx
// App.jsx
import { AgenticProvider, useDesignTokens } from '@agentic/react';

function App() {
  return (
    <AgenticProvider 
      brandPackId="my-brand-pack"
      configPath="./.agentic/config.json"
    >
      <MyApplication />
    </AgenticProvider>
  );
}

// Component using design tokens
function Button({ variant = 'primary', children }) {
  const tokens = useDesignTokens();
  
  return (
    <button 
      className={`btn btn-${variant}`}
      style={{
        backgroundColor: tokens.colors.primary[500],
        borderRadius: tokens.radii.md,
        padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`
      }}
    >
      {children}
    </button>
  );
}
```

### Vue Integration

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <agentic-provider :config="agenticConfig">
      <my-application />
    </agentic-provider>
  </div>
</template>

<script>
import { AgenticProvider } from '@agentic/vue';

export default {
  components: { AgenticProvider },
  data() {
    return {
      agenticConfig: {
        brandPackId: 'my-brand-pack',
        configPath: './.agentic/config.json'
      }
    };
  }
};
</script>
```

## Development Server Integration

### Express Middleware

```javascript
// server.js
const express = require('express');
const { agenticMiddleware } = require('@agentic/express');

const app = express();

app.use('/api/agentic', agenticMiddleware({
  configPath: './.agentic/config.json',
  apiUrl: process.env.AGENTIC_API_URL || 'http://localhost:8901',
  
  // Middleware options
  enableCaching: true,
  enableCompression: true,
  rateLimit: {
    windowMs: 60000, // 1 minute
    max: 100 // requests per window
  }
}));
```

### Next.js API Routes

```javascript
// pages/api/agentic/[...params].js
import { createAgenticHandler } from '@agentic/nextjs';

const handler = createAgenticHandler({
  configPath: './.agentic/config.json',
  apiUrl: process.env.AGENTIC_API_URL
});

export default handler;
```

## CI/CD Pipeline Integration

### GitHub Actions

```yaml
# .github/workflows/design-automation.yml
name: Design Automation

on:
  pull_request:
    paths:
      - 'src/**/*.css'
      - 'src/**/*.scss'
      - 'components/**/*.css'

jobs:
  design-validation:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Validate Design System
        run: |
          npm run agentic:validate
          npm run agentic:analyze
        env:
          AGENTIC_CI_ENABLED: true
          AGENTIC_CI_FAIL_ON_ERRORS: true
          
      - name: Generate Design Report
        run: npm run agentic:report
        
      - name: Upload Design Report
        uses: actions/upload-artifact@v3
        with:
          name: design-report
          path: reports/design-automation/
```

### GitLab CI

```yaml
# .gitlab-ci.yml
design-validation:
  stage: test
  script:
    - npm ci
    - npm run agentic:validate
    - npm run agentic:analyze
  artifacts:
    reports:
      junit: reports/design-automation/validation-report.xml
    paths:
      - reports/design-automation/
  only:
    changes:
      - "src/**/*.{css,scss,sass,less}"
      - "components/**/*.{css,scss,sass,less}"
```

## IDE/Editor Extensions

### VS Code Extension Configuration

```json
// .vscode/settings.json
{
  "agentic.enabled": true,
  "agentic.configPath": "./.agentic/config.json",
  "agentic.autoEnhance": "safe",
  "agentic.showNotifications": true,
  "agentic.validateOnSave": true,
  "agentic.previewOnHover": true
}
```

### Neovim Plugin Configuration

```lua
-- init.lua
require('agentic').setup({
  config_path = './.agentic/config.json',
  auto_enhance = 'safe',
  show_notifications = true,
  validate_on_save = true,
  keymaps = {
    enhance_file = '<leader>ae',
    validate_file = '<leader>av',
    show_suggestions = '<leader>as'
  }
})
```

## Testing Integration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/test/agentic-setup.js'],
  transform: {
    '^.+\\.css$': '@agentic/jest-transform-css'
  },
  moduleNameMapping: {
    '\\.(css|scss|sass|less)$': '@agentic/jest-css-modules-mock'
  }
};

// src/test/agentic-setup.js
import { configureAgentic } from '@agentic/testing';

configureAgentic({
  brandPackId: 'test-brand-pack',
  mockApiCalls: true,
  validateTokens: true
});
```

### Cypress Integration

```javascript
// cypress/support/commands.js
import '@agentic/cypress-commands';

Cypress.Commands.add('validateDesignTokens', (selector) => {
  cy.get(selector).then(($el) => {
    cy.agenticValidateTokens($el[0]);
  });
});

// cypress/integration/design-system.spec.js
describe('Design System Integration', () => {
  it('should use correct design tokens', () => {
    cy.visit('/');
    cy.validateDesignTokens('.btn-primary');
    cy.agenticCheckContrast('.text-content');
  });
});
```

## Monitoring and Analytics

### Performance Monitoring

```javascript
// monitoring.js
import { AgenticMonitor } from '@agentic/monitoring';

const monitor = new AgenticMonitor({
  apiUrl: process.env.AGENTIC_API_URL,
  projectId: process.env.AGENTIC_PROJECT_ID,
  
  // Metrics to track
  metrics: [
    'enhancement-performance',
    'token-adoption-rate',
    'consistency-score',
    'accessibility-compliance'
  ],
  
  // Reporting configuration
  reporting: {
    interval: '1h',
    destination: 'datadog', // or 'newrelic', 'custom'
    alerts: {
      performanceDegradation: true,
      consistencyViolations: true
    }
  }
});

monitor.start();
```

### Error Tracking

```javascript
// error-tracking.js
import * as Sentry from '@sentry/browser';
import { AgenticIntegration } from '@agentic/sentry';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new AgenticIntegration({
      captureEnhancementErrors: true,
      captureValidationErrors: true,
      capturePerformanceData: true,
      
      // Filter sensitive data
      beforeSend: (event) => {
        // Remove brand pack data from error reports
        if (event.contexts?.agentic?.brandPack) {
          delete event.contexts.agentic.brandPack;
        }
        return event;
      }
    })
  ]
});
```

## Best Practices

### 1. Environment Configuration
- Use environment variables for API URLs and keys
- Separate development and production configurations
- Implement graceful fallbacks for missing configurations

### 2. Performance Optimization
- Enable caching in production environments
- Use batch processing for multiple files
- Implement proper rate limiting

### 3. Error Handling
- Always provide fallback mechanisms
- Log errors appropriately without exposing sensitive data
- Implement retry strategies with exponential backoff

### 4. Security Considerations
- Validate all API inputs and outputs
- Use secure communication channels
- Implement proper authentication and authorization

### 5. Testing Strategy
- Mock API calls in unit tests
- Test integration points thoroughly
- Validate design token consistency
- Monitor performance impacts

This integration guide ensures that AI agents can properly configure and use the design automation system across various development environments and toolchains.