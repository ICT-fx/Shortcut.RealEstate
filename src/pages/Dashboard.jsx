import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { STATUS_COLORS, OFFER_COLORS } from '../lib/constants'
import { LogOut, ArrowRight } from 'lucide-react'

const fmt = (dateStr) => new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: ordersData }, { data: profileData }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
      ])
      setOrders(ordersData ?? [])
      setProfile(profileData)
    }
    load()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        padding: '0 24px',
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#111827', letterSpacing: '-0.04em' }}>
          shortcut<span style={{ color: '#6845EC' }}>.</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '0.85rem', color: 'rgba(17,24,39,0.45)', letterSpacing: '-0.02em' }}>
            {profile?.full_name}
          </span>
          <button
            onClick={signOut}
            style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'rgba(17,24,39,0.5)', letterSpacing: '-0.02em', fontFamily: 'DM Sans, sans-serif' }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.04em', marginBottom: 6 }}>
          Welcome back, {firstName}
        </h1>
        <p style={{ color: 'rgba(17,24,39,0.45)', fontSize: '0.9rem', letterSpacing: '-0.02em', marginBottom: 32 }}>
          Here are your active projects.
        </p>

        {/* Loading */}
        {orders === null && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <div style={{ width: 28, height: 28, border: '3px solid rgba(104,69,236,0.15)', borderTop: '3px solid #6845EC', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Empty */}
        {orders !== null && orders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'rgba(17,24,39,0.4)', fontSize: '0.9rem', letterSpacing: '-0.02em' }}>
            No active projects yet.
          </div>
        )}

        {/* Order cards */}
        {orders !== null && orders.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {orders.map(order => {
              const statusColor = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending
              const offerColor = OFFER_COLORS[order.offer] ?? '#6B7280'
              return (
                <div
                  key={order.id}
                  style={{ background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}
                >
                  {/* Offer badge + status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ background: `${offerColor}18`, color: offerColor, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 5 }}>
                      {order.offer}
                    </span>
                    <span style={{ background: statusColor.bg, color: statusColor.text, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '-0.01em', padding: '3px 10px', borderRadius: 20 }}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title */}
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827', letterSpacing: '-0.03em', marginBottom: 4 }}>
                    {order.title || 'Untitled project'}
                  </p>

                  {/* Date */}
                  <p style={{ fontSize: '0.78rem', color: 'rgba(17,24,39,0.35)', letterSpacing: '-0.02em', marginBottom: 16 }}>
                    {fmt(order.created_at)}
                  </p>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(`/dashboard/${order.id}`)}
                    style={{ width: '100%', background: '#6845EC', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 0', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '-0.02em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    Open workspace <ArrowRight size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
