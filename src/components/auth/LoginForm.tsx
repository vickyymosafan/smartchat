'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { testSupabaseConnection } from '@/lib/supabaseTest';

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error' | null>(null);
  const [connectionMessage, setConnectionMessage] = useState('');
  const { signIn, signUp } = useAuth();

  // Test connection on mount
  useEffect(() => {
    const testConnection = async () => {
      setConnectionStatus('checking');
      const result = await testSupabaseConnection();
      
      if (result.success) {
        setConnectionStatus('success');
        setConnectionMessage('Terhubung ke Supabase');
        // Hide success message after 3 seconds
        setTimeout(() => setConnectionStatus(null), 3000);
      } else {
        setConnectionStatus('error');
        setConnectionMessage(result.message);
      }
    };

    testConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">SmartChat</h1>
          <p className="mt-2 text-muted-foreground">
            {isLogin ? 'Masuk ke akun Anda' : 'Buat akun baru'}
          </p>
        </div>

        {/* Connection Status */}
        {connectionStatus && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
              connectionStatus === 'checking'
                ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                : connectionStatus === 'success'
                ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400'
                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
            }`}
          >
            {connectionStatus === 'checking' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memeriksa koneksi...</span>
              </>
            )}
            {connectionStatus === 'success' && (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>{connectionMessage}</span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <AlertCircle className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">Gagal terhubung ke Supabase</div>
                  <div className="mt-1 text-xs whitespace-pre-line">{connectionMessage}</div>
                </div>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? 'Masuk...' : 'Mendaftar...'}
              </>
            ) : (
              <>{isLogin ? 'Masuk' : 'Daftar'}</>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:underline"
            disabled={loading}
          >
            {isLogin
              ? 'Belum punya akun? Daftar'
              : 'Sudah punya akun? Masuk'}
          </button>
        </div>
      </Card>
    </div>
  );
}
