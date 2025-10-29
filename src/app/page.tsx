'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace('/viajes'); // o '/explorar' o la pantalla que quieras de logueados
      } else {
        router.replace('/auth');
      }
      setChecking(false);
    })();
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center text-gray-600">
      {checking ? 'Cargando…' : null}
    </div>
  );
}
