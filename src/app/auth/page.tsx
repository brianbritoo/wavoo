'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [idField, setIdField] = useState(''); // email o usuario
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // solo en signup
  const [email, setEmail] = useState(''); // solo en signup
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.replace('/viajes');
    })();
  }, [router]);

  async function login() {
    setStatus(null);
    try {
      const id = idField.trim();
      let loginEmail = id;

      if (!id.includes('@')) {
        // Han escrito "usuario". Buscamos su email en profiles.
        const { data, error } = await supabase
          .from('profiles').select('id')
          .eq('username', id).single();
        if (error || !data) throw new Error('Usuario no encontrado');
        // Obtenemos email del auth user
        const { data: prof } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', id)
        .single();
      loginEmail = prof?.email;
      

      const { error: errLogin } = await supabase.auth.signInWithPassword({
        email: loginEmail, password
      });
      if (errLogin) throw errLogin;

      // Ruta según profile.completed
      const { data: { user } } = await supabase.auth.getUser();
      const { data: p } = await supabase.from('profiles').select('completed').eq('id', user!.id).single();
      router.replace(p?.completed ? '/viajes' : '/onboarding');
    } catch (e: any) {
      setStatus(e.message || 'Error de acceso');
    }
  }

  async function signup() {
    setStatus(null);
    try {
      if (!email.includes('@')) throw new Error('Introduce un email válido');
      if (username.trim().length < 3) throw new Error('Usuario mínimo 3 caracteres');

      // Alta de cuenta
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;

      setStatus('Te hemos enviado un enlace de confirmación. Revisa tu correo.');
      // El perfil se crea via trigger; el username lo guardaremos en onboarding
    } catch (e: any) {
      setStatus(e.message || 'No se pudo registrar');
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex gap-4 mb-6">
        <button className={mode==='login'?'font-semibold':''} onClick={()=>setMode('login')}>Iniciar sesión</button>
        <button className={mode==='signup'?'font-semibold':''} onClick={()=>setMode('signup')}>Crear cuenta</button>
      </div>

      {mode === 'login' ? (
        <div className="space-y-3">
          <input className="w-full border rounded-lg p-2"
            placeholder="Email o usuario"
            value={idField} onChange={e=>setIdField(e.target.value)} />
          <input className="w-full border rounded-lg p-2" type="password"
            placeholder="Contraseña"
            value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="w-full bg-brand text-white rounded-xl py-3" onClick={login}>
            Entrar
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input className="w-full border rounded-lg p-2"
            placeholder="Email"
            value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border rounded-lg p-2"
            placeholder="Usuario"
            value={username} onChange={e=>setUsername(e.target.value)} />
          <input className="w-full border rounded-lg p-2" type="password"
            placeholder="Contraseña"
            value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="w-full bg-brand text-white rounded-xl py-3" onClick={signup}>
            Crear cuenta
          </button>
        </div>
      )}

      {status && <p className="text-sm mt-3">{status}</p>}
    </div>
  );
}
