/**
 * Supabase Client Configuration
 * Menginisialisasi koneksi ke Supabase untuk authentication dan database
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Detailed logging untuk debugging
if (typeof window !== 'undefined') {
  console.log('🔧 Supabase Configuration Check:');
  console.log('  - URL defined:', !!supabaseUrl);
  console.log('  - Key defined:', !!supabaseAnonKey);
  console.log('  - URL value:', supabaseUrl || 'MISSING');
  console.log('  - Key preview:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MISSING');
  console.log('  - Environment:', process.env.NODE_ENV);
}

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = `
❌ Missing Supabase Environment Variables!

Required variables:
- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ MISSING'}
- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ MISSING'}

${typeof window === 'undefined' ? 
  '🔧 Server-side: Check your .env.local file' : 
  '🔧 Client-side: Check Vercel Environment Variables'
}

For Vercel deployment:
1. Go to Vercel Dashboard > Settings > Environment Variables
2. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Redeploy your application

For local development:
1. Create .env.local file in project root
2. Add the required variables
3. Restart dev server

See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions.
  `.trim();
  
  console.error(errorMessage);
  throw new Error('Missing Supabase environment variables. Check console for details.');
}

/**
 * Supabase client instance
 * Digunakan untuk semua operasi database dan authentication
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'smartchat-auth',
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application-name': 'smartchat',
    },
    fetch: (url, options = {}) => {
      // Log fetch requests for debugging
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG === 'true') {
        console.log('🌐 Supabase fetch:', url);
      }
      return fetch(url, options);
    },
  },
  db: {
    schema: 'public',
  },
});

// Log successful initialization
if (typeof window !== 'undefined') {
  console.log('✅ Supabase client initialized successfully');
}
