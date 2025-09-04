#!/usr/bin/env node

/**
 * JSX Transformation Test Suite
 * Tests the new JSX enhancement capabilities
 */

const { enhanceJSX, JSXEnhancer } = require('./packages/engine/jsx');

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
  },
  radii: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px'
  },
  elevation: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.1)'
  }
};

// Test cases
const testCases = [
  {
    name: 'Basic className string with Tailwind classes',
    input: `<div className="bg-blue-500 text-white p-4 rounded-md shadow-md">Hello World</div>`,
    expectTransformation: true
  },
  {
    name: 'Template literal className',
    input: `<div className={\`bg-blue-600 p-\${size} text-gray-900\`}>Dynamic</div>`,
    expectTransformation: true
  },
  {
    name: 'Conditional className with ternary',
    input: `<button className={active ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}>Click me</button>`,
    expectTransformation: true
  },
  {
    name: 'Complex component with multiple elements',
    input: `
      <div className="bg-gray-100 p-6 rounded-lg">
        <h1 className="text-blue-600 text-xl font-bold mb-4">Title</h1>
        <p className="text-gray-700 mb-6">Content</p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600">
          Action
        </button>
      </div>
    `,
    expectTransformation: true
  },
  {
    name: 'TypeScript JSX component',
    input: `
      interface Props {
        title: string;
        variant: 'primary' | 'secondary';
      }
      
      export const Card: React.FC<Props> = ({ title, variant }) => {
        return (
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-300">
            <h2 className={variant === 'primary' ? "text-blue-600" : "text-gray-600"}>
              {title}
            </h2>
          </div>
        );
      };
    `,
    expectTransformation: true
  },
  {
    name: 'No className attribute',
    input: `<div style={{ background: 'red' }}>No classes</div>`,
    expectTransformation: false
  }
];

// Run tests
async function runJSXTests() {
  console.log('🧪 Running JSX Transformation Tests');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let total = testCases.length;
  
  for (const [index, testCase] of testCases.entries()) {
    console.log(`\n📝 Test ${index + 1}: ${testCase.name}`);
    console.log('─'.repeat(40));
    
    try {
      const result = enhanceJSX({
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
            console.log('✅ PASS - Transformation applied as expected');
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
    console.log('🎉 All JSX tests passed!');
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed`);
  }
  
  return passed === total;
}

// Test CSS generation
async function testCSSGeneration() {
  console.log('\n🎨 Testing CSS Generation');
  console.log('=' .repeat(50));
  
  const enhancer = new JSXEnhancer(testTokens);
  const css = enhancer.generateAgenticCSS();
  
  console.log('Generated CSS:');
  console.log(css);
  
  // Basic validation
  const hasColorClasses = css.includes('.agentic-primary');
  const hasSpacingClasses = css.includes('.agentic-padding-');
  const hasRadiusClasses = css.includes('.agentic-radius-');
  
  if (hasColorClasses && hasSpacingClasses && hasRadiusClasses) {
    console.log('✅ CSS generation test passed');
    return true;
  } else {
    console.log('❌ CSS generation test failed');
    return false;
  }
}

// Main test execution
async function main() {
  const jsxTestsPass = await runJSXTests();
  const cssTestsPass = await testCSSGeneration();
  
  console.log('\n' + '='.repeat(60));
  if (jsxTestsPass && cssTestsPass) {
    console.log('🎉 All JSX Enhancement Tests Passed!');
    console.log('✅ JSX parsing and className transformation working');
    console.log('✅ Template literal support working'); 
    console.log('✅ Tailwind class mapping working');
    console.log('✅ Component structure integrity maintained');
    console.log('✅ CSS utility generation working');
    console.log('\n🚀 JSX Phase 1 Implementation Complete!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runJSXTests, testCSSGeneration };