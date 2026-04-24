# Auth Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-screen auth overlay (sign in / sign up / client dashboard) triggered by a "My Account" button in the Hero navbar.

**Architecture:** `useAuth` hook subscribes to Supabase auth state and is consumed by `App`. `AuthOverlay` is a self-contained component with left branding panel + right animated panel (forms → dashboard). Hero receives `user` and `onOpenAuth` props to render the nav button.

**Tech Stack:** React 18, Tailwind v3, framer-motion, @supabase/supabase-js, lucide-react

---

### Task 1: useAuth hook

**Files:**
- Create: `src/lib/useAuth.js`

- [ ] **Step 1: Create the hook**

```js
// src/lib/useAuth.js
import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

- [ ] **Step 2: Verify the file exists and has no syntax errors**

```bash
node --input-type=module < src/lib/useAuth.js 2>&1 || echo "check imports only"
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/useAuth.js
git commit -m "feat: add useAuth hook"
```

---

### Task 2: AuthOverlay — skeleton + left panel

**Files:**
- Create: `src/components/ui/auth-overlay.jsx`

- [ ] **Step 1: Create the component skeleton with left panel**

```jsx
// src/components/ui/auth-overlay.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function LeftPanel() {
  return (
    <div
      className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden"
      style={{ width: '40%', background: '#07070F' }}
    >
      {/* Animated gradient blobs */}
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

      {/* Logo */}
      <div className="relative z-10">
        <span
          className="text-xl font-bold text-white"
          style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.03em' }}
        >
          shortcut<span style={{ color: '#6845EC' }}>.</span>
        </span>
      </div>

      {/* Tagline */}
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

export function AuthOverlay({ open, onClose, defaultView = 'signin' }) {
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

function RightPanel({ onClose, defaultView }) {
  // placeholder — filled in Task 3
  return (
    <div className="flex flex-col flex-1 items-center justify-center relative" style={{ background: '#09091A' }}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white opacity-40 hover:opacity-100 transition-opacity">
        <X size={22} />
      </button>
      <p style={{ color: 'white' }}>Right panel — coming in Task 3</p>
    </div>
  )
}
```

- [ ] **Step 2: Smoke test — add AuthOverlay to App temporarily**

In `src/App.jsx`, add at top of imports:
```jsx
import { AuthOverlay } from './components/ui/auth-overlay'
```
And inside `App()`, before the closing `</div>`:
```jsx
<AuthOverlay open={true} onClose={() => {}} />
```
Run `npm run dev` and confirm the overlay renders with blobs + left panel.

- [ ] **Step 3: Revert the smoke test additions from App.jsx** (remove the import and `<AuthOverlay>` line added in step 2 — Task 5 will add them properly)

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/auth-overlay.jsx
git commit -m "feat: auth overlay skeleton + left panel"
```

---

### Task 3: Sign In and Sign Up forms

**Files:**
- Modify: `src/components/ui/auth-overlay.jsx`

Replace the `RightPanel` placeholder function with the full version below. Keep all other functions intact.

- [ ] **Step 1: Replace `RightPanel` with the full implementation**

```jsx
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
          width: '100%', padding: '11px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? '#4B3086' : '#7C3AED', color: '#fff', fontFamily: 'DM Sans', fontWeight: 600,
          fontSize: '0.9rem', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
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

function SignUpForm({ onSuccess, onSwitchToSignIn }) {
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
        <h2 style={{ fontFamily: 'Syne', fontSize: '1.4rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', marginBottom: '10px' }}>Check your inbox</h2>
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
          width: '100%', padding: '11px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? '#4B3086' : '#7C3AED', color: '#fff', fontFamily: 'DM Sans', fontWeight: 600,
          fontSize: '0.9rem', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
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

function RightPanel({ onClose, defaultView }) {
  const [view, setView] = useState(defaultView) // 'signin' | 'signup' | 'dashboard'

  useEffect(() => { setView(defaultView) }, [defaultView])

  return (
    <div className="flex flex-col flex-1 items-center justify-center relative px-8" style={{ background: '#09091A' }}>
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
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          {view === 'signin' && (
            <SignInForm
              onSuccess={() => setView('dashboard')}
              onSwitchToSignUp={() => setView('signup')}
            />
          )}
          {view === 'signup' && (
            <SignUpForm
              onSuccess={() => setView('done')}
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
```

Also add this `@keyframes spin` to `src/index.css` (at the end of the file):
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/auth-overlay.jsx src/index.css
git commit -m "feat: sign in and sign up forms"
```

---

### Task 4: Dashboard panel

**Files:**
- Modify: `src/components/ui/auth-overlay.jsx`

Add the `Dashboard` component before `RightPanel`. It references `supabase` (already imported at top).

- [ ] **Step 1: Add Dashboard component**

```jsx
const STATUS_COLORS = {
  pending:     { bg: 'rgba(245,158,11,0.15)',  text: '#F59E0B' },
  paid:        { bg: 'rgba(59,130,246,0.15)',   text: '#60A5FA' },
  in_progress: { bg: 'rgba(6,182,212,0.15)',    text: '#06B6D4' },
  review:      { bg: 'rgba(124,58,237,0.15)',   text: '#A78BFA' },
  completed:   { bg: 'rgba(34,197,94,0.15)',    text: '#22C55E' },
  cancelled:   { bg: 'rgba(107,114,128,0.15)',  text: '#6B7280' },
}

const OFFER_COLORS = {
  starter: '#6B7280',
  pro:     '#7C3AED',
  premium: '#F59E0B',
}

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

      {/* Orders */}
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans', fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
        My orders
      </p>

      {orders === null && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
          <Loader2 size={20} style={{ color: '#7C3AED', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {orders !== null && orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans', fontSize: '0.9rem', letterSpacing: '-0.02em', marginBottom: '16px' }}>
            No orders yet.
          </p>
          <button
            onClick={() => { onClose(); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 300) }}
            style={{ background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '-0.03em', cursor: 'pointer' }}
          >
            Discover our offers
          </button>
        </div>
      )}

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
                <span style={{ background: statusColor.bg, color: statusColor.text, fontFamily: 'DM Sans', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '-0.01em', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
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
            <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans', fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>Edit profile</p>
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/auth-overlay.jsx
git commit -m "feat: dashboard panel with orders and profile edit"
```

---

### Task 5: Wire AuthOverlay into App + Hero navbar

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add imports at top of App.jsx**

Add these two lines after the existing imports:
```jsx
import { useAuth } from './lib/useAuth'
import { AuthOverlay } from './components/ui/auth-overlay'
```

- [ ] **Step 2: Update the App component**

Replace:
```jsx
export default function App() {
  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      <Hero />
```
With:
```jsx
export default function App() {
  const { user } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authDefaultView, setAuthDefaultView] = useState('signin')

  function openAuth(view = 'signin') {
    setAuthDefaultView(view)
    setAuthOpen(true)
  }

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      <AuthOverlay open={authOpen} onClose={() => setAuthOpen(false)} defaultView={authDefaultView} />
      <Hero user={user} onOpenAuth={openAuth} />
```

- [ ] **Step 3: Update Hero function signature**

Replace:
```jsx
function Hero() {
```
With:
```jsx
function Hero({ user, onOpenAuth }) {
```

- [ ] **Step 4: Replace the "Book a call →" button in Hero navbar with two buttons**

Find this block in Hero (around line 177–192):
```jsx
        <motion.a
          href="#contact"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{
            background: '#6845EC',
            boxShadow: '0 4px 20px #6845EC40',
            textDecoration: 'none',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          Book a call →
        </motion.a>
```
Replace with:
```jsx
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:flex items-center gap-3"
        >
          {user ? (
            <button
              onClick={() => onOpenAuth('dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', background: 'none',
                border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', background: '#7C3AED',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontFamily: 'DM Sans', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '-0.02em',
              }}>
                {(user.user_metadata?.full_name || user.email || 'U').slice(0, 2).toUpperCase()}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'DM Sans', fontSize: '0.85rem', letterSpacing: '-0.02em' }}>
                {user.user_metadata?.full_name?.split(' ')[0] || user.email}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('signin')}
              className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.03em',
              }}
            >
              My Account
            </button>
          )}
          <a
            href="#contact"
            className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: '#6845EC', boxShadow: '0 4px 20px #6845EC40',
              textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.03em',
            }}
          >
            Book a call →
          </a>
        </motion.div>
```

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```
Open http://localhost:5173. Check:
- "My Account" button appears in navbar (unauthenticated)
- Clicking opens the full-screen overlay
- Sign in / sign up toggle works with animation
- Sign in with a test account shows the dashboard

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire auth overlay into App and Hero navbar"
```

---

### Task 6: Add pricing section id for empty-state scroll

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Find the Pricing section root element and add id="pricing"**

Search for `function Pricing()` in App.jsx. Find the outermost `<section>` or `<div>` that wraps the pricing section and add `id="pricing"` to it. Example — if it starts with:
```jsx
<section className="...">
```
Change to:
```jsx
<section id="pricing" className="...">
```

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "fix: add id=pricing anchor for dashboard empty-state scroll"
```
