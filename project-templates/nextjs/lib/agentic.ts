/**
 * Agentic Design System SDK for Next.js
 * Server and client utilities for design system integration
 */

interface AgenticConfig {
  apiUrl: string;
  brandPackId: string;
  brandVersion?: string;
  projectPath?: string;
}

interface EnhancementOptions {
  enableTypography?: boolean;
  enableAnimations?: boolean;
  enableGradients?: boolean;
  enableStates?: boolean;
  enableOptimization?: boolean;
}

interface EnhancementResult {
  success: boolean;
  css?: string;
  changes?: Change[];
  brandCompliance?: ComplianceScore;
  accessibility?: AccessibilityReport;
  error?: string;
}

interface Change {
  type: string;
  property: string;
  before: string;
  after: string;
  line?: number;
}

interface ComplianceScore {
  score: number;
  tokensUsed: string[];
  suggestions: string[];
}

interface AccessibilityReport {
  score: string;
  issues: AccessibilityIssue[];
  wcagLevel: string;
}

interface AccessibilityIssue {
  type: string;
  element: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
}

interface ComponentGenerationRequest {
  description: string;
  componentType?: string;
  style?: string;
  framework?: string;
}

interface GeneratedComponent {
  html?: string;
  css?: string;
  jsx?: string;
  vue?: string;
  svelte?: string;
  metadata?: ComponentMetadata;
}

interface ComponentMetadata {
  componentName: string;
  props: string[];
  category: string;
  complexity: string;
}

/**
 * Server-side Agentic client for build-time and API route usage
 */
export class AgenticServer {
  private config: AgenticConfig;
  
  constructor(config?: Partial<AgenticConfig>) {
    this.config = {
      apiUrl: config?.apiUrl || process.env.AGENTIC_API_URL || 'http://localhost:8901/api',
      brandPackId: config?.brandPackId || process.env.AGENTIC_BRAND_PACK_ID || 'western-companies',
      brandVersion: config?.brandVersion || process.env.AGENTIC_BRAND_VERSION || '1.0.0',
      projectPath: config?.projectPath || process.cwd()
    };
  }
  
  /**
   * Check API health
   */
  async checkHealth(): Promise<{ ok: boolean; mongoAvailable?: boolean }> {
    try {
      const response = await fetch(`${this.config.apiUrl}/health`);
      return await response.json();
    } catch (error) {
      return { ok: false };
    }
  }
  
  /**
   * Get project context
   */
  async getContext(): Promise<any> {
    const response = await fetch(`${this.config.apiUrl}/context`);
    return await response.json();
  }
  
  /**
   * Enhance CSS with brand tokens and transformations
   */
  async enhanceCSS(css: string, options?: EnhancementOptions): Promise<EnhancementResult> {
    try {
      const response = await fetch(`${this.config.apiUrl}/design/enhance-cached`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: css,
          codeType: 'css',
          brandPackId: this.config.brandPackId,
          brandVersion: this.config.brandVersion,
          projectPath: this.config.projectPath,
          ...options
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Validate quality gates
      const minCompliance = parseFloat(process.env.AGENTIC_MIN_BRAND_COMPLIANCE || '0.8');
      if (result.brandCompliance?.score < minCompliance) {
        console.warn(`Brand compliance score ${result.brandCompliance.score} below threshold ${minCompliance}`);
      }
      
      return result;
    } catch (error) {
      console.error('CSS enhancement failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Apply all advanced transformations
   */
  async enhanceAdvanced(css: string, options?: EnhancementOptions): Promise<EnhancementResult> {
    const defaultOptions: EnhancementOptions = {
      enableTypography: true,
      enableAnimations: true,
      enableGradients: true,
      enableStates: true,
      enableOptimization: true,
      ...options
    };
    
    try {
      const response = await fetch(`${this.config.apiUrl}/design/enhance-advanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: css,
          options: defaultOptions,
          projectPath: this.config.projectPath
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Advanced enhancement failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Generate component using AI
   */
  async generateComponent(request: ComponentGenerationRequest): Promise<any> {
    const response = await fetch(`${this.config.apiUrl}/design/generate-component`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...request,
        projectPath: this.config.projectPath
      })
    });
    
    return await response.json();
  }
  
  /**
   * Analyze semantics and accessibility
   */
  async analyzeSemantics(html: string): Promise<any> {
    const response = await fetch(`${this.config.apiUrl}/semantic/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html,
        options: {
          includeAccessibility: true,
          includeComponents: true,
          includeRelationships: true
        }
      })
    });
    
    return await response.json();
  }
  
  /**
   * Get layout templates
   */
  async getLayoutTemplates(filters?: Record<string, string>): Promise<any> {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.config.apiUrl}/layout/templates?${params}`);
    return await response.json();
  }
  
  /**
   * Apply layout template
   */
  async applyLayoutTemplate(templateId: string, content: any, customizations?: any): Promise<any> {
    const response = await fetch(`${this.config.apiUrl}/layout/apply-template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId,
        content,
        customizations,
        projectPath: this.config.projectPath
      })
    });
    
    return await response.json();
  }
  
  /**
   * Get brand pack tokens
   */
  async getBrandTokens(): Promise<any> {
    const response = await fetch(`${this.config.apiUrl}/brand-packs/${this.config.brandPackId}/export/json`);
    return await response.json();
  }
  
  /**
   * Get brand pack CSS
   */
  async getBrandCSS(): Promise<string> {
    const response = await fetch(`${this.config.apiUrl}/brand-packs/${this.config.brandPackId}/export/css`);
    return await response.text();
  }
}

/**
 * Client-side Agentic utilities
 */
export class AgenticClient {
  private apiUrl: string;
  
  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_AGENTIC_API_URL || 'http://localhost:8901/api';
  }
  
  /**
   * Enhance CSS on the client
   */
  async enhanceCSS(css: string): Promise<EnhancementResult> {
    const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ css })
    });
    
    return await response.json();
  }
  
  /**
   * Generate component on the client
   */
  async generateComponent(request: ComponentGenerationRequest): Promise<any> {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    return await response.json();
  }
}

/**
 * Singleton instances
 */
export const agenticServer = new AgenticServer();
export const agenticClient = typeof window !== 'undefined' ? new AgenticClient() : null;

/**
 * Utility function to enhance styles at build time
 * Used in webpack loaders and build scripts
 */
export async function enhanceStylesAtBuildTime(css: string): Promise<string> {
  const result = await agenticServer.enhanceAdvanced(css);
  return result.css || css;
}

/**
 * React hook for using Agentic in components
 */
export function useAgentic() {
  if (typeof window === 'undefined') {
    throw new Error('useAgentic can only be used on the client');
  }
  
  return {
    client: agenticClient,
    enhanceCSS: agenticClient!.enhanceCSS.bind(agenticClient),
    generateComponent: agenticClient!.generateComponent.bind(agenticClient)
  };
}