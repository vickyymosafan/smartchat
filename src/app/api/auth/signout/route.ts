import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 API Route: Processing signout');

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ API Route: Signout error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 }
      );
    }

    console.log('✅ API Route: Signout successful');
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('❌ API Route: Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
