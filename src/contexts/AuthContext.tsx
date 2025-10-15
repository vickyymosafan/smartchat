'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { mapErrorToIndonesian } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        console.log('🔍 Initial session check:', session ? 'Session found' : 'No session');
        
        if (session) {
          setSession(session);
          setUser(session.user);
        } else {
          // No session found - user needs to login manually
          console.log('🔐 No session found - user must login');
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('❌ Error getting initial session:', error);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Auth state changed:', _event, session ? 'Session active' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting to sign up...');
      console.log('📧 Email:', email);
      console.log('🚀 Using API route (server-side)...');
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || 'Signup failed';
        console.error('❌ API Route signup error:', errorMessage);
        
        const friendlyMessage = mapErrorToIndonesian({ message: errorMessage });
        toast.error(friendlyMessage);
        
        return { error: { message: errorMessage } as AuthError };
      }

      console.log('✅ SignUp successful via API route');
      
      // Set session from API response
      if (result.data.session) {
        // IMPORTANT: Set session in Supabase client for RLS to work
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.data.session.access_token,
          refresh_token: result.data.session.refresh_token,
        });

        if (sessionError) {
          console.error('❌ Error setting session in Supabase client:', sessionError);
          toast.error('Gagal membuat sesi. Silakan login kembali.');
          return { error: sessionError };
        }

        // Set session and user in React state
        setSession(result.data.session);
        setUser(result.data.user);
        
        console.log('✅ Session set successfully in Supabase client and React state');
        toast.success('Akun berhasil dibuat dan Anda sudah login!');
      } else if (result.data.user) {
        // Email confirmation required
        toast.success('Akun berhasil dibuat! Silakan cek email untuk verifikasi.');
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('❌ Unexpected error during signUp:', error);
      
      const friendlyMessage = mapErrorToIndonesian(error);
      toast.error(friendlyMessage);
      
      return { error: { message: error.message } as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting to sign in...');
      console.log('📧 Email:', email);
      console.log('🚀 Using API route (server-side)...');
      
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || 'Signin failed';
        console.error('❌ API Route signin error:', errorMessage);
        
        const friendlyMessage = mapErrorToIndonesian({ message: errorMessage });
        toast.error(friendlyMessage);
        
        return { error: { message: errorMessage } as AuthError };
      }

      console.log('✅ SignIn successful via API route');
      
      // Set session from API response
      if (result.data.session) {
        // IMPORTANT: Set session in Supabase client for RLS to work
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.data.session.access_token,
          refresh_token: result.data.session.refresh_token,
        });

        if (sessionError) {
          console.error('❌ Error setting session in Supabase client:', sessionError);
          toast.error('Gagal membuat sesi. Silakan login kembali.');
          return { error: sessionError };
        }

        // Set session and user in React state
        setSession(result.data.session);
        setUser(result.data.user);
        
        console.log('✅ Session set successfully in Supabase client and React state');
        toast.success('Berhasil login!');
      } else {
        toast.error('Gagal membuat sesi. Silakan coba lagi.');
        return { error: { message: 'No session returned' } as AuthError };
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('❌ Unexpected error during signIn:', error);
      
      const friendlyMessage = mapErrorToIndonesian(error);
      toast.error(friendlyMessage);
      
      return { error: { message: error.message } as AuthError };
    }
  };

  const signOut = async () => {
    try {
      console.log('🔐 Attempting to sign out...');
      console.log('🚀 Using API route (server-side)...');
      
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ API Route signout error:', result.error);
        toast.error(result.error || 'Gagal logout');
        return;
      }

      console.log('✅ SignOut successful via API route');
      
      // Clear local session
      await supabase.auth.signOut();
      
      // Clear state
      setSession(null);
      setUser(null);
      
      toast.success('Berhasil logout');
    } catch (error: any) {
      console.error('❌ Unexpected error during signOut:', error);
      toast.error('Terjadi kesalahan saat logout');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
