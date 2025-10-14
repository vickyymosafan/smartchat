import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json();

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    console.log('🔐 API Route: Processing token refresh');

    // Create a new Supabase client for this request
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Use Supabase client's setSession which handles refresh properly
    const { data, error } = await supabase.auth.setSession({
      access_token: '', // Not needed for refresh
      refresh_token: refresh_token,
    });

    if (error) {
      console.error('❌ API Route: Refresh error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 }
      );
    }

    console.log('✅ API Route: Token refresh successful');
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('❌ API Route: Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
