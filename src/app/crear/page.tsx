'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Crear() {
  const [form, setForm] = useState({
    titulo:'', destino:'', start_date:'', end_date:'',
    presupuesto_min: '', presupuesto_max: '', tematica:'', plazas_total:'4'
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/auth'; }
    })();
  }, []);

  function set<K extends keyof typeof form>(k:K, v:any){ setForm({...form, [k]:v}); }

  async function crear() {
    setMsg('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMsg('Inicia sesión primero.'); return; }

    const plazas = parseInt(form.plazas_total || '0', 10);
    const { error } = await supabase.from('trips').insert({
      creator_id: user.id,
      titulo: form.titulo,
      destino: form.destino,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      presupuesto_min: form.presupuesto_min ? Number(form.presupuesto_min) : null,
      presupuesto_max: form.presupuesto_max ? Number(form.presupuesto_max) : null,
      tematica: form.tematica || null,
      plazas_total: plazas,
      plazas_disponibles: plazas,
      estado: 'abierto'
    });

    if (error) setMsg('❌ Error al crear: ' + error.message);
    else { setMsg('✅ Viaje creado'); window.location.href = '/explorar'; }
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold text-teal-600">Crear viaje</h1>

      <input className="border rounded px-3 py-2 w-full" placeholder="Título"
             onChange={e=>set('titulo',e.target.value)} />
      <input className="border rounded px-3 py-2 w-full" placeholder="Destino"
             onChange={e=>set('destino',e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        <input type="date" className="border rounded px-3 py-2"
               onChange={e=>set('start_date',e.target.value)} />
        <input type="date" className="border rounded px-3 py-2"
               onChange={e=>set('end_date',e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input type="number" className="border rounded px-3 py-2" placeholder="€ min"
               onChange={e=>set('presupuesto_min',e.target.value)} />
        <input type="number" className="border rounded px-3 py-2" placeholder="€ max"
               onChange={e=>set('presupuesto_max',e.target.value)} />
      </div>

      <input className="border rounded px-3 py-2 w-full" placeholder="Temática (playa/senderismo/festival)"
             onChange={e=>set('tematica',e.target.value)} />
      <input type="number" className="border rounded px-3 py-2 w-full"
             placeholder="Plazas totales" defaultValue={4}
             onChange={e=>set('plazas_total',e.target.value)} />

      <button onClick={crear} className="bg-teal-600 text-white px-4 py-2 rounded">Publicar</button>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
