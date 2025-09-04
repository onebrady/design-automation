# Base Configurations for AI-Driven Design Automation

This directory contains comprehensive base configurations, templates, and guidance for AI agents to effectively set up and use the AI-Driven Design Automation System in any project.

## 🎯 **Purpose**

The AI-Driven Design Automation System is designed to enhance design consistency and productivity for agentic coding. This base configurations system provides AI agents with everything they need to:

1. **Set up new projects** with proper design system integration
2. **Configure brand packs** that define design tokens and personality
3. **Choose the right APIs** from 59 available endpoints across 8 categories
4. **Implement best practices** for different project types and scenarios
5. **Troubleshoot issues** and optimize performance

## 📁 **Directory Structure**

### [`/projects`](./projects/) - Project Setup Templates
Complete project configuration templates for different types of applications:
- **Web Applications** - Modern web apps with component-based architecture
- **Component Libraries** - Design system and reusable component projects
- **Marketing Sites** - Brand-focused content sites with conversion optimization
- **E-commerce Applications** - Product-focused sites with design consistency
- **Dashboard Applications** - Data-heavy apps with intelligent layouts

### [`/brand-packs`](./brand-packs/) - Brand Pack Configuration
Brand identity and token system setup:
- **Creation Guides** - Step-by-step brand pack creation process
- **Token Architecture** - Complete design token system documentation
- **Industry Templates** - Pre-configured setups for different industries
- **Personality Profiles** - Brand personality configuration examples
- **Migration Guides** - Updating and versioning existing brand packs

### [`/workflows`](./workflows/) - AI Agent Workflows
Decision trees and processes for AI agents:
- **Enhancement Workflows** - When and how to enhance designs
- **Component Generation** - From description to implementation
- **Layout Analysis** - Grid vs Flexbox decision making
- **Semantic Enhancement** - Accessibility and SEO optimization
- **Performance Optimization** - Advanced transformation usage

### [`/integrations`](./integrations/) - Integration Patterns
Technical integration documentation:
- **SDK Integration** - Using enhance(), enhanceCached(), autoEnhance()
- **Direct API Usage** - When to bypass the SDK
- **Framework Integration** - React, Vue, Svelte, vanilla JavaScript
- **Build Tool Integration** - Vite, Webpack, Rollup plugins
- **CI/CD Integration** - Automated design validation and enhancement

### [`/scenarios`](./scenarios/) - Common Use Cases
Real-world scenario implementations:
- **New Project Setup** - Zero to design system integration
- **Legacy Migration** - Adding automation to existing projects
- **Team Collaboration** - Multi-developer design consistency
- **Design System Evolution** - Scaling and maintenance strategies
- **Performance Optimization** - Caching and batch operation strategies

### [`/ai-guidance`](./ai-guidance/) - AI-Specific Documentation
Decision matrices and guidance specifically for AI agents:
- **Endpoint Selection Logic** - Flowcharts for choosing the right APIs
- **Context Resolution** - Understanding project structure and requirements
- **Rate Limiting Strategy** - Optimal API usage patterns
- **Error Recovery** - Handling failures and providing fallbacks
- **Success Metrics** - Measuring and validating design automation effectiveness

## 🚀 **Quick Start for AI Agents**

### 1. **Analyze the Project**
```javascript
// Use the context resolution workflow
const context = await analyzeProjectStructure(projectPath);
const projectType = determineProjectType(context);
```

### 2. **Select Configuration Template**
```javascript
// Choose appropriate template based on project type
const template = getProjectTemplate(projectType);
// Options: web-app, component-library, marketing-site, ecommerce, dashboard
```

### 3. **Set Up Brand Pack**
```javascript
// Create or configure brand pack
const brandPack = await setupBrandPack(projectRequirements);
```

### 4. **Configure Integration**
```javascript
// Set up SDK integration
await configureSDKIntegration(projectPath, template, brandPack);
```

### 5. **Validate Setup**
```javascript
// Verify everything is working
const validation = await validateConfiguration(projectPath);
```

## 🔧 **System Capabilities**

The AI-Driven Design Automation System provides **59 endpoints** across **8 functional areas**:

### Core System (100% Working)
- **System Health** - MongoDB status, project context resolution
- **Brand Pack Management** - CRUD operations, versioning, export
- **Design Enhancement** - CSS transformation and analysis
- **Advanced Transformations** - Typography, animations, gradients, optimization

### AI-Powered Features (100% Working)
- **Component Generation** - Natural language to UI components
- **Pattern Learning** - AI pattern recognition and suggestions
- **Semantic Analysis** - HTML enhancement and accessibility
- **Layout Intelligence** - Grid systems and responsive design

## 📊 **Configuration Priority**

The system resolves configuration in strict priority order:

1. **Environment Variables** (`AGENTIC_*`)
2. **`.agentic/config.json`** - Project-specific configuration
3. **`package.json`** - agentic field in package.json
4. **`brand-pack.ref.json`** - Brand pack reference markers
5. **MongoDB Project Mapping** - Database-stored project settings
6. **Auto-bind** - Single brand pack scenarios
7. **Lock File Fallback** - `.agentic/brand-pack.lock.json`

## 🔑 **Key Environment Variables**

```bash
# Server Configuration
PORT=8901                                   # API server port
AGENTIC_MONGO_URI=mongodb://localhost:27017  # Database connection
AGENTIC_DB_NAME=agentic_design              # Database name

# Brand Pack Configuration
AGENTIC_BRAND_PACK_ID=your-brand-id         # Override brand pack
AGENTIC_STRICT=1                            # Fail hard on errors
AGENTIC_AUTO_APPLY=safe                     # Auto-application mode

# AI Integration
ANTHROPIC_API_KEY=sk-ant-...                # Claude API key
CLAUDE_MODEL=claude-3-5-sonnet-20241022     # Claude model version
```

## 🎨 **Design Token System**

The system uses a comprehensive design token architecture:

```javascript
{
  "colors": {
    "roles": {
      "primary": { "value": "#1B3668", "light": "#1B3668", "dark": "#4A78C3" },
      "secondary": { "value": "#2A4F8F", "light": "#2A4F8F", "dark": "#3665B3" }
    }
  },
  "typography": {
    "scale": { "sm": "14px", "md": "16px", "lg": "18px", "xl": "24px" }
  },
  "spacing": {
    "scale": { "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px" }
  }
}
```

## 📈 **Performance Targets**

The system maintains strict performance standards:
- **<100ms p95** for cached operations
- **<300ms** for new CSS transforms  
- **>70% cache hit rate** for enhancement operations
- **<8KB SDK bundle size** (gzipped)

## 🤝 **For AI Agents**

This documentation is specifically designed for AI agents working with agentic coding projects. Each section includes:

- **Decision Trees** - Visual flowcharts for making choices
- **Code Examples** - Copy-paste ready configuration snippets
- **Validation Scripts** - Automated verification of setups
- **Error Handling** - Comprehensive troubleshooting guides
- **Best Practices** - Battle-tested patterns and anti-patterns

Start with the [`/ai-guidance`](./ai-guidance/) section for AI-specific decision making logic, then explore the project templates in [`/projects`](./projects/) to find the configuration that matches your use case.

---

**System Status**: 100% Operational (59/59 endpoints working)  
**Last Updated**: 2025-09-03 (Phase 9 Complete)  
**Documentation Version**: 1.0.0