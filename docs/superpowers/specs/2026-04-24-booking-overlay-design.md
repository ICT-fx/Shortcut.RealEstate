# Booking Overlay — Phase 1 Design Spec

**Date:** 2026-04-24  
**Scope:** Discovery Call booking via Cal.com overlay on the public site

## Goal

Replace all "Book a call" buttons on the site with an overlay that opens a Cal.com booking widget. Users pick a slot directly on the site without leaving the page. Cal.com handles confirmation emails and Google Calendar sync automatically.

## Cal.com Config

- **Profile:** `https://cal.com/fantin-slmlin`
- **Event:** `https://cal.com/fantin-slmlin/discovery-call`
- **Embed URL:** `https://cal.com/fantin-slmlin/discovery-call?embed=true`

## Architecture

### New file: `src/components/ui/booking-overlay.jsx`

A modal overlay component modelled on the existing `AuthOverlay` pattern:

- Dark semi-transparent backdrop (`rgba(0,0,0,0.7)`)
- Centered card, width ~680px, height ~80vh
- `<iframe>` pointing to the Cal.com embed URL
- Loading spinner while iframe loads (`onLoad` toggles it off)
- Close button (✕) top-right
- Closes on backdrop click
- `framer-motion` entrance animation (fade + scale), consistent with site style

Props: `open: boolean`, `onClose: () => void`

### Changes to `src/App.jsx`

1. Add state: `const [bookingOpen, setBookingOpen] = useState(false)`
2. Add function: `function openBooking() { setBookingOpen(true) }`
3. Mount `<BookingOverlay open={bookingOpen} onClose={() => setBookingOpen(false)} />` in the App return, alongside `AuthOverlay`
4. Wire up 3 buttons:
   - **Navbar** (line ~211): `<a href="#contact">` → `<button onClick={openBooking}>`
   - **Hero** (line ~262): `<a href="#contact">` → `<button onClick={openBooking}>`
   - **Footer links** (line ~2077): `'Book a call'` string → clickable element with `onClick`

## Behaviour

- Overlay opens instantly; iframe starts loading in background
- Spinner shown until Cal.com widget is ready
- Backdrop click or ✕ closes the overlay
- Cal.com handles: slot selection, confirmation email to client + team, Google Calendar event creation

## Out of Scope (Phase 2+)

- Revision call booking (client portal)
- Any backend or Supabase integration
