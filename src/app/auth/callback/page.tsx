'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // evita prerender de esta página

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error(error);
        router.replace('/auth?err=callback');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('completed')
        .eq('id', user.id)
        .single();

      router.replace(profile?.completed ? '/viajes' : '/onboarding');
    })();
  }, [router]);

  return <div className="min-h-dvh flex items-center justify-center">Entrando…</div>;
}
