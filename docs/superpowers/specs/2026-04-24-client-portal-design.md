# Client Portal — Design Spec

**Date:** 2026-04-24  
**Scope:** Phase 2+3 — authenticated client portal with project tracking, real-time chat, file delivery, and revision call booking

---

## Goal

Give paying clients a dedicated space at `/dashboard` where they can track their project status, chat with the team, download delivered videos, and book revision calls — all without leaving the Shortcut site.

---

## Routes

```
/                        → marketing site (unchanged)
/dashboard               → order list (protected)
/dashboard/:orderId      → order workspace (protected)
```

**Protection logic (`ProtectedRoute`):**
1. If not authenticated → redirect to `/`
2. If authenticated but no order with status `paid | in_progress | review | completed` → redirect to `/` (show auth overlay with message)
3. Otherwise → render the page

---

## Supabase Schema

### Existing tables (verify columns exist, add if missing)

**`profiles`** — already exists
```
id           uuid (= auth.users.id)
full_name    text
phone        text
company      text
email        text
```

**`orders`** — already exists, add columns if missing:
```
id              uuid, primary key
user_id         uuid, references auth.users(id)
status          text  — 'pending' | 'paid' | 'in_progress' | 'review' | 'completed' | 'cancelled'
property_name   text
offer_type      text  — 'starter' | 'pro' | 'premium'
created_at      timestamptz
```

### New tables

**`messages`**
```sql
create table messages (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references orders(id) on delete cascade,
  sender_id   uuid references auth.users(id),
  sender_role text not null check (sender_role in ('client', 'team')),
  content     text not null,
  created_at  timestamptz default now()
);

-- RLS
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

**`deliverables`**
```sql
create table deliverables (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid references orders(id) on delete cascade,
  file_name     text not null,
  file_url      text not null,
  uploaded_by   text not null check (uploaded_by in ('client', 'team')),
  created_at    timestamptz default now()
);

-- RLS
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

### Supabase Storage

Bucket `deliverables` — public read access. Files stored at path `{orderId}/{filename}`.

### RLS on orders

```sql
alter table orders enable row level security;
create policy "clients see own orders"
  on orders for select
  using (user_id = auth.uid());
```

---

## File Structure

```
src/
  main.jsx                              ← add RouterProvider + routes
  App.jsx                               ← unchanged, stays on route "/"
  pages/
    Dashboard.jsx                       ← /dashboard — order list
    OrderWorkspace.jsx                  ← /dashboard/:orderId — workspace
  components/
    ui/
      protected-route.jsx               ← auth + paid-order guard
      booking-overlay.jsx               ← existing, reused for revision call
      auth-overlay.jsx                  ← existing, unchanged
```

---

## Design System (dashboard pages)

- **Background:** `#FAFAFA`
- **Card background:** `#FFFFFF` with `box-shadow: 0 2px 12px rgba(0,0,0,0.06)`
- **Text primary:** `#111827`
- **Text secondary:** `rgba(17,24,39,0.45)`
- **Accent:** `#6845EC`
- **Border:** `rgba(0,0,0,0.07)`
- **Fonts:** DM Sans (body), Syne (headings), Bebas Neue (display) — already loaded
- **Letter spacing:** same rules as CLAUDE.md

Status badge colors — reuse `STATUS_COLORS` from `auth-overlay.jsx` (extract to shared constant).

---

## Page: `/dashboard` — Order List

**Header:** Shortcut logo left, `Welcome back, {firstName}` center, Sign out button right.

**Content:** Grid of order cards (1 col mobile, 2 col desktop). Each card:
- Property name (h3, bold)
- Offer type badge (Starter / Pro / Premium)
- Status badge (color-coded)
- Date (formatted)
- "Open workspace →" button → navigates to `/dashboard/:orderId`

**Empty state:** message "No active projects yet" + link back to pricing.

---

## Page: `/dashboard/:orderId` — Order Workspace

**Header (sticky):**
- ← Back button (→ `/dashboard`)
- Property name + status badge
- "Book a Revision Call" button → opens `BookingOverlay` with URL `https://cal.com/fantin-slmlin/revision-call?embed=true`

**Body — two tabs: Chat | Files**

### Tab: Chat

Real-time via Supabase Realtime (channel per `order_id`).

- Messages fetched on mount, ordered by `created_at` asc
- New messages subscribed via `supabase.channel('messages:order_id=eq.{id}')`
- Layout: client bubbles right (violet `#6845EC` bg, white text), team bubbles left (white bg, dark text, border)
- Input bar at bottom: textarea + Send button
- Auto-scroll to bottom on new message

### Tab: Files

- List of deliverables (file_name, uploaded_by badge, date, download button)
- "Upload your rushes" section: file input → uploads to Supabase Storage at `deliverables/{orderId}/{filename}` → inserts row in `deliverables` table with `uploaded_by: 'client'`
- Team uploads files via Supabase Studio (no admin UI in this scope)

---

## Cal.com — Revision Call

Requires creating a second event type on Cal.com:
- Name: "Revision Call"
- Slug: `revision-call`
- Duration: 20 or 30 min
- Only accessible via the dashboard (URL not public)

The existing `BookingOverlay` component is reused with a `src` prop to allow switching between discovery and revision URLs.

---

## Routing Setup (`main.jsx`)

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Dashboard from './pages/Dashboard'
import OrderWorkspace from './pages/OrderWorkspace'
import ProtectedRoute from './components/ui/protected-route'

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

ReactDOM.createRoot(...).render(<RouterProvider router={router} />)
```

---

## Out of Scope

- Admin interface for the team (use Supabase Studio)
- Payment integration (orders created manually for now)
- Push notifications
- Video preview player (files are download links only)
