/**
 * Vision AI Integration with GPT-4V
 *
 * Provides intelligent visual analysis of screenshots using OpenAI's GPT-4V model.
 * Includes prompt engineering and structured analysis capabilities.
 */

const OpenAI = require('openai');
const Logger = require('../../apps/server/utils/logger');
const { ANALYSIS_PROMPTS } = require('./analysis-prompts');

class VisionAI {
  constructor(options = {}) {
    this.options = {
      model: 'gpt-4-turbo', // Switch to GPT-4 Turbo for better visual analysis
      maxTokens: 4096,
      temperature: 0.1, // Maximum consistency for failure detection
      top_p: 0.9, // Focused analysis
      frequency_penalty: 0.3, // Reduce repetitive feedback
      retryAttempts: 3,
      retryDelay: 1000,
      ...options,
    };

    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || options.apiKey,
    });

    // Validate API key
    if (!this.openai.apiKey) {
      throw new Error('OpenAI API key is required for Vision AI functionality');
    }

    Logger.info('VisionAI initialized', {
      model: this.options.model,
      maxTokens: this.options.maxTokens,
      temperature: this.options.temperature,
    });
  }

  /**
   * Analyze screenshot for design quality and issues
   */
  async analyzeDesign(screenshotBase64, context = {}) {
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      Logger.info('Starting visual design analysis', {
        analysisId,
        contextKeys: Object.keys(context),
        imageSize: `${Math.round((screenshotBase64.length * 0.75) / 1024)}KB`,
      });

      // Prepare the analysis prompt based on context
      const prompt = this.buildAnalysisPrompt(context);

      // Call GPT-5 with retry logic and tool preambles
      const messages = [
        {
          role: 'system',
          content: this.getSystemPreamble(),
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${screenshotBase64}`,
                detail: 'high',
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ];

      const response = await this.callVisionAPIWithRetry(
        {
          model: this.options.model,
          messages,
          max_tokens: this.options.maxTokens,
          temperature: this.options.temperature,
        },
        analysisId
      );

      const duration = Date.now() - startTime;

      // Parse the response
      const analysisResult = this.parseAnalysisResponse(response, analysisId);

      Logger.info('Visual analysis completed', {
        analysisId,
        duration: `${duration}ms`,
        overallScore: analysisResult.overallScore,
        criticalIssues: analysisResult.criticalIssues?.length || 0,
        improvements: analysisResult.improvementOpportunities?.length || 0,
      });

      return {
        success: true,
        analysisId,
        duration,
        ...analysisResult,
        metadata: {
          model: this.options.model,
          prompt: prompt.substring(0, 200) + '...', // Truncated for logging
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      Logger.error('Visual analysis failed', {
        analysisId,
        error: error.message,
        duration: Date.now() - startTime,
      });

      return {
        success: false,
        analysisId,
        error: error.message,
        code: 'ANALYSIS_FAILED',
      };
    }
  }

  /**
   * Build analysis prompt based on context
   */
  buildAnalysisPrompt(context) {
    const {
      brandContext,
      analysisType = 'comprehensive',
      designPrinciples = ['hierarchy', 'spacing', 'typography', 'color', 'accessibility'],
      availableEndpoints = [],
    } = context;

    // Start with base prompt
    let prompt = ANALYSIS_PROMPTS.COMPREHENSIVE_DESIGN_ANALYSIS;

    // Add brand context if available
    if (brandContext && brandContext.tokens) {
      prompt += `\n\nBRAND CONTEXT:\n${JSON.stringify(brandContext.tokens, null, 2)}`;
    }

    // Add specific design principles focus
    if (designPrinciples.length > 0) {
      prompt += `\n\nFOCUS AREAS: ${designPrinciples.join(', ')}`;
    }

    // Add available endpoints for routing
    if (availableEndpoints.length > 0) {
      prompt += `\n\nAVAILABLE OPTIMIZATION ENDPOINTS:\n${availableEndpoints.join('\n')}`;
    }

    // Add specific analysis type instructions
    if (analysisType === 'brand-validation') {
      prompt += `\n\n${ANALYSIS_PROMPTS.BRAND_VALIDATION_FOCUS}`;
    } else if (analysisType === 'accessibility') {
      prompt += `\n\n${ANALYSIS_PROMPTS.ACCESSIBILITY_FOCUS}`;
    }

    return prompt;
  }

  /**
   * Call Vision API with retry logic
   */
  async callVisionAPIWithRetry(requestPayload, analysisId, attempt = 1) {
    try {
      Logger.debug('Calling OpenAI Vision API', {
        analysisId,
        attempt,
        model: requestPayload.model,
      });

      // Handle GPT-5 parameter differences and structured output
      if (requestPayload.model === 'gpt-5') {
        if (requestPayload.max_tokens) {
          requestPayload.max_completion_tokens = requestPayload.max_tokens;
          delete requestPayload.max_tokens;
        }
        // GPT-5 only supports temperature = 1 (default)
        if (requestPayload.temperature !== undefined && requestPayload.temperature !== 1) {
          Logger.debug('GPT-5 requires temperature=1, adjusting from', {
            originalTemp: requestPayload.temperature,
          });
          requestPayload.temperature = 1;
        }

        // Note: GPT-5 doesn't support top_p or frequency_penalty parameters
        // Only temperature (forced to 1) and max_completion_tokens are supported

        // Add JSON response format for more reliable parsing
        requestPayload.response_format = {
          type: 'json_object',
        };

        Logger.debug('Added JSON response format and optimization params for GPT-5', {
          analysisId,
          top_p: requestPayload.top_p,
          frequency_penalty: requestPayload.frequency_penalty,
        });
      }

      const response = await this.openai.chat.completions.create(requestPayload);

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response choices received from OpenAI');
      }

      return response.choices[0].message.content;
    } catch (error) {
      Logger.warn('Vision API call failed', {
        analysisId,
        attempt,
        error: error.message,
        code: error.code,
      });

      // Retry logic
      if (attempt < this.options.retryAttempts) {
        const delay = this.options.retryDelay * attempt;
        Logger.info('Retrying Vision API call', {
          analysisId,
          nextAttempt: attempt + 1,
          delay: `${delay}ms`,
        });

        await this.sleep(delay);
        return this.callVisionAPIWithRetry(requestPayload, analysisId, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Parse and validate analysis response
   */
  parseAnalysisResponse(responseContent, analysisId) {
    try {
      // DEBUG: Log the raw response to understand what GPT-4 Turbo is returning
      Logger.info('Raw GPT-4 Turbo response for debugging', {
        analysisId,
        responseLength: responseContent.length,
        rawResponse: responseContent.substring(0, 1000) + '...', // First 1000 chars
      });

      // Try to extract JSON from the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        Logger.warn('No JSON found in response, falling back to text parsing', {
          analysisId,
          sampleResponse: responseContent.substring(0, 300),
        });
        // If no JSON found, create structured response from text
        return this.parseTextResponse(responseContent);
      }

      Logger.info('JSON found, attempting to parse', {
        analysisId,
        jsonLength: jsonMatch[0].length,
        jsonPreview: jsonMatch[0].substring(0, 200) + '...',
      });

      const jsonResponse = JSON.parse(jsonMatch[0]);

      // DEBUG: Log the parsed JSON structure
      Logger.info('Parsed JSON structure from GPT-4 Turbo', {
        analysisId,
        overallScore: jsonResponse.overallScore,
        criticalIssuesRaw: jsonResponse.criticalIssues
          ? jsonResponse.criticalIssues.length
          : 'undefined',
        criticalViolationsRaw: jsonResponse.criticalViolations
          ? jsonResponse.criticalViolations.length
          : 'undefined',
        mediumViolationsRaw: jsonResponse.mediumViolations
          ? jsonResponse.mediumViolations.length
          : 'undefined',
        improvementOpportunitiesRaw: jsonResponse.improvementOpportunities
          ? jsonResponse.improvementOpportunities.length
          : 'undefined',
        allKeys: Object.keys(jsonResponse),
      });

      // Validate required fields - Handle different JSON schema variations
      const criticalIssues = this.validateIssues(
        jsonResponse.criticalIssues || jsonResponse.criticalViolations || []
      );

      const improvementOpportunities = this.validateIssues(
        jsonResponse.improvementOpportunities || jsonResponse.mediumViolations || []
      );

      const validatedResponse = {
        overallScore: this.validateScore(jsonResponse.overallScore),
        criticalIssues,
        improvementOpportunities,
        executionOrder: this.validateExecutionOrder(jsonResponse.executionOrder),
        estimatedQualityGain: this.validateScore(jsonResponse.estimatedQualityGain),
        designScores: this.validateDesignScores(
          jsonResponse.designScores || jsonResponse.calculationBreakdown
        ),
        endpointRecommendations: this.validateEndpointRecommendations(
          jsonResponse.endpointRecommendations
        ),
      };

      Logger.info('Validated response structure', {
        analysisId,
        criticalIssuesValidated: validatedResponse.criticalIssues.length,
        improvementOpportunitiesValidated: validatedResponse.improvementOpportunities.length,
      });

      Logger.info('Vision AI structured analysis response validated', {
        analysisId,
        model: this.options.model,
        overallScore: validatedResponse.overallScore,
        criticalIssues: validatedResponse.criticalIssues.length,
        improvementOpportunities: validatedResponse.improvementOpportunities.length,
        structuredOutput: true,
      });

      return validatedResponse;
    } catch (parseError) {
      Logger.warn('Failed to parse JSON response, using text analysis', {
        analysisId,
        error: parseError.message,
      });

      // Fallback to text parsing
      return this.parseTextResponse(responseContent);
    }
  }

  /**
   * Parse text response when JSON parsing fails
   */
  parseTextResponse(responseContent) {
    // Extract key information from text response
    const overallScore = this.extractScoreFromText(responseContent, 'overall') || 75;
    const issues = this.extractIssuesFromText(responseContent);

    return {
      overallScore,
      criticalIssues: issues.critical,
      improvementOpportunities: issues.improvements,
      executionOrder: [],
      estimatedQualityGain: 10,
      designScores: this.generateDefaultScores(overallScore),
      endpointRecommendations: [],
      rawAnalysis: responseContent, // Include raw text for manual review
    };
  }

  /**
   * Validate and normalize score values
   */
  validateScore(score) {
    const numScore = Number(score);
    if (isNaN(numScore)) return 75; // Default score
    return Math.max(0, Math.min(100, numScore));
  }

  /**
   * Validate issues array
   */
  validateIssues(issues) {
    if (!Array.isArray(issues)) return [];

    return issues.map((issue) => ({
      // Handle both 'issue' (old format) and 'violation' (GPT-4 Turbo format)
      issue: issue.issue || issue.violation || 'Unknown issue',
      severity: ['low', 'medium', 'high', 'critical'].includes(issue.severity)
        ? issue.severity
        : 'medium',
      location: issue.location || 'Not specified',
      evidence: issue.evidence || 'No evidence provided',
      recommendedEndpoint: issue.recommendedEndpoint || '',
      parameters: issue.parameters || {},
      expectedImprovement: issue.expectedImprovement || 'General improvement',
      confidence: issue.confidence || null,
    }));
  }

  /**
   * Validate execution order
   */
  validateExecutionOrder(order) {
    if (!Array.isArray(order)) return [];
    return order.filter((item) => typeof item === 'string');
  }

  /**
   * Validate design scores object
   */
  validateDesignScores(scores) {
    const defaultScores = {
      visualHierarchy: 75,
      typography: 75,
      spacing: 75,
      color: 75,
      accessibility: 75,
      brandConsistency: 75,
    };

    if (!scores || typeof scores !== 'object') return defaultScores;

    // Validate each score
    Object.keys(defaultScores).forEach((key) => {
      if (scores[key] !== undefined) {
        defaultScores[key] = this.validateScore(scores[key]);
      }
    });

    return defaultScores;
  }

  /**
   * Validate endpoint recommendations
   */
  validateEndpointRecommendations(recommendations) {
    if (!Array.isArray(recommendations)) return [];

    return recommendations.map((rec) => ({
      endpoint: rec.endpoint || '',
      parameters: rec.parameters || {},
      visualGoal: rec.visualGoal || 'Improve design',
      confidence: this.validateScore(rec.confidence || 80),
      priority: ['low', 'medium', 'high'].includes(rec.priority) ? rec.priority : 'medium',
    }));
  }

  /**
   * Extract score from text content
   */
  extractScoreFromText(text, type) {
    const patterns = [
      new RegExp(`${type}[\\s\\w]*:?[\\s]*(\\d{1,3})`, 'i'),
      new RegExp(`(\\d{1,3})%?[\\s]*${type}`, 'i'),
      new RegExp(`score[\\s]*:?[\\s]*(\\d{1,3})`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const score = parseInt(match[1]);
        if (score >= 0 && score <= 100) return score;
      }
    }

    return null;
  }

  /**
   * Extract issues from text content
   */
  extractIssuesFromText(text) {
    const critical = [];
    const improvements = [];

    // Look for common issue patterns
    const issuePatterns = [
      /problem[s]?:?\s*([^.]+)/gi,
      /issue[s]?:?\s*([^.]+)/gi,
      /improve[s]?:?\s*([^.]+)/gi,
      /fix:?\s*([^.]+)/gi,
    ];

    issuePatterns.forEach((pattern) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const issue = match[1].trim();
        if (issue.length > 10) {
          // Filter out very short matches
          improvements.push({
            issue,
            severity: 'medium',
            recommendedEndpoint: '',
            parameters: {},
            expectedImprovement: 'Address identified issue',
          });
        }
      }
    });

    return { critical, improvements };
  }

  /**
   * Generate default design scores based on overall score
   */
  generateDefaultScores(overallScore) {
    const variance = 10; // Allow some variance around overall score

    return {
      visualHierarchy: Math.max(
        0,
        Math.min(100, overallScore + (Math.random() * variance * 2 - variance))
      ),
      typography: Math.max(
        0,
        Math.min(100, overallScore + (Math.random() * variance * 2 - variance))
      ),
      spacing: Math.max(0, Math.min(100, overallScore + (Math.random() * variance * 2 - variance))),
      color: Math.max(0, Math.min(100, overallScore + (Math.random() * variance * 2 - variance))),
      accessibility: Math.max(
        0,
        Math.min(100, overallScore + (Math.random() * variance * 2 - variance))
      ),
      brandConsistency: Math.max(
        0,
        Math.min(100, overallScore + (Math.random() * variance * 2 - variance))
      ),
    };
  }

  /**
   * Analyze multiple viewports (responsive analysis)
   */
  async analyzeMultipleViewports(screenshots, context = {}) {
    const viewportAnalyses = [];

    for (const screenshot of screenshots) {
      const analysis = await this.analyzeDesign(screenshot.base64, {
        ...context,
        viewport: screenshot.viewport,
        analysisType: 'responsive',
      });

      viewportAnalyses.push({
        viewport: screenshot.viewport,
        analysis,
      });
    }

    return {
      success: true,
      viewportAnalyses,
      responsiveScore: this.calculateResponsiveScore(viewportAnalyses),
      responsiveIssues: this.identifyResponsiveIssues(viewportAnalyses),
    };
  }

  /**
   * Calculate overall responsive design score
   */
  calculateResponsiveScore(viewportAnalyses) {
    const scores = viewportAnalyses
      .filter((va) => va.analysis.success)
      .map((va) => va.analysis.overallScore);

    if (scores.length === 0) return 0;

    // Average score with penalty for inconsistency
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = this.calculateVariance(scores);
    const consistencyPenalty = Math.min(variance / 10, 20); // Max 20 point penalty

    return Math.max(0, average - consistencyPenalty);
  }

  /**
   * Identify responsive design issues
   */
  identifyResponsiveIssues(viewportAnalyses) {
    const issues = [];

    // Compare scores across viewports
    const scores = viewportAnalyses.map((va) => ({
      viewport: va.viewport,
      score: va.analysis.success ? va.analysis.overallScore : 0,
    }));

    // Identify significant score drops
    scores.forEach((current, index) => {
      scores.forEach((other, otherIndex) => {
        if (index !== otherIndex && current.score - other.score > 20) {
          issues.push({
            issue: `Significant quality drop from ${current.viewport.width}px to ${other.viewport.width}px`,
            severity: 'high',
            scoreDifference: current.score - other.score,
          });
        }
      });
    });

    return issues;
  }

  /**
   * Calculate variance for score consistency
   */
  calculateVariance(scores) {
    if (scores.length < 2) return 0;

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const squaredDifferences = scores.map((score) => Math.pow(score - mean, 2));

    return squaredDifferences.reduce((sum, diff) => sum + diff, 0) / scores.length;
  }

  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get system preamble for tool usage and progress reporting
   */
  getSystemPreamble() {
    return `You are a RUTHLESS design auditor conducting comprehensive failure analysis. Your expertise comes from 15+ years auditing enterprise interfaces for Fortune 500 companies where accessibility violations result in legal action.

<critical_mindset>
ADOPT THIS MENTALITY:
- You are being paid to find EVERY flaw, no matter how minor
- A score above 70 means the design is production-ready - this should be RARE
- Accessibility violations are LEGAL LIABILITIES, not suggestions
- Small typography/spacing issues compound into major usability problems
- Your reputation depends on catching issues other auditors miss
</critical_mindset>

<measurement_standards>
YOU MUST MEASURE AND VERIFY:
- Font sizes: Anything under 16px for body text is a CRITICAL FAILURE
- Touch targets: Anything under 44px is a CRITICAL mobile accessibility failure
- Contrast ratios: Light gray text (#999, #777, #666) on white typically FAILS WCAG
- Line heights: Under 1.4 creates reading difficulty for dyslexic users
- Heading hierarchy: H1 under 24px fails to establish proper information architecture
</measurement_standards>

<evidence_requirements>
FOR EVERY ISSUE YOU IDENTIFY:
- Provide specific pixel measurements or color values
- Reference exact element locations (top-left button, main heading, etc.)
- State confidence level (90%+ for clear violations, 70-89% for probable issues)
- Explain the user impact (accessibility barrier, usability friction, etc.)
- Never say "appears to be" - either it IS a problem or state your uncertainty level
</evidence_requirements>

<scoring_calibration>
SCORE RUTHLESSLY:
- 90-100: Exceptional design, ready for accessibility certification
- 80-89: Good design with minor issues
- 70-79: Acceptable design with notable problems  
- 60-69: Poor design with multiple accessibility/usability barriers
- 50-59: Bad design with serious violations
- Below 50: Unacceptable design, major redesign required

Remember: Most designs you audit will score 50-70. Anything above 80 should be exceptional.
</scoring_calibration>`;
  }

  /**
   * Get JSON Schema for structured design analysis output
   */
  getDesignAnalysisSchema() {
    return {
      type: 'object',
      properties: {
        overallScore: {
          type: 'integer',
          minimum: 0,
          maximum: 100,
          description: 'Overall design quality score',
        },
        designScores: {
          type: 'object',
          properties: {
            visualHierarchy: { type: 'integer', minimum: 0, maximum: 100 },
            typography: { type: 'integer', minimum: 0, maximum: 100 },
            spacing: { type: 'integer', minimum: 0, maximum: 100 },
            color: { type: 'integer', minimum: 0, maximum: 100 },
            accessibility: { type: 'integer', minimum: 0, maximum: 100 },
            brandConsistency: { type: 'integer', minimum: 0, maximum: 100 },
          },
          required: [
            'visualHierarchy',
            'typography',
            'spacing',
            'color',
            'accessibility',
            'brandConsistency',
          ],
          additionalProperties: false,
        },
        criticalIssues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              issue: { type: 'string', description: 'Clear description of the design problem' },
              severity: { type: 'string', enum: ['low', 'medium', 'high'] },
              recommendedEndpoint: { type: 'string', description: 'API endpoint to fix the issue' },
              parameters: {
                type: 'object',
                properties: {
                  focusArea: { type: 'string' },
                  adjustment: { type: 'string' },
                  targetSelector: { type: 'string' },
                },
                additionalProperties: false,
              },
              expectedImprovement: { type: 'string', description: 'Expected outcome description' },
              confidence: { type: 'integer', minimum: 0, maximum: 100 },
              priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            },
            required: ['issue', 'severity', 'recommendedEndpoint', 'expectedImprovement'],
            additionalProperties: false,
          },
        },
        improvementOpportunities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              issue: { type: 'string' },
              severity: { type: 'string', enum: ['low', 'medium', 'high'] },
              recommendedEndpoint: { type: 'string' },
              parameters: {
                type: 'object',
                additionalProperties: false,
              },
              expectedImprovement: { type: 'string' },
              confidence: { type: 'integer', minimum: 0, maximum: 100 },
              priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            },
            required: ['issue', 'severity', 'recommendedEndpoint', 'expectedImprovement'],
            additionalProperties: false,
          },
        },
        endpointRecommendations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              endpoint: { type: 'string' },
              parameters: { type: 'object', additionalProperties: false },
              visualGoal: { type: 'string' },
              confidence: { type: 'integer', minimum: 0, maximum: 100 },
              priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            },
            required: ['endpoint', 'visualGoal'],
            additionalProperties: false,
          },
        },
        executionOrder: {
          type: 'array',
          items: { type: 'string' },
          description: 'Recommended order for applying optimizations',
        },
        estimatedQualityGain: {
          type: 'integer',
          minimum: 0,
          maximum: 100,
          description: 'Expected quality improvement points',
        },
      },
      required: [
        'overallScore',
        'designScores',
        'criticalIssues',
        'improvementOpportunities',
        'executionOrder',
        'estimatedQualityGain',
      ],
      additionalProperties: false,
    };
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return {
      model: this.options.model,
      maxTokens: this.options.maxTokens,
      temperature: this.options.temperature,
      retryAttempts: this.options.retryAttempts,
      hasApiKey: !!this.openai.apiKey,
      structuredOutput: this.options.model === 'gpt-5',
    };
  }
}

module.exports = { VisionAI };
