# Client Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a protected client portal at `/dashboard` and `/dashboard/:orderId` with order tracking, real-time chat, file delivery, and revision call booking.

**Architecture:** React Router v6 for routing; ProtectedRoute guards check auth + paid order status; Supabase Realtime powers chat; Supabase Storage handles file uploads. All pages are light-themed (`#FAFAFA` bg) with inline styles matching the existing codebase pattern.

**Tech Stack:** react-router-dom v6, @supabase/supabase-js (existing), framer-motion (existing), lucide-react (existing). No new UI libraries.

**Important notes before starting:**
- Existing orders use fields `title` and `offer` (not `property_name`/`offer_type`)
- No test framework in this project — verification is manual in the browser
- Supabase SQL and storage setup must be done manually in Supabase Studio before running Tasks 4+
- `STATUS_COLORS` and `OFFER_COLORS` are currently defined inside `auth-overlay.jsx` — we extract them to a shared file

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Add react-router-dom |
| `src/lib/constants.js` | Create | Shared STATUS_COLORS, OFFER_COLORS |
| `src/lib/useAuth.js` | Modify | Re-export as-is (no change needed) |
| `src/components/ui/auth-overlay.jsx` | Modify | Import STATUS_COLORS/OFFER_COLORS from shared lib |
| `src/components/ui/booking-overlay.jsx` | Modify | Accept `src` prop instead of hardcoded URL |
| `src/components/ui/protected-route.jsx` | Create | Auth + paid-order guard |
| `src/main.jsx` | Modify | Add RouterProvider + routes |
| `src/pages/Dashboard.jsx` | Create | `/dashboard` — order list |
| `src/pages/OrderWorkspace.jsx` | Create | `/dashboard/:orderId` — chat + files + booking |

---

### Task 1: Install react-router-dom

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
npm install react-router-dom@6
```

Expected output: added 1 package (or similar), no errors.

- [ ] **Step 2: Verify installation**

```bash
grep "react-router-dom" package.json
```

Expected: `"react-router-dom": "^6.x.x"` in dependencies.

---

### Task 2: Supabase setup (manual — run in Supabase Studio SQL editor)

**No files to edit.** Run these SQL statements one by one in Supabase Studio → SQL Editor.

- [ ] **Step 1: Create `messages` table**

```sql
create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references orders(id) on delete cascade,
  sender_id   uuid references auth.users(id),
  sender_role text not null check (sender_role in ('client', 'team')),
  content     text not null,
  created_at  timestamptz default now()
);
```

- [ ] **Step 2: Enable RLS on messages**

```sql
alter table messages enable row level security;

create policy "clients see own order messages"
  on messages for select
  using (
    order_id in (select id from orders where user_id = auth.uid())
  );

create policy "clients insert own order messages"
  on messages for insert
  with check (
    order_id in (select id from orders where user_id = auth.uid())
    and sender_id = auth.uid()
    and sender_role = 'client'
  );
```

- [ ] **Step 3: Create `deliverables` table**

```sql
create table if not exists deliverables (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid references orders(id) on delete cascade,
  file_name     text not null,
  file_url      text not null,
  uploaded_by   text not null check (uploaded_by in ('client', 'team')),
  created_at    timestamptz default now()
);

alter table deliverables enable row level security;

create policy "clients see own order deliverables"
  on deliverables for select
  using (
    order_id in (select id from orders where user_id = auth.uid())
  );

create policy "clients insert own order deliverables"
  on deliverables for insert
  with check (
    order_id in (select id from orders where user_id = auth.uid())
    and uploaded_by = 'client'
  );
```

- [ ] **Step 4: Enable RLS on orders (if not already enabled)**

```sql
alter table orders enable row level security;

create policy "clients see own orders"
  on orders for select
  using (user_id = auth.uid());
```

- [ ] **Step 5: Create Supabase Storage bucket**

In Supabase Studio → Storage → New bucket:
- Name: `deliverables`
- Public: ✅ (so file URLs work without auth headers)

- [ ] **Step 6: Enable Realtime on messages table**

In Supabase Studio → Database → Replication → enable `messages` table for INSERT events.

---

### Task 3: Extract shared constants

**Files:**
- Create: `src/lib/constants.js`
- Modify: `src/components/ui/auth-overlay.jsx`

- [ ] **Step 1: Create `src/lib/constants.js`**

```js
export const STATUS_COLORS = {
  pending:     { bg: 'rgba(245,158,11,0.15)',  text: '#F59E0B' },
  paid:        { bg: 'rgba(59,130,246,0.15)',   text: '#60A5FA' },
  in_progress: { bg: 'rgba(6,182,212,0.15)',    text: '#06B6D4' },
  review:      { bg: 'rgba(124,58,237,0.15)',   text: '#A78BFA' },
  completed:   { bg: 'rgba(34,197,94,0.15)',    text: '#22C55E' },
  cancelled:   { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
}

export const OFFER_COLORS = {
  starter: '#6B7280',
  pro:     '#7C3AED',
  premium: '#F59E0B',
}

export const PAID_STATUSES = ['paid', 'in_progress', 'review', 'completed']
```

- [ ] **Step 2: Update `auth-overlay.jsx` imports**

At the top of `src/components/ui/auth-overlay.jsx`, replace the two locally-defined constant blocks:

```js
// Remove these two blocks from auth-overlay.jsx:
// const STATUS_COLORS = { ... }
// const OFFER_COLORS = { ... }

// Add this import instead (after the other imports):
import { STATUS_COLORS, OFFER_COLORS } from '../../lib/constants'
```

- [ ] **Step 3: Verify build still passes**

```bash
node_modules/.bin/vite build 2>&1 | tail -5
```

Expected: `✓ built in X.XXs` with no errors.

---

### Task 4: Update BookingOverlay to accept `src` prop

**Files:**
- Modify: `src/components/ui/booking-overlay.jsx`

- [ ] **Step 1: Replace hardcoded URL with `src` prop**

Change the function signature and iframe src:

```jsx
export function BookingOverlay({ open, onClose, src }) {
```

And update the iframe:

```jsx
<iframe
  src={src}
  style={{ flex: 1, border: 'none', width: '100%' }}
  onLoad={() => setLoaded(true)}
  title="Booking"
/>
```

- [ ] **Step 2: Update all existing usages in `App.jsx`**

Find `<BookingOverlay open={bookingOpen} onClose={() => setBookingOpen(false)} />` and add the src prop:

```jsx
<BookingOverlay
  open={bookingOpen}
  onClose={() => setBookingOpen(false)}
  src="https://cal.com/fantin-slmlin/discovery-call?embed=true"
/>
```

- [ ] **Step 3: Verify build**

```bash
node_modules/.bin/vite build 2>&1 | tail -5
```

Expected: `✓ built in X.XXs`.

---

### Task 5: Create ProtectedRoute

**Files:**
- Create: `src/components/ui/protected-route.jsx`

- [ ] **Step 1: Create the file**

```jsx
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
```

---

### Task 6: Update `main.jsx` with router

**Files:**
- Modify: `src/main.jsx`

- [ ] **Step 1: Replace main.jsx content**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Dashboard from './pages/Dashboard'
import OrderWorkspace from './pages/OrderWorkspace'
import ProtectedRoute from './components/ui/protected-route'
import './index.css'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  {
    path: '/dashboard',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: '/dashboard/:orderId',
    element: <ProtectedRoute><OrderWorkspace /></ProtectedRoute>,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
```

- [ ] **Step 2: Create placeholder pages so build doesn't fail**

Create `src/pages/Dashboard.jsx`:

```jsx
export default function Dashboard() {
  return <div>Dashboard</div>
}
```

Create `src/pages/OrderWorkspace.jsx`:

```jsx
export default function OrderWorkspace() {
  return <div>Workspace</div>
}
```

- [ ] **Step 3: Verify build**

```bash
node_modules/.bin/vite build 2>&1 | tail -5
```

Expected: `✓ built in X.XXs`.

---

### Task 7: Build Dashboard page (order list)

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Replace Dashboard.jsx with full implementation**

```jsx
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
            style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'rgba(17,24,39,0.5)', letterSpacing: '-0.02em' }}
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
                  style={{ background: '#fff', borderRadius: 14, padding: '20px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}
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
```

- [ ] **Step 2: Verify build**

```bash
node_modules/.bin/vite build 2>&1 | tail -5
```

Expected: `✓ built in X.XXs`.

- [ ] **Step 3: Manual check — navigate to `/dashboard` in the browser**

Start dev server if not running: `npm run dev`  
Visit `http://localhost:5173/dashboard` while signed in with a paid order.  
Expected: order cards displayed.  
Visit while signed out: expected redirect to `/`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/constants.js src/components/ui/protected-route.jsx src/main.jsx src/pages/Dashboard.jsx src/components/ui/auth-overlay.jsx src/components/ui/booking-overlay.jsx src/App.jsx
git commit -m "feat: add routing, protected route, and dashboard order list"
```

---

### Task 8: Build OrderWorkspace shell + header + tabs

**Files:**
- Modify: `src/pages/OrderWorkspace.jsx`

- [ ] **Step 1: Replace OrderWorkspace.jsx with the shell**

```jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { STATUS_COLORS } from '../lib/constants'
import { BookingOverlay } from '../components/ui/booking-overlay'
import { ArrowLeft, MessageSquare, FolderOpen, Calendar } from 'lucide-react'

export default function OrderWorkspace() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [tab, setTab] = useState('chat') // 'chat' | 'files'
  const [bookingOpen, setBookingOpen] = useState(false)

  useEffect(() => {
    supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
      .then(({ data }) => setOrder(data))
  }, [orderId])

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, border: '3px solid rgba(104,69,236,0.15)', borderTop: '3px solid #6845EC', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const statusColor = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <BookingOverlay
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        src="https://cal.com/fantin-slmlin/revision-call?embed=true"
      />

      {/* Header */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        padding: '0 24px',
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(17,24,39,0.45)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', letterSpacing: '-0.02em', padding: 0 }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.08)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827', letterSpacing: '-0.03em' }}>
            {order.title || 'Untitled project'}
          </span>
          <span style={{ background: statusColor.bg, color: statusColor.text, fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
            {order.status.replace('_', ' ')}
          </span>
        </div>
        <button
          onClick={() => setBookingOpen(true)}
          style={{ background: '#6845EC', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.82rem', letterSpacing: '-0.02em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Calendar size={14} /> Book a Revision Call
        </button>
      </header>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 24px', display: 'flex', gap: 0 }}>
        {[
          { key: 'chat', label: 'Chat', icon: <MessageSquare size={15} /> },
          { key: 'files', label: 'Files', icon: <FolderOpen size={15} /> },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid #6845EC' : '2px solid transparent',
              color: tab === t.key ? '#6845EC' : 'rgba(17,24,39,0.45)',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '-0.02em',
              padding: '14px 20px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              transition: 'color 0.15s',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tab === 'chat' && <ChatTab orderId={orderId} />}
        {tab === 'files' && <FilesTab orderId={orderId} />}
      </div>
    </div>
  )
}

function ChatTab({ orderId }) {
  return <div style={{ padding: 24, color: 'rgba(17,24,39,0.4)' }}>Chat coming in next task…</div>
}

function FilesTab({ orderId }) {
  return <div style={{ padding: 24, color: 'rgba(17,24,39,0.4)' }}>Files coming in next task…</div>
}
```

- [ ] **Step 2: Verify build + manual check**

```bash
node_modules/.bin/vite build 2>&1 | tail -5
```

Visit `http://localhost:5173/dashboard` → click "Open workspace" on an order.  
Expected: header shows order title + status badge, tabs visible, "Book a Revision Call" button visible.  
Click "Book a Revision Call": booking overlay opens (uses revision-call URL).  
Click "Back": returns to `/dashboard`.

---

### Task 9: Implement Chat tab

**Files:**
- Modify: `src/pages/OrderWorkspace.jsx` — replace `ChatTab` placeholder

- [ ] **Step 1: Replace the `ChatTab` function** (keep everything else in the file unchanged)

```jsx
function ChatTab({ orderId }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState(null)
  const bottomRef = useRef(null)

  // Add to imports at top of file:
  // import { useRef } from 'react'
  // import { Send } from 'lucide-react'

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id))

    // Load existing messages
    supabase
      .from('messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data ?? []))

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${orderId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `order_id=eq.${orderId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [orderId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    await supabase.from('messages').insert({
      order_id: orderId,
      sender_id: userId,
      sender_role: 'client',
      content: text.trim(),
    })
    setText('')
    setSending(false)
  }

  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(17,24,39,0.3)', fontSize: '0.85rem', letterSpacing: '-0.02em', marginTop: 32 }}>
            No messages yet. Say hello!
          </p>
        )}
        {messages.map(msg => {
          const isClient = msg.sender_role === 'client'
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isClient ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '70%',
                background: isClient ? '#6845EC' : '#fff',
                color: isClient ? '#fff' : '#111827',
                border: isClient ? 'none' : '1px solid rgba(0,0,0,0.08)',
                borderRadius: isClient ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '10px 14px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                {!isClient && (
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6845EC', letterSpacing: '-0.01em', marginBottom: 4 }}>
                    Shortcut team
                  </p>
                )}
                <p style={{ fontSize: '0.88rem', letterSpacing: '-0.02em', lineHeight: 1.5, margin: 0 }}>
                  {msg.content}
                </p>
                <p style={{ fontSize: '0.68rem', opacity: 0.55, marginTop: 4, textAlign: 'right', margin: 0 }}>
                  {fmtTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={sendMessage}
        style={{ padding: '12px 24px', background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: 10 }}
      >
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message…"
          style={{
            flex: 1, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, padding: '10px 14px',
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', letterSpacing: '-0.02em',
            outline: 'none', background: '#FAFAFA', color: '#111827',
          }}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          style={{
            background: '#6845EC', color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '-0.02em',
            opacity: !text.trim() || sending ? 0.5 : 1,
          }}
        >
          <Send size={14} /> Send
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Add missing imports** at the top of `OrderWorkspace.jsx`

Ensure these are in the import block:

```jsx
import { useEffect, useState, useRef } from 'react'
import { ArrowLeft, MessageSquare, FolderOpen, Calendar, Send } from 'lucide-react'
```

- [ ] **Step 3: Verify build**

```bash
node_modules/.bin/vite build 2>&1 | tail -5
```

- [ ] **Step 4: Manual check**

Visit workspace → Chat tab.  
Type a message → click Send.  
Expected: message appears on the right in violet bubble.  
Open another browser tab at the same URL: new messages appear in real-time.

---

### Task 10: Implement Files tab

**Files:**
- Modify: `src/pages/OrderWorkspace.jsx` — replace `FilesTab` placeholder

- [ ] **Step 1: Replace the `FilesTab` function** (keep everything else unchanged)

```jsx
function FilesTab({ orderId }) {
  const [deliverables, setDeliverables] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    supabase
      .from('deliverables')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setDeliverables(data ?? []))
  }, [orderId])

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setUploadError('')

    const path = `${orderId}/${Date.now()}-${file.name}`
    const { error: storageError } = await supabase.storage
      .from('deliverables')
      .upload(path, file)

    if (storageError) {
      setUploadError(storageError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('deliverables')
      .getPublicUrl(path)

    await supabase.from('deliverables').insert({
      order_id: orderId,
      file_name: file.name,
      file_url: publicUrl,
      uploaded_by: 'client',
    })

    const { data } = await supabase
      .from('deliverables')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
    setDeliverables(data ?? [])
    setUploading(false)
    e.target.value = ''
  }

  const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Upload rushes section */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '20px 20px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827', letterSpacing: '-0.03em', marginBottom: 4 }}>
          Upload your rushes & photos
        </p>
        <p style={{ fontSize: '0.78rem', color: 'rgba(17,24,39,0.4)', letterSpacing: '-0.02em', marginBottom: 14 }}>
          Share your raw footage and photos directly here.
        </p>
        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: uploading ? 'rgba(104,69,236,0.08)' : '#6845EC',
          color: uploading ? '#6845EC' : '#fff',
          border: uploading ? '1px solid #6845EC' : 'none',
          borderRadius: 9, padding: '9px 18px',
          fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.82rem', letterSpacing: '-0.02em',
          cursor: uploading ? 'not-allowed' : 'pointer',
        }}>
          {uploading ? 'Uploading…' : 'Choose file'}
          <input type="file" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
        </label>
        {uploadError && <p style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: 8 }}>{uploadError}</p>}
      </div>

      {/* Files list */}
      <div>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(17,24,39,0.35)', marginBottom: 12 }}>
          All files
        </p>

        {deliverables === null && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <div style={{ width: 24, height: 24, border: '3px solid rgba(104,69,236,0.15)', borderTop: '3px solid #6845EC', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}

        {deliverables !== null && deliverables.length === 0 && (
          <p style={{ color: 'rgba(17,24,39,0.3)', fontSize: '0.85rem', letterSpacing: '-0.02em' }}>
            No files yet. We'll upload your edited video here when it's ready.
          </p>
        )}

        {deliverables !== null && deliverables.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {deliverables.map(file => (
              <div key={file.id} style={{
                background: '#fff', borderRadius: 10, padding: '12px 16px',
                border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#111827', letterSpacing: '-0.03em', margin: 0 }}>
                    {file.file_name}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(17,24,39,0.35)', letterSpacing: '-0.02em', margin: '3px 0 0' }}>
                    {file.uploaded_by === 'team' ? 'From Shortcut' : 'Your upload'} · {fmt(file.created_at)}
                  </p>
                </div>
                <a
                  href={file.file_url}
                  download={file.file_name}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: 'rgba(104,69,236,0.08)', color: '#6845EC',
                    borderRadius: 8, padding: '7px 14px',
                    fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.78rem', letterSpacing: '-0.02em',
                    textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
node_modules/.bin/vite build 2>&1 | tail -5
```

- [ ] **Step 3: Manual check**

Visit workspace → Files tab.  
Upload a file → expected: file appears in list with "Your upload" label and a Download button.  
Upload a file via Supabase Studio directly (uploaded_by = 'team') → refresh page → expected: appears with "From Shortcut" label.

- [ ] **Step 4: Final commit**

```bash
git add src/pages/OrderWorkspace.jsx src/pages/Dashboard.jsx
git commit -m "feat: order workspace with real-time chat and file delivery"
```
