'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // login
  const [idField, setIdField] = useState(''); // email o usuario
  const [password, setPassword] = useState('');
  // signup
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase
          .from('profiles')
          .select('completed')
          .eq('id', user.id)
          .single();
        router.replace(p?.completed ? '/viajes' : '/onboarding');
      }
    })();
  }, [router]);

  // LOGIN: acepta email o usuario
  async function login() {
    setStatus(null);
    try {
      const id = idField.trim();
      let loginEmail = id;

      // Si han puesto "usuario" (sin @), resolvemos su email desde profiles
      if (!id.includes('@')) {
        const { data: prof, error: e1 } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', id)
          .single();

        if (e1 || !prof || !prof.email) {
          throw new Error('Usuario no encontrado o sin email asociado');
        }
        loginEmail = prof.email;
      }

      const { error: errLogin } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });
      if (errLogin) throw errLogin;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se pudo iniciar sesión');

      const { data: p } = await supabase
        .from('profiles')
        .select('completed')
        .eq('id', user.id)
        .single();

      router.replace(p?.completed ? '/viajes' : '/onboarding');
    } catch (e: any) {
      setStatus(e?.message || 'Error de acceso');
    }
  }

  // SIGNUP: email + contraseña (el username lo pedimos luego en onboarding)
  async function signup() {
    setStatus(null);
    try {
      if (!email.includes('@')) throw new Error('Introduce un email válido');
      if (password.length < 6) throw new Error('Contraseña mínima de 6 caracteres');

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;

      setStatus('Te hemos enviado un enlace de confirmación. Revisa tu correo.');
    } catch (e: any) {
      setStatus(e?.message || 'No se pudo registrar');
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex gap-4 mb-6">
        <button
          className={mode === 'login' ? 'font-semibold' : ''}
          onClick={() => setMode('login')}
        >
          Iniciar sesión
        </button>
        <button
          className={mode === 'signup' ? 'font-semibold' : ''}
          onClick={() => setMode('signup')}
        >
          Crear cuenta
        </button>
      </div>

      {mode === 'login' ? (
        <div className="space-y-3">
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Email o usuario"
            value={idField}
            onChange={(e) => setIdField(e.target.value)}
          />
          <input
            className="w-full border rounded-lg p-2"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-brand text-white rounded-xl py-3" onClick={login}>
            Entrar
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {/* El username definitivo lo completamos en /onboarding */}
          <input
            className="w-full border rounded-lg p-2"
            placeholder="(Opcional) Usuario para mostrar"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="w-full border rounded-lg p-2"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-brand text-white rounded-xl py-3" onClick={signup}>
            Crear cuenta
          </button>
        </div>
      )}

      {status && <p className="text-sm mt-3">{status}</p>}
    </div>
  );
}
