import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('🔐 API Route: Processing signup for', email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('❌ API Route: Signup error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 }
      );
    }

    console.log('✅ API Route: Signup successful');
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('❌ API Route: Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
