import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export function useAuth({ onSignedIn } = {}) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const onSignedInRef = useCallback(onSignedIn, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_IN' && onSignedInRef) {
        onSignedInRef()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
