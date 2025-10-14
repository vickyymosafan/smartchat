/**
 * Direct Sign Up Test
 * Test langsung ke sign up endpoint
 */

const SUPABASE_URL = 'https://yzpjlmdbothjshwpzqxr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cGpsbWRib3RoanNod3B6cXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjQ0OTIsImV4cCI6MjA3NTYwMDQ5Mn0.YbbFsCDCL3ePGPkhTcyAEJKtc1nOmJUFd-iAu7O0Wo4';

const randomEmail = `test${Date.now()}@example.com`;
const testPassword = 'test123456';

console.log('🧪 Direct Sign Up Test\n');
console.log('📧 Email:', randomEmail);
console.log('🔑 Password:', testPassword);
console.log('\n' + '='.repeat(60) + '\n');

async function testSignUp() {
  try {
    console.log('📤 Sending sign up request...\n');
    
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email: randomEmail,
        password: testPassword,
      }),
    });

    console.log('📥 Response received:');
    console.log('   Status:', response.status, response.statusText);
    console.log('   Headers:');
    response.headers.forEach((value, key) => {
      console.log(`     ${key}: ${value}`);
    });
    
    console.log('\n📊 Response Body:');
    const text = await response.text();
    console.log(text);
    
    try {
      const data = JSON.parse(text);
      console.log('\n📋 Parsed Data:');
      console.log(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        console.log('\n✅ SIGN UP SUCCESSFUL!');
        console.log('\n👤 User Info:');
        console.log('   ID:', data.user?.id);
        console.log('   Email:', data.user?.email);
        console.log('   Created:', data.user?.created_at);
        console.log('   Email Confirmed:', data.user?.email_confirmed_at || 'Not yet');
        
        if (data.session) {
          console.log('\n🔐 Session Info:');
          console.log('   Access Token:', data.session.access_token.substring(0, 30) + '...');
          console.log('   Refresh Token:', data.session.refresh_token.substring(0, 30) + '...');
          console.log('   Expires In:', data.session.expires_in, 'seconds');
        } else {
          console.log('\n⚠️  No session created (email confirmation required)');
        }
        
      } else {
        console.log('\n❌ SIGN UP FAILED!');
        console.log('\n🔧 Error Details:');
        console.log('   Message:', data.message || data.msg || data.error_description);
        console.log('   Code:', data.code || data.error);
      }
      
    } catch (parseError) {
      console.log('\n⚠️  Could not parse response as JSON');
      console.log('   Raw response:', text);
    }
    
  } catch (error) {
    console.log('\n❌ REQUEST FAILED!');
    console.log('\n🔧 Error Details:');
    console.log('   Name:', error.name);
    console.log('   Message:', error.message);
    console.log('   Stack:', error.stack);
    
    if (error.cause) {
      console.log('   Cause:', error.cause);
    }
  }
}

testSignUp().then(() => {
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Test completed!');
});
