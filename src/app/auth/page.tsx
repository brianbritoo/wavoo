'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function sendMagicLink() {
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) setErr(error.message);
    else setSent(true);
  }

  // Si ya está logueado, redirige a explorar
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = '/explorar';
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-3xl font-bold text-teal-600">Wavoo</h1>
        <p className="text-gray-600">Accede con tu correo (te enviaremos un enlace)</p>
        <input
          className="w-full border rounded px-3 py-2"
          type="email"
          placeholder="tucorreo@uv.es"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />
        <button onClick={sendMagicLink} className="w-full bg-teal-600 text-white py-2 rounded">
          Enviar enlace mágico
        </button>
        {sent && <p className="text-teal-700">Enlace enviado ✅ Revisa tu correo y vuelve aquí automáticamente.</p>}
        {err && <p className="text-red-600">{err}</p>}
      </div>
    </div>
  );
}
