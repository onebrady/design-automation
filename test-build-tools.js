#!/usr/bin/env node

/**
 * Build Tool Integration Test Suite
 * Tests Vite plugin, Next.js plugin, and Webpack loader functionality
 */

const fs = require('fs');
const path = require('path');

// Import build tool integrations
const { agenticDesignPlugin: vitePlugin } = require('./packages/vite-plugin');
const { withAgenticDesign, enhanceWithNextjs } = require('./packages/nextjs-plugin');
const webpackLoader = require('./packages/webpack-loader');

// Test tokens
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

// Test cases for each build tool
const testCases = [
  {
    name: 'CSS file transformation',
    fileName: 'styles.css',
    code: `.button {
  background-color: #1B3668;
  color: #F8FAFC;
  padding: 16px 24px;
}`,
    expectTransformation: true,
    expectedInOutput: ['var(--color-primary)', 'var(--color-surface)', 'var(--spacing-md)']
  },
  {
    name: 'JSX file with className',
    fileName: 'Component.jsx',
    code: `export default function Button() {
  return <button className="bg-blue-500 text-white p-4">Click me</button>;
}`,
    expectTransformation: true,
    expectedInOutput: ['agentic-primary', 'agentic-padding-md']
  },
  {
    name: 'styled-components CSS-in-JS',
    fileName: 'StyledButton.js',
    code: `import styled from 'styled-components';

const Button = styled.button\`
  background-color: #1B3668;
  color: #F8FAFC;
  padding: 16px 24px;
  border-radius: 8px;
\`;

export default Button;`,
    expectTransformation: true,
    expectedInOutput: ['var(--color-primary)', 'var(--color-surface)', 'var(--spacing-md)']
  },
  {
    name: 'emotion CSS-in-JS',
    fileName: 'EmotionButton.jsx',
    code: `import { css } from '@emotion/css';

const buttonStyle = css\`
  color: #1B3668;
  background: #F8FAFC;
  margin: 8px;
  padding: 16px;
\`;

export default function Button() {
  return <button className={buttonStyle}>Click me</button>;
}`,
    expectTransformation: true,
    expectedInOutput: ['var(--color-primary)', 'var(--color-surface)', 'var(--spacing-sm)']
  },
  {
    name: 'Regular JavaScript (no CSS-in-JS)',
    fileName: 'utils.js',
    code: `export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}`,
    expectTransformation: false,
    expectedInOutput: []
  }
];

// Mock project setup
function setupTestProject() {
  const testDir = path.join(__dirname, 'test-build-tools-temp');
  
  // Clean and create test directory
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
  fs.mkdirSync(testDir, { recursive: true });
  
  // Create .agentic directory with tokens
  const agenticDir = path.join(testDir, '.agentic');
  fs.mkdirSync(agenticDir, { recursive: true });
  fs.writeFileSync(
    path.join(agenticDir, 'brand-pack.lock.json'),
    JSON.stringify({ tokens: testTokens }, null, 2)
  );
  
  // Create package.json
  fs.writeFileSync(
    path.join(testDir, 'package.json'),
    JSON.stringify({
      name: 'test-project',
      version: '1.0.0',
      dependencies: {
        'styled-components': '^5.3.0',
        '@emotion/css': '^11.10.0'
      }
    }, null, 2)
  );
  
  return testDir;
}

// Test Vite plugin
async function testVitePlugin() {
  console.log('\n🧪 Testing Vite Plugin');
  console.log('─'.repeat(40));
  
  const testDir = setupTestProject();
  const plugin = vitePlugin();
  
  // Simulate Vite config resolution
  plugin.configResolved({ root: testDir });
  
  let passed = 0;
  
  for (const testCase of testCases) {
    const filePath = path.join(testDir, testCase.fileName);
    fs.writeFileSync(filePath, testCase.code);
    
    try {
      const result = await plugin.transform(testCase.code, filePath);
      
      if (testCase.expectTransformation) {
        if (result && result.code) {
          // Check if expected strings are in the output
          const hasExpectedContent = testCase.expectedInOutput.every(expected => 
            result.code.includes(expected)
          );
          
          if (hasExpectedContent) {
            console.log(`✅ PASS - ${testCase.name}: Transformation applied correctly`);
            passed++;
          } else {
            console.log(`❌ FAIL - ${testCase.name}: Expected content not found in output`);
            console.log(`   Expected: ${testCase.expectedInOutput.join(', ')}`);
          }
        } else {
          console.log(`❌ FAIL - ${testCase.name}: Expected transformation but none applied`);
        }
      } else {
        if (!result) {
          console.log(`✅ PASS - ${testCase.name}: No transformation applied as expected`);
          passed++;
        } else {
          console.log(`❌ FAIL - ${testCase.name}: Unexpected transformation applied`);
        }
      }
    } catch (error) {
      console.log(`❌ ERROR - ${testCase.name}: ${error.message}`);
    }
  }
  
  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
  
  return { passed, total: testCases.length };
}

// Test Next.js plugin
async function testNextjsPlugin() {
  console.log('\n🧪 Testing Next.js Plugin');
  console.log('─'.repeat(40));
  
  const testDir = setupTestProject();
  let passed = 0;
  
  for (const testCase of testCases) {
    const filePath = path.join(testDir, testCase.fileName);
    
    try {
      const result = await enhanceWithNextjs({
        code: testCase.code,
        filePath: filePath,
        projectRoot: testDir
      });
      
      if (testCase.expectTransformation) {
        if (result.success && result.changes && result.changes.length > 0) {
          const hasExpectedContent = testCase.expectedInOutput.every(expected => 
            result.code.includes(expected)
          );
          
          if (hasExpectedContent) {
            console.log(`✅ PASS - ${testCase.name}: Enhancement applied correctly`);
            passed++;
          } else {
            console.log(`❌ FAIL - ${testCase.name}: Expected content not found in output`);
          }
        } else {
          console.log(`❌ FAIL - ${testCase.name}: Expected enhancement but none applied`);
        }
      } else {
        if (result.skipped || (result.changes && result.changes.length === 0)) {
          console.log(`✅ PASS - ${testCase.name}: No enhancement applied as expected`);
          passed++;
        } else {
          console.log(`❌ FAIL - ${testCase.name}: Unexpected enhancement applied`);
        }
      }
    } catch (error) {
      console.log(`❌ ERROR - ${testCase.name}: ${error.message}`);
    }
  }
  
  // Test withAgenticDesign configuration wrapper
  try {
    const nextConfig = withAgenticDesign({
      experimental: { appDir: true }
    });
    
    if (typeof nextConfig.webpack === 'function') {
      console.log('✅ PASS - withAgenticDesign: Configuration wrapper working');
      passed++;
    } else {
      console.log('❌ FAIL - withAgenticDesign: Configuration wrapper not working');
    }
  } catch (error) {
    console.log(`❌ ERROR - withAgenticDesign: ${error.message}`);
  }
  
  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
  
  return { passed, total: testCases.length + 1 };
}

// Test Webpack loader
async function testWebpackLoader() {
  console.log('\n🧪 Testing Webpack Loader');
  console.log('─'.repeat(40));
  
  const testDir = setupTestProject();
  let passed = 0;
  
  for (const testCase of testCases) {
    const filePath = path.join(testDir, testCase.fileName);
    
    // Mock webpack loader context
    const loaderContext = {
      resourcePath: filePath,
      async: () => (error, result) => {
        return new Promise((resolve) => {
          if (error) resolve({ error });
          else resolve({ result });
        });
      },
      getOptions: () => ({ projectRoot: testDir, development: true })
    };
    
    try {
      // Bind the loader context and call it
      const loaderResult = await new Promise((resolve) => {
        const callback = (error, result) => resolve({ error, result });
        loaderContext.async = () => callback;
        webpackLoader.call(loaderContext, testCase.code);
      });
      
      if (testCase.expectTransformation) {
        if (loaderResult.result && loaderResult.result !== testCase.code) {
          const hasExpectedContent = testCase.expectedInOutput.every(expected => 
            loaderResult.result.includes(expected)
          );
          
          if (hasExpectedContent) {
            console.log(`✅ PASS - ${testCase.name}: Loader transformation applied correctly`);
            passed++;
          } else {
            console.log(`❌ FAIL - ${testCase.name}: Expected content not found in loader output`);
          }
        } else {
          console.log(`❌ FAIL - ${testCase.name}: Expected loader transformation but none applied`);
        }
      } else {
        if (!loaderResult.result || loaderResult.result === testCase.code) {
          console.log(`✅ PASS - ${testCase.name}: No loader transformation applied as expected`);
          passed++;
        } else {
          console.log(`❌ FAIL - ${testCase.name}: Unexpected loader transformation applied`);
        }
      }
    } catch (error) {
      console.log(`❌ ERROR - ${testCase.name}: ${error.message}`);
    }
  }
  
  // Test webpack rule helper
  try {
    const rule = webpackLoader.createAgenticRule({ development: true });
    if (rule.test && rule.use && rule.use[0].loader) {
      console.log('✅ PASS - createAgenticRule: Webpack rule helper working');
      passed++;
    } else {
      console.log('❌ FAIL - createAgenticRule: Webpack rule helper not working');
    }
  } catch (error) {
    console.log(`❌ ERROR - createAgenticRule: ${error.message}`);
  }
  
  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
  
  return { passed, total: testCases.length + 1 };
}

// Main test runner
async function main() {
  console.log('🚀 Starting Build Tool Integration Tests');
  console.log('='.repeat(60));
  
  const viteResults = await testVitePlugin();
  const nextjsResults = await testNextjsPlugin();
  const webpackResults = await testWebpackLoader();
  
  const totalPassed = viteResults.passed + nextjsResults.passed + webpackResults.passed;
  const totalTests = viteResults.total + nextjsResults.total + webpackResults.total;
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Build Tool Integration Results: ${totalPassed}/${totalTests} passed`);
  console.log(`   Vite Plugin: ${viteResults.passed}/${viteResults.total}`);
  console.log(`   Next.js Plugin: ${nextjsResults.passed}/${nextjsResults.total}`);
  console.log(`   Webpack Loader: ${webpackResults.passed}/${webpackResults.total}`);
  
  if (totalPassed === totalTests) {
    console.log('\n🎉 All Build Tool Integration Tests Passed!');
    console.log('✅ Vite plugin supports CSS, JSX, and CSS-in-JS');
    console.log('✅ Next.js plugin provides seamless webpack integration');
    console.log('✅ Webpack loader works with all supported file types');
    console.log('\n🚀 Build Tool Integration Phase 3 Complete!');
    process.exit(0);
  } else {
    console.log(`\n❌ ${totalTests - totalPassed} build tool test(s) failed`);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testVitePlugin, testNextjsPlugin, testWebpackLoader };