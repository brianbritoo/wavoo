'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

type Trip = {
  id: string;
  titulo: string;
  destino?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  presupuesto_min?: number | null;
  presupuesto_max?: number | null;
  plazas_disponibles?: number | null;
  tematica?: string | null;
  cover_url?: string | null;
  creator_id?: string | null;
};

export default function TripDetail({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      await Promise.all([loadTrip(), loadMembers(), loadRequests()]);
    })();
  }, [params.id]);

  async function loadTrip() {
    const { data } = await supabase.from('trips').select('*').eq('id', params.id).single();
    setTrip((data as Trip) ?? null);
  }
  async function loadMembers() {
    const { data } = await supabase.from('trip_members').select('user_id, estado').eq('trip_id', params.id);
    setMembers(data || []);
  }
  async function loadRequests() {
    const { data } = await supabase
      .from('trip_members')
      .select(`user_id, estado, profiles: user_id ( name )`)
      .eq('trip_id', params.id)
      .eq('estado', 'pendiente');
    setRequests((data || []).map((r: any) => ({ user_id: r.user_id, estado: r.estado, name: r.profiles?.name || r.user_id })));
  }

  const yaSoyAlgo = useMemo(() => members.find(m => m.user_id === userId), [members, userId]);
  const soyCreador = !!userId && trip?.creator_id === userId;

  async function solicitar() {
    setStatus('');
    if (!userId) { setStatus('Inicia sesión primero.'); return; }
    if (yaSoyAlgo) { setStatus('Ya has solicitado o eres miembro.'); return; }
    const { error } = await supabase.from('trip_members').insert({ trip_id: params.id, user_id: userId, estado: 'pendiente', rol: 'miembro' });
    if (error) setStatus('❌ ' + error.message);
    else { setStatus('✅ Solicitud enviada'); await Promise.all([loadRequests(), loadMembers()]); }
  }

  async function aceptar(uid: string) {
    if (!trip || userId !== trip.creator_id) return;
    const { error } = await supabase.from('trip_members').update({ estado: 'aceptado' }).eq('trip_id', params.id).eq('user_id', uid);
    if (error) { setStatus('❌ ' + error.message); return; }
    await supabase.from('trips').update({ plazas_disponibles: (trip.plazas_disponibles ?? 0) - 1 }).eq('id', params.id);
    setStatus('✅ Solicitud aceptada');
    await Promise.all([loadTrip(), loadRequests(), loadMembers()]);
  }

  async function rechazar(uid: string) {
    if (!trip || userId !== trip.creator_id) return;
    const { error } = await supabase.from('trip_members').update({ estado: 'rechazado' }).eq('trip_id', params.id).eq('user_id', uid);
    setStatus(error ? '❌ ' + error.message : '❎ Solicitud rechazada');
    await loadRequests();
  }

  if (!trip) {
    return (
      <div className="max-w-screen-md mx-auto p-4">
        {/* skeleton simple para mobile */}
        <div className="rounded-2xl overflow-hidden border mb-3 bg-gray-200 animate-pulse h-48" />
        <div className="space-y-2">
          <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const portada = trip.cover_url ?? 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200';
  const showCTA = !soyCreador && !yaSoyAlgo;

  return (
    <div className="max-w-screen-md mx-auto pb-[88px] p-4 sm:p-6">
      {/* Encabezado responsive */}
      <div className="rounded-2xl overflow-hidden border mb-3">
        <div className="relative w-full aspect-[16/9]">
          <Image
            src={portada}
            alt={trip.titulo}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-cover"
          />
          {/* degradado para legibilidad en móvil */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        <div className="p-3">
          <h1 className="text-xl sm:text-2xl font-semibold leading-tight">{trip.titulo}</h1>
          <div className="text-gray-600 text-sm sm:text-base mt-1">
            {trip.destino ?? 'Destino por definir'} · {trip.start_date} → {trip.end_date}
          </div>
          <div className="text-gray-500 text-xs sm:text-sm mt-1">
            €{trip.presupuesto_min ?? '-'}–{trip.presupuesto_max ?? '-'} · {trip.tematica ?? 'general'}
          </div>
        </div>
      </div>

      {/* Datos clave en tarjetas compactas para móvil */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2">
        <div className="rounded-xl border p-3">
          <div className="text-xs text-gray-500">Plazas</div>
          <div className="text-lg font-semibold">{trip.plazas_disponibles ?? 0}</div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-xs text-gray-500">Presupuesto</div>
          <div className="text-lg font-semibold">€{trip.presupuesto_min ?? '-'}–{trip.presupuesto_max ?? '-'}</div>
        </div>
      </div>

      {/* Estado/acciones */}
      {yaSoyAlgo && <p className="text-sm text-gray-700">Estado: {yaSoyAlgo.estado}</p>}

      {soyCreador && (
        <div className="border rounded-xl p-4 space-y-3 mt-2">
          <h2 className="font-semibold text-base">Solicitudes pendientes</h2>
          {requests.length === 0 && <p className="text-gray-500 text-sm">No hay solicitudes.</p>}
          {requests.map(r => (
            <div key={r.user_id} className="flex items-center justify-between gap-2">
              <span className="text-sm truncate">{r.name}</span>
              <div className="flex gap-2">
                <button onClick={() => aceptar(r.user_id)} className="bg-brand text-white px-3 py-1.5 rounded-lg text-sm">Aceptar</button>
                <button onClick={() => rechazar(r.user_id)} className="bg-gray-200 px-3 py-1.5 rounded-lg text-sm">Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3">
        <a className="text-brand underline text-sm sm:text-base" href={`/chat/${trip.id}`}>Ir al chat del viaje</a>
        {status && <p className="text-sm mt-2">{status}</p>}
      </div>

      {/* CTA fijo inferior para móvil */}
      {showCTA && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 backdrop-blur supports-[padding:max(0px)]:pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-screen-md mx-auto p-3">
            <button
              onClick={solicitar}
              className="w-full bg-brand text-white py-3 rounded-xl text-base font-medium shadow"
            >
              Solicitar unirse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
