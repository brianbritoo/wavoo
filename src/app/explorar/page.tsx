'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Trip = {
  id: string;
  titulo: string;
  destino: string;
  start_date: string | null;
  end_date: string | null;
  presupuesto_min: number | null;
  presupuesto_max: number | null;
  tematica: string | null;
  plazas_disponibles: number;
};

export default function Explorar() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('estado', 'abierto')
      .order('start_date', { ascending: true });
    setTrips((data || []) as Trip[]);
  }

  const filtered = trips.filter(t =>
    (t.titulo + ' ' + t.destino + ' ' + (t.tematica || ''))
      .toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-teal-600">Explorar viajes</h1>

      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Buscar por destino, título o temática…"
        value={q}
        onChange={e=>setQ(e.target.value)}
      />

      <div className="grid gap-4">
        {filtered.map(t => (
          <a key={t.id} href={`/viaje/${t.id}`} className="border rounded p-4 hover:shadow">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">{t.titulo}</h2>
              <span className="text-sm text-gray-500">{t.plazas_disponibles} plazas</span>
            </div>
            <p className="text-gray-600">{t.destino}</p>
            <p className="text-gray-500 text-sm">
              {t.start_date} → {t.end_date}
            </p>
            <p className="text-gray-700">
              €{t.presupuesto_min ?? '-'}–{t.presupuesto_max ?? '-'} · {t.tematica ?? 'general'}
            </p>
          </a>
        ))}
        {filtered.length === 0 && <p className="text-gray-500">No hay viajes que cumplan tu búsqueda.</p>}
      </div>
    </div>
  );
}
