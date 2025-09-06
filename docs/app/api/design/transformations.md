# Advanced CSS Transformations

Typography, animations, gradients, states, and compositional transformation systems.

## Typography Enhancement

**Endpoint**: `POST /api/design/enhance-typography`  
**Response Time**: ~24ms  
**Purpose**: Modular scale application, typography hierarchy, design token integration with comprehensive typography system generation

### Request Format

```json
{
  "code": "h1 { font-size: 32px; font-family: Arial; }",
  "projectPath": "/path/to/project"
}
```

### Request Fields

- **code**: CSS code to enhance (required)
- **projectPath**: Project path for brand context (required)

### Response Structure

```json
{
  "success": true,
  "css": "/* Enhanced CSS with typography improvements and complete hierarchy */",
  "changes": [
    {
      "type": "typography-scale-suggestion",
      "property": "font-size",
      "before": "font-size: 32px;",
      "after": "font-size: 1.953rem; /* 2xl */",
      "location": "font-size",
      "scale": "2xl",
      "originalSize": "32px",
      "suggestion": true
    },
    {
      "type": "typography-hierarchy",
      "property": "hierarchy",
      "before": "",
      "after": "/* Complete h1-h6 hierarchy with design tokens */",
      "location": "end-of-file",
      "description": "Added typography hierarchy rules"
    }
  ],
  "scale": {
    "xs": "0.750rem",
    "sm": "0.800rem",
    "base": "1.000rem",
    "lg": "1.250rem",
    "xl": "1.563rem",
    "2xl": "1.953rem",
    "3xl": "2.441rem",
    "4xl": "3.000rem"
  },
  "recommendations": [
    {
      "type": "typography-hierarchy",
      "message": "No heading hierarchy detected. Consider adding consistent heading styles.",
      "severity": "medium",
      "suggestion": "Define h1-h6 styles using the modular scale"
    }
  ]
}
```

### Features

- **Scale Transformation**: Converts px to rem with modular scale suggestions and scale mapping
- **Typography Hierarchy**: Automatically adds complete h1-h6 hierarchy with design tokens
- **Font Weight Token Integration**: Converts font-weight values to design tokens
- **Design Token Integration**: Uses CSS custom properties (--font-size-xl, --font-weight-bold)
- **Change Tracking**: Detailed change log with before/after comparisons and location tracking
- **Modular Scale**: Complete scale object with all available typography sizes
- **Smart Recommendations**: Typography improvement suggestions based on content analysis

### Generated Typography System

**Typography Hierarchy**: Complete h1-h6 system with consistent spacing and weights
**Modular Scale**: 9-step scale from xs (0.750rem) to 4xl (3.000rem)
**Design Tokens**: Font sizes, weights, and line heights using CSS custom properties
**Scale Suggestions**: Intelligent px-to-scale mapping with comments

### Usage Example

```bash
curl -X POST http://localhost:3001/api/design/enhance-typography \
  -H "Content-Type: application/json" \
  -d '{
    "code": "h1 { font-size: 32px; font-family: Arial; }",
    "projectPath": "/path/to/project"
  }'
```

### Performance Characteristics

- **Response Time**: 24ms average
- **Scale Generation**: Complete modular scale calculation
- **Hierarchy Generation**: Full h1-h6 system with design tokens
- **Smart Analysis**: Typography pattern recognition and recommendations

## Animation Enhancement

**Endpoint**: `POST /api/design/enhance-animations`  
**Response Time**: ~8ms  
**Purpose**: Comprehensive animation system generation with utilities, keyframes, and micro-interactions

### Request Format

```json
{
  "code": ".button { transition: none; }",
  "projectPath": "/path/to/project"
}
```

### Request Fields

- **code**: CSS code to enhance with animations (required)
- **projectPath**: Project path for brand context (required)

### Response Structure

```json
{
  "success": true,
  "css": "/* Enhanced CSS with complete animation system utilities and keyframes */",
  "changes": [
    {
      "type": "animation-utilities",
      "property": "utilities",
      "before": "",
      "after": "/* Complete animation utility classes */",
      "location": "end-of-file",
      "description": "Added animation utility classes"
    },
    {
      "type": "animation-keyframes",
      "property": "keyframes",
      "before": "",
      "after": "/* Complete keyframe animations */",
      "location": "end-of-file",
      "description": "Added keyframe animations"
    }
  ],
  "tokens": {
    "easing": {
      "ease-out": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      "ease-in": "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
      "ease-in-out": "cubic-bezier(0.645, 0.045, 0.355, 1)",
      "ease-back": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      "ease-elastic": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      "ease-bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    },
    "duration": {
      "instant": "0ms",
      "fast": "150ms",
      "normal": "300ms",
      "slow": "500ms",
      "slower": "750ms",
      "slowest": "1000ms"
    },
    "presets": {
      "fade-in": { "duration": "normal", "easing": "ease-out" },
      "fade-out": { "duration": "normal", "easing": "ease-in" },
      "slide-up": { "duration": "normal", "easing": "ease-out" },
      "slide-down": { "duration": "normal", "easing": "ease-out" },
      "scale-in": { "duration": "normal", "easing": "ease-back" },
      "scale-out": { "duration": "fast", "easing": "ease-in" }
    }
  },
  "recommendations": [
    {
      "type": "interaction-states",
      "message": "Interactive elements found without hover states. Consider adding hover animations.",
      "severity": "low",
      "suggestion": "Add hover state animations for better UX"
    }
  ]
}
```

### Generated Animation System

**Animation Utilities** (11 utility classes):

- `hover-lift`, `hover-scale`, `hover-glow`, `hover-slide` - Interactive hover effects
- `loading-pulse`, `loading-spin`, `loading-bounce`, `loading-skeleton` - Loading animations
- `focus-visible`, `disabled` - Accessibility and state animations

**Keyframe Animations** (8 complete keyframes):

- `pulse`, `spin`, `bounce`, `skeleton-loading` - Loading states
- `fade-in`, `slide-up`, `slide-down`, `scale-in` - Entrance animations

**Animation Token System**:

- **6 Easing Curves**: From linear to elastic and bounce effects
- **6 Duration Scales**: From instant (0ms) to slowest (1000ms)
- **6 Animation Presets**: Common animation patterns with optimal settings

### Features

- **Complete Animation Utilities**: Production-ready animation classes for common interactions
- **Keyframe Generation**: Hardware-accelerated transform animations
- **Advanced Easing**: Professional easing curves including bounce and elastic
- **Duration Scale**: Comprehensive timing system from micro to macro interactions
- **Animation Presets**: Pre-configured animations with optimal duration/easing combinations
- **Smart Recommendations**: Context-aware animation suggestions based on content analysis
- **Accessibility Support**: Focus states and reduced motion considerations

### Usage Example

```bash
curl -X POST http://localhost:3001/api/design/enhance-animations \
  -H "Content-Type: application/json" \
  -d '{
    "code": ".button { transition: none; }",
    "projectPath": "/path/to/project"
  }'
```

### Performance Characteristics

- **Response Time**: 8ms average
- **System Generation**: Complete animation framework with utilities and keyframes
- **Hardware Acceleration**: GPU-optimized transforms for smooth performance
- **Smart Analysis**: Context-aware animation recommendations

## Gradient Enhancement

**Endpoint**: `POST /api/design/enhance-gradients`  
**Response Time**: ~9ms  
**Purpose**: Comprehensive gradient system generation with utilities, presets, and cross-browser support

### Request Format

```json
{
  "code": ".header { background: red; }",
  "projectPath": "/path/to/project"
}
```

### Request Fields

- **code**: CSS code to enhance with gradients (required)
- **projectPath**: Project path for brand context (required)

### Response Structure

```json
{
  "success": true,
  "css": "/* Enhanced CSS with complete gradient system utilities */",
  "changes": [
    {
      "type": "gradient-utilities",
      "property": "utilities",
      "before": "",
      "after": "/* Complete gradient utility system */",
      "location": "end-of-file",
      "description": "Added gradient utility classes"
    }
  ],
  "presets": {
    "primary": {
      "type": "linear",
      "direction": "to-br",
      "colors": ["var(--color-primary-500)", "var(--color-primary-700)"]
    },
    "secondary": {
      "type": "linear",
      "direction": "to-br",
      "colors": ["var(--color-secondary-500)", "var(--color-secondary-700)"]
    },
    "accent": {
      "type": "linear",
      "direction": "to-r",
      "colors": ["var(--color-accent-400)", "var(--color-accent-600)"]
    },
    "warm": {
      "type": "linear",
      "direction": "to-br",
      "colors": ["var(--color-orange-400)", "var(--color-red-600)"]
    },
    "cool": {
      "type": "linear",
      "direction": "to-br",
      "colors": ["var(--color-blue-400)", "var(--color-purple-600)"]
    },
    "neutral": {
      "type": "linear",
      "direction": "to-b",
      "colors": ["var(--color-gray-100)", "var(--color-gray-300)"]
    },
    "glass": {
      "type": "linear",
      "direction": "to-br",
      "colors": ["rgba(255, 255, 255, 0.25)", "rgba(255, 255, 255, 0.05)"]
    },
    "rainbow": {
      "type": "linear",
      "direction": "to-r",
      "colors": [
        "var(--color-red-500)",
        "var(--color-orange-500)",
        "var(--color-yellow-500)",
        "var(--color-green-500)",
        "var(--color-blue-500)",
        "var(--color-purple-500)"
      ]
    },
    "spotlight": {
      "type": "radial",
      "shape": "ellipse at center",
      "colors": ["var(--color-primary-200)", "transparent"]
    },
    "vignette": {
      "type": "radial",
      "shape": "ellipse at center",
      "colors": ["transparent 30%", "rgba(0, 0, 0, 0.3) 70%"]
    }
  },
  "recommendations": []
}
```

### Generated Gradient System

**Background Gradient Utilities** (10 utility classes):

- `bg-gradient-primary`, `bg-gradient-secondary`, `bg-gradient-accent` - Brand gradients
- `bg-gradient-warm`, `bg-gradient-cool`, `bg-gradient-neutral` - Color temperature gradients
- `bg-gradient-glass`, `bg-gradient-rainbow` - Special effect gradients
- `bg-gradient-spotlight`, `bg-gradient-vignette` - Radial effect gradients

**Text Gradient Utilities** (10 utility classes):

- Complete set of `text-gradient-*` classes with WebKit compatibility
- Cross-browser text gradient support with fallbacks
- Transparent color handling for text gradients

**Directional Utilities** (8 directional classes):

- `bg-gradient-to-t`, `bg-gradient-to-tr`, `bg-gradient-to-r`, `bg-gradient-to-br`
- `bg-gradient-to-b`, `bg-gradient-to-bl`, `bg-gradient-to-l`, `bg-gradient-to-tl`
- CSS custom property support with `--gradient-from` and `--gradient-to`

**Gradient Presets System**:

- **10 Professional Presets**: Complete gradient specifications with type, direction, and colors
- **Linear & Radial Support**: Both gradient types with full configuration options
- **Brand Token Integration**: Uses design system color tokens throughout
- **Cross-browser Compatibility**: WebKit prefixes and fallback support

### Features

- **Complete Gradient Utilities**: 30+ production-ready gradient classes
- **Professional Presets**: 10 carefully designed gradient patterns
- **Cross-browser Support**: WebKit prefixes and fallbacks included
- **Brand Integration**: Full design token system compatibility
- **Linear & Radial Gradients**: Complete gradient type coverage
- **Direction Control**: 8-directional gradient utilities
- **Text Gradient Support**: WebKit-compatible text gradients with transparency
- **Performance Optimized**: Hardware-accelerated gradients

### Usage Example

```bash
curl -X POST http://localhost:3001/api/design/enhance-gradients \
  -H "Content-Type: application/json" \
  -d '{
    "code": ".header { background: red; }",
    "projectPath": "/path/to/project"
  }'
```

### Performance Characteristics

- **Response Time**: 9ms average
- **System Generation**: Complete gradient framework with 30+ utilities
- **Cross-browser Optimization**: WebKit and standard CSS support
- **Brand Integration**: Seamless design token compatibility

## State Enhancement

**Endpoint**: `POST /api/design/enhance-states`  
**Response Time**: ~7ms  
**Purpose**: Comprehensive interactive state system generation with accessibility support and design consistency

### Request Format

```json
{
  "code": ".button { color: blue; }",
  "projectPath": "/path/to/project"
}
```

### Request Fields

- **code**: CSS code to enhance with states (required)
- **projectPath**: Project path for brand context (required)

### Response Structure

```json
{
  "success": true,
  "css": "/* Enhanced CSS with complete state variations */",
  "changes": [
    {
      "type": "state-enhancement",
      "property": "color",
      "states": ["hover", "active"],
      "variations": {
        "default": "var(--color-primary)",
        "hover": "var(--color-primary-light)",
        "active": "var(--color-primary-dark)"
      }
    },
    {
      "type": "state-system",
      "property": "states",
      "before": "",
      "after": "/* Complete interactive state system */",
      "location": "end-of-file",
      "description": "Added comprehensive state variations"
    }
  ],
  "states": {
    "button": {
      "default": { "background": "var(--color-primary)", "color": "white" },
      "hover": {
        "background": "var(--color-primary-dark)",
        "transform": "translateY(-1px)",
        "box-shadow": "0 4px 12px rgba(0,0,0,0.15)"
      },
      "active": {
        "background": "var(--color-primary-darker)",
        "transform": "translateY(0)",
        "box-shadow": "0 2px 4px rgba(0,0,0,0.1)"
      },
      "focus": { "outline": "2px solid var(--color-accent)", "outline-offset": "2px" },
      "disabled": {
        "background": "var(--color-gray-400)",
        "cursor": "not-allowed",
        "opacity": "0.6"
      },
      "loading": { "cursor": "wait", "position": "relative", "color": "transparent" }
    },
    "link": {
      "default": { "color": "var(--color-primary)", "text-decoration": "underline" },
      "hover": { "color": "var(--color-primary-dark)", "text-decoration": "none" },
      "active": { "color": "var(--color-primary-darker)" },
      "focus": { "outline": "2px solid var(--color-accent)", "outline-offset": "2px" },
      "visited": { "color": "var(--color-purple-600)" }
    },
    "form": {
      "input": {
        "default": { "border": "1px solid var(--color-gray-300)", "background": "white" },
        "focus": {
          "border-color": "var(--color-primary)",
          "box-shadow": "0 0 0 3px rgba(66, 153, 225, 0.1)",
          "outline": "none"
        },
        "invalid": {
          "border-color": "var(--color-red-500)",
          "box-shadow": "0 0 0 3px rgba(245, 101, 101, 0.1)"
        },
        "valid": {
          "border-color": "var(--color-green-500)",
          "box-shadow": "0 0 0 3px rgba(72, 187, 120, 0.1)"
        },
        "disabled": {
          "background": "var(--color-gray-100)",
          "cursor": "not-allowed",
          "opacity": "0.6"
        }
      }
    },
    "component": {
      "card": {
        "default": { "box-shadow": "0 1px 3px rgba(0,0,0,0.12)", "transform": "translateY(0)" },
        "hover": { "box-shadow": "0 4px 12px rgba(0,0,0,0.15)", "transform": "translateY(-2px)" }
      },
      "interactive": {
        "default": { "cursor": "pointer", "transition": "all 0.2s ease" },
        "hover": { "transform": "scale(1.02)" },
        "active": { "transform": "scale(0.98)" }
      }
    }
  },
  "stateVariations": {
    "hover": { "opacity": 0.8, "transform": "translateY(-1px)" },
    "active": { "opacity": 0.9, "transform": "translateY(0)" },
    "focus": { "outline": "2px solid var(--color-accent)" },
    "disabled": { "opacity": 0.5, "cursor": "not-allowed" },
    "loading": { "cursor": "wait" }
  },
  "accessibility": {
    "focusVisible": true,
    "highContrast": true,
    "reducedMotion": true,
    "screenReader": {
      "ariaStates": ["aria-pressed", "aria-expanded", "aria-selected"],
      "visuallyHidden": ".sr-only { position: absolute; width: 1px; height: 1px; }"
    }
  },
  "recommendations": [
    {
      "type": "accessibility-enhancement",
      "message": "Consider adding focus-visible polyfill for older browsers",
      "severity": "medium",
      "suggestion": "Add :focus-visible support with polyfill"
    },
    {
      "type": "state-consistency",
      "message": "Ensure all interactive elements have consistent hover states",
      "severity": "low",
      "suggestion": "Apply uniform hover patterns across components"
    }
  ]
}
```

### Generated State System

**Button States** (6 complete state variations):

- `default`, `hover`, `active`, `focus`, `disabled`, `loading`
- Complete transform and shadow effects for enhanced UX
- Brand color token integration with light/dark variations
- Loading state with cursor and opacity handling

**Link States** (5 state variations):

- `default`, `hover`, `active`, `focus`, `visited`
- Accessible color variations with proper contrast
- Text decoration management for optimal readability
- Focus indicators with proper offset and styling

**Form States** (5 input state variations):

- `default`, `focus`, `invalid`, `valid`, `disabled`
- Border and shadow variations for clear state indication
- Color-coded validation feedback (red/green)
- Proper disabled state handling with opacity and cursor

**Component States** (2 component types):

- **Card States**: Hover effects with elevation and transform
- **Interactive States**: General purpose hover/active patterns
- Smooth transitions with optimized timing

**Accessibility Features**:

- **Focus-Visible Support**: Modern focus management
- **High Contrast Compatibility**: Proper contrast ratios maintained
- **Reduced Motion Support**: Respects user motion preferences
- **Screen Reader Utilities**: ARIA state attributes and visually hidden classes

### Features

- **Comprehensive State Coverage**: Button, link, form, and component states
- **Accessibility First**: WCAG-compliant focus indicators and ARIA support
- **Brand Integration**: Complete design token compatibility
- **Performance Optimized**: Hardware-accelerated transforms and transitions
- **Cross-browser Support**: Focus-visible polyfill recommendations
- **Consistency Framework**: Unified state behaviors across components
- **Loading States**: Complete loading UX with cursor and opacity management
- **Validation States**: Color-coded form validation with proper feedback

### Usage Example

```bash
curl -X POST http://localhost:3001/api/design/enhance-states \
  -H "Content-Type: application/json" \
  -d '{
    "code": ".link { text-decoration: none; }",
    "projectPath": "/path/to/project"
  }'
```

### Performance Characteristics

- **Response Time**: 7ms average
- **State Generation**: Complete state system with 25+ variations
- **Accessibility Integration**: Full WCAG compliance features
- **Brand Consistency**: Design token integration across all states

## Advanced Composition

**Endpoint**: `POST /api/design/enhance-advanced`  
**Response Time**: ~7ms  
**Purpose**: Multi-system enhancement combining typography, animations, gradients, and states with comprehensive design system generation

### Request Format

```json
{
  "code": "h1 { font-size: 32px; color: red; transition: none; }",
  "options": {
    "enableTypography": true,
    "enableAnimations": true,
    "enableGradients": true,
    "enableStates": true,
    "enableOptimization": true
  },
  "projectPath": "/path/to/project"
}
```

### Request Fields

- **code**: CSS code to enhance (required)
- **options**: Transformation options object (optional)
  - `enableTypography`: Apply typography scale and hierarchy
  - `enableAnimations`: Add animation utilities and transitions
  - `enableGradients`: Generate gradient utility classes
  - `enableStates`: Create interactive state variations
  - `enableOptimization`: Apply CSS optimization
- **projectPath**: Project path for brand context (required)

### Response Structure

```json
{
  "success": true,
  "css": "/* Enhanced CSS with complete design system utilities */",
  "changes": [
    {
      "type": "typography-scale-suggestion",
      "property": "font-size",
      "before": "font-size: 32px;",
      "after": "font-size: 1.953rem; /* 2xl */",
      "location": "font-size",
      "scale": "2xl",
      "originalSize": "32px",
      "suggestion": true
    },
    {
      "type": "typography-hierarchy",
      "property": "hierarchy",
      "before": "",
      "after": "/* Complete h1-h6 hierarchy with design tokens */",
      "location": "end-of-file",
      "description": "Added typography hierarchy rules"
    }
    // Additional change objects for animations, gradients, states, etc.
  ],
  "transformations": [
    { "type": "typography", "applied": 2, "timestamp": "2025-09-06T03:17:18.441Z" },
    { "type": "animations", "applied": 2, "timestamp": "2025-09-06T03:17:18.442Z" },
    { "type": "gradients", "applied": 1, "timestamp": "2025-09-06T03:17:18.442Z" },
    { "type": "states", "applied": 5, "timestamp": "2025-09-06T03:17:18.443Z" }
  ],
  "recommendations": [
    {
      "type": "missing-reduced-motion",
      "message": "No reduced motion preference handling found. This affects accessibility.",
      "severity": "high",
      "suggestion": "Add @media (prefers-reduced-motion: reduce) support"
    }
  ],
  "composition": {
    "transformOrder": [
      "typography",
      "colors",
      "spacing",
      "animations",
      "gradients",
      "states",
      "shadows",
      "optimization"
    ],
    "transformationsApplied": 4,
    "totalChanges": 13,
    "processingTimeMs": 7,
    "cacheKey": "c84a1c10b96a1d9f1d53f7672c2e3892"
  },
  "analytics": {
    "transformsApplied": 4,
    "cacheHits": 0,
    "processingTime": 0,
    "errors": [],
    "cacheSize": 0,
    "cacheHitRate": 0
  }
}
```

### Generated Design System Features

**Typography System**:

- Complete h1-h6 hierarchy with design tokens
- Typography scale suggestions (px to rem conversion)
- Font weight and line height optimization

**Animation Utilities**:

- Hover effects (lift, scale, glow, slide)
- Loading animations (pulse, spin, bounce, skeleton)
- Focus and accessibility states
- Keyframe animations for micro-interactions

**Gradient System**:

- Brand-aligned gradient presets (primary, secondary, accent)
- Color gradient variations (warm, cool, neutral, glass, rainbow)
- Gradient direction utilities
- Text gradient support with webkit compatibility

**Interactive States**:

- Button states (hover, focus, active, disabled, loading)
- Link states with proper accessibility
- Form element states (focus, invalid, valid, disabled)
- Component states (card hover, interactive elements)

**Accessibility Features**:

- Reduced motion preference support
- High contrast media queries
- Screen reader utilities (sr-only)
- Focus-visible polyfill support

### Usage Example

```bash
curl -X POST http://localhost:3001/api/design/enhance-advanced \
  -H "Content-Type: application/json" \
  -d '{
    "code": "h1 { font-size: 32px; color: red; transition: none; }",
    "options": {
      "enableTypography": true,
      "enableAnimations": true,
      "enableGradients": true,
      "enableStates": true,
      "enableOptimization": true
    },
    "projectPath": "/path/to/project"
  }'
```

### Performance Characteristics

- **Response Time**: 7ms average
- **Cache Support**: Smart caching with cache key generation
- **Change Tracking**: Detailed before/after transformation log
- **Optimization**: Automatic CSS optimization and recommendations
- **Design System Generation**: Complete utility class generation

## CSS Optimization

**Endpoint**: `POST /api/design/optimize`  
**Response Time**: ~1ms  
**Purpose**: Comprehensive CSS optimization with 10 optimization types and detailed change tracking

### Request Format

```json
{
  "code": "/* Comment */ .button { color: red; background: blue; padding: 10px 10px 10px 10px; }",
  "level": 2,
  "options": {
    "removeComments": true,
    "removeWhitespace": true,
    "mergeDuplicates": true,
    "enableGzipAnalysis": true
  }
}
```

### Request Fields

- **code**: CSS code to optimize (required)
- **level**: Optimization level 0-2 (optional, defaults to 2)
- **options**: Optimization options object (optional)
  - `removeComments`: Remove CSS comments
  - `removeWhitespace`: Remove unnecessary whitespace
  - `mergeDuplicates`: Merge duplicate CSS rules
  - `enableGzipAnalysis`: Enable gzip compression analysis

### Response Structure

```json
{
  "success": true,
  "css": ".button{color:#f00;background:#00f;padding:10px 10px 10px 10px}",
  "changes": [
    {
      "type": "remove-comments",
      "before": 85,
      "after": 72,
      "savings": 13,
      "description": "Removed CSS comments"
    },
    {
      "type": "remove-whitespace",
      "before": 72,
      "after": 63,
      "savings": 9,
      "description": "Removed unnecessary whitespace"
    },
    {
      "type": "shorten-values",
      "before": 63,
      "after": 64,
      "savings": -1,
      "description": "Shortened CSS values"
    }
  ],
  "stats": {
    "originalSize": 85,
    "optimizedSize": 63,
    "compressionRatio": 0.25882352941176473,
    "optimizationsApplied": [
      "remove-comments",
      "remove-whitespace",
      "shorten-values",
      "remove-trailing-semicolons",
      "optimize-zero-values",
      "merge-duplicate-rules",
      "optimize-selectors",
      "consolidate-media-queries",
      "merge-shorthand-properties",
      "remove-redundant-properties"
    ],
    "timeSpent": 1
  },
  "recommendations": []
}
```

### Optimization System

**10 Complete Optimization Types**:

1. **remove-comments** - Strips CSS comments for size reduction
2. **remove-whitespace** - Removes unnecessary whitespace and formatting
3. **shorten-values** - Converts long color values to shorter formats (#ff0000 → #f00)
4. **remove-trailing-semicolons** - Removes unnecessary trailing semicolons
5. **optimize-zero-values** - Optimizes zero values (0px → 0, 0px 0px 0px 0px → 0)
6. **merge-duplicate-rules** - Merges duplicate CSS rules and selectors
7. **optimize-selectors** - Optimizes CSS selector specificity and structure
8. **consolidate-media-queries** - Consolidates and optimizes media queries
9. **merge-shorthand-properties** - Merges properties into shorthand notation
10. **remove-redundant-properties** - Removes redundant property declarations

### Optimization Levels

- **Level 0**: No optimization (passthrough)
- **Level 1**: Safe optimizations (comments, whitespace, values, semicolons, zero values)
- **Level 2**: Aggressive optimizations (all 10 optimization types applied)

### Performance Metrics

- **Compression Analysis**: Original size, optimized size, compression ratio
- **Savings Tracking**: Byte savings per optimization type with before/after sizes
- **Processing Time**: Optimization execution time in milliseconds
- **Applied Optimizations**: Complete list of optimizations applied

### Features

- **10 Optimization Types**: Complete CSS optimization pipeline
- **Detailed Change Tracking**: Before/after analysis with savings calculations
- **Performance Metrics**: Comprehensive size and time analysis
- **Flexible Optimization Levels**: From safe to aggressive optimization
- **Color Optimization**: Advanced color value shortening (#ffffff → #fff)
- **Zero Value Optimization**: Smart zero value consolidation
- **Selector Optimization**: CSS selector efficiency improvements
- **Media Query Consolidation**: Optimized media query management

### Usage Example

```bash
curl -X POST http://localhost:3001/api/design/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "code": ".btn { margin: 0px; padding: 0px 0px 0px 0px; }",
    "level": 2,
    "options": { "removeWhitespace": true }
  }'
```

### Performance Characteristics

- **Response Time**: <1ms consistently (0-1ms measured)
- **Compression Ratios**: 15-50% size reduction typical
- **Zero Value Optimization**: Up to 16 bytes saved on shorthand properties
- **Color Optimization**: 3-6 bytes saved per color value

## Performance Characteristics

| Transformation | Response Time | Use Case                     |
| -------------- | ------------- | ---------------------------- |
| Typography     | 24ms          | Text styling and hierarchy   |
| Animations     | 8ms           | Micro-interactions           |
| Gradients      | 9ms           | Background enhancements      |
| States         | 7ms           | Interactive elements         |
| Advanced       | 12ms          | Comprehensive transformation |
| Optimization   | 10ms          | Performance improvement      |
| Batch          | 5ms/file      | Multi-file processing        |

## Integration Patterns

### Single Transformation

```bash
curl -X POST http://localhost:3001/api/design/enhance-typography \
  -H "Content-Type: application/json" \
  -d '{"code": "h1 { font-size: 28px; }", "projectPath": "/project"}'
```

## Development Context

These transformation endpoints build on the basic enhancement foundation to provide specialized CSS improvements. Each endpoint focuses on a specific aspect of design system implementation while maintaining consistency with brand tokens and design patterns.
