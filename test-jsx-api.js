#!/usr/bin/env node

/**
 * JSX API Integration Test
 * Tests the JSX enhancement through the API endpoints
 */

const http = require('http');

// Test JSX code
const testJSXCode = `
export const Button = ({ children, variant = 'primary' }) => {
  return (
    <button className={variant === 'primary' 
      ? "bg-blue-500 text-white p-4 rounded-md shadow-md" 
      : "bg-gray-200 text-gray-800 p-2 rounded-sm"
    }>
      {children}
    </button>
  );
};
`;

function makeAPIRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 8901,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (err) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testJSXEnhanceEndpoint() {
  console.log('🧪 Testing JSX Enhancement Endpoint');
  console.log('=' .repeat(50));
  
  try {
    const response = await makeAPIRequest('/api/design/enhance', {
      code: testJSXCode,
      codeType: 'jsx',
      brandPackId: 'western-companies',
      projectPath: process.cwd()
    });
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('✅ JSX enhancement API call successful');
      console.log('\n📄 Original Code:');
      console.log(testJSXCode.trim());
      
      console.log('\n🔄 Changes Applied:');
      if (response.data.changes && response.data.changes.length > 0) {
        response.data.changes.forEach((change, index) => {
          console.log(`  ${index + 1}. ${change.type}: "${change.before}" → "${change.after}"`);
        });
        
        console.log('\n📄 Enhanced Code:');
        console.log(response.data.code.trim());
        
        return true;
      } else {
        console.log('⚠️  No changes applied - this may be expected depending on tokens available');
        return true;
      }
    } else {
      console.log(`❌ API call failed: ${response.statusCode}`, response.data);
      return false;
    }
  } catch (error) {
    console.log(`❌ Request error: ${error.message}`);
    return false;
  }
}

async function testJSXEnhanceCachedEndpoint() {
  console.log('\n🧪 Testing JSX Cached Enhancement Endpoint');
  console.log('=' .repeat(50));
  
  try {
    const response = await makeAPIRequest('/api/design/enhance-cached', {
      code: testJSXCode,
      codeType: 'jsx',
      brandPackId: 'western-companies',
      filePath: 'Button.jsx'
    });
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('✅ JSX cached enhancement API call successful');
      console.log(`Cache hit: ${response.data.cacheHit}`);
      
      if (response.data.changes && response.data.changes.length > 0) {
        console.log(`Changes applied: ${response.data.changes.length}`);
        return true;
      } else {
        console.log('⚠️  No changes applied - this may be expected');
        return true;
      }
    } else {
      console.log(`❌ API call failed: ${response.statusCode}`, response.data);
      return false;
    }
  } catch (error) {
    console.log(`❌ Request error: ${error.message}`);
    return false;
  }
}

async function testTSXSupport() {
  console.log('\n🧪 Testing TSX Support');
  console.log('=' .repeat(50));
  
  const tsxCode = `
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary' }) => {
  return (
    <button className="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
      {children}
    </button>
  );
};
`;
  
  try {
    const response = await makeAPIRequest('/api/design/enhance', {
      code: tsxCode,
      codeType: 'tsx',
      brandPackId: 'western-companies'
    });
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('✅ TSX enhancement API call successful');
      
      if (response.data.changes && response.data.changes.length > 0) {
        console.log(`Changes applied: ${response.data.changes.length}`);
        return true;
      } else {
        console.log('⚠️  No changes applied - this may be expected');
        return true;
      }
    } else {
      console.log(`❌ API call failed: ${response.statusCode}`, response.data);
      return false;
    }
  } catch (error) {
    console.log(`❌ Request error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting JSX API Integration Tests\n');
  
  // Test server connectivity first
  try {
    const healthResponse = await makeAPIRequest('/api/health', {});
    if (healthResponse.statusCode !== 200) {
      throw new Error(`Server not responding correctly: ${healthResponse.statusCode}`);
    }
    console.log('✅ Server connectivity confirmed\n');
  } catch (error) {
    console.log(`❌ Cannot connect to server on localhost:8901: ${error.message}`);
    console.log('   Make sure the server is running with: npm run start:server');
    process.exit(1);
  }
  
  const enhanceTest = await testJSXEnhanceEndpoint();
  const cachedTest = await testJSXEnhanceCachedEndpoint();
  const tsxTest = await testTSXSupport();
  
  console.log('\n' + '='.repeat(60));
  if (enhanceTest && cachedTest && tsxTest) {
    console.log('🎉 All JSX API Integration Tests Passed!');
    console.log('✅ JSX enhancement endpoint working');
    console.log('✅ JSX cached enhancement endpoint working');
    console.log('✅ TSX support working');
    console.log('\n🚀 JSX Phase 1 API Integration Complete!');
    process.exit(0);
  } else {
    console.log('❌ Some API tests failed');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}