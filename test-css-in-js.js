#!/usr/bin/env node

/**
 * CSS-in-JS Transformation Test Suite
 * Tests the new CSS-in-JS enhancement capabilities
 */

const { enhanceCSSinJS, CSSinJSEnhancer } = require('./packages/engine/css-in-js');

// Sample brand tokens for testing
const testTokens = {
  colors: {
    roles: {
      primary: '#1B3668',
      'primary-dark': '#0F2347',
      secondary: '#2A4F8F',
      surface: '#F8FAFC',
      'surface-dark': '#1A1A1A',
      text: '#212529',
      'text-secondary': '#6C757D',
      border: '#DEE2E6'
    }
  },
  spacing: {
    tokens: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px'
    }
  }
};

// Test cases for CSS-in-JS
const testCases = [
  {
    name: 'Styled-components with color tokens',
    input: `
const Button = styled.button\`
  background-color: #1B3668;
  color: #F8FAFC;
  padding: 16px 24px;
  border-radius: 8px;
\`;
    `,
    expectTransformation: true
  },
  {
    name: 'Emotion css tagged template',
    input: `
const buttonStyle = css\`
  color: #1B3668;
  background: #F8FAFC;
  margin: 8px;
  padding: 16px;
\`;
    `,
    expectTransformation: true
  },
  {
    name: 'Emotion css prop in JSX',
    input: `
export const Card = () => (
  <div css={css\`
    background-color: #F8FAFC;
    border: 1px solid #DEE2E6;
    padding: 24px;
    color: #212529;
  \`}>
    <h2 css={css\`color: #1B3668; margin: 8px 0;\`}>Title</h2>
  </div>
);
    `,
    expectTransformation: true
  },
  {
    name: 'Styled-components with complex CSS',
    input: `
const Container = styled.div\`
  padding: 32px;
  margin: 16px auto;
  background: linear-gradient(135deg, #F8FAFC 0%, #DEE2E6 100%);
  border: 1px solid #DEE2E6;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  
  &:hover {
    background-color: #1A1A1A;
    color: #F8FAFC;
  }
\`;
    `,
    expectTransformation: true
  },
  {
    name: 'Mixed styled-components and template literals',
    input: `
const Theme = {
  primary: '#1B3668',
  surface: '#F8FAFC'
};

const Button = styled.button\`
  background: \${props => props.variant === 'primary' ? '#1B3668' : '#F8FAFC'};
  color: \${props => props.variant === 'primary' ? '#F8FAFC' : '#1B3668'};
  padding: 16px 24px;
  margin: 8px;
\`;
    `,
    expectTransformation: true
  },
  {
    name: 'Emotion with responsive styles',
    input: `
const responsiveStyle = css\`
  color: #1B3668;
  padding: 16px;
  
  @media (max-width: 768px) {
    padding: 8px;
    color: #6C757D;
  }
  
  @media (min-width: 1024px) {
    padding: 32px;
    background: #F8FAFC;
  }
\`;
    `,
    expectTransformation: true
  },
  {
    name: 'Regular JavaScript without CSS-in-JS',
    input: `
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
    `,
    expectTransformation: false
  },
  {
    name: 'Template literal without CSS',
    input: `
const message = \`Hello \${name}, welcome to our application!\`;
    `,
    expectTransformation: false
  }
];

// Run CSS-in-JS tests
async function runCSSinJSTests() {
  console.log('🧪 Running CSS-in-JS Transformation Tests');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let total = testCases.length;
  
  for (const [index, testCase] of testCases.entries()) {
    console.log(`\n📝 Test ${index + 1}: ${testCase.name}`);
    console.log('─'.repeat(40));
    
    try {
      const result = enhanceCSSinJS({
        code: testCase.input,
        tokens: testTokens,
        filePath: 'test.jsx'
      });
      
      console.log('📄 Input:');
      console.log(testCase.input.trim());
      
      if (result.success) {
        const hasChanges = result.changes && result.changes.length > 0;
        
        if (testCase.expectTransformation) {
          if (hasChanges) {
            console.log('✅ PASS - CSS-in-JS transformation applied as expected');
            console.log('\n🔄 Changes:');
            result.changes.forEach(change => {
              console.log(`  • ${change.type}: "${change.before}" → "${change.after}"`);
            });
            console.log('\n📄 Output:');
            console.log(result.code.trim());
            passed++;
          } else {
            console.log('❌ FAIL - Expected transformation but none applied');
          }
        } else {
          if (!hasChanges) {
            console.log('✅ PASS - No transformation applied as expected');
            passed++;
          } else {
            console.log('❌ FAIL - Unexpected transformation applied');
            console.log('Changes:', result.changes);
          }
        }
      } else {
        console.log(`❌ FAIL - Enhancement error: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All CSS-in-JS tests passed!');
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed`);
  }
  
  return passed === total;
}

// Test runtime token injection
async function testRuntimeTokenInjection() {
  console.log('\n🎨 Testing Runtime Token Injection');
  console.log('=' .repeat(50));
  
  const enhancer = new CSSinJSEnhancer(testTokens);
  const tokenCode = enhancer.generateTokenInjection();
  
  console.log('Generated Token Injection Code:');
  console.log(tokenCode);
  
  // Basic validation
  const hasColorTokens = tokenCode.includes('--color-primary');
  const hasSpacingTokens = tokenCode.includes('--spacing-md');
  const hasInjectionLogic = tokenCode.includes('setProperty');
  
  if (hasColorTokens && hasSpacingTokens && hasInjectionLogic) {
    console.log('✅ Runtime token injection test passed');
    return true;
  } else {
    console.log('❌ Runtime token injection test failed');
    console.log(`Color tokens: ${hasColorTokens}, Spacing: ${hasSpacingTokens}, Logic: ${hasInjectionLogic}`);
    return false;
  }
}

// Test specific CSS-in-JS patterns
async function testSpecificPatterns() {
  console.log('\n🔍 Testing Specific CSS-in-JS Patterns');
  console.log('=' .repeat(50));
  
  const patterns = [
    {
      name: 'Styled-components detection',
      code: 'const Button = styled.div`color: #1B3668;`;',
      shouldMatch: true
    },
    {
      name: 'Emotion css detection',
      code: 'const style = css`color: #1B3668;`;',
      shouldMatch: true
    },
    {
      name: 'Regular template literal',
      code: 'const message = `Hello ${name}`;',
      shouldMatch: false
    },
    {
      name: 'CSS in template literal',
      code: 'const styles = `color: #1B3668; padding: 16px;`;',
      shouldMatch: true
    }
  ];
  
  const enhancer = new CSSinJSEnhancer(testTokens);
  let passed = 0;
  
  patterns.forEach((pattern, index) => {
    console.log(`\n${index + 1}. Testing: ${pattern.name}`);
    
    try {
      const result = enhanceCSSinJS({
        code: pattern.code,
        tokens: testTokens,
        filePath: 'test.js'
      });
      
      const hasChanges = result.changes && result.changes.length > 0;
      
      if (pattern.shouldMatch === hasChanges) {
        console.log(`✅ PASS - Expected ${pattern.shouldMatch ? 'transformation' : 'no transformation'}`);
        passed++;
      } else {
        console.log(`❌ FAIL - Expected ${pattern.shouldMatch ? 'transformation' : 'no transformation'}, got opposite`);
      }
    } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
    }
  });
  
  console.log(`\nPattern Tests: ${passed}/${patterns.length} passed`);
  return passed === patterns.length;
}

// Main test execution
async function main() {
  console.log('🚀 Starting CSS-in-JS Enhancement Tests\n');
  
  const mainTests = await runCSSinJSTests();
  const tokenTests = await testRuntimeTokenInjection();
  const patternTests = await testSpecificPatterns();
  
  console.log('\n' + '='.repeat(60));
  if (mainTests && tokenTests && patternTests) {
    console.log('🎉 All CSS-in-JS Enhancement Tests Passed!');
    console.log('✅ Styled-components transformation working');
    console.log('✅ Emotion css transformation working');
    console.log('✅ Template literal CSS transformation working');
    console.log('✅ JSX css prop transformation working');
    console.log('✅ Runtime token injection working');
    console.log('✅ CSS pattern detection working');
    console.log('\n🚀 CSS-in-JS Phase 2 Implementation Complete!');
    process.exit(0);
  } else {
    console.log('❌ Some CSS-in-JS tests failed');
    console.log(`Main tests: ${mainTests ? 'PASS' : 'FAIL'}`);
    console.log(`Token tests: ${tokenTests ? 'PASS' : 'FAIL'}`);
    console.log(`Pattern tests: ${patternTests ? 'PASS' : 'FAIL'}`);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runCSSinJSTests, testRuntimeTokenInjection, testSpecificPatterns };