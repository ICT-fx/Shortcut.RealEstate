import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Refresh session so app_metadata claims in JWT are up to date
    supabase.auth.refreshSession().then(() => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        const isAdmin = user?.app_metadata?.is_admin === true
        if (!isAdmin) {
          navigate('/', { replace: true })
        } else {
          setAllowed(true)
        }
        setChecking(false)
      })
    })
  }, [navigate])

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07070F' }}>
        <div style={{ width: 28, height: 28, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6845EC', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return allowed ? children : null
}
