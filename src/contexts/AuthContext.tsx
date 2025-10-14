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
      .then(({ data: { session } }) => {
        console.log('🔍 Initial session check:', session ? 'Session found' : 'No session');
        setSession(session);
        setUser(session?.user ?? null);
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
      console.log('🔐 Attempting to sign up with Supabase...');
      console.log('📧 Email:', email);
      console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('❌ Supabase signUp error:', error);
        
        // Handle specific error cases
        if (error.message.includes('fetch')) {
          toast.error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
        } else if (error.message.includes('User already registered')) {
          toast.error('Email sudah terdaftar. Silakan login.');
        } else {
          toast.error(error.message);
        }
        return { error };
      }

      console.log('✅ SignUp successful:', data);
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        toast.success('Akun berhasil dibuat! Silakan cek email untuk verifikasi.');
      } else {
        toast.success('Akun berhasil dibuat dan Anda sudah login!');
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('❌ Unexpected error during signUp:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Tidak dapat terhubung ke Supabase. Periksa koneksi internet atau firewall Anda.');
      } else {
        toast.error(`Terjadi kesalahan: ${error.message || 'Unknown error'}`);
      }
      
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting to sign in with Supabase...');
      console.log('📧 Email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Supabase signIn error:', error);
        
        // Handle specific error cases
        if (error.message.includes('fetch')) {
          toast.error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Email atau password salah.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Email belum diverifikasi. Silakan cek email Anda.');
        } else {
          toast.error(error.message);
        }
        return { error };
      }

      console.log('✅ SignIn successful:', data);
      toast.success('Berhasil login!');
      return { error: null };
    } catch (error: any) {
      console.error('❌ Unexpected error during signIn:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Tidak dapat terhubung ke Supabase. Periksa koneksi internet atau firewall Anda.');
      } else {
        toast.error(`Terjadi kesalahan: ${error.message || 'Unknown error'}`);
      }
      
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Berhasil logout');
      }
    } catch (error: any) {
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
