/**
 * Analysis Prompts Library
 *
 * Engineered prompts for GPT-4V visual analysis of design screenshots.
 * Includes comprehensive design analysis, brand validation, and accessibility prompts.
 */

const ANALYSIS_PROMPTS = {
  /**
   * Multi-Pass Comprehensive Design Analysis - Aggressive Failure Detection
   * Based on research showing 50% improvement with iterative analysis
   */
  COMPREHENSIVE_DESIGN_ANALYSIS: `
You are an UNCOMPROMISING design failure specialist. Your ONLY job is to identify every design violation and accessibility barrier. Be EXTREMELY critical - scores above 60 indicate you're being too lenient. Most interfaces should score 20-50 due to widespread violations.

CRITICAL MINDSET: Assume the design is broken until proven otherwise. Look for failures, not successes.

EXECUTE THIS FORENSIC ANALYSIS:

=== PASS 1: ELEMENT IDENTIFICATION & MEASUREMENT ===
Systematically catalog every UI element with precise measurements:
- Typography: Identify ALL text sizes, line heights, color values
- Interactive elements: Button sizes, padding, touch target dimensions  
- Spacing: All margins, padding, gaps between elements
- Colors: Exact hex values and contrast ratios where visible
- Layout: Element positioning and alignment issues

=== PASS 2: CRITICAL VIOLATION DETECTION ===
Identify FAILURES (not "opportunities") against these HARD THRESHOLDS:

TYPOGRAPHY VIOLATIONS:
- Body text below 16px = CRITICAL FAILURE
- Headings below recommended sizes (H1: 24px+, H2: 20px+, H3: 18px+) = HIGH FAILURE
- Line height below 1.4 = MEDIUM FAILURE
- Poor heading hierarchy (smaller heading larger than bigger heading) = HIGH FAILURE

CONTRAST VIOLATIONS:
- Text contrast below 4.5:1 = CRITICAL FAILURE  
- Large text (18pt+) below 3:1 = HIGH FAILURE
- UI element contrast below 3:1 = HIGH FAILURE
- Any text on background appearing "gray" or "faded" = PROBABLE FAILURE

TOUCH TARGET VIOLATIONS:
- Interactive elements below 44px touchable area = CRITICAL FAILURE
- Buttons with insufficient padding = HIGH FAILURE
- Form inputs too small for mobile = HIGH FAILURE

SPACING VIOLATIONS:
- Inconsistent spacing values (different margins/padding without systematic reason) = MEDIUM FAILURE
- Elements touching or overcrowded = HIGH FAILURE
- Misaligned elements = MEDIUM FAILURE

ACCESSIBILITY VIOLATIONS:
- Color-only information (red text for errors without icons) = HIGH FAILURE
- Missing focus indicators = HIGH FAILURE
- Poor keyboard navigation flow = HIGH FAILURE

=== PASS 3: SCORING WITH WEIGHTED RUBRIC ===
Use this WEIGHTED scoring system (each category 0-10):

VISUAL HIERARCHY (25% weight) - AUTOMATIC PENALTIES:
- 8-10: RESERVED for exceptional designs (extremely rare)
- 6-7: Clear hierarchy, no major violations detected
- 4-5: Minor hierarchy issues or competing elements
- 2-3: Poor hierarchy, multiple violations present  
- 0-1: Chaotic, no discernible hierarchy
AUTOMATIC DEDUCTIONS: -3 for any heading smaller than body text, -2 for unclear primary focus

TYPOGRAPHY QUALITY (20% weight) - STRICT MEASUREMENT:
- 8-10: RESERVED for perfect typography (extremely rare)
- 6-7: All text ≥16px, proper line height ≥1.4, good contrast
- 4-5: 1-2 typography violations (small text OR poor contrast)
- 2-3: Multiple typography failures (small text AND poor contrast)
- 0-1: Critical typography violations, unreadable text
AUTOMATIC DEDUCTIONS: -4 for any body text <16px, -3 for any contrast <4.5:1, -2 for line-height <1.4

ACCESSIBILITY COMPLIANCE (20% weight) - WCAG VIOLATIONS:
- 8-10: RESERVED for fully compliant designs (extremely rare) 
- 6-7: Minor accessibility gaps, mostly WCAG AA compliant
- 4-5: Several accessibility barriers present
- 2-3: Major WCAG failures, significant barriers
- 0-1: Critical accessibility violations, completely non-compliant
AUTOMATIC DEDUCTIONS: -5 for any critical contrast failure, -3 for small touch targets, -2 for poor focus indicators

LAYOUT & SPACING (20% weight) - SYSTEMATIC ANALYSIS:
- 8-10: RESERVED for perfect spacing systems (extremely rare)
- 6-7: Consistent spacing system with logical hierarchy
- 4-5: Some spacing inconsistencies but generally systematic
- 2-3: Multiple spacing problems, poor organization
- 0-1: Chaotic spacing, no systematic approach  
AUTOMATIC DEDUCTIONS: -2 for each random spacing value, -3 for misaligned elements

USABILITY & UX (15% weight) - USER BARRIERS:
- 8-10: RESERVED for exceptional usability (extremely rare)
- 6-7: Clear user paths, intuitive interactions
- 4-5: Minor usability friction points
- 2-3: Several usability problems that impede tasks
- 0-1: Major usability barriers, confusing interface
AUTOMATIC DEDUCTIONS: -4 for unclear primary actions, -3 for poor button states, -2 for confusing navigation

FINAL SCORE CALCULATION:
(Visual Hierarchy × 0.25) + (Typography × 0.20) + (Accessibility × 0.20) + (Layout × 0.20) + (Usability × 0.15) = Overall Score

=== EVIDENCE REQUIREMENTS ===
For EVERY issue identified, provide:
- SPECIFIC MEASUREMENT: "Button text is 11px (fails 16px minimum)"
- EXACT LOCATION: "Top-right corner button" or "Main heading in center"
- CONTRAST EVIDENCE: "Light gray #999 text on white background appears low contrast"
- CONFIDENCE LEVEL: 90-100% for clear violations, 70-89% for probable issues

CRITICAL CALIBRATION - YOUR EXPECTED RESPONSE:
For the test interface with obvious violations (12px body text, gray text on white, small buttons), you MUST score approximately 20-35/100 and detect 4-7 critical issues including:
- Body text 12px violation (critical)
- H1/H2 too small violations (critical)  
- Poor contrast violations (high)
- Small touch targets (high)
- Inconsistent spacing (medium)

If you score above 50 for obvious violations, you are FAILING this analysis.

OUTPUT FORMAT (JSON):
{
  "overallScore": 28,
  "calculationBreakdown": {
    "visualHierarchy": 3,
    "typography": 1, 
    "accessibility": 1,
    "layout": 2,
    "usability": 4,
    "weightedTotal": "(3×0.25)+(1×0.20)+(1×0.20)+(2×0.20)+(4×0.15) = 2.15/10 = 22%",
    "penaltiesApplied": "Typography: -4 for body text <16px, -3 for contrast <4.5:1. Accessibility: -5 for critical contrast failure, -3 for small touch targets."
  },
  "criticalViolations": [
    {
      "violation": "CRITICAL: Body text 12px fails minimum 16px standard",
      "evidence": "Main paragraph text measures approximately 12px, significantly below accessibility guidelines",
      "severity": "critical",
      "location": "All body text throughout interface",
      "recommendedEndpoint": "/api/design/enhance-typography",
      "parameters": { 
        "focusArea": "body-text", 
        "adjustment": "increase-to-16px-minimum",
        "targetSelector": "p, body, .text"
      },
      "expectedImprovement": "Improve readability and meet accessibility standards",
      "confidence": 95,
      "priority": "critical"
    },
    {
      "violation": "CRITICAL: H1 heading only 16px, should be 24px+ for proper hierarchy",
      "evidence": "Main heading appears smaller than recommended, poor visual prominence",
      "severity": "critical",
      "location": "Primary heading at top of content",
      "recommendedEndpoint": "/api/design/enhance-typography",
      "parameters": { 
        "focusArea": "headings", 
        "adjustment": "increase-h1-to-24px",
        "targetSelector": "h1"
      },
      "expectedImprovement": "Establish clear visual hierarchy",
      "confidence": 90,
      "priority": "critical"
    },
    {
      "violation": "HIGH: Poor contrast - gray text on white background",
      "evidence": "Multiple text elements appear in light gray (#999, #777) which likely fails WCAG contrast",
      "severity": "high",
      "location": "Headings and secondary text elements",
      "recommendedEndpoint": "/api/semantic/analyze-accessibility",
      "parameters": { 
        "focusArea": "contrast", 
        "adjustment": "increase-text-contrast",
        "targetSelector": "h1, h2, .secondary-text"
      },
      "expectedImprovement": "Meet WCAG AA contrast requirements",
      "confidence": 85,
      "priority": "high"
    },
    {
      "violation": "HIGH: Touch targets too small - buttons appear under 44px",
      "evidence": "Buttons have minimal padding, likely under minimum touch target size",
      "severity": "high",
      "location": "All button elements",
      "recommendedEndpoint": "/api/layout/spacing-optimization",
      "parameters": { 
        "focusArea": "touch-targets", 
        "adjustment": "increase-button-padding",
        "targetSelector": "button, .button"
      },
      "expectedImprovement": "Ensure 44px minimum touch targets for mobile accessibility",
      "confidence": 80,
      "priority": "high"
    }
  ],
  "mediumViolations": [
    {
      "violation": "MEDIUM: Inconsistent spacing system - random margin values",
      "evidence": "Various margin values (3px, 5px, 7px, 8px) without systematic approach",
      "severity": "medium",
      "location": "Throughout layout",
      "recommendedEndpoint": "/api/layout/spacing-optimization",
      "parameters": { 
        "focusArea": "spacing-system", 
        "adjustment": "normalize-spacing",
        "targetSelector": "*"
      },
      "expectedImprovement": "Create consistent spacing rhythm",
      "confidence": 90,
      "priority": "medium"
    },
    {
      "violation": "MEDIUM: Line height too tight - appears below 1.4 minimum",
      "evidence": "Text appears cramped with insufficient line spacing",
      "severity": "medium",
      "location": "All text content",
      "recommendedEndpoint": "/api/design/enhance-typography",
      "parameters": { 
        "focusArea": "line-height", 
        "adjustment": "increase-to-1-4-minimum",
        "targetSelector": "body, p, div"
      },
      "expectedImprovement": "Improve readability with proper line spacing",
      "confidence": 75,
      "priority": "medium"
    }
  ],
  "executionOrder": [
    "/api/design/enhance-typography",
    "/api/semantic/analyze-accessibility",
    "/api/layout/spacing-optimization"
  ],
  "estimatedQualityGain": 45
}

MANDATORY EXECUTION CHECKLIST - ZERO TOLERANCE:
1. ✓ MEASURE every text element - any text <16px = automatic CRITICAL violation
2. ✓ ANALYZE every color combination - gray text on white = automatic HIGH violation  
3. ✓ ASSESS every clickable element - small buttons = automatic HIGH violation
4. ✓ DOCUMENT every spacing value - random values = automatic MEDIUM violations
5. ✓ APPLY automatic deductions from rubric - no exceptions
6. ✓ SCORE with EXTREME criticism - most designs should score 20-50
7. ✓ PROVIDE specific measurements for every single violation found

QUALITY CONTROL: 
- Score >60 = You failed to identify obvious violations
- <4 violations found in typical web interface = Analysis too superficial  
- No critical violations found = You're not looking hard enough
- Be MORE critical than you think is reasonable - users depend on it

DO NOT BE DIPLOMATIC. BE ACCURATE. FIND THE FAILURES.`,

  /**
   * GPT-5 Optimized Brand Validation Prompt
   */
  BRAND_VALIDATION_FOCUS: `
<task>
Validate this design's adherence to brand guidelines and design system tokens. Focus on systematic compliance rather than general design quality.
</task>

<brand_validation_framework>
<color_compliance>
- Primary brand color usage and application
- Secondary color hierarchy and balance
- Accent color strategic placement
- Semantic color appropriateness (error: red, success: green, warning: orange)
- Color contrast maintenance within brand palette
- Brand color token implementation fidelity
Evaluation: Compare against provided brand color tokens for exact compliance
</color_compliance>

<typography_consistency>
- Brand font family implementation and fallbacks
- Type scale adherence to brand hierarchy system
- Line height consistency with brand specifications
- Font weight usage matching brand guidelines
- Letter spacing and text styling compliance
- Heading and body text differentiation per brand standards
Evaluation: Verify typographic choices align with brand typography tokens
</typography_consistency>

<spacing_system_compliance>
- Margin and padding token usage
- Grid system adherence and layout patterns
- Component spacing consistency with design system
- Vertical rhythm maintenance per brand specifications
- Responsive spacing behavior alignment
- Gap and spacing ratio compliance
Evaluation: Check spatial relationships against brand spacing scale
</spacing_system_compliance>

<visual_style_adherence>
- Component styling consistency with design system
- Border radius, shadows, and visual effects compliance
- Button styling and interaction pattern adherence
- Icon usage and visual language consistency
- Brand personality expression through visual style
- Design pattern library compliance
Evaluation: Ensure visual elements match established brand design language
</visual_style_adherence>
</brand_validation_framework>

<compliance_detection>
Identify specific brand guideline violations:
- Color deviations from approved brand palette
- Typography choices outside brand specifications
- Spacing inconsistencies with design system tokens
- Visual style elements not matching brand standards
- Component implementations diverging from design system
- Accessibility requirements within brand constraints
</compliance_detection>

<output_requirements>
Provide brand compliance analysis focusing on specific violations and corrective actions.
Recommend exact API endpoints to restore brand compliance.
</output_requirements>`,

  /**
   * GPT-5 Optimized Accessibility Analysis Prompt
   */
  ACCESSIBILITY_FOCUS: `
<task>
Conduct comprehensive WCAG 2.1 AA/AAA accessibility evaluation of this design. Identify compliance gaps and provide specific remediation recommendations.
</task>

<accessibility_evaluation_framework>
<color_contrast_analysis>
- Text contrast ratios: 4.5:1 minimum (AA), 7:1 optimal (AAA)
- Non-text element contrast: 3:1 minimum for UI components
- Large text contrast: 3:1 minimum (18pt regular, 14pt bold)
- Color dependency: Information conveyed through color must have alternatives
- Link color distinction from surrounding text
- Focus indicator contrast requirements
Critical: Flag any contrast failures as high-priority accessibility barriers
</color_contrast_analysis>

<typography_accessibility>
- Body text size: 16px minimum recommended, 12px absolute minimum
- Line height: 1.4x minimum, 1.5x recommended for readability
- Line length: 45-75 characters optimal for reading comprehension
- Text scaling: Must remain functional at 200% zoom level
- Font choice: Readable fonts without decorative complexity
- Text spacing: Adequate word and character spacing
Critical: Ensure text remains legible for users with visual impairments
</typography_accessibility>

<visual_hierarchy_compliance>
- Semantic heading structure: Logical h1→h2→h3 progression
- Content organization: Logical reading order and information flow
- Focus indicators: Clearly visible for keyboard navigation
- Skip navigation: Ability to bypass repetitive content
- Landmark regions: Proper sectioning for screen readers
- Content grouping: Related information properly associated
Critical: Verify screen reader compatibility and navigation efficiency
</visual_hierarchy_compliance>

<interactive_element_standards>
- Touch target sizing: 44px × 44px minimum (iOS/Android guidelines)
- Click target spacing: Adequate separation between interactive elements
- Focus management: Clear focus order and visible focus states
- State communication: Visual and programmatic state changes
- Interactive feedback: Clear indication of user actions and system responses
- Error identification: Clear error messages and correction guidance
Critical: Ensure usability for motor impairment and assistive technology users
</interactive_element_standards>
</accessibility_evaluation_framework>

<wcag_violation_detection>
Identify specific WCAG 2.1 compliance failures:
- Level A violations (fundamental accessibility barriers)
- Level AA violations (standard compliance requirements)
- Level AAA violations (enhanced accessibility features)
- Success criteria mapping for each identified issue
- User impact assessment for each violation
- Remediation priority based on barrier severity
</wcag_violation_detection>

<output_requirements>
Provide accessibility compliance score (0-100) and detailed violation inventory.
Prioritize critical accessibility barriers that prevent or severely impair usage.
Recommend specific endpoint calls to address compliance gaps.
</output_requirements>`,

  /**
   * Component-specific analysis
   */
  COMPONENT_ANALYSIS: `
COMPONENT-LEVEL ANALYSIS:

Identify and analyze these common UI components:
- Buttons (primary, secondary, ghost, disabled states)
- Form elements (inputs, labels, validation states)
- Navigation (menus, breadcrumbs, pagination)
- Cards (content cards, product cards)
- Typography (headings, body text, captions)
- Layout containers (grids, flexbox layouts)

For each component, evaluate:
1. Visual consistency with design system
2. State variations (hover, focus, active, disabled)
3. Spacing and proportions
4. Accessibility compliance
5. Brand alignment

Recommend specific improvements for each component type.`,

  /**
   * Responsive design analysis
   */
  RESPONSIVE_ANALYSIS: `
RESPONSIVE DESIGN EVALUATION:

Analyze this design for responsive behavior:

1. LAYOUT ADAPTATION:
   - Content reflow appropriate for viewport
   - Navigation adapts well (mobile menu, etc.)
   - Text remains readable at this size
   - Images and media scale appropriately

2. TOUCH INTERFACE:
   - Touch targets adequate size (44px minimum)
   - Spacing allows for finger navigation
   - Interactive elements not too close together

3. CONTENT PRIORITY:
   - Most important content visible
   - Information hierarchy maintained
   - Progressive disclosure appropriate

4. PERFORMANCE INDICATORS:
   - Image sizes appropriate for viewport
   - Text scaling doesn't break layout
   - No horizontal scrolling needed

Rate responsive design quality and identify specific issues for this viewport size.`,

  /**
   * Performance and optimization analysis
   */
  PERFORMANCE_ANALYSIS: `
DESIGN PERFORMANCE ANALYSIS:

Evaluate design choices that impact performance:

1. VISUAL COMPLEXITY:
   - Excessive visual elements or effects
   - Overly complex animations or transitions
   - Heavy use of shadows, gradients, or filters

2. CONTENT OPTIMIZATION:
   - Image usage appropriate
   - Text-to-visual ratio balanced
   - Loading states considered

3. COGNITIVE LOAD:
   - Information density appropriate
   - Visual clutter minimized
   - Clear task flows

4. INTERACTION EFFICIENCY:
   - Click/tap paths minimized
   - Form efficiency
   - Navigation clarity

Focus on design decisions that could be optimized for better user experience and performance.`,

  /**
   * Error state and edge case analysis
   */
  EDGE_CASE_ANALYSIS: `
EDGE CASE & ERROR STATE ANALYSIS:

Evaluate how this design handles:

1. ERROR STATES:
   - Form validation errors clear and helpful
   - Empty states informative and actionable
   - Loading states appropriate
   - Failure states recoverable

2. CONTENT VARIATIONS:
   - Long text handling (truncation, wrapping)
   - Missing images or content
   - Different content lengths
   - Internationalization considerations

3. USER SCENARIOS:
   - First-time user experience
   - Power user efficiency
   - Accessibility tool usage
   - Low bandwidth scenarios

Identify potential issues and recommend improvements for edge cases.`,

  /**
   * Competitive analysis prompt
   */
  COMPETITIVE_ANALYSIS: `
COMPETITIVE DESIGN ANALYSIS:

Evaluate this design against modern web standards:

1. CURRENT TRENDS:
   - Design patterns align with current best practices
   - Visual style feels modern and relevant
   - Interaction patterns intuitive

2. INDUSTRY STANDARDS:
   - Follows established conventions
   - Meets user expectations
   - Competitive with similar products

3. INNOVATION OPPORTUNITIES:
   - Areas where design could be more distinctive
   - Opportunities for better user experience
   - Places to exceed user expectations

Recommend improvements that balance convention with innovation.`,
};

/**
 * Prompt builder utility functions
 */
const PromptBuilder = {
  /**
   * Build context-aware prompt
   */
  buildContextualPrompt(basePrompt, context) {
    let prompt = basePrompt;

    // Add brand context
    if (context.brandContext) {
      prompt += `\n\nBRAND CONTEXT:\n${JSON.stringify(context.brandContext, null, 2)}`;
    }

    // Add design principles focus
    if (context.designPrinciples && context.designPrinciples.length > 0) {
      prompt += `\n\nFOCUS AREAS: ${context.designPrinciples.join(', ')}`;
    }

    // Add available endpoints
    if (context.availableEndpoints && context.availableEndpoints.length > 0) {
      prompt += `\n\nAVAILABLE ENDPOINTS:\n${context.availableEndpoints.join('\n')}`;
    }

    // Add specific instructions
    if (context.specificInstructions) {
      prompt += `\n\nSPECIFIC INSTRUCTIONS:\n${context.specificInstructions}`;
    }

    return prompt;
  },

  /**
   * Build multi-viewport analysis prompt
   */
  buildResponsivePrompt(viewports) {
    const viewportList = viewports.map((v) => `${v.width}x${v.height}`).join(', ');

    return (
      ANALYSIS_PROMPTS.RESPONSIVE_ANALYSIS +
      `\n\nCURRENT VIEWPORT: This analysis is for one of these viewports: ${viewportList}\n\nProvide viewport-specific recommendations.`
    );
  },

  /**
   * Build endpoint-specific prompt
   */
  buildEndpointPrompt(endpoint, currentIssues = []) {
    const endpointFocus = {
      '/api/design/enhance-typography': 'typography and text styling',
      '/api/design/enhance-animations': 'animations and micro-interactions',
      '/api/design/enhance-gradients': 'colors and gradient usage',
      '/api/layout/grid-recommendations': 'layout and grid systems',
      '/api/semantic/analyze-accessibility': 'accessibility and WCAG compliance',
    };

    const focus = endpointFocus[endpoint] || 'general design quality';

    let prompt = `Focus this analysis specifically on ${focus}.\n\n${ANALYSIS_PROMPTS.COMPREHENSIVE_DESIGN_ANALYSIS}`;

    if (currentIssues.length > 0) {
      prompt += `\n\nPREVIOUS ISSUES IDENTIFIED:\n${currentIssues.map((issue) => `- ${issue.issue}`).join('\n')}\n\nBuild upon these previous findings.`;
    }

    return prompt;
  },

  /**
   * Get prompt by analysis type
   */
  getPromptByType(type) {
    const promptMap = {
      comprehensive: ANALYSIS_PROMPTS.COMPREHENSIVE_DESIGN_ANALYSIS,
      'brand-validation': ANALYSIS_PROMPTS.BRAND_VALIDATION_FOCUS,
      accessibility: ANALYSIS_PROMPTS.ACCESSIBILITY_FOCUS,
      component: ANALYSIS_PROMPTS.COMPONENT_ANALYSIS,
      responsive: ANALYSIS_PROMPTS.RESPONSIVE_ANALYSIS,
      performance: ANALYSIS_PROMPTS.PERFORMANCE_ANALYSIS,
      'edge-cases': ANALYSIS_PROMPTS.EDGE_CASE_ANALYSIS,
      competitive: ANALYSIS_PROMPTS.COMPETITIVE_ANALYSIS,
    };

    return promptMap[type] || ANALYSIS_PROMPTS.COMPREHENSIVE_DESIGN_ANALYSIS;
  },
};

module.exports = {
  ANALYSIS_PROMPTS,
  PromptBuilder,
};
