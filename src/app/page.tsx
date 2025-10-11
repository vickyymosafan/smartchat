import ChatInterfaceWrapper from '@/components/ChatInterfaceWrapper';

/**
 * Home page - Entry point aplikasi chat
 *
 * Menggunakan ChatInterfaceWrapper untuk conditional rendering
 * antara UI lama dan UI baru berdasarkan feature flag
 */
export default function Home() {
  return <ChatInterfaceWrapper />;
}
