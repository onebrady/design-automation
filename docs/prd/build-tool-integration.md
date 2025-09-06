# Build Tool Integration Guide

This guide covers how to integrate Agentic Design System with your build tools for automatic CSS, JSX, and CSS-in-JS transformation at build time.

## Overview

The Agentic Design System provides build tool plugins for:

- **Vite** - Universal plugin for Vite-based projects
- **Next.js** - Specialized plugin with webpack integration
- **Webpack** - Standalone loader for webpack projects
- **CSS-in-JS** - Support for styled-components and emotion

## Installation

All build tool plugins are included in the main Agentic Design package:

```bash
npm install agentic-design-platform
```

## Vite Plugin

### Setup

Add the Vite plugin to your `vite.config.js`:

```javascript
import { agenticDesignPlugin } from 'agentic-design-platform/packages/vite-plugin';

export default {
  plugins: [
    agenticDesignPlugin({
      // Optional configuration
      projectRoot: process.cwd(),
      development: process.env.NODE_ENV === 'development',
    }),
  ],
};
```

### Supported File Types

The Vite plugin automatically transforms:

- **`.css` files** - CSS enhancement with design tokens
- **`.jsx/.tsx` files** - JSX className transformation
- **`.js/.ts` files** - CSS-in-JS transformation (when patterns detected)

### Example Transformations

**CSS Files:**

```css
/* Input */
.button {
  background-color: #1b3668;
  padding: 16px 24px;
}

/* Output */
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-md) var(--spacing-lg);
}
```

**JSX Files:**

```jsx
// Input
<button className="bg-blue-500 text-white p-4">Click me</button>

// Output
<button className="agentic-primary text-white agentic-padding-md">Click me</button>
```

**CSS-in-JS Files:**

```javascript
// Input
const Button = styled.button`
  background-color: #1b3668;
  padding: 16px 24px;
`;

// Output
const Button = styled.button`
  background-color: var(--color-primary);
  padding: var(--spacing-md) var(--spacing-lg);
`;
```

## Next.js Plugin

### Setup

Use the `withAgenticDesign` higher-order function in your `next.config.js`:

```javascript
const { withAgenticDesign } = require('agentic-design-platform/packages/nextjs-plugin');

module.exports = withAgenticDesign({
  // Your existing Next.js config
  experimental: {
    appDir: true,
  },
  // Agentic Design will add webpack configuration automatically
});
```

### Advanced Usage

For more control, you can use the standalone enhancement function:

```javascript
// pages/api/enhance.js
import { enhanceWithNextjs } from 'agentic-design-platform/packages/nextjs-plugin';

export default async function handler(req, res) {
  const { code, filePath } = req.body;

  const result = await enhanceWithNextjs({
    code,
    filePath,
    projectRoot: process.cwd(),
  });

  res.json(result);
}
```

### Features

- **Zero Configuration** - Works out of the box
- **Server-Side Safe** - Skips transformation on server builds to avoid hydration issues
- **Development Logging** - Shows transformation details in development mode
- **Error Resilience** - Falls back gracefully if enhancement fails

## Webpack Loader

### Setup

Add the loader to your `webpack.config.js`:

```javascript
const { createAgenticRule } = require('agentic-design-platform/packages/webpack-loader');

module.exports = {
  module: {
    rules: [
      // Add Agentic Design loader
      createAgenticRule({
        development: process.env.NODE_ENV === 'development',
        maxChanges: 10,
        projectRoot: __dirname,
      }),

      // Your other rules...
    ],
  },
};
```

### Manual Configuration

For more control, configure the loader manually:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(css|jsx?|tsx?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('agentic-design-platform/packages/webpack-loader'),
            options: {
              development: process.env.NODE_ENV === 'development',
              projectRoot: __dirname,
              maxChanges: 10,
            },
          },
        ],
      },
    ],
  },
};
```

### Loader Options

- `development` - Enable development logging and error details
- `projectRoot` - Project root directory for token resolution
- `maxChanges` - Maximum number of transformations per file (default: 10)

## CSS-in-JS Support

All build tools support CSS-in-JS libraries:

### Supported Libraries

- **styled-components** - Full support for template literals
- **emotion** - Support for `css` tagged templates and JSX css props
- **Template literals** - Generic CSS template literal detection

### Pattern Detection

The build tools automatically detect CSS-in-JS patterns:

```javascript
// Detected patterns
styled.button`...`           // styled-components
css`...`                    // emotion css
css({ ... })               // emotion object styles
import styled from 'styled-components'
import { css } from '@emotion/css'
```

### Example: styled-components

```javascript
// Input
import styled from 'styled-components';

const Button = styled.button`
  background-color: #1b3668;
  color: #f8fafc;
  padding: 16px 24px;
  border-radius: 8px;
`;

// Output
import styled from 'styled-components';

const Button = styled.button`
  background-color: var(--color-primary);
  color: var(--color-surface);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
`;
```

### Example: emotion

```javascript
// Input
import { css } from '@emotion/css';

const buttonStyle = css`
  color: #1b3668;
  background: #f8fafc;
  margin: 8px;
`;

// Output
import { css } from '@emotion/css';

const buttonStyle = css`
  color: var(--color-primary);
  background: var(--color-surface);
  margin: var(--spacing-sm);
`;
```

## Token Resolution

All build tools use the same token resolution strategy:

### 1. Lock File (Highest Priority)

`.agentic/brand-pack.lock.json`

### 2. Package.json Configuration

```json
{
  "agentic": {
    "tokens": {
      "colors": {
        "roles": {
          "primary": "#1B3668"
        }
      }
    }
  }
}
```

### 3. Discovery System Fallback

Automatic brand pack detection and MongoDB lookup

## Development Features

### Logging

In development mode, all plugins provide detailed logging:

```bash
[Agentic Design] Enhanced Component.jsx (jsx, 2 changes)
[Agentic Design] Enhanced styles.css (css, 5 changes)
[Agentic Design] Enhanced StyledButton.js (css-in-js, 3 changes)
```

### Error Handling

Build tools are designed to fail gracefully:

- Parse errors don't break the build
- Enhancement failures return original source
- Missing tokens are handled gracefully
- Node_modules and build directories are automatically excluded

### Performance

- **File Type Detection** - Only processes relevant files
- **Pattern Matching** - Efficient CSS-in-JS detection
- **Caching** - Results are cached when possible
- **Minimal Overhead** - Fast transformation with minimal bundle impact

## Testing Your Integration

Run the build tool integration tests:

```bash
# Test all build tools
node test-build-tools.js

# Test individual tools
npm run plugin:tests    # Vite plugin tests
```

## Troubleshooting

### Common Issues

**1. Transformations not applying**

- Check that your project has tokens configured
- Verify file extensions are supported (.css, .jsx, .tsx, .js, .ts)
- Ensure files aren't in node_modules or build directories

**2. CSS-in-JS not detected**

- Verify you're importing the CSS-in-JS library
- Check that you're using supported patterns (css\`, styled.button\`)
- Enable development logging to see detection results

**3. Build errors**

- Build tools are designed to be resilient - check console for warnings
- Verify webpack/vite/next.js configuration is correct
- Test with a minimal reproduction case

### Debug Mode

Enable detailed logging by setting development mode:

```javascript
// Vite
agenticDesignPlugin({ development: true });

// Next.js - automatic in development
// Webpack
createAgenticRule({ development: true });
```

## Advanced Configuration

### Custom Token Sources

Extend token resolution for advanced use cases:

```javascript
// Custom token loader
const { loadTokens } = require('agentic-design-platform/packages/webpack-loader');

const customTokens = {
  ...loadTokens(process.cwd()),
  // Add custom tokens
  custom: {
    colors: {
      brand: '#FF0000',
    },
  },
};
```

### Integration with CSS Processors

Build tools work with CSS preprocessors:

```javascript
// Vite with Sass
export default {
  plugins: [agenticDesignPlugin()],
  css: {
    preprocessorOptions: {
      scss: {
        // Agentic tokens are available as CSS variables
        additionalData: `@import "agentic-tokens.scss";`,
      },
    },
  },
};
```

## Best Practices

1. **Use Lock Files** - Commit `.agentic/brand-pack.lock.json` for consistent builds
2. **Development Logging** - Enable in development, disable in production
3. **Error Boundaries** - Build tools won't break your build, but monitor for warnings
4. **Testing** - Test transformations in your CI/CD pipeline
5. **Performance** - Use caching and limit `maxChanges` for large codebases

## Migration Guide

### From Manual SDK Usage

If you're currently using the SDK manually, build tools provide automatic transformation:

```javascript
// Before: Manual SDK usage
import { enhance } from 'agentic-design-platform/sdk';
const enhanced = await enhance(cssCode);

// After: Build-time transformation (automatic)
// Just write normal CSS/JSX - transformation happens at build time
```

### From Other Design Systems

Build tools work alongside other design systems:

```css
/* Works with Tailwind, Bootstrap, etc. */
.button {
  @apply bg-blue-500; /* Tailwind */
  background-color: #1b3668; /* Will be transformed to var(--color-primary) */
}
```

This completes the build tool integration guide. All three major build tools (Vite, Next.js, Webpack) now support automatic CSS, JSX, and CSS-in-JS transformation with the Agentic Design System.
