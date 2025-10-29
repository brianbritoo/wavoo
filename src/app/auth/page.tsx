'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Phone from '../../components/Phone';


export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = '/explorar';
    });
  }, []);

  async function sendMagic() {
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) setErr(error.message); else setSent(true);
  }

  return (
    <main className="min-h-dvh bg-white flex flex-col">
      {/* Cabecera turquesa con curva inferior y logo */}
      <div className="relative w-full">
        <div className="h-40 bg-[#14b8a6] rounded-b-[2rem] w-full" />
        <div className="absolute top-8 left-0 right-0 flex items-center justify-center">
          <img
            src="/wavoo_logo.svg"
            alt="Wavoo"
            className="h-10 w-auto"
            style={{ filter: 'brightness(0) invert(1)' }} /* convierte el logo a blanco */
          />
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 px-6 py-6 max-w-md w-full mx-auto">
        <h1 className="text-3xl font-bold text-[#14b8a6]">Iniciar sesión</h1>
        <p className="mt-1 text-gray-600">Accede con tu correo (te enviaremos un enlace)</p>

        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tucorreo@uv.es"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          className="mt-6 w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
        />

        <button
          onClick={sendMagic}
          className="mt-4 w-full rounded-xl bg-[#14b8a6] text-white py-3 text-base font-medium active:scale-[.99]">
          Continuar
        </button>

        <p className="mt-3 text-sm text-gray-500">
          {sent ? 'Enlace enviado ✅ Revisa tu correo' : (err ? 'Error: ' + err : '¿No tienes una cuenta? Regístrate al entrar')}
        </p>
      </div>
    </main>
  );
}
