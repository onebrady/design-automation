# Brand Pack Configuration Guide

Brand packs are the core configuration system that defines design tokens, personality, and component patterns for the AI-Driven Design Automation System. This guide provides comprehensive documentation for AI agents on creating, configuring, and managing brand packs.

## Overview

Brand packs serve as the single source of truth for:
- **Design Tokens**: Colors, typography, spacing, animations, etc.
- **Brand Personality**: Numerical scales defining brand characteristics
- **Component Definitions**: Base styling and variants for components
- **Guidelines**: Accessibility, performance, and consistency rules

## Brand Pack Structure

```json
{
  "id": "unique-brand-pack-id",
  "name": "Human Readable Name",
  "description": "Purpose and usage description",
  "version": "1.0.0",
  "type": "web-application|component-library|marketing-site|dashboard",
  "metadata": { /* creation info, tags, etc */ },
  "personality": { /* brand personality scales */ },
  "tokens": { /* design token definitions */ },
  "components": { /* component styling patterns */ },
  "guidelines": { /* accessibility, performance rules */ }
}
```

## Core Configuration Sections

### 1. Metadata
```json
"metadata": {
  "created": "2024-01-15",
  "author": "Design Team",
  "organization": "ACME Corp",
  "tags": ["web-app", "modern", "accessible"],
  "industry": "Technology",
  "version": "1.0.0"
}
```

### 2. Personality Scales (1-10)
```json
"personality": {
  "modern_traditional": 8,     // 1=traditional, 10=cutting-edge
  "playful_serious": 4,        // 1=serious, 10=playful
  "minimal_decorative": 7,     // 1=decorative, 10=minimal
  "trustworthy_innovative": 6, // 1=trustworthy, 10=innovative
  "casual_professional": 5,    // 1=casual, 10=professional
  "energetic_calm": 3          // 1=calm, 10=energetic
}
```

### 3. Design Tokens
Design tokens follow a hierarchical structure: category → subcategory → token → value

#### Colors
```json
"colors": {
  "roles": {
    "primary": {
      "50": "#F0F9FF",    // Lightest shade
      "500": "#0EA5E9",   // Base color
      "900": "#0C4A6E",   // Darkest shade
      "contrast": "#FFFFFF" // Text contrast color
    }
  },
  "semantic": {
    "background": {
      "primary": "var(--color-neutral-50)",
      "secondary": "var(--color-neutral-100)"
    }
  }
}
```

#### Typography
```json
"typography": {
  "families": {
    "sans": "Inter, system-ui, sans-serif",
    "serif": "Georgia, serif",
    "mono": "JetBrains Mono, monospace"
  },
  "scale": {
    "xs": "12px", "sm": "14px", "md": "16px",
    "lg": "18px", "xl": "20px", "2xl": "24px"
  },
  "weights": {
    "light": 300, "normal": 400, "medium": 500,
    "semibold": 600, "bold": 700
  }
}
```

### 4. Component Definitions
```json
"components": {
  "button": {
    "variants": {
      "primary": {
        "backgroundColor": "var(--color-primary-500)",
        "color": "var(--color-primary-contrast)",
        "borderRadius": "var(--radius-md)",
        "padding": "var(--spacing-2) var(--spacing-4)"
      }
    },
    "states": {
      "hover": { "transform": "translateY(-1px)" },
      "disabled": { "opacity": "0.5" }
    }
  }
}
```

## Brand Pack Types

### 1. Web Application
- **Focus**: User interface consistency, accessibility
- **Personality**: Balanced, professional
- **Components**: Forms, navigation, data display
- **Performance**: Medium bundle size tolerance

### 2. Component Library  
- **Focus**: Reusability, consistency, documentation
- **Personality**: Clean, systematic
- **Components**: Base components with variants
- **Performance**: Strict bundle size limits

### 3. Marketing Site
- **Focus**: Conversion, visual impact, performance
- **Personality**: Brand-forward, engaging
- **Components**: Hero sections, CTAs, testimonials
- **Performance**: Aggressive optimization

### 4. Dashboard
- **Focus**: Data visualization, usability
- **Personality**: Clean, functional
- **Components**: Charts, tables, filters
- **Performance**: Optimized for data handling

## AI Agent Guidelines

### When Creating Brand Packs

1. **Analyze Project Requirements**
   - Determine project type (web-app, component-library, etc.)
   - Identify target audience and use cases
   - Consider accessibility and performance requirements

2. **Define Brand Personality**
   - Use personality scales to guide token decisions
   - Higher modern_traditional (7-10) = clean, minimal styles
   - Higher playful_serious (7-10) = vibrant colors, animations
   - Higher minimal_decorative (7-10) = reduced ornamentation

3. **Generate Design Tokens**
   - Start with a primary color that matches brand personality
   - Generate complementary color palettes
   - Create semantic color mappings for consistency
   - Define typography scales appropriate for use case

4. **Component Patterns**
   - Define base component styles using design tokens
   - Create variants for different use cases
   - Include interaction states (hover, focus, disabled)

### When Modifying Existing Brand Packs

1. **Preserve Brand Identity**
   - Maintain existing personality characteristics
   - Keep primary brand colors unless explicitly requested
   - Preserve component hierarchy and naming conventions

2. **Incremental Changes**
   - Make small, targeted modifications
   - Test changes against existing components
   - Document reasons for changes

3. **Version Management**
   - Increment version numbers for significant changes
   - Maintain backward compatibility when possible
   - Document breaking changes

### Best Practices

1. **Token Naming**
   - Use semantic names (primary, secondary) over descriptive (blue, red)
   - Follow consistent naming patterns
   - Use CSS custom property format for references

2. **Color Systems**
   - Ensure AA/AAA contrast ratios for accessibility
   - Provide light/dark variants where needed
   - Include sufficient color stops for flexibility

3. **Responsive Design**
   - Define appropriate breakpoints for project type
   - Create responsive spacing and typography scales
   - Consider mobile-first approaches for web projects

4. **Performance Considerations**
   - Limit the number of design tokens to essential ones
   - Use system fonts when appropriate
   - Optimize for bundle size in component libraries

## Common Patterns

### Enterprise Application
```json
{
  "personality": {
    "modern_traditional": 6,
    "playful_serious": 3,
    "minimal_decorative": 8,
    "trustworthy_innovative": 4,
    "casual_professional": 8,
    "energetic_calm": 3
  }
}
```

### Startup/Tech Product
```json
{
  "personality": {
    "modern_traditional": 9,
    "playful_serious": 7,
    "minimal_decorative": 7,
    "trustworthy_innovative": 8,
    "casual_professional": 4,
    "energetic_calm": 7
  }
}
```

### Financial Services
```json
{
  "personality": {
    "modern_traditional": 4,
    "playful_serious": 2,
    "minimal_decorative": 6,
    "trustworthy_innovative": 2,
    "casual_professional": 9,
    "energetic_calm": 2
  }
}
```

## Validation and Testing

Brand packs should be validated for:
- JSON schema compliance
- Color contrast ratios meet accessibility standards
- Token references resolve correctly
- Component definitions are complete
- Performance impact within guidelines

Use the CLI tools for validation:
```bash
agentic brand-pack validate ./brand-pack.json
agentic brand-pack test-tokens ./brand-pack.json
agentic brand-pack analyze-performance ./brand-pack.json
```