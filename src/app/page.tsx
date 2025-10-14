'use client';

import { ChatShell } from '@/components/chat/ChatShell';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * Home page - Entry point aplikasi chat
 *
 * Menggunakan ChatShell (NEW UI) dengan redesign modern
 * Dengan authentication guard
 */
export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <ChatShell />;
}
