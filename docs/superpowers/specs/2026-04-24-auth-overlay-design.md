# Auth Overlay — Design Spec
_2026-04-24_

## Overview

Full-screen auth overlay for ShortCut agency site. Triggered by "My Account" button in the Hero navbar. Handles sign in, sign up, and post-login client dashboard — all in the same overlay without page navigation.

---

## Layout & Animation

- **Trigger**: "My Account" button in existing Hero navbar (right side)
- **Entry animation**: `framer-motion` opacity 0→1 + scale 0.97→1, ~300ms ease-out
- **Exit animation**: reverse on close or sign out
- **Background**: `#07070F` at 97% opacity + `backdrop-blur-sm`
- **Close**: ✕ icon top-right corner

### Desktop (two columns)
| Left 40% | Right 60% |
|---|---|
| ShortCut logo + tagline (Bebas Neue) | Auth form or dashboard |
| Animated violet/cyan gradient background | Content changes on auth state |
| Static — never changes | Animated transition between views |

### Mobile
Single column — left branding panel hidden, right panel takes full width.

---

## Auth Forms

### Sign In
- Fields: email, password
- CTA: "Sign in" (solid violet `#7C3AED`)
- Secondary: "Forgot password?" → Supabase `resetPasswordForEmail` (sends magic link)
- Toggle: "No account yet? **Sign up**"

### Sign Up
- Fields: full name, email, password (no confirm field — Supabase handles validation)
- CTA: "Create account" (solid violet)
- On success: show message "Check your email to confirm your account" — no auto-login until email confirmed
- Toggle: "Already have an account? **Sign in**"

### Input design
- Background: `#0F0F1A`
- Border: `#1E1E2E`, focus ring: `#7C3AED`
- Font: DM Sans, `letterSpacing: '-0.03em'`
- Labels: small, muted above each field

### States
- **Loading**: button disabled + spinner icon (lucide `Loader2` with spin animation)
- **Error**: red message below button (Supabase error message, translated if needed)
- **Success (sign up)**: inline confirmation message, form hidden

---

## Dashboard (post-login)

Replaces the right panel via framer-motion slide+fade transition after successful sign in.

### Header
- "Welcome back, [first name]" — Syne font
- "Sign out" button — small, ghost style, top right of panel

### Orders list
Fetches from `public.orders` for the authenticated user (RLS ensures only their rows).

Each order row displays:
- Offer badge: Starter / Pro / Premium (colored pill)
- Order title (or fallback "Untitled order")
- Status badge with color:
  - `pending` → amber
  - `paid` → blue
  - `in_progress` → cyan
  - `review` → purple
  - `completed` → green
  - `cancelled` → gray

### Empty state
"No orders yet." + "Discover our offers" button → closes overlay + scrolls to `#pricing` section.

### Profile link
Small "Edit profile" link at bottom of panel → opens inline mini-form (full name, phone, company). Saves to `public.profiles` via Supabase update.

---

## Navbar Integration

### Unauthenticated state
```
[My Account]  ← outline violet button, opens overlay
```

### Authenticated state
```
[FD]  Fantin  ← violet circle with initials + first name, opens overlay on dashboard view directly
```

---

## Architecture

### New files
- `src/lib/useAuth.js` — subscribes to `supabase.auth.onAuthStateChange`, returns `{ user, loading }`
- `src/components/ui/auth-overlay.jsx` — full overlay component (layout + forms + dashboard)

### Modified files
- `src/App.jsx` — adds `authOpen` state, `user` state from `useAuth`, passes props to Hero and renders `<AuthOverlay>`

### Data flow
```
App.jsx
  ├── useAuth() → user, loading
  ├── authOpen state
  ├── Hero (user, onOpenAuth)
  └── AuthOverlay (open, onClose, user)
        ├── LeftPanel (static branding)
        └── RightPanel
              ├── SignInForm
              ├── SignUpForm
              └── Dashboard (fetches orders on mount)
```

### Supabase calls
| Action | Call |
|---|---|
| Sign in | `supabase.auth.signInWithPassword({ email, password })` |
| Sign up | `supabase.auth.signUp({ email, password, options: { data: { full_name } } })` |
| Sign out | `supabase.auth.signOut()` |
| Reset password | `supabase.auth.resetPasswordForEmail(email)` |
| Fetch orders | `supabase.from('orders').select('*').order('created_at', { ascending: false })` |
| Update profile | `supabase.from('profiles').update({...}).eq('id', user.id)` |

---

## Security

- Only `VITE_SUPABASE_ANON_KEY` (publishable) used in frontend — never the secret key
- RLS policies on all tables ensure users only see their own data
- `full_name` stored in `raw_user_meta_data` at signup (for profile creation trigger) — not used for authorization decisions
