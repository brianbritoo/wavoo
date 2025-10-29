'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Phone from '@/components/Phone';

export default function Chat({ params }:{ params:{ tripId:string }}) {
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data:{ user } } = await supabase.auth.getUser();
      if (!user) { window.location.href='/auth'; return; }
      setUserId(user.id);

      const { data: m } = await supabase
        .from('trip_members').select('estado')
        .eq('trip_id', params.tripId).eq('user_id', user.id).single();

      if (!m || m.estado !== 'aceptado') { setAllowed(false); return; }
      setAllowed(true);

      const { data } = await supabase
        .from('messages').select('*').eq('trip_id', params.tripId)
        .order('created_at', { ascending: true });
      setMsgs(data || []);

      const ch = supabase.channel(`chat:${params.tripId}`)
        .on('postgres_changes',
          { event:'INSERT', schema:'public', table:'messages', filter:`trip_id=eq.${params.tripId}` },
          (payload)=> setMsgs(prev=>[...prev, payload.new as any])
        ).subscribe();

      return ()=> { supabase.removeChannel(ch); };
    })();
  }, [params.tripId]);

  async function send() {
    if (!text.trim() || !userId) return;
    await supabase.from('messages').insert({ trip_id: params.tripId, user_id: userId, body: text.trim() });
    setText('');
  }

  if (allowed === null) return <div className="p-6">Cargando…</div>;
  if (allowed === false) return <Phone><div className="p-6 text-red-600">No tienes acceso a este chat.</div></Phone>;

  return (
    <Phone>
      <div className="p-3 flex flex-col h-[680px]">
        <div className="flex-1 space-y-2 overflow-y-auto">
          {msgs.map((m:any)=>(
            <div key={m.id} className={`max-w-[80%] px-3 py-2 rounded-2xl ${m.user_id===userId ? 'ml-auto bg-[#14b8a6] text-white rounded-br-sm':'bg-gray-100 rounded-bl-sm'}`}>
              {m.body}
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input className="flex-1 rounded-xl border px-3 py-2" value={text} onChange={e=>setText(e.target.value)} placeholder="Escribe un mensaje…" />
          <button onClick={send} className="rounded-xl bg-[#14b8a6] text-white px-4">Enviar</button>
        </div>
      </div>
    </Phone>
  );
}
