import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { PAID_STATUSES } from '../../lib/constants'

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'allowed' | 'denied'

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setStatus('denied'); return }

      const { data: orders } = await supabase
        .from('orders')
        .select('status')
        .in('status', PAID_STATUSES)
        .limit(1)

      setStatus(orders && orders.length > 0 ? 'allowed' : 'denied')
    }
    check()
  }, [])

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid rgba(104,69,236,0.15)',
          borderTop: '3px solid #6845EC',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (status === 'denied') return <Navigate to="/" replace />

  return children
}
