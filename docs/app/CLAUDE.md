# docs/app Documentation Guidelines

## Purpose

The `docs/app` folder serves as **the primary context provider for AI agents** working on this AI-Driven Design Automation system. This documentation focuses on **what currently works**, **how to use existing features**, and **how to develop the application further**.

## What Belongs Here

### ✅ Include

- **Working Features**: Current functional capabilities and APIs
- **Usage Patterns**: How to interact with the system effectively
- **Development Context**: Architecture, patterns, and extension points
- **Active Issues**: Current development needs requiring attention
- **Integration Guides**: How components work together

### ❌ Do Not Include

- **Error Correction Histories**: Past debugging processes or restoration timelines
- **Broken Feature Documentation**: Non-functional endpoints or features
- **Development Logs**: Build outputs, debug sessions, or troubleshooting processes
- **Temporary Analysis**: One-time investigations or diagnostic reports

## File Organization Standards

### File Size Guidelines

- **Maximum 300 lines per file** - Break down larger files into logical components
- **Logical Grouping** - Organize by functional area, not chronologically
- **Clear Navigation** - Each file should reference related files

### Folder Structure

```
docs/app/
├── CLAUDE.md                 # This file - purpose and guidelines
├── README.md                 # Application overview and getting started
├── api/                      # API endpoint documentation by feature area
│   ├── core/                 # System health, brand management
│   ├── design/              # CSS enhancement and transformations
│   ├── intelligence/        # AI-powered analysis systems
│   ├── generation/          # Component and template generation
│   └── semantic/            # Accessibility and HTML analysis
├── architecture/            # System design and technical patterns
├── setup/                   # Environment and configuration guides
├── testing/                 # Testing approaches and verification
└── issues/                  # Active development issues only
```

## Maintenance Principles

### Documentation Standards

1. **Current State Focus** - Document what exists now, not what was broken before
2. **Practical Utility** - Include information that helps with development decisions
3. **AI-Friendly Format** - Use clear headings, examples, and structured data
4. **Regular Cleanup** - Remove outdated information that no longer applies

### Update Process

1. **When adding features** - Document in appropriate functional area
2. **When fixing bugs** - Update existing documentation, don't add debugging details
3. **When restructuring** - Maintain logical organization, update cross-references
4. **When removing features** - Delete documentation entirely, don't mark as deprecated

## Content Quality Standards

### Essential Information

- **What it does** - Clear functional description
- **How to use it** - Examples and integration patterns
- **Dependencies** - Required services, configurations, or data
- **Performance** - Expected response times and resource usage
- **Limitations** - Known constraints or boundaries

### Writing Style

- **Concise and Direct** - No unnecessary explanation or background
- **Example-Driven** - Include working code examples and sample responses
- **Actionable** - Focus on information that enables development work
- **Consistent Format** - Follow established patterns for similar content

## AI Agent Context Goals

This documentation should enable AI agents to:

1. **Understand System Capabilities** - Know what features are available and working
2. **Make Development Decisions** - Have context for extending or modifying functionality
3. **Integrate Components** - Understand how different parts work together
4. **Debug Issues** - Know expected behaviors and common patterns
5. **Plan Features** - Understand architectural constraints and extension points

## Folder Maintenance

### Regular Reviews

- **Monthly**: Check for files exceeding 300 lines
- **Per Feature**: Update documentation when adding/changing functionality
- **Per Issue Resolution**: Move resolved issues out of issues/ folder

### Quality Checks

- **No duplicate information** across multiple files
- **Clear cross-references** between related documentation
- **Working examples** that can be tested
- **Current status** reflected accurately

---

**Remember**: This folder provides the foundation for AI agents to understand and work with the entire application effectively. Keep it focused, current, and practical.
