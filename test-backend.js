// Test script untuk backend API chat
const API_BASE_URL = 'http://localhost:3000';

// Test cases
const testCases = [
  {
    name: 'Test valid message',
    payload: {
      message: 'Hello, ini adalah test message',
      sessionId: 'test-session-1'
    },
    expectedStatus: 200
  },
  {
    name: 'Test empty message',
    payload: {
      message: '',
      sessionId: 'test-session-2'
    },
    expectedStatus: 400
  },
  {
    name: 'Test missing message',
    payload: {
      sessionId: 'test-session-3'
    },
    expectedStatus: 400
  },
  {
    name: 'Test long message',
    payload: {
      message: 'a'.repeat(1001), // Lebih dari 1000 karakter
      sessionId: 'test-session-4'
    },
    expectedStatus: 400
  },
  {
    name: 'Test GET method (should fail)',
    method: 'GET',
    expectedStatus: 405
  }
];

// Fungsi untuk menjalankan test
async function runTest(testCase) {
  console.log(`\n🧪 Running: ${testCase.name}`);
  
  try {
    const options = {
      method: testCase.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (testCase.payload && (testCase.method || 'POST') === 'POST') {
      options.body = JSON.stringify(testCase.payload);
    }

    const response = await fetch(`${API_BASE_URL}/api/chat`, options);
    const data = await response.json();
    
    console.log(`   Status: ${response.status} (Expected: ${testCase.expectedStatus})`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    if (response.status === testCase.expectedStatus) {
      console.log('   ✅ PASS');
      return true;
    } else {
      console.log('   ❌ FAIL - Status code mismatch');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

// Fungsi utama untuk menjalankan semua test
async function runAllTests() {
  console.log('🚀 Starting Backend API Tests...');
  console.log(`📍 Testing API at: ${API_BASE_URL}/api/chat`);
  
  // Check if server is running
  try {
    const healthCheck = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'GET'
    });
    console.log('✅ Server is running and accessible');
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('   Please run: npm run dev');
    return;
  }

  let passed = 0;
  let total = testCases.length;

  for (const testCase of testCases) {
    const result = await runTest(testCase);
    if (result) passed++;
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Test Results:');
  console.log(`   Passed: ${passed}/${total}`);
  console.log(`   Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the output above.');
  }
}

// Jalankan tests
runAllTests().catch(console.error);