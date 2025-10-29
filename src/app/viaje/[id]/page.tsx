'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TripDetail({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);
    await loadTrip(); await loadMembers(); await loadRequests();
  })(); }, [params.id]);

  async function loadTrip() {
    const { data } = await supabase.from('trips').select('*').eq('id', params.id).single();
    setTrip(data);
  }
  async function loadMembers() {
    const { data } = await supabase.from('trip_members').select('user_id, estado').eq('trip_id', params.id);
    setMembers(data || []);
  }
  async function loadRequests() {
    const { data, error } = await supabase
      .from('trip_members')
      .select(`
        user_id,
        estado,
        profiles: user_id (
          name
        ),
        auth_users: user_id
      `)
      .eq('trip_id', params.id)
      .eq('estado', 'pendiente');

    // Fallback para mostrar email si no hay name: otra consulta del perfil o muestra user_id
    setRequests((data || []).map((r:any) => ({
      user_id: r.user_id,
      estado: r.estado,
      name: r.profiles?.name || r.user_id
    })));
  }


  async function solicitar() {
    setStatus('');
    if (!userId) { setStatus('Inicia sesión primero.'); return; }
    const ya = members.find(m => m.user_id === userId);
    if (ya) { setStatus('Ya has solicitado o eres miembro.'); return; }
    const { error } = await supabase.from('trip_members').insert({ trip_id: params.id, user_id: userId, estado: 'pendiente', rol: 'miembro' });
    if (error) setStatus('❌ ' + error.message);
    else { setStatus('✅ Solicitud enviada'); await loadRequests(); await loadMembers(); }
  }

  async function aceptar(uid: string) {
    if (!trip || userId !== trip.creator_id) return;
    const { error } = await supabase.from('trip_members').update({ estado: 'aceptado' }).eq('trip_id', params.id).eq('user_id', uid);
    if (error) { setStatus('❌ ' + error.message); return; }
    await supabase.from('trips').update({ plazas_disponibles: trip.plazas_disponibles - 1 }).eq('id', params.id);
    setStatus('✅ Solicitud aceptada'); await loadTrip(); await loadRequests(); await loadMembers();
  }

  async function rechazar(uid: string) {
    if (!trip || userId !== trip.creator_id) return;
    const { error } = await supabase.from('trip_members').update({ estado: 'rechazado' }).eq('trip_id', params.id).eq('user_id', uid);
    setStatus(error ? '❌ '+error.message : '❎ Solicitud rechazada'); await loadRequests();
  }

  if (!trip) return <div className="p-6">Cargando…</div>;
  const soyCreador = userId && trip.creator_id === userId;
  const yaSoyAlgo = members.find(m => m.user_id === userId);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{trip.titulo}</h1>
      <p className="text-gray-600">{trip.destino}</p>
      <p className="text-gray-500 text-sm">{trip.start_date} → {trip.end_date}</p>
      <p>Presupuesto: €{trip.presupuesto_min ?? '-'}–{trip.presupuesto_max ?? '-'}</p>
      <p>Plazas disponibles: {trip.plazas_disponibles}</p>

      {!soyCreador && !yaSoyAlgo && (
        <button onClick={solicitar} className="bg-brand text-white px-4 py-2 rounded">Solicitar unirse</button>
      )}
      {yaSoyAlgo && <p className="text-sm text-gray-700">Estado: {yaSoyAlgo.estado}</p>}

      {soyCreador && (
        <div className="border rounded p-4 space-y-2">
          <h2 className="font-semibold">Solicitudes pendientes</h2>
          {requests.length === 0 && <p className="text-gray-500">No hay solicitudes.</p>}
          {requests.map(r => (
            <div key={r.user_id} className="flex items-center justify-between">
              <span>{r.user_id}</span>
              <div className="flex gap-2">
                <button onClick={()=>aceptar(r.user_id)} className="bg-brand text-white px-3 py-1 rounded">Aceptar</button>
                <button onClick={()=>rechazar(r.user_id)} className="bg-gray-300 px-3 py-1 rounded">Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <a className="text-brand underline" href={`/chat/${trip.id}`}>Ir al chat del viaje</a>
      {status && <p className="text-sm">{status}</p>}
    </div>
  );
}

{/* Encabezado */}
<div className="rounded-2xl overflow-hidden border mb-3">
  <div className="aspect-[16/9] bg-gray-200"
       style={{backgroundImage:`url(${trip.cover_url || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200'})`,
               backgroundSize:'cover', backgroundPosition:'center'}}/>
  <div className="p-3">
    <div className="text-lg font-semibold">{trip.titulo}</div>
    <div className="text-gray-600 text-sm">{trip.destino} · {trip.start_date} → {trip.end_date}</div>
    <div className="text-gray-500 text-xs">€{trip.presupuesto_min ?? '-'}–{trip.presupuesto_max ?? '-'} · {trip.tematica ?? 'general'}</div>
  </div>
</div>
