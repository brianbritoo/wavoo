'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [message, setMessage] = useState('Conectando a Supabase...')

  useEffect(() => {
    supabase.from('trips').select('*').limit(1)
      .then(({ error }) => {
        if (error) setMessage('❌ Error: ' + error.message)
        else setMessage('✅ Conectado correctamente a Supabase')
      })
  }, [])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <h1 className="text-2xl font-bold text-brand">{message}</h1>
    </div>
  )
}
