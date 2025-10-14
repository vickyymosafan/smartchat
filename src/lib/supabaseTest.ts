/**
 * Supabase Connection Test Utility
 * Untuk verify koneksi ke Supabase dan troubleshooting
 */

import { supabase } from './supabase';

/**
 * Test koneksi ke Supabase
 * Returns true jika koneksi berhasil, false jika gagal
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    console.log('🧪 Testing Supabase connection...');
    console.log('🌐 URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // Test 1: Check if credentials are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return {
        success: false,
        message: 'Supabase credentials tidak ditemukan di environment variables',
      };
    }

    // Test 2: Try to get session (this will test auth endpoint)
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return {
        success: false,
        message: `Gagal terhubung ke Supabase: ${error.message}`,
        details: error,
      };
    }

    console.log('✅ Supabase connection test successful');
    return {
      success: true,
      message: 'Koneksi ke Supabase berhasil!',
      details: data,
    };
  } catch (error: any) {
    console.error('❌ Unexpected error during connection test:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'Tidak dapat terhubung ke Supabase. Kemungkinan penyebab:\n' +
                 '1. Koneksi internet bermasalah\n' +
                 '2. Firewall atau proxy blocking request\n' +
                 '3. Supabase URL salah atau project tidak aktif',
        details: error,
      };
    }

    return {
      success: false,
      message: `Error: ${error.message || 'Unknown error'}`,
      details: error,
    };
  }
}

/**
 * Check apakah database tables sudah dibuat
 */
export async function checkDatabaseSetup(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    console.log('🧪 Checking database setup...');
    
    // Try to query conversations table
    const { data, error } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);
    
    if (error) {
      // Check if error is because table doesn't exist
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database belum di-setup. Silakan jalankan SQL schema di Supabase Dashboard.',
          details: error,
        };
      }
      
      return {
        success: false,
        message: `Database error: ${error.message}`,
        details: error,
      };
    }

    console.log('✅ Database setup verified');
    return {
      success: true,
      message: 'Database sudah di-setup dengan benar!',
      details: data,
    };
  } catch (error: any) {
    console.error('❌ Error checking database setup:', error);
    return {
      success: false,
      message: `Error: ${error.message || 'Unknown error'}`,
      details: error,
    };
  }
}
