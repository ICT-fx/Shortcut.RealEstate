import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'

/* ── Shared styles ── */
const inputStyle = {
  background: '#0F0F1A',
  border: '1px solid #1E1E2E',
  borderRadius: '8px',
  color: '#fff',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '0.9rem',
  letterSpacing: '-0.03em',
  padding: '10px 14px',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s',
}

const labelStyle = {
  display: 'block',
  color: 'rgba(255,255,255,0.45)',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '0.75rem',
  letterSpacing: '-0.02em',
  marginBottom: '6px',
}

const STATUS_COLORS = {
  pending:     { bg: 'rgba(245,158,11,0.15)',  text: '#F59E0B' },
  paid:        { bg: 'rgba(59,130,246,0.15)',   text: '#60A5FA' },
  in_progress: { bg: 'rgba(6,182,212,0.15)',    text: '#06B6D4' },
  review:      { bg: 'rgba(124,58,237,0.15)',   text: '#A78BFA' },
  completed:   { bg: 'rgba(34,197,94,0.15)',    text: '#22C55E' },
  cancelled:   { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
}

const OFFER_COLORS = {
  starter: '#6B7280',
  pro:     '#7C3AED',
  premium: '#F59E0B',
}

/* ── Left branding panel ── */
function LeftPanel() {
  return (
    <div
      className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden"
      style={{ width: '40%', background: '#07070F' }}
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '10%', left: '-10%',
            width: '400px', height: '400px',
            background: 'radial-gradient(ellipse, rgba(104,69,236,0.35) 0%, transparent 70%)',
            filter: 'blur(60px)', borderRadius: '50%',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute', bottom: '15%', right: '-5%',
            width: '300px', height: '300px',
            background: 'radial-gradient(ellipse, rgba(6,182,212,0.25) 0%, transparent 70%)',
            filter: 'blur(70px)', borderRadius: '50%',
          }}
        />
      </div>

      <div className="relative z-10">
        <span
          className="text-xl font-bold text-white"
          style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.03em' }}
        >
          shortcut<span style={{ color: '#6845EC' }}>.</span>
        </span>
      </div>

      <div className="relative z-10">
        <p
          className="text-white leading-tight mb-3"
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 'clamp(2rem, 3vw, 3rem)',
            letterSpacing: '-0.04em',
          }}
        >
          YOUR VIDEO.<br />YOUR BRAND.<br />YOUR RESULTS.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', letterSpacing: '-0.02em' }}>
          Manage your orders and track your projects.
        </p>
      </div>
    </div>
  )
}

/* ── Reusable input field ── */
function InputField({ label, type = 'text', value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false)
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            ...inputStyle,
            borderColor: focused ? '#7C3AED' : '#1E1E2E',
            paddingRight: isPassword ? '42px' : '14px',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Sign In form ── */
function SignInForm({ onSuccess, onSwitchToSignUp }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  async function handleSignIn(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  async function handleForgotPassword() {
    if (!email) { setError('Enter your email first'); return }
    await supabase.auth.resetPasswordForEmail(email)
    setResetSent(true)
    setError('')
  }

  return (
    <form onSubmit={handleSignIn} style={{ width: '100%', maxWidth: '360px' }}>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', marginBottom: '8px' }}>
        Sign in
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans', fontSize: '0.85rem', letterSpacing: '-0.02em', marginBottom: '28px' }}>
        Access your orders and project status.
      </p>

      <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <InputField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

      {error && <p style={{ color: '#F87171', fontSize: '0.8rem', fontFamily: 'DM Sans', marginBottom: '12px', letterSpacing: '-0.02em' }}>{error}</p>}
      {resetSent && <p style={{ color: '#34D399', fontSize: '0.8rem', fontFamily: 'DM Sans', marginBottom: '12px', letterSpacing: '-0.02em' }}>Reset link sent — check your inbox.</p>}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', padding: '11px', borderRadius: '8px', border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? '#4B3086' : '#7C3AED',
          color: '#fff', fontFamily: 'DM Sans', fontWeight: 600,
          fontSize: '0.9rem', letterSpacing: '-0.03em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'background 0.2s',
        }}
      >
        {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
        Sign in
      </button>

      <button
        type="button"
        onClick={handleForgotPassword}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans', fontSize: '0.8rem', letterSpacing: '-0.02em', marginTop: '12px', padding: 0 }}
      >
        Forgot password?
      </button>

      <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans', fontSize: '0.82rem', letterSpacing: '-0.02em', marginTop: '24px', textAlign: 'center' }}>
        No account yet?{' '}
        <button type="button" onClick={onSwitchToSignUp} style={{ background: 'none', border: 'none', color: '#7C3AED', cursor: 'pointer', fontWeight: 600, fontFamily: 'DM Sans', fontSize: '0.82rem' }}>
          Sign up
        </button>
      </p>
    </form>
  )
}

/* ── Sign Up form ── */
function SignUpForm({ onSwitchToSignIn }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSignUp(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✉️</div>
        <h2 style={{ fontFamily: 'Syne', fontSize: '1.4rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', marginBottom: '10px' }}>
          Check your inbox
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'DM Sans', fontSize: '0.85rem', letterSpacing: '-0.02em' }}>
          We sent a confirmation link to <strong style={{ color: '#fff' }}>{email}</strong>. Click it to activate your account.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSignUp} style={{ width: '100%', maxWidth: '360px' }}>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', marginBottom: '8px' }}>
        Create account
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans', fontSize: '0.85rem', letterSpacing: '-0.02em', marginBottom: '28px' }}>
        Start managing your video projects.
      </p>

      <InputField label="Full name" value={fullName} onChange={setFullName} placeholder="Jane Dupont" />
      <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <InputField label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 6 characters" />

      {error && <p style={{ color: '#F87171', fontSize: '0.8rem', fontFamily: 'DM Sans', marginBottom: '12px', letterSpacing: '-0.02em' }}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', padding: '11px', borderRadius: '8px', border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? '#4B3086' : '#7C3AED',
          color: '#fff', fontFamily: 'DM Sans', fontWeight: 600,
          fontSize: '0.9rem', letterSpacing: '-0.03em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'background 0.2s',
        }}
      >
        {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
        Create account
      </button>

      <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans', fontSize: '0.82rem', letterSpacing: '-0.02em', marginTop: '24px', textAlign: 'center' }}>
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToSignIn} style={{ background: 'none', border: 'none', color: '#7C3AED', cursor: 'pointer', fontWeight: 600, fontFamily: 'DM Sans', fontSize: '0.82rem' }}>
          Sign in
        </button>
      </p>
    </form>
  )
}

/* ── Dashboard ── */
function Dashboard({ onClose }) {
  const [orders, setOrders] = useState(null)
  const [profile, setProfile] = useState(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', company: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: ordersData }, { data: profileData }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
      ])
      setOrders(ordersData ?? [])
      if (profileData) {
        setProfile(profileData)
        setProfileForm({ full_name: profileData.full_name ?? '', phone: profileData.phone ?? '', company: profileData.company ?? '' })
      }
    }
    load()
  }, [])

  async function saveProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSavingProfile(true)
    await supabase.from('profiles').update(profileForm).eq('id', user.id)
    setProfile(p => ({ ...p, ...profileForm }))
    setSavingProfile(false)
    setEditingProfile(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    onClose()
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div style={{ width: '100%', maxWidth: '420px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne', fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', margin: 0 }}>
            Welcome back, {firstName}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans', fontSize: '0.8rem', letterSpacing: '-0.02em', marginTop: '4px' }}>
            {profile?.email}
          </p>
        </div>
        <button
          onClick={signOut}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'rgba(255,255,255,0.45)', fontFamily: 'DM Sans', fontSize: '0.78rem', letterSpacing: '-0.02em', padding: '6px 12px', cursor: 'pointer' }}
        >
          Sign out
        </button>
      </div>

      {/* Orders label */}
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans', fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
        My orders
      </p>

      {/* Loading */}
      {orders === null && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
          <Loader2 size={20} style={{ color: '#7C3AED', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Empty state */}
      {orders !== null && orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans', fontSize: '0.9rem', letterSpacing: '-0.02em', marginBottom: '16px' }}>
            No orders yet.
          </p>
          <button
            onClick={() => {
              onClose()
              setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 300)
            }}
            style={{ background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '-0.03em', cursor: 'pointer' }}
          >
            Discover our offers
          </button>
        </div>
      )}

      {/* Orders list */}
      {orders !== null && orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {orders.map(order => {
            const statusColor = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending
            return (
              <div
                key={order.id}
                style={{ background: '#0F0F1A', border: '1px solid #1E1E2E', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <span style={{ background: `${OFFER_COLORS[order.offer]}22`, color: OFFER_COLORS[order.offer], fontFamily: 'DM Sans', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px' }}>
                      {order.offer}
                    </span>
                  </div>
                  <p style={{ color: '#fff', fontFamily: 'DM Sans', fontSize: '0.88rem', letterSpacing: '-0.03em', margin: 0 }}>
                    {order.title || 'Untitled order'}
                  </p>
                </div>
                <span style={{ background: statusColor.bg, color: statusColor.text, fontFamily: 'DM Sans', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '-0.01em', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Profile edit */}
      <div style={{ borderTop: '1px solid #1E1E2E', paddingTop: '16px' }}>
        {!editingProfile ? (
          <button
            onClick={() => setEditingProfile(true)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Sans', fontSize: '0.78rem', letterSpacing: '-0.02em', cursor: 'pointer', padding: 0 }}
          >
            Edit profile
          </button>
        ) : (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans', fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Edit profile
            </p>
            {[
              { label: 'Full name', key: 'full_name', placeholder: 'Jane Dupont' },
              { label: 'Phone', key: 'phone', placeholder: '+33 6 00 00 00 00' },
              { label: 'Company', key: 'company', placeholder: 'Acme Inc.' },
            ].map(({ label, key, placeholder }) => (
              <div key={key} style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>{label}</label>
                <input
                  value={profileForm[key]}
                  onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={inputStyle}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={saveProfile}
                disabled={savingProfile}
                style={{ background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '7px', padding: '8px 16px', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '0.82rem', letterSpacing: '-0.02em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {savingProfile && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                Save
              </button>
              <button
                onClick={() => setEditingProfile(false)}
                style={{ background: 'none', border: '1px solid #1E1E2E', borderRadius: '7px', padding: '8px 16px', fontFamily: 'DM Sans', fontSize: '0.82rem', letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Right panel (animated view switcher) ── */
function RightPanel({ onClose, defaultView }) {
  const [view, setView] = useState(defaultView)

  useEffect(() => { setView(defaultView) }, [defaultView])

  return (
    <div className="flex flex-col flex-1 items-center justify-center relative px-8" style={{ background: '#09091A', overflowY: 'auto' }}>
      <button
        onClick={onClose}
        className="absolute top-6 right-6 transition-opacity hover:opacity-100"
        style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <X size={22} />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '48px 0' }}
        >
          {view === 'signin' && (
            <SignInForm
              onSuccess={() => setView('dashboard')}
              onSwitchToSignUp={() => setView('signup')}
            />
          )}
          {view === 'signup' && (
            <SignUpForm
              onSwitchToSignIn={() => setView('signin')}
            />
          )}
          {view === 'dashboard' && (
            <Dashboard onClose={onClose} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ── Main export ── */
export function AuthOverlay({ open, onClose, defaultView = 'signin' }) {
  /* Lock body scroll when open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex"
          style={{ background: 'rgba(7,7,15,0.97)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full h-full"
          >
            <LeftPanel />
            <RightPanel onClose={onClose} defaultView={defaultView} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
