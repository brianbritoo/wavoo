'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    (async () => {
      // Intercambia el código del enlace de confirmación por una sesión
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error(error);
        router.replace('/auth?err=callback');
        return;
      }
      // Tras crear sesión, mira si tiene profile.completed
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('completed')
        .eq('id', user.id)
        .single();

      router.replace(profile?.completed ? '/viajes' : '/onboarding');
    })();
  }, [router, sp]);

  return <div className="min-h-dvh flex items-center justify-center">Entrando…</div>;
}
