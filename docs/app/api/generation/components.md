# AI-Powered Component Generation & Development

Advanced component creation using Claude 4 Sonnet AI with brand compliance, multi-framework support, and secure sandbox development environment.

## Generate Component

**Endpoint**: `POST /api/design/generate-component`  
**Status**: ✅ Working (13-17s avg - Claude 4 Sonnet AI processing)  
**Response Time**: 13-17s (AI-intensive processing)  
**Purpose**: Generate UI components from natural language descriptions using Claude AI

### Request Format

```json
{
  "description": "A modern button with primary styling and hover effects",
  "componentType": "button",
  "style": "modern",
  "framework": "html",
  "projectPath": "/path/to/project"
}
```

### Request Fields

- **`description`** (required) - Natural language description of the component
- **`componentType`** (optional) - Component category: button, card, form, navigation, layout, etc.
- **`style`** (optional) - Visual style: modern, minimal, playful, professional
- **`framework`** (optional) - Target framework: html, react, vue, svelte
- **`projectPath`** (optional) - Project context path for brand token integration

### Response Structure

```json
{
  "success": true,
  "component": {
    "html": "<button class=\"btn btn-primary\" type=\"button\">Click me</button>",
    "css": ".btn { padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-md); border: none; cursor: pointer; font-family: var(--font-body); font-size: var(--font-size-sm); transition: all var(--duration-fast) var(--easing-ease-out); } .btn-primary { background: var(--color-primary); color: var(--color-primary-contrast); } .btn-primary:hover { background: var(--color-primary-dark); transform: translateY(-1px); } .btn-primary:active { background: var(--color-primary); transform: translateY(0); }",
    "jsx": "<Button className=\"btn btn-primary\" type=\"button\">Click me</Button>",
    "vue": "<button class=\"btn btn-primary\" type=\"button\">Click me</button>",
    "svelte": "<button class=\"btn btn-primary\" type=\"button\">Click me</button>",
    "metadata": {
      "componentName": "PrimaryButton",
      "props": ["children", "variant", "size", "disabled"],
      "category": "form-controls",
      "complexity": "simple"
    },
    "accessibility": {
      "score": "AA",
      "issues": [],
      "enhancements": [
        "Proper button semantics maintained",
        "Keyboard navigation supported",
        "Focus states included",
        "High contrast colors used"
      ],
      "ariaAttributes": ["type=\"button\""],
      "wcagGuidelines": ["1.3.1", "1.4.3", "2.1.1", "2.4.7"]
    }
  },
  "brandCompliance": {
    "score": 0.95,
    "tokensUsed": [
      "var(--color-primary)",
      "var(--color-primary-contrast)",
      "var(--color-primary-dark)",
      "var(--spacing-sm)",
      "var(--spacing-md)",
      "var(--radius-md)",
      "var(--font-body)",
      "var(--font-size-sm)",
      "var(--duration-fast)",
      "var(--easing-ease-out)"
    ],
    "brandAlignment": {
      "colors": "excellent",
      "typography": "good",
      "spacing": "excellent",
      "elevation": "good"
    },
    "suggestions": []
  },
  "alternatives": [
    {
      "style": "minimal",
      "preview": "<button class=\"btn btn-minimal\">Click me</button>",
      "description": "Clean minimal styling with subtle effects"
    },
    {
      "style": "playful",
      "preview": "<button class=\"btn btn-playful\">Click me</button>",
      "description": "Fun styling with rounded corners and animations"
    }
  ],
  "aiMetadata": {
    "model": "claude-sonnet-4-20250514",
    "promptTokens": 892,
    "completionTokens": 1247,
    "processingTime": 14017,
    "confidence": 0.92
  }
}
```

### Usage Examples

#### Basic Button Generation

```bash
curl -X POST http://localhost:3001/api/design/generate-component \
  -H "Content-Type: application/json" \
  -d '{
    "description": "A modern primary button with hover effects",
    "componentType": "button",
    "style": "modern",
    "framework": "html"
  }'
```

#### Complex Card Component

```bash
curl -X POST http://localhost:3001/api/design/generate-component \
  -H "Content-Type: application/json" \
  -d '{
    "description": "A card component with image, title, description and action button",
    "componentType": "card",
    "style": "modern",
    "framework": "react"
  }'
```

### Key Features

- **Claude 4 Sonnet Integration**: Latest Anthropic AI for sophisticated component generation
- **Multi-Framework Support**: HTML, React, Vue, Svelte output formats
- **Brand Compliance**: Automatic design token integration with compliance scoring
- **Accessibility**: AA-compliant output with ARIA attributes and WCAG guidelines
- **Style Alternatives**: Multiple variations provided automatically
- **Rich Metadata**: Component names, props, categories, and complexity ratings

---

# Component Sandbox System

Secure sandbox creation for component development and testing.

## Create Sandbox

**Endpoint**: `POST /api/design/create-sandbox`  
**Status**: ✅ **Fully Working**  
**Response Time**: ~500ms-1s  
**Purpose**: Create secure development environment for component testing

### Request Format

```json
{
  "html": "<div class=\"app\"><h1>Sandbox App</h1><button class=\"btn\">Test Button</button></div>",
  "css": ".app { padding: 20px; } .btn { background: var(--color-primary); }",
  "javascript": "console.log('Sandbox initialized');",
  "framework": "html", // html, react, vue, svelte
  "projectPath": "/path/to/project",
  "options": {
    "liveReload": true,
    "autoSave": true,
    "previewMode": "responsive"
  }
}
```

### Response Structure

```json
{
  "success": true,
  "sandbox": {
    "id": "sandbox_1757130945922_0twk54gb8",
    "url": "http://localhost:3000/sandbox/sandbox_1757130945922_0twk54gb8",
    "editUrl": "http://localhost:3000/sandbox/sandbox_1757130945922_0twk54gb8/edit",
    "previewUrl": "http://localhost:3000/sandbox/sandbox_1757130945922_0twk54gb8/preview",
    "status": "active",
    "createdAt": 1757130945956,
    "expiresAt": "2025-09-06T15:55:45.956Z"
  },
  "capabilities": {
    "liveReload": true,
    "hotModuleReplacement": true,
    "responsivePreview": true,
    "codeEditing": true
  }
}
```

### Features

- **Live Reload**: Automatic refresh on code changes
- **Hot Module Replacement**: Framework-specific HMR support
- **Responsive Preview**: Multi-device viewport testing
- **Code Editing**: Integrated code editor capabilities
- **Secure Isolation**: Sandboxed execution environment
- **Multiple Framework Support**: HTML, React, Vue, Svelte
- **Auto-Expiration**: Automatic cleanup after 12 hours

### Usage Example

```bash
curl -X POST http://localhost:3001/api/design/create-sandbox \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<div class=\"demo\"><h2>My Component</h2></div>",
    "css": ".demo { padding: 20px; background: #f5f5f5; }",
    "javascript": "console.log(\"Component loaded\");",
    "framework": "html",
    "options": {
      "liveReload": true,
      "previewMode": "responsive"
    }
  }'
```

## Development Integration

### Sandbox Workflow

```
Create Sandbox → Live Development → Preview Testing → Code Export
```

### Performance Characteristics

- **Creation Time**: 500ms-1s for initial setup
- **Live Reload**: Near-instant code change reflection
- **Resource Usage**: Lightweight container per sandbox
- **Concurrent Limit**: Multiple sandboxes supported
- **Auto-Cleanup**: 12-hour expiration with automatic removal

## Technical Implementation

### Sandbox Environment

- **Isolation**: Secure containerized execution
- **Port Management**: Dynamic port allocation for each sandbox
- **File System**: Temporary file storage with automatic cleanup
- **Security**: Sandboxed execution prevents system access
- **Monitoring**: Health checks and resource monitoring

### Framework Support

- **HTML/CSS/JS**: Direct browser execution
- **React**: JSX compilation with live reload
- **Vue**: SFC compilation with hot reload
- **Svelte**: Component compilation with HMR

---

**Last Verified**: 2025-09-06  
**Implementation Status**: Fully functional with comprehensive testing
