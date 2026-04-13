# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Vite, localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build locally
```

## Stack

- **Vite + React 18** (JSX, not TypeScript)
- **Tailwind CSS v3** — content paths: `./index.html`, `./src/**/*.{js,jsx}`
- **framer-motion** — hero entrance animations
- **lucide-react** — all icons

No Next.js, no shadcn, no TypeScript.

## Architecture

All page content lives in a single file: `src/App.jsx`. Each section is a named function component (`Hero`, `Marquee`, `Targets`, `Services`, `Process`, `WhyUs`, `Portfolio`, `Testimonials`, `Pricing`, `FinalCTA`, `Footer`). The default export `App` renders them in sequence.

The only external component is `src/components/ui/minimalist-hero.jsx` — a JSX adaptation of a TSX/shadcn minimalist hero template. It handles its own header/nav, so there is no separate Navbar component.

## Design System

**Color scheme**: dark site (`#07070F` bg, `#7C3AED` violet, `#06B6D4` cyan, `#F59E0B` amber) except the hero which is white/light with an `#FDE68A` amber circle.

**Fonts** (loaded via Google Fonts in `index.html`):
- `font-display` → Bebas Neue (large display text)
- `font-heading` → Syne (section headings)
- `font-sans` → DM Sans (body, default)

**Custom Tailwind animations**: `animate-marquee`, `animate-float`, `animate-float-delayed`, `animate-glow-pulse`

**CSS utilities** (defined in `src/index.css`): `.btn-primary`, `.btn-secondary`, `.section-label`, `.card-glow`, `.gradient-text`, `.accent-gradient-text`, `.grid-bg`

**Scroll animations**: `useInView` hook + `FadeIn` wrapper component defined at the top of `App.jsx` use IntersectionObserver for reveal-on-scroll.

## Key Constraints

- Keep all sections in `src/App.jsx` — do not split into separate files unless asked.
- The `MinimalistHero` component controls the hero viewport entirely (bg-white, own nav). Do not add a separate navbar above it.
- CSS variables (`--violet`, `--cyan`, etc.) are defined in `:root` in `index.css` but most components use literal hex values for Tailwind inline styles.

## Typography Rules

**Negative letter-spacing** is mandatory on ALL text across the entire site. This gives the compact, high-end branding feel typical of premium modern sites. Already applied globally — maintain on any new text added.

| Element | `letterSpacing` value |
|---|---|
| `h1` hero title | `-0.05em` |
| `h2` section titles (`font-display`) | `-0.04em` |
| Large impact paragraphs (`≥ 1.8rem`, e.g. Targets intro) | `-0.05em` |
| FinalCTA giant heading (`clamp` ≥ 3rem) | `-0.05em` |
| Medium body text (hero paragraph, section subtitles) | `-0.03em` |
| Bullet lists / short phrases (`text-xl` and below) | `-0.05em` ✅ approved |
| Buttons / CTAs | `-0.03em` |

Apply as inline style: `style={{ letterSpacing: '-0.05em' }}` — do NOT use Tailwind `tracking-*` classes, they don't offer enough granularity.
