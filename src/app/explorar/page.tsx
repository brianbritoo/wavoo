'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Phone from '../../components/Phone';

type Trip = {
  id: string; titulo: string; destino: string;
  start_date: string | null; end_date: string | null;
  presupuesto_min: number | null; presupuesto_max: number | null;
  tematica: string | null; plazas_disponibles: number;
  cover_url?: string | null;
};

export default function Explorar() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from('trips').select('*').eq('estado','abierto').order('start_date');
    setTrips((data||[]) as Trip[]);
  }

  const filtered = trips.filter(t =>
    (t.titulo + ' ' + t.destino + ' ' + (t.tematica||'')).toLowerCase().includes(q.toLowerCase())
  );

  const cats = [
    { name:'Playa', emoji:'🏖️' },
    { name:'Cultura', emoji:'🏛️' },
    { name:'Guit poll', emoji:'🎉' }, // guiño a tu mock
    { name:'Senderismo', emoji:'🥾' },
  ];

  return (
    <Phone>
      <div className="p-4">
        <div className="text-xl font-semibold mb-3">Explorar</div>

        <input
          className="w-full rounded-xl border px-4 py-2 mb-4"
          placeholder="Buscar destino o temática…"
          value={q} onChange={e=>setQ(e.target.value)}
        />

        <div className="text-sm font-semibold mb-2">Explora por categoría</div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {cats.map(c=>(
            <button key={c.name} className="min-w-[110px] flex-shrink-0 rounded-2xl border px-3 py-2 text-left">
              <div className="text-2xl">{c.emoji}</div>
              <div className="text-sm">{c.name}</div>
            </button>
          ))}
        </div>

        <div className="text-sm font-semibold mb-2">Viajes para ti</div>
        <div className="grid gap-3">
          {filtered.map(t=>(
            <a key={t.id} href={`/viaje/${t.id}`} className="rounded-2xl overflow-hidden border">
              <div className="aspect-[16/9] bg-gray-200"
                   style={{backgroundImage:`url(${t.cover_url || 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200'})`,
                           backgroundSize:'cover', backgroundPosition:'center'}} />
              <div className="p-3">
                <div className="flex justify-between items-center">
                  <div className="font-semibold">{t.titulo}</div>
                  <span className="text-xs text-gray-500">{t.plazas_disponibles} plazas</span>
                </div>
                <div className="text-gray-600 text-sm">{t.destino}</div>
                <div className="text-gray-500 text-xs">
                  {t.start_date} → {t.end_date} · €{t.presupuesto_min ?? '-'}–{t.presupuesto_max ?? '-'}
                </div>
              </div>
            </a>
          ))}
          {filtered.length===0 && <p className="text-gray-500 text-sm">No hay resultados.</p>}
        </div>
      </div>
    </Phone>
  );
}
