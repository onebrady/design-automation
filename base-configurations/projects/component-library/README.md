# Component Library Project Template

This template sets up a component library project with AI-driven design automation, optimized for creating reusable components with consistent design tokens and patterns.

## Quick Start

1. Copy this template to your new project directory
2. Replace all `{{PLACEHOLDER}}` values with actual values:
   - `{{PROJECT_NAME}}` - Your component library name
   - `{{BRAND_PACK_ID}}` - Your brand pack identifier
   - `{{AUTHOR_NAME}}` - Author/maintainer name
   - `{{ORGANIZATION}}` - Organization name
3. Install dependencies: `npm install`
4. Start development: `npm run dev`

## Template Structure

```
component-library/
├── .agentic/
│   └── config.json              # Agentic configuration optimized for components
├── src/
│   ├── components/              # Source components
│   ├── tokens/                  # Design token exports
│   ├── stories/                 # Storybook stories
│   └── index.js                 # Main export
├── dist/                        # Built components
├── .env.template                # Environment configuration
├── package.json.template        # Package configuration with build tools
├── rollup.config.js.template    # Build configuration
├── brand-pack-template.json     # Component-focused brand pack
└── storybook/                   # Storybook configuration
```

## Key Features

### Component Generation
- AI-powered component scaffolding with design token integration
- Automatic prop definitions based on brand pack patterns
- Storybook stories generated automatically
- TypeScript definitions included

### Design Token Integration
- Automatic token extraction and export
- CSS custom properties generated from brand pack
- SCSS/Sass mixins for component development
- Token usage validation and consistency checking

### Build Optimization
- Tree-shakable ESM and CJS builds
- CSS extraction with design token substitution
- Automatic dependency bundling
- Size budget enforcement

### Development Experience
- Hot module replacement with design token updates
- Visual regression testing integration
- Accessibility validation built-in
- Design system documentation generation

## AI Agent Integration

This template is optimized for AI agents to:
- Generate new components with consistent patterns
- Apply design tokens automatically across components
- Validate design system compliance
- Generate documentation and examples
- Maintain consistency across the component library

## Customization

The template includes extensive configuration options for:
- Component generation patterns
- Design token naming conventions
- Build output formats
- Documentation generation
- Testing approaches

Refer to the individual configuration files for detailed options.