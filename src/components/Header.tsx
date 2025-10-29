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

  /* OJO: hidden sm:block ⇒ oculto en móvil, visible en ≥640px */
  return (
    <header className="hidden sm:block sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="max-w-6xl mx-auto h-14 px-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src="/wavoo_logo.svg" alt="Wavoo" className="h-8 w-auto" style={{minWidth:120}}/>
        </a>
        <nav className="flex items-center gap-2">
          <a href="/explorar" className="px-3 py-1.5 rounded-md hover:bg-gray-100">Explorar</a>
          <a href="/crear" className="px-3 py-1.5 rounded-md bg-[#14b8a6] text-white hover:opacity-90">Crear viaje</a>
          {email ? (
            <>
              <a href="/perfil" className="hidden md:inline px-3 py-1.5 rounded-md hover:bg-gray-100">{email}</a>
              <button onClick={logout} className="px-3 py-1.5 rounded-md border hover:bg-gray-50">Salir</button>
            </>
          ) : (
            <a href="/auth" className="px-3 py-1.5 rounded-md border hover:bg-gray-50">Entrar</a>
          )}
        </nav>
      </div>
    </header>
  );
}
