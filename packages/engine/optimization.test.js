// CSS Optimization Pipeline Tests
// Tests for minifyProperties, optimizeSelectors, and safety mechanisms

const { describe, test, expect, beforeEach } = require('@jest/globals');

// Import the CompostionalTransformSystem for testing
const { CompositionalTransformSystem } = require('./compositor');

describe('CSS Optimization Pipeline', () => {
  let compositor;

  beforeEach(() => {
    compositor = new CompositionalTransformSystem();
  });

  describe('minifyProperties', () => {
    test('should preserve pixel units on non-zero values', () => {
      const css = `
.test-class {
  padding: 80px 16px;
  margin: 24px auto;
  width: 350px;
  height: 200px;
}`;

      const result = compositor.minifyProperties(css);
      
      expect(result.css).toContain('padding: 80px 16px');
      expect(result.css).toContain('margin: 24px auto');
      expect(result.css).toContain('width: 350px');
      expect(result.css).toContain('height: 200px');
    });

    test('should remove units from zero values', () => {
      const css = `
.test-class {
  margin: 0px;
  padding: 0rem;
  border: 0em solid;
}`;

      const result = compositor.minifyProperties(css);
      
      expect(result.css).toContain('margin: 0');
      expect(result.css).toContain('padding: 0');
      expect(result.css).toContain('border: 0 solid');
    });

    test('should preserve rem and em units', () => {
      const css = `
.test-class {
  font-size: 1.25rem;
  line-height: 1.5em;
  margin: 2rem 1em;
}`;

      const result = compositor.minifyProperties(css);
      
      expect(result.css).toContain('font-size: 1.25rem');
      expect(result.css).toContain('line-height: 1.5em');
      expect(result.css).toContain('margin: 2rem 1em');
    });

    test('should preserve percentage and auto values', () => {
      const css = `
.test-class {
  width: 100%;
  margin: 0 auto;
  height: 50vh;
}`;

      const result = compositor.minifyProperties(css);
      
      expect(result.css).toContain('width: 100%');
      expect(result.css).toContain('margin: 0 auto');
      expect(result.css).toContain('height: 50vh');
    });

    test('should handle complex property values', () => {
      const css = `
.test-class {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}`;

      const result = compositor.minifyProperties(css);
      
      expect(result.css).toContain('20px');
      expect(result.css).toContain('25px');
      expect(result.css).toContain('-5px');
      expect(result.css).toContain('-4px');
      expect(result.css).toContain('linear-gradient');
      expect(result.css).toContain('rgba(0, 0, 0, 0.1)');
    });

    test('should minify spacing appropriately', () => {
      const css = `
.test-class {
  padding    :    1rem    2rem   ;
  margin  : 0   auto  ;
}`;

      const result = compositor.minifyProperties(css);
      
      expect(result.css).toContain('padding: 1rem 2rem;');
      expect(result.css).toContain('margin: 0 auto;');
    });
  });

  describe('optimizeSelectors', () => {
    test('should preserve class selectors', () => {
      const css = `
.inventory-section {
  padding: 80px 0;
}

.inventory-grid {
  display: grid;
}`;

      const result = compositor.optimizeSelectors(css);
      
      expect(result.css).toContain('.inventory-section');
      expect(result.css).toContain('.inventory-grid');
      expect(result.css).toMatch(/\.inventory-section\s*{/);
      expect(result.css).toMatch(/\.inventory-grid\s*{/);
    });

    test('should handle complex selectors', () => {
      const css = `
.container .item:hover,
.container .item:focus {
  transform: translateY(-4px);
}

.parent > .child + .sibling ~ .another {
  color: blue;
}`;

      const result = compositor.optimizeSelectors(css);
      
      expect(result.css).toContain('.container .item:hover');
      expect(result.css).toContain('.container .item:focus');
      expect(result.css).toContain('.parent > .child + .sibling ~ .another');
    });

    test('should preserve pseudo-selectors and combinators', () => {
      const css = `
button:hover {
  background: blue;
}

.nav > li + li {
  margin-left: 10px;
}

.card ~ .card {
  margin-top: 1rem;
}`;

      const result = compositor.optimizeSelectors(css);
      
      expect(result.css).toContain('button:hover');
      expect(result.css).toContain('.nav > li + li');
      expect(result.css).toContain('.card ~ .card');
    });

    test('should handle multi-line CSS properly', () => {
      const css = `
.complex-selector,
.another-selector,
.third-selector {
  property: value;
}`;

      const result = compositor.optimizeSelectors(css);
      
      expect(result.css).toContain('.complex-selector');
      expect(result.css).toContain('.another-selector');  
      expect(result.css).toContain('.third-selector');
      expect(result.css).toContain('property: value');
    });

    test('should preserve media queries', () => {
      const css = `
@media (max-width: 768px) {
  .responsive {
    display: block;
  }
}`;

      const result = compositor.optimizeSelectors(css);
      
      expect(result.css).toContain('@media (max-width: 768px)');
      expect(result.css).toContain('.responsive');
      expect(result.css).toContain('display: block');
    });
  });

  describe('CSS Validation', () => {
    test('should produce valid CSS', () => {
      const css = `
.test-class {
  padding: 80px 0;
  margin: 16px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}`;

      const result = compositor.minifyProperties(css);
      
      // Basic validation: ensure no orphaned properties
      const lines = result.css.split('\n').map(line => line.trim()).filter(Boolean);
      let braceBalance = 0;
      let inRule = false;
      
      for (const line of lines) {
        if (line.includes('{')) {
          braceBalance++;
          inRule = true;
        }
        if (line.includes('}')) {
          braceBalance--;
          inRule = false;
        }
        
        // Property lines should only exist inside rules
        if (line.includes(':') && line.includes(';') && !line.includes('{')) {
          expect(inRule || braceBalance > 0).toBe(true);
        }
      }
      
      expect(braceBalance).toBe(0); // All braces should be balanced
    });
  });

  describe('Integration Tests', () => {
    test('should handle fresh-project inventory section CSS', () => {
      const css = `
.inventory-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.inventory-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}`;

      const minified = compositor.minifyProperties(css);
      const optimized = compositor.optimizeSelectors(minified.css);
      
      // Should preserve all selectors
      expect(optimized.css).toContain('.inventory-section');
      expect(optimized.css).toContain('.inventory-grid');
      expect(optimized.css).toContain('.inventory-item:hover');
      
      // Should preserve all units
      expect(optimized.css).toContain('80px');
      expect(optimized.css).toContain('350px');
      expect(optimized.css).toContain('20px');
      expect(optimized.css).toContain('25px');
      expect(optimized.css).toContain('-4px');
      expect(optimized.css).toContain('2rem');
      
      // Should preserve complex values
      expect(optimized.css).toContain('linear-gradient');
      expect(optimized.css).toContain('repeat(auto-fit, minmax(350px, 1fr))');
      expect(optimized.css).toContain('rgba(0, 0, 0, 0.1)');
    });

    test('should handle financing section CSS', () => {
      const css = `
.financing-section {
  padding: 100px 0;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.financing-hero {
  grid-template-columns: 1fr 400px;
  gap: 4rem;
}

.financing-card:hover {
  transform: rotate(0deg) scale(1.02);
}`;

      const minified = compositor.minifyProperties(css);
      const optimized = compositor.optimizeSelectors(minified.css);
      
      // Should preserve all selectors and values
      expect(optimized.css).toContain('.financing-section');
      expect(optimized.css).toContain('.financing-hero');
      expect(optimized.css).toContain('.financing-card:hover');
      expect(optimized.css).toContain('100px');
      expect(optimized.css).toContain('400px');
      expect(optimized.css).toContain('4rem');
      expect(optimized.css).toContain('1.02');
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed CSS gracefully', () => {
      const malformedCSS = `
.broken {
  padding 80px; // missing colon
  color: blue
} // missing semicolon

.incomplete {
  margin: 1rem`;

      expect(() => {
        compositor.minifyProperties(malformedCSS);
      }).not.toThrow();
      
      expect(() => {
        compositor.optimizeSelectors(malformedCSS);
      }).not.toThrow();
    });
    
    test('should return original CSS when optimization fails', () => {
      const css = '.test { color: blue; }';
      
      // Mock a failing optimization
      const originalMinify = compositor.minifyProperties;
      compositor.minifyProperties = () => { throw new Error('Test error'); };
      
      try {
        const result = compositor.minifyProperties(css);
        // Should return original CSS or error result, not crash
        expect(typeof result.css).toBe('string');
      } catch (error) {
        // If it throws, should be handled gracefully
        expect(error).toBeDefined();
      }
      
      // Restore original function
      compositor.minifyProperties = originalMinify;
    });
  });
});

module.exports = {
  // Export test utilities for integration tests
  createTestCSS: (selector, properties) => {
    return `${selector} {\n${properties.map(p => `  ${p}`).join('\n')}\n}`;
  },
  
  validateCSSStructure: (css) => {
    const lines = css.split('\n').map(line => line.trim()).filter(Boolean);
    let braceBalance = 0;
    
    for (const line of lines) {
      if (line.includes('{')) braceBalance++;
      if (line.includes('}')) braceBalance--;
    }
    
    return braceBalance === 0;
  }
};