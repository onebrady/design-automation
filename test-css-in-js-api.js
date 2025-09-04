#!/usr/bin/env node

/**
 * CSS-in-JS API Integration Test
 * Tests the API endpoints for CSS-in-JS transformation
 */

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

// Test cases for API
const testCases = [
  {
    name: 'styled-components API test',
    payload: {
      code: `const Button = styled.button\`
  background-color: #1B3668;
  color: #F8FAFC;
  padding: 16px 24px;
\`;`,
      codeType: 'js',
      tokens: testTokens
    },
    expectTransformation: true
  },
  {
    name: 'emotion css API test',
    payload: {
      code: `const style = css\`
  color: #1B3668;
  background: #F8FAFC;
  margin: 8px;
\`;`,
      codeType: 'js',
      tokens: testTokens
    },
    expectTransformation: true
  },
  {
    name: 'Regular JavaScript (no CSS-in-JS)',
    payload: {
      code: `function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}`,
      codeType: 'js',
      tokens: testTokens
    },
    expectTransformation: false
  }
];

async function testAPIEndpoint(endpoint, testCase) {
  try {
    const response = await fetch(`http://localhost:8901/api/design/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(`API request failed: ${error.message}`);
  }
}

async function runAPITests() {
  console.log('🧪 Testing CSS-in-JS API Integration');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let total = testCases.length * 2; // Test both endpoints
  
  for (const [index, testCase] of testCases.entries()) {
    console.log(`\n📝 Test ${index + 1}: ${testCase.name}`);
    console.log('─'.repeat(40));
    
    // Test /enhance endpoint
    console.log('🔄 Testing /enhance endpoint...');
    try {
      const result = await testAPIEndpoint('enhance', testCase);
      
      if (result.success) {
        const hasChanges = result.changes && result.changes.length > 0;
        
        if (testCase.expectTransformation) {
          if (hasChanges) {
            console.log('✅ PASS - /enhance: Transformation applied as expected');
            console.log(`   Changes: ${result.changes.length}`);
            passed++;
          } else {
            console.log('❌ FAIL - /enhance: Expected transformation but none applied');
          }
        } else {
          if (!hasChanges) {
            console.log('✅ PASS - /enhance: No transformation applied as expected');
            passed++;
          } else {
            console.log('❌ FAIL - /enhance: Unexpected transformation applied');
          }
        }
      } else {
        console.log(`❌ FAIL - /enhance: API error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ERROR - /enhance: ${error.message}`);
    }
    
    // Test /enhance-cached endpoint
    console.log('🔄 Testing /enhance-cached endpoint...');
    try {
      const result = await testAPIEndpoint('enhance-cached', testCase);
      
      if (result.success) {
        const hasChanges = result.changes && result.changes.length > 0;
        
        if (testCase.expectTransformation) {
          if (hasChanges) {
            console.log('✅ PASS - /enhance-cached: Transformation applied as expected');
            console.log(`   Changes: ${result.changes.length}`);
            passed++;
          } else {
            console.log('❌ FAIL - /enhance-cached: Expected transformation but none applied');
          }
        } else {
          if (!hasChanges) {
            console.log('✅ PASS - /enhance-cached: No transformation applied as expected');
            passed++;
          } else {
            console.log('❌ FAIL - /enhance-cached: Unexpected transformation applied');
          }
        }
      } else {
        console.log(`❌ FAIL - /enhance-cached: API error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ERROR - /enhance-cached: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 API Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All CSS-in-JS API tests passed!');
    console.log('✅ Both /enhance and /enhance-cached endpoints working');
    console.log('✅ CSS-in-JS transformation integrated successfully');
    return true;
  } else {
    console.log(`⚠️  ${total - passed} API test(s) failed`);
    return false;
  }
}

// Check server availability first
async function checkServerHealth() {
  try {
    const response = await fetch('http://localhost:8901/api/health');
    if (response.ok) {
      console.log('✅ API server is running on port 8901');
      return true;
    } else {
      throw new Error(`Server responded with ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ API server not available: ${error.message}`);
    console.log('   Please start the server with: npm run start:server');
    return false;
  }
}

// Main test execution
async function main() {
  console.log('🚀 Starting CSS-in-JS API Integration Tests\n');
  
  // Check if server is running
  const serverAvailable = await checkServerHealth();
  if (!serverAvailable) {
    process.exit(1);
  }
  
  // Run API tests
  const success = await runAPITests();
  
  if (success) {
    console.log('\n🎉 CSS-in-JS API Integration Complete!');
    process.exit(0);
  } else {
    console.log('\n❌ CSS-in-JS API Integration Tests Failed');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runAPITests, checkServerHealth };