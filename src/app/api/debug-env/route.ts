import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check environment variables
 * Access at: /api/debug-env
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    env: {
      supabaseUrl: supabaseUrl
        ? `${supabaseUrl.substring(0, 40)}...`
        : '❌ MISSING',
      supabaseKey: supabaseKey
        ? `${supabaseKey.substring(0, 20)}...`
        : '❌ MISSING',
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    },
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
