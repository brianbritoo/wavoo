'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Chat({ params }:{ params:{ tripId:string }}) {
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/auth'; return; }
      setUserId(user.id);

      // ¿es miembro aceptado?
      const { data: m } = await supabase
        .from('trip_members')
        .select('estado')
        .eq('trip_id', params.tripId)
        .eq('user_id', user.id)
        .single();

      if (!m || m.estado !== 'aceptado') { setAllowed(false); return; }
      setAllowed(true);

      // carga mensajes
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('trip_id', params.tripId)
        .order('created_at', { ascending: true });
      setMsgs(data || []);

      // suscripción realtime
      const ch = supabase.channel(`chat:${params.tripId}`)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `trip_id=eq.${params.tripId}` },
          (payload) => setMsgs(m => [...m, payload.new as any])
        )
        .subscribe();

      return () => { supabase.removeChannel(ch); };
    })();
  }, [params.tripId]);

  async function send() {
    if (!text.trim() || !userId) return;
    await supabase.from('messages').insert({ trip_id: params.tripId, user_id: userId, body: text.trim() });
    setText('');
  }

  if (allowed === null) return <div className="p-6">Cargando…</div>;
  if (allowed === false) return <div className="p-6 text-red-600">No tienes acceso a este chat (debes ser miembro aceptado).</div>;

  return (
    <div className="max-w-lg mx-auto p-6 flex flex-col gap-3 h-[80vh]">
      <h1 className="text-xl font-bold">Chat del viaje</h1>
      <div className="flex-1 overflow-y-auto space-y-2">
        {msgs.map((m:any)=> (
          <div key={m.id} className={`p-2 rounded ${m.user_id===userId?'bg-teal-100 self-end':'bg-gray-100'}`}>
            {m.body}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 border rounded px-3 py-2" value={text}
               onChange={e=>setText(e.target.value)} placeholder="Escribe…" />
        <button onClick={send} className="bg-teal-600 text-white px-4 py-2 rounded">Enviar</button>
      </div>
    </div>
  );
}
