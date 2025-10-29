'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/Avatar';

export default function Perfil() {
  const [p, setP] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/auth'; return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setP(data);
    })();
  }, []);

  async function save() {
    setSaving(true);
    await supabase.from('profiles').update({
      name: p.name, surname: p.surname, username: p.username
    }).eq('id', p.id);
    setSaving(false);
  }

  if (!p) return <div className="p-6">Cargando…</div>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Avatar name={p.name} src={p.avatar_url} />
        <div>
          <div className="font-semibold">{p.name ?? 'Sin nombre'}</div>
          <div className="text-sm text-gray-500">@{p.username ?? 'usuario'}</div>
        </div>
      </div>

      <div className="space-y-3">
        <input className="w-full border rounded-lg p-2" placeholder="Nombre"
          value={p.name ?? ''} onChange={e=>setP({...p, name: e.target.value})}/>
        <input className="w-full border rounded-lg p-2" placeholder="Apellidos"
          value={p.surname ?? ''} onChange={e=>setP({...p, surname: e.target.value})}/>
        <input className="w-full border rounded-lg p-2" placeholder="Usuario"
          value={p.username ?? ''} onChange={e=>setP({...p, username: e.target.value})}/>
        <button disabled={saving} onClick={save}
          className="w-full bg-brand text-white rounded-xl py-3">
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
