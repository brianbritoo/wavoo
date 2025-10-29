'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Onboarding() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    name: '',
    surname: '',
    sex: 'other',
    birthdate: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth'); return; }

      const { data: p } = await supabase.from('profiles')
        .select('username,name,surname,sex,birthdate,completed')
        .eq('id', user.id).single();

      if (p?.completed) { router.replace('/viajes'); return; }
      if (p) {
        setForm({
          username: p.username ?? '',
          name: p.name ?? '',
          surname: p.surname ?? '',
          sex: (p.sex ?? 'other') as 'male' | 'female' | 'other',
          birthdate: p.birthdate ?? ''
        });
      }
      setLoading(false);
    })();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth'); return; }

      // username único
      if (form.username) {
        const { data: exists } = await supabase
          .from('profiles').select('id').eq('username', form.username).neq('id', user.id);
        if (exists && exists.length > 0) { setErr('El usuario ya existe'); setSaving(false); return; }
      }

      const { error } = await supabase.from('profiles').update({
        username: form.username || null,
        name: form.name || null,
        surname: form.surname || null,
        sex: form.sex || null,
        birthdate: form.birthdate || null,
        completed: true
      }).eq('id', user.id);

      if (error) throw error;
      router.replace('/viajes');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Cargando…</div>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Crea tu perfil</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Usuario</label>
          <input className="w-full border rounded-lg p-2"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value.trim() })}
            placeholder="tu_usuario" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm">Nombre</label>
            <input className="w-full border rounded-lg p-2"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}/>
          </div>
          <div>
            <label className="block text-sm">Apellidos</label>
            <input className="w-full border rounded-lg p-2"
              value={form.surname}
              onChange={e => setForm({ ...form, surname: e.target.value })}/>
          </div>
        </div>
        <div>
          <label className="block text-sm">Sexo</label>
          <select className="w-full border rounded-lg p-2"
            value={form.sex}
            onChange={e => setForm({ ...form, sex: e.target.value as any })}>
            <option value="male">Hombre</option>
            <option value="female">Mujer</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Fecha de nacimiento</label>
          <input type="date" className="w-full border rounded-lg p-2"
            value={form.birthdate ?? ''}
            onChange={e => setForm({ ...form, birthdate: e.target.value })}/>
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}
        <button disabled={saving}
          className="w-full bg-brand text-white rounded-xl py-3">
          {saving ? 'Guardando…' : 'Continuar'}
        </button>
      </form>
    </div>
  );
}
