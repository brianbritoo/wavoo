'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Phone from '../../components/Phone';

export default function Perfil() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({ name:'', bio:'', avatar_url:'' });

  useEffect(()=>{ (async()=>{
    const { data:{ user } } = await supabase.auth.getUser();
    if(!user) { window.location.href='/auth'; return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!data) await supabase.from('profiles').insert({ id:user.id, name:user.email?.split('@')[0] });
    setProfile({ name: data?.name ?? user.email?.split('@')[0], bio: data?.bio ?? '', avatar_url: data?.avatar_url ?? '' });
    setLoading(false);
  })()},[]);

  async function save() {
    const { data:{ user } } = await supabase.auth.getUser();
    if(!user) return;
    await supabase.from('profiles').update({ name:profile.name, bio:profile.bio, avatar_url:profile.avatar_url }).eq('id', user.id);
    alert('Perfil guardado ✅');
  }

  if (loading) return <div className="p-6">Cargando…</div>;

  const input = "rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]";

  return (
    <Phone>
      <div className="p-6">
        <div className="flex flex-col items-center">
          <img src={profile.avatar_url || 'https://i.pravatar.cc/200'} className="h-28 w-28 rounded-full object-cover border" alt="avatar"/>
          <div className="text-xl font-semibold mt-2">{profile.name}</div>
          <div className="text-gray-500 text-sm">Lector de brújula sharer</div>
        </div>

        <div className="mt-6 space-y-3">
          <input className={input} placeholder="Tu nombre" value={profile.name} onChange={e=>setProfile({...profile, name:e.target.value})}/>
          <input className={input} placeholder="URL del avatar (opcional)" value={profile.avatar_url} onChange={e=>setProfile({...profile, avatar_url:e.target.value})}/>
          <textarea className={input} rows={4} placeholder="Acerca de mí" value={profile.bio} onChange={e=>setProfile({...profile, bio:e.target.value})}/>
          <button onClick={save} className="w-full rounded-xl bg-[#14b8a6] text-white py-3 font-medium hover:opacity-90">Guardar</button>
        </div>
      </div>
    </Phone>
  );
}
