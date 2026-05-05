# Booking Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Cal.com booking overlay that opens when any "Book a call" button is clicked on the site.

**Architecture:** New `BookingOverlay` component (iframe wrapping `cal.com/fantin-slmlin/discovery-call?embed=true`) mounted in `App`, state managed identically to the existing `AuthOverlay` pattern. Three buttons wired up: navbar, hero, footer.

**Tech Stack:** React 18, framer-motion, lucide-react (X icon). No new dependencies.

---

### Task 1: Create `BookingOverlay` component

**Files:**
- Create: `src/components/ui/booking-overlay.jsx`

- [ ] **Step 1: Create the file**

```jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function BookingOverlay({ open, onClose }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="booking-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.72)',
              zIndex: 1000,
            }}
          />

          {/* Card */}
          <motion.div
            key="booking-card"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: 720,
              height: '85vh',
              background: '#fff',
              borderRadius: 20,
              overflow: 'hidden',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
            }}
          >
            {/* Header bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: '#111827',
                letterSpacing: '-0.03em',
              }}>
                Book a Discovery Call
              </span>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(0,0,0,0.06)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#111827',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Spinner while loading */}
            {!loaded && (
              <div style={{
                position: 'absolute', inset: 0, top: 57,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#fff',
                zIndex: 1,
              }}>
                <div style={{
                  width: 32, height: 32,
                  border: '3px solid rgba(104,69,236,0.15)',
                  borderTop: '3px solid #6845EC',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* Cal.com iframe */}
            <iframe
              src="https://cal.com/fantin-slmlin/discovery-call?embed=true"
              style={{ flex: 1, border: 'none', width: '100%' }}
              onLoad={() => setLoaded(true)}
              title="Book a Discovery Call"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Verify the file exists**

```bash
ls "src/components/ui/booking-overlay.jsx"
```

Expected: file listed with no error.

---

### Task 2: Wire up `App.jsx` — state + mount

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add import at the top of App.jsx** (alongside the AuthOverlay import, around line 15)

```jsx
import { BookingOverlay } from './components/ui/booking-overlay'
```

- [ ] **Step 2: Add state inside the `App` function** (right after the `authOpen` / `authDefaultView` lines, ~line 2128)

```jsx
const [bookingOpen, setBookingOpen] = useState(false)
```

- [ ] **Step 3: Mount `BookingOverlay` in the App return** (right after `<AuthOverlay …/>`, ~line 2146)

```jsx
<BookingOverlay open={bookingOpen} onClose={() => setBookingOpen(false)} />
```

- [ ] **Step 4: Pass `onOpenBooking` prop to `Hero` and `Footer`** (update the two component calls in the App return)

```jsx
<Hero user={user} onOpenAuth={openAuth} onOpenBooking={() => setBookingOpen(true)} />
```

```jsx
<Footer onOpenBooking={() => setBookingOpen(true)} />
```

---

### Task 3: Wire up navbar "Book a call" button

**Files:**
- Modify: `src/App.jsx` (Hero component, navbar section, ~line 211)

The current navbar button is an `<a>` tag. Replace it with a `<button>`:

- [ ] **Step 1: Find and replace the navbar button** (~line 211–217)

Replace:
```jsx
<a
  href="#contact"
  className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
  style={{ background: '#6845EC', boxShadow: '0 4px 20px #6845EC40', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.03em' }}
>
  Book a call →
</a>
```

With:
```jsx
<button
  onClick={onOpenBooking}
  className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
  style={{ background: '#6845EC', boxShadow: '0 4px 20px #6845EC40', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.03em' }}
>
  Book a call →
</button>
```

- [ ] **Step 2: Update the `Hero` function signature** to accept `onOpenBooking` (~line 51)

```jsx
function Hero({ user, onOpenAuth, onOpenBooking }) {
```

---

### Task 4: Wire up hero "Book a call" button

**Files:**
- Modify: `src/App.jsx` (Hero component, hero CTA section, ~line 261–268)

- [ ] **Step 1: Find and replace the hero button** (~line 261–268)

Replace:
```jsx
<a
  href="#contact"
  className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold transition-all hover:opacity-90"
  style={{ background: '#ffffff', color: '#0D0D0D', textDecoration: 'none', letterSpacing: '-0.03em' }}
>
  Book a call
</a>
```

With:
```jsx
<button
  onClick={onOpenBooking}
  className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold transition-all hover:opacity-90"
  style={{ background: '#ffffff', color: '#0D0D0D', border: 'none', cursor: 'pointer', letterSpacing: '-0.03em' }}
>
  Book a call
</button>
```

---

### Task 5: Wire up footer "Book a call" link

**Files:**
- Modify: `src/App.jsx` (Footer component definition + call)

The footer renders all contact links in a loop. "Book a call" must trigger the overlay instead of `href="#"`.

- [ ] **Step 1: Update the `Footer` function signature** to accept `onOpenBooking`

Find the Footer function definition (search for `function Footer`) and add the prop:

```jsx
function Footer({ onOpenBooking }) {
```

- [ ] **Step 2: Update the footer link rendering** (~line 2085–2095)

Replace the generic link renderer inside the `col.links.map` with a conditional for "Book a call":

```jsx
{col.links.map(link => (
  <li key={link}>
    {link === 'Book a call' ? (
      <button
        onClick={onOpenBooking}
        className="font-sans text-sm transition-colors"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'rgba(17,24,39,0.35)', fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.03em' }}
        onMouseOver={e => e.target.style.color = '#111827'}
        onMouseOut={e => e.target.style.color = 'rgba(17,24,39,0.35)'}
      >
        {link}
      </button>
    ) : (
      <a
        href="#"
        className="font-sans text-sm transition-colors"
        style={{ color: 'rgba(17,24,39,0.35)' }}
        onMouseOver={e => e.target.style.color = '#111827'}
        onMouseOut={e => e.target.style.color = 'rgba(17,24,39,0.35)'}
      >
        {link}
      </a>
    )}
  </li>
))}
```

---

### Task 6: Manual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Check all three buttons**
  - Click "Book a call →" in the navbar → overlay opens with Cal.com iframe
  - Click "Book a call" in the hero → overlay opens
  - Click "Book a call" in the footer (Contact section) → overlay opens
  - Click outside the card / click ✕ → overlay closes
  - Verify the spinner appears briefly then the Cal.com UI loads

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/booking-overlay.jsx src/App.jsx
git commit -m "feat: add Cal.com booking overlay on Book a call buttons"
```
