'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Phone from '../../components/Phone';

export default function Crear() {
  const [form, setForm] = useState({
    titulo:'', destino:'', start_date:'', end_date:'',
    presupuesto_min:'', presupuesto_max:'', tematica:'Cultural',
    plazas_total:'4', cover_url:''
  });
  const [msg, setMsg] = useState('');

  useEffect(()=>{ (async()=>{
    const { data:{ user } } = await supabase.auth.getUser();
    if(!user) window.location.href='/auth';
  })()},[]);

  function set<K extends keyof typeof form>(k:K, v:any){ setForm({...form,[k]:v}); }

  async function crear() {
    setMsg('');
    const { data:{ user } } = await supabase.auth.getUser();
    if(!user) return setMsg('Inicia sesión');

    const plazas = parseInt(form.plazas_total||'0',10);
    const { error } = await supabase.from('trips').insert({
      creator_id:user.id, titulo:form.titulo, destino:form.destino,
      start_date:form.start_date||null, end_date:form.end_date||null,
      presupuesto_min: form.presupuesto_min? Number(form.presupuesto_min):null,
      presupuesto_max: form.presupuesto_max? Number(form.presupuesto_max):null,
      tematica:form.tematica, plazas_total:plazas, plazas_disponibles:plazas,
      estado:'abierto', cover_url: form.cover_url || null
    });
    if(error) setMsg('❌ '+error.message);
    else { setMsg('✅ Publicado'); window.location.href='/explorar'; }
  }

  const input = "rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]";

  return (
    <Phone>
      <div className="p-4">
        <div className="text-xl font-semibold mb-4">Crear un viaje</div>
        <div className="space-y-3">
          <input className={input} placeholder="Título" onChange={e=>set('titulo',e.target.value)} />
          <input className={input} placeholder="Destino" onChange={e=>set('destino',e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className={input} type="date" onChange={e=>set('start_date',e.target.value)} />
            <input className={input} type="date" onChange={e=>set('end_date',e.target.value)} />
          </div>
          <select className={input} value={form.tematica} onChange={e=>set('tematica',e.target.value)}>
            <option>Cultural</option><option>Playa</option><option>Fiesta</option><option>Senderismo</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input className={input} type="number" placeholder="€ mínimo" onChange={e=>set('presupuesto_min',e.target.value)} />
            <input className={input} type="number" placeholder="€ máximo" onChange={e=>set('presupuesto_max',e.target.value)} />
          </div>
          <input className={input} type="number" placeholder="Plazas" defaultValue={4} onChange={e=>set('plazas_total',e.target.value)} />
          <input className={input} placeholder="Imagen (URL opcional)" onChange={e=>set('cover_url',e.target.value)} />
        </div>

        <button onClick={crear} className="mt-4 w-full rounded-xl bg-[#14b8a6] text-white py-3 font-medium hover:opacity-90">
          Crear
        </button>
        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </div>
    </Phone>
  );
}
