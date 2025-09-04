# Web Application Configuration Template

Complete setup for modern web applications with AI-driven design automation.

## 🎯 **Use Case**

This template is designed for:
- **Modern web applications** with component-based architecture
- **React/Vue/Svelte projects** requiring design consistency
- **Multi-page applications** with shared design patterns
- **Teams** needing automated design enhancement
- **Progressive web apps** with responsive layouts

## 📋 **Prerequisites**

- Node.js 20+ installed
- MongoDB running on localhost:27017 (or configured via AGENTIC_MONGO_URI)
- AI-Driven Design Automation System server running on port 8901

## 🚀 **Quick Setup**

### 1. **Copy Configuration Files**
```bash
# Copy the template files to your project root
cp .agentic/config.json /path/to/your/project/.agentic/
cp package.json.template /path/to/your/project/package.json.agentic
cp .env.template /path/to/your/project/.env
```

### 2. **Install Dependencies**
```bash
# Install the Agentic Design SDK
npm install @agentic/design-sdk

# For build integration (optional)
npm install --save-dev @agentic/vite-plugin
```

### 3. **Configure Environment**
```bash
# Set up your environment variables
echo "AGENTIC_MONGO_URI=mongodb://localhost:27017" >> .env
echo "AGENTIC_DB_NAME=agentic_design" >> .env
echo "ANTHROPIC_API_KEY=your-api-key-here" >> .env
```

### 4. **Initialize Brand Pack**
```bash
# Create a brand pack for your project
curl -X POST http://localhost:8901/api/brand-packs \
  -H "Content-Type: application/json" \
  -d @brand-pack-template.json
```

## 📁 **Template Files**

### [`.agentic/config.json`](./.agentic/config.json)
Main project configuration file:
- Brand pack binding
- Enhancement preferences
- Performance settings
- Team collaboration options

### [`package.json.template`](./package.json.template)
Package.json additions with agentic field:
- SDK integration scripts
- Development workflows
- Build integration

### [`.env.template`](./.env.template)
Environment variable template:
- API keys and endpoints
- Database configuration
- Feature flags

### [`brand-pack-template.json`](./brand-pack-template.json)
Brand pack creation template:
- Design tokens
- Brand personality
- Component preferences

### [`vite.config.js.template`](./vite.config.js.template)
Vite build integration:
- Automatic design enhancement
- Development mode features
- Production optimizations

### [`integration-examples/`](./integration-examples/)
Code examples for different scenarios:
- Component enhancement
- Layout analysis
- Semantic improvements
- Performance optimization

## 🔧 **Configuration Options**

### **Enhancement Levels**
```javascript
{
  "enhancementLevel": "conservative", // conservative | balanced | aggressive
  "autoApply": "safe",               // safe | manual | off
  "batchProcessing": true,           // Process multiple files together
  "cacheStrategy": "aggressive"      // conservative | balanced | aggressive
}
```

### **Feature Flags**
```javascript
{
  "features": {
    "typography": true,        // Enable typography enhancements
    "animations": true,        // Enable animation suggestions
    "gradients": false,        // Enable gradient enhancements
    "semantics": true,         // Enable semantic analysis
    "accessibility": true,     // Enable accessibility improvements
    "componentGeneration": true // Enable AI component generation
  }
}
```

### **Performance Settings**
```javascript
{
  "performance": {
    "maxConcurrent": 3,        // Max concurrent API requests
    "timeout": 30000,          // Request timeout in ms
    "retries": 2,              // Number of retry attempts
    "cacheExpiry": 3600        // Cache expiry in seconds
  }
}
```

## 🎨 **Brand Pack Configuration**

### **Token Structure**
The brand pack defines your design system tokens:

```javascript
{
  "colors": {
    "roles": {
      "primary": { "value": "#3B82F6", "light": "#60A5FA", "dark": "#1D4ED8" },
      "secondary": { "value": "#8B5CF6", "light": "#A78BFA", "dark": "#5B21B6" },
      "success": { "value": "#10B981", "light": "#34D399", "dark": "#047857" },
      "warning": { "value": "#F59E0B", "light": "#FBBF24", "dark": "#D97706" },
      "error": { "value": "#EF4444", "light": "#F87171", "dark": "#B91C1C" }
    }
  },
  "typography": {
    "scale": {
      "xs": "12px",
      "sm": "14px", 
      "md": "16px",
      "lg": "18px",
      "xl": "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px"
    },
    "weights": {
      "light": 300,
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    }
  },
  "spacing": {
    "scale": {
      "xs": "4px",
      "sm": "8px",
      "md": "16px", 
      "lg": "24px",
      "xl": "32px",
      "2xl": "48px",
      "3xl": "64px"
    }
  }
}
```

### **Brand Personality**
Define your brand's personality for AI-driven decisions:

```javascript
{
  "personality": {
    "modern_traditional": 8,    // 1-10 scale: traditional (1) to modern (10)
    "playful_serious": 6,       // 1-10 scale: playful (1) to serious (10) 
    "minimal_decorative": 7,    // 1-10 scale: minimal (1) to decorative (10)
    "trustworthy_innovative": 7 // 1-10 scale: trustworthy (1) to innovative (10)
  }
}
```

## 🔄 **Development Workflow**

### **1. Design Enhancement**
```javascript
import { enhance } from '@agentic/design-sdk';

// Enhance a CSS file
const result = await enhance({
  code: `.btn { color: red; padding: 10px; }`,
  projectPath: process.cwd()
});

console.log(result.code); // Enhanced CSS with tokens
// .btn { color: var(--color-primary); padding: var(--spacing-md); }
```

### **2. Component Generation**
```javascript
import { generateComponent } from '@agentic/design-sdk';

// Generate a component from description
const component = await generateComponent({
  description: "A modern card component with shadow and hover effects",
  framework: "react",
  projectPath: process.cwd()
});

console.log(component.jsx); // React component code
console.log(component.css); // Corresponding CSS
```

### **3. Layout Analysis**
```javascript
import { analyzeLayout } from '@agentic/design-sdk';

// Analyze existing layout
const analysis = await analyzeLayout({
  html: document.documentElement.outerHTML,
  css: getAllStyleSheets(),
  projectPath: process.cwd()
});

console.log(analysis.recommendations); // Layout improvement suggestions
```

## 📊 **Monitoring & Analytics**

### **Performance Metrics**
Track enhancement effectiveness:
- **Token adoption rate** - % of hardcoded values converted to tokens
- **Accessibility score** - WCAG compliance improvements  
- **Performance impact** - Bundle size and load time changes
- **Pattern consistency** - Design pattern adherence score

### **Team Metrics**
Monitor team adoption:
- **Enhancement usage** - API calls per developer
- **Manual overrides** - When developers reject suggestions
- **Success rate** - % of enhancements that remain after review
- **Time savings** - Estimated time saved on design tasks

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Brand Pack Not Found**
```
Error: brand_pack_not_found
```
**Solution**: Verify brand pack ID in `.agentic/config.json` matches existing brand pack.

#### **API Connection Failed**
```
Error: ECONNREFUSED localhost:8901
```
**Solution**: Ensure the AI-Driven Design Automation server is running on port 8901.

#### **MongoDB Connection Failed**
```  
Error: MongoNetworkError
```
**Solution**: Verify MongoDB is running and AGENTIC_MONGO_URI is correct.

#### **Rate Limiting**
```
Error: Too Many Requests
```
**Solution**: Reduce concurrent requests in performance settings.

### **Debug Mode**
Enable detailed logging:
```bash
DEBUG=agentic:* npm run dev
```

## 🎯 **Success Criteria**

A successful web application integration achieves:

- ✅ **Automatic design enhancement** during development
- ✅ **Consistent design token usage** across components  
- ✅ **Improved accessibility scores** (WCAG AA compliance)
- ✅ **Faster development cycles** with AI-generated components
- ✅ **Scalable design system** that evolves with the project
- ✅ **Team design consistency** without manual coordination

## 📈 **Next Steps**

After setup:
1. **Run enhancement on existing styles** to establish baseline
2. **Generate key components** using AI descriptions
3. **Set up continuous integration** for automated enhancement  
4. **Train team** on SDK usage and workflows
5. **Iterate on brand pack** based on enhancement results

## 🔗 **Related Documentation**

- [Brand Pack Configuration Guide](../../brand-packs/creation-guide.md)
- [SDK Integration Patterns](../../integrations/sdk-integration.md)
- [Team Collaboration Workflows](../../scenarios/team-collaboration.md)
- [Performance Optimization](../../scenarios/performance-optimization.md)