# Static HTML Starter Template - Agentic Design System

A minimal starter template for creating NEW static HTML projects with automatic design system enhancement.

## What This Is

A **blank canvas** with Agentic Design System pre-connected. When you write HTML/CSS, it's automatically enhanced with brand tokens and design patterns.

## Features

- ✅ **Automatic CSS Enhancement** - Your styles are transformed in real-time
- ✅ **Brand Tokens** - Colors, spacing, typography automatically applied
- ✅ **Component Generation** - Create UI components from descriptions
- ✅ **Zero Configuration** - Works immediately when copied
- ✅ **AI-Friendly** - Designed for AI agents to build upon

## Quick Start

1. **Copy this folder** to your new project location
2. **Start building** - Edit index.html and add your content
3. **Write normal CSS** - It gets enhanced automatically:
   ```css
   /* You write: */
   .button { background: blue; padding: 10px; }
   
   /* Automatically becomes: */
   .button { background: var(--color-primary); padding: var(--spacing-sm); }
   ```

## File Structure

```
static-html/
├── index.html              # Main page with API integration
├── css/
│   ├── main.css           # Your CSS (will be enhanced)
│   └── brand-tokens.css   # Generated brand tokens
├── js/
│   └── agentic-client.js  # API client library
└── examples/
    ├── component-generation.html  # Generate components UI
    └── layout-templates.html      # Apply layout templates
```

## API Integration

The `agentic-client.js` provides a complete client for all API endpoints:

```javascript
// Initialize client
const agentic = new AgenticClient();
await agentic.initialize();

// Enhance CSS
const enhanced = await agentic.enhanceCSS('.btn { color: red; }');

// Generate component
const button = await agentic.generateComponent('Modern primary button', 'button');

// Analyze layout
const analysis = await agentic.analyzeLayout(document.body.innerHTML);

// Check accessibility
const a11y = await agentic.checkAccessibility(htmlContent);
```

## Configuration

The system automatically detects configuration from:
1. `.agentic/config.json` in parent directories
2. Environment variables
3. Default to "western-companies" brand pack

## Live Examples

### Component Generation
Open `examples/component-generation.html` to:
- Generate components from descriptions
- See real-time previews
- Get multiple framework outputs
- Export generated code

### Layout Templates  
Open `examples/layout-templates.html` to:
- Browse available layouts
- Apply templates with content
- Customize layouts
- Export layout code

## Brand Token Integration

Brand tokens are automatically loaded as CSS variables:

```css
:root {
  --color-primary: #1B3668;
  --color-secondary: #2A4F8F;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --font-heading: "Titillium Web";
  --radius-md: 0.5rem;
}
```

Use these tokens in your CSS:
```css
.button {
  background: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
}
```

## Performance

- CSS enhancement: ~5ms (cached)
- Component generation: ~14s (AI-powered)
- Layout analysis: ~37ms
- Template application: ~1ms

## Error Handling

The client handles errors gracefully:
- Falls back to original CSS if enhancement fails
- Shows user-friendly messages
- Continues working in degraded mode

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Tips

1. **Use DevTools** to see API calls
2. **Check console** for detailed logs
3. **Monitor performance** tab for timing
4. **Test offline** to verify fallbacks

## Customization

Modify `agentic-client.js` to:
- Add custom error handling
- Change API endpoints
- Add authentication
- Customize quality gates