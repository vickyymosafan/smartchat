/**
 * Test Script - Supabase Sign Up
 * Test backend Supabase untuk membuat akun baru
 */

const SUPABASE_URL = 'https://yzpjlmdbothjshwpzqxr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cGpsbWRib3RoanNod3B6cXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjQ0OTIsImV4cCI6MjA3NTYwMDQ5Mn0.YbbFsCDCL3ePGPkhTcyAEJKtc1nOmJUFd-iAu7O0Wo4';

// Generate random email untuk testing
const randomEmail = `test${Date.now()}@example.com`;
const testPassword = 'test123456';

console.log('🧪 Testing Supabase Sign Up Backend...\n');
console.log('📧 Test Email:', randomEmail);
console.log('🔑 Test Password:', testPassword);
console.log('🌐 Supabase URL:', SUPABASE_URL);
console.log('\n' + '='.repeat(60) + '\n');

async function testSignUp() {
  try {
    console.log('1️⃣ Testing connection to Supabase...');
    
    // Test 1: Health check
    const healthResponse = await fetch(`${SUPABASE_URL}/auth/v1/health`);
    console.log('   Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      console.log('   ✅ Supabase is reachable\n');
    } else {
      console.log('   ❌ Supabase health check failed\n');
      return;
    }

    // Test 2: Sign up
    console.log('2️⃣ Testing sign up endpoint...');
    console.log('   POST', `${SUPABASE_URL}/auth/v1/signup`);
    
    const signUpResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: randomEmail,
        password: testPassword,
      }),
    });

    console.log('   Response status:', signUpResponse.status);
    console.log('   Response status text:', signUpResponse.statusText);

    const data = await signUpResponse.json();
    
    if (signUpResponse.ok) {
      console.log('   ✅ Sign up successful!\n');
      console.log('📊 Response Data:');
      console.log('   User ID:', data.user?.id);
      console.log('   Email:', data.user?.email);
      console.log('   Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No (confirmation required)');
      console.log('   Session:', data.session ? 'Created' : 'Not created (email confirmation required)');
      
      if (data.session) {
        console.log('   Access Token:', data.session.access_token.substring(0, 20) + '...');
      }
      
      console.log('\n✅ Backend test PASSED!');
      console.log('\n💡 Notes:');
      console.log('   - If email confirmation is required, check your email');
      console.log('   - Or disable email confirmation in Supabase Dashboard');
      console.log('   - Dashboard > Authentication > Settings > Email Auth');
      
    } else {
      console.log('   ❌ Sign up failed!\n');
      console.log('📊 Error Response:');
      console.log(JSON.stringify(data, null, 2));
      
      console.log('\n❌ Backend test FAILED!');
      console.log('\n🔧 Possible issues:');
      console.log('   1. Invalid API key');
      console.log('   2. Supabase project paused');
      console.log('   3. Email already registered');
      console.log('   4. Network/firewall issue');
    }

  } catch (error) {
    console.log('   ❌ Request failed!\n');
    console.log('📊 Error Details:');
    console.log('   Error name:', error.name);
    console.log('   Error message:', error.message);
    
    console.log('\n❌ Backend test FAILED!');
    console.log('\n🔧 Possible issues:');
    console.log('   1. Cannot reach Supabase URL');
    console.log('   2. Network/firewall blocking request');
    console.log('   3. Invalid Supabase URL');
    console.log('   4. CORS issue (if running in browser)');
  }
}

// Test 3: Check database tables (optional)
async function testDatabaseAccess() {
  console.log('\n' + '='.repeat(60) + '\n');
  console.log('3️⃣ Testing database access...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/conversations?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log('   Response status:', response.status);
    
    if (response.status === 200) {
      console.log('   ✅ Database tables accessible');
      console.log('   ✅ SQL schema has been run');
    } else if (response.status === 401) {
      console.log('   ⚠️  Unauthorized (expected - need to be logged in)');
      console.log('   ✅ But database is accessible');
    } else if (response.status === 404) {
      console.log('   ❌ Table not found');
      console.log('   ⚠️  SQL schema has NOT been run yet!');
      console.log('   📝 Run supabase-schema.sql in Supabase Dashboard');
    } else {
      const data = await response.json();
      console.log('   Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Database access failed');
    console.log('   Error:', error.message);
  }
}

// Run tests
console.log('🚀 Starting backend tests...\n');
testSignUp()
  .then(() => testDatabaseAccess())
  .then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ All tests completed!');
    console.log('\nNext steps:');
    console.log('1. If sign up successful, try logging in with the test account');
    console.log('2. If email confirmation required, disable it in Supabase Dashboard');
    console.log('3. If database tables not found, run supabase-schema.sql');
    console.log('4. Test the frontend application');
  })
  .catch(error => {
    console.error('\n❌ Test suite failed:', error);
  });
