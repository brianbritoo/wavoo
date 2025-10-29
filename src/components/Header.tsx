'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  }

  return (
    <header className="border-b p-3 flex items-center justify-between">
      <a href="/" className="font-bold text-teal-600">Wavoo</a>
      <nav className="flex items-center gap-3">
        <a href="/explorar" className="text-gray-700">Explorar</a>
        <a href="/crear" className="text-gray-700">Crear viaje</a>
        {email ? (
          <>
            <a href="/perfil" className="text-gray-700">{email}</a>
            <button onClick={logout} className="bg-teal-600 text-white px-3 py-1 rounded">Salir</button>
          </>
        ) : (
          <a href="/auth" className="bg-teal-600 text-white px-3 py-1 rounded">Entrar</a>
        )}
      </nav>
    </header>
  );
}
