import { useState, useEffect, useRef } from 'react'
import {
  Zap, Scissors, Layers, Palette, Clock,
  Star, Check, ArrowRight, Film,
  Building2, Home, Users, TrendingUp, Award,
  Upload, RefreshCw, Rocket,
  Instagram, Twitter, Youtube, Linkedin,
  BarChart2, Globe, Clapperboard,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { ContainerScroll } from './components/ui/container-scroll-animation'
import { DynamicFrameLayout } from './components/ui/dynamic-frame-layout'
import { ZoomParallax } from './components/ui/zoom-parallax'

/* ─────────────────────────────────────────
   UTILITIES
───────────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

function FadeIn({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'
        } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────
   HERO  (dark + scroll animation)
───────────────────────────────────────── */
function Hero() {
  const navLinks = [
    { label: 'SERVICES', href: '#services' },
    { label: 'WORK', href: '#portfolio' },
    { label: 'PROCESS', href: '#process' },
    { label: 'PRICING', href: '#pricing' },
  ]

  const heroRef = useRef(null)
  const videoRef = useRef(null)
  const targetRef = useRef({ r: 7, g: 7, b: 15 })
  const currentRef = useRef({ r: 7, g: 7, b: 15 })
  const isVisible = useRef(false)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 16
    const ctx = canvas.getContext('2d')
    let rafId
    let sampleTid
    let frameCount = 0

    function computeGradient(r, g, b) {
      const avg = (r + g + b) / 3
      const factor = 2.8
      const clamp = (v) => Math.min(255, Math.max(0, Math.round(avg + (v - avg) * factor)))
      const br = clamp(r), bg2 = clamp(g), bb = clamp(b)
      const mix = (c) => Math.round(c + (255 - c) * 0.45)
      return `linear-gradient(to bottom, #07070F 0%, #07070F 50%, rgba(${br},${bg2},${bb},0.9) 75%, rgb(${mix(br)},${mix(bg2)},${mix(bb)}) 100%)`
    }

    function sample() {
      const v = videoRef.current
      if (v && v.readyState >= 2 && isVisible.current) {
        try {
          ctx.drawImage(v, 0, 0, 16, 16)
          const d = ctx.getImageData(0, 0, 16, 16).data
          let r = 0, g = 0, b = 0
          for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2] }
          const n = d.length / 4
          targetRef.current = { r: r / n, g: g / n, b: b / n }
        } catch (_) { }
      }
      sampleTid = setTimeout(sample, 200)
    }

    function lerp(a, b, t) { return a + (b - a) * t }
    function tick() {
      if (!isVisible.current) { rafId = null; return }
      const c = currentRef.current
      const t = targetRef.current
      const next = {
        r: lerp(c.r, t.r, 0.04),
        g: lerp(c.g, t.g, 0.04),
        b: lerp(c.b, t.b, 0.04),
      }
      currentRef.current = next
      frameCount++
      if (frameCount % 3 === 0 && heroRef.current) {
        heroRef.current.style.background = computeGradient(next.r, next.g, next.b)
      }
      rafId = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(([entry]) => {
      isVisible.current = entry.isIntersecting
      const v = videoRef.current
      if (entry.isIntersecting) {
        if (v) v.play().catch(() => {})
        if (!rafId) rafId = requestAnimationFrame(tick)
      } else {
        if (v) v.pause()
      }
    }, { threshold: 0.1 })
    if (heroRef.current) observer.observe(heroRef.current)

    const v = videoRef.current
    if (v) {
      v.addEventListener('canplay', () => { sample(); rafId = requestAnimationFrame(tick) }, { once: true })
      if (v.readyState >= 2) { sample(); rafId = requestAnimationFrame(tick) }
    }
    return () => { clearTimeout(sampleTid); cancelAnimationFrame(rafId); observer.disconnect() }
  }, [])

  return (
    <div
      ref={heroRef}
      className="relative w-full overflow-hidden"
      style={{ background: '#07070F', transition: 'background 0.6s ease' }}
    >
      {/* ── Blobs de couleur ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div style={{ position: 'absolute', top: '-10%', left: '15%', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(104,69,236,0.18) 0%, transparent 70%)', filter: 'blur(70px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '2%', right: '10%', width: '400px', height: '320px', background: 'radial-gradient(ellipse, rgba(99,179,237,0.14) 0%, transparent 70%)', filter: 'blur(80px)', borderRadius: '50%' }} />
      </div>

      {/* ── Nav ── */}
      <header className="relative z-30 flex w-full max-w-7xl mx-auto items-center justify-between px-6 pt-8">
        <motion.a
          href="#"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-bold tracking-wider text-white"
          style={{ textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}
        >
          shortcut<span style={{ color: '#6845EC' }}>.</span>
        </motion.a>

        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden items-center space-x-8 md:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium tracking-widest transition-colors hover:text-white"
              style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}
            >
              {link.label}
            </a>
          ))}
        </motion.nav>

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
      </header>

      {/* ── Texte hero — directement sous la nav ── */}
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-0">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1
            className="font-black leading-[1.02] tracking-tight mb-5"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2.8rem, 5.5vw, 5rem)',
              color: '#FFFFFF',
              letterSpacing: '-0.05em',
            }}
          >
            We turn your property into an<br /> <span style={{ color: '#6845EC' }}>irresistible</span> place.
          </h1>

          <p
            className="text-lg md:text-xl leading-relaxed mb-7"
            style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '680px', letterSpacing: '-0.03em' }}
          >
            Professional, human-made video editing{' '}
            <strong style={{ color: '#fff', fontWeight: 600 }}>delivered in 48 hours.</strong>
            <br />
            <span style={{ whiteSpace: 'nowrap' }}>No freelancers, no AI, no hassle&hellip;just high-impact videos that attract attention and drive demand.</span>
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {/* View pricing — rectangle arrondi violet */}
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold text-white transition-all hover:opacity-90"
              style={{ background: '#6845EC', boxShadow: '0 4px 20px #6845EC50', textDecoration: 'none', letterSpacing: '-0.03em' }}
            >
              View pricing <ArrowRight className="h-4 w-4" />
            </a>

            {/* Book a call — rectangle arrondi blanc */}
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold transition-all hover:opacity-90"
              style={{ background: '#ffffff', color: '#0D0D0D', textDecoration: 'none', letterSpacing: '-0.03em' }}
            >
              Book a call
            </a>

            <span className="hidden md:block h-5 w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />

            <div className="flex items-center gap-1.5 text-base" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.03em' }}>
              <Users className="h-5 w-5" style={{ color: '#6845EC' }} />
              <span><strong style={{ color: '#fff' }}>1,000+</strong> customers</span>
            </div>

            <span className="hidden md:block h-5 w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />

            {/* Drapeau français SVG avec coins arrondis */}
            <div className="flex items-center gap-2 text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <svg width="22" height="16" viewBox="0 0 22 16" style={{ borderRadius: '3px', flexShrink: 0 }}>
                <rect width="22" height="16" rx="3" fill="#fff" />
                <rect width="7.33" height="16" rx="0" fill="#002395" />
                <rect x="7.33" width="7.34" height="16" fill="#fff" />
                <rect x="14.67" width="7.33" height="16" rx="0" fill="#ED2939" />
                {/* coins arrondis via clip */}
                <rect width="22" height="16" rx="3" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
              </svg>
              <span>Registered in France</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Tablette vidéo ── */}
      <ContainerScroll titleComponent={null}>
        <video
          ref={videoRef}
          src="https://kcnccoy8rycyq3xs.public.blob.vercel-storage.com/presentation.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      </ContainerScroll>
    </div>
  )
}

/* ─────────────────────────────────────────
   MARQUEE
───────────────────────────────────────── */
function Marquee() {
  const items = [
    'TikTok', 'YouTube', 'Instagram Reels', 'Meta Ads',
    'YouTube Shorts', 'Corporate Video', 'Real Estate', 'LinkedIn',
    'Product Videos', 'Motion Design', 'Color Grading',
  ]
  const doubled = [...items, ...items]

  return (
    <div className="border-y py-4 overflow-hidden" style={{ background: '#F2EAE4', borderColor: 'rgba(0,0,0,0.06)' }}>
      <div className="flex whitespace-nowrap animate-marquee">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center mx-5">
            <span className="font-heading font-semibold text-xs uppercase tracking-[0.15em]" style={{ color: 'rgba(45,64,119,0.45)' }}>
              {item}
            </span>
            <span className="ml-5 text-lg" style={{ color: 'rgba(104,69,236,0.3)' }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   TARGETS
───────────────────────────────────────── */
const BELIEF_BULLETS = [
  { left: 'Capture attention instantly', right: 'Make your property look 10x more attractive' },
  { left: 'Sell properties faster', right: 'Increase your rental conversion rate' },
  { left: 'No shortcuts, just premium editing', right: 'Top 1% editors in the world', rightAccent: true },
]

function Targets() {
  return (
    <section id="services" className="py-28 relative overflow-hidden" style={{ background: '#FAFAFA' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          {/* ── Left: text + bullets ── */}
          <FadeIn className="flex-[1.4] min-w-0">
            <p
              className="font-sans font-bold mb-8"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.2rem)', color: '#111827', letterSpacing: '-0.05em', lineHeight: '1.35' }}
            >
              We believe great properties{' '}
              <span style={{ color: '#6845EC' }}>shouldn't be overlooked.</span>{' '}
              So we turn yours into a high-demand listing,{' '}
              <span style={{ color: '#6845EC' }}>in 48 hours.</span>
            </p>

            {/* 2-col bullet grid — chaque cellule a sa propre underline */}
            <div className="grid grid-cols-2 gap-x-10">
              {BELIEF_BULLETS.flatMap((row, i) => [
                /* Left cell */
                <div
                  key={`l${i}`}
                  className="py-1.5"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.13)' }}
                >
                  <span className="font-sans text-xl font-medium" style={{ color: '#111827', lineHeight: '1.3', letterSpacing: '-0.05em' }}>
                    {row.left}
                  </span>
                </div>,

                /* Right cell */
                <div
                  key={`r${i}`}
                  className="py-2.5"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.13)' }}
                >
                  {row.rightAccent ? (
                    <span
                      className="font-sans text-xl font-semibold px-4 py-0.5 rounded-full inline-block w-fit"
                      style={{ background: '#6845EC', color: '#fff', letterSpacing: '-0.05em' }}
                    >
                      {row.right}
                    </span>
                  ) : (
                    <span className="font-sans text-xl font-medium" style={{ color: '#111827', lineHeight: '1.3', letterSpacing: '-0.05em' }}>
                      {row.right}
                    </span>
                  )}
                </div>,
              ])}
            </div>
          </FadeIn>

          {/* ── Right: Before / After video slots ── */}
          <FadeIn delay={120} className="flex-shrink-0 flex items-end gap-7">
            {/* Before */}
            <div className="flex flex-col items-center gap-4">
              <span
                className="font-sans text-sm font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(17,24,39,0.4)' }}
              >
                Before
              </span>
              <div
                className="rounded-2xl flex flex-col items-center justify-center gap-4"
                style={{
                  width: '280px',
                  height: '500px',
                  background: '#E0E0E0',
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              >
                <Film size={44} style={{ color: 'rgba(17,24,39,0.25)' }} />
                <span className="font-sans text-base" style={{ color: 'rgba(17,24,39,0.4)' }}>Your raw footage</span>
              </div>
            </div>

            {/* After */}
            <div className="flex flex-col items-center gap-4">
              <span
                className="font-sans text-sm font-semibold uppercase tracking-widest"
                style={{ color: '#6845EC' }}
              >
                After
              </span>
              <div
                className="rounded-2xl flex flex-col items-center justify-center gap-4"
                style={{
                  width: '280px',
                  height: '500px',
                  background: 'rgba(104,69,236,0.05)',
                  border: '2px solid #6845EC',
                  boxShadow: '0 0 60px rgba(104,69,236,0.25), inset 0 0 50px rgba(104,69,236,0.06)',
                }}
              >
                <Clapperboard size={44} style={{ color: '#6845EC' }} />
                <span className="font-sans text-base font-semibold" style={{ color: '#6845EC' }}>Premium edit</span>
              </div>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  )
}



/* ─────────────────────────────────────────
   COMPARISON
───────────────────────────────────────── */
const COMPARISON_LEFT = [
  'Slow turnaround',
  'Basic presentation',
  'Easy to ignore',
]

const COMPARISON_RIGHT = [
  'Fast delivery',
  'Scroll-stopping videos',
  'Built to attract & convert',
]

function Services() {
  return (
    <section className="py-24 relative" style={{ background: '#FAFAFA' }}>
      <div className="max-w-4xl mx-auto px-6">

        {/* ── Header centré ── */}
        <FadeIn className="text-center mb-14">
          {/* Étoiles */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#6845EC">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
            <span className="font-sans text-sm font-medium ml-1" style={{ color: '#6845EC', letterSpacing: '-0.03em' }}>
              +1,000 – 5 star reviews
            </span>
          </div>

          {/* Titre */}
          <h2
            className="font-sans font-black mb-4"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              color: '#0D0D0D',
              letterSpacing: '-0.05em',
              lineHeight: '1.05',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            From invisible to high-demand,<br />in 48 hours.
          </h2>

          {/* Sous-titre */}
          <p
            className="font-sans"
            style={{ fontSize: '1rem', color: 'rgba(17,24,39,0.5)', letterSpacing: '-0.03em', lineHeight: '1.5' }}
          >
            Your property deserves attention. We make sure it gets it.
          </p>
        </FadeIn>

        {/* ── Tableau comparatif ── */}
        <FadeIn delay={80}>
          <div className="grid grid-cols-2">

            {/* Colonne Gauche */}
            <div className="pr-8 md:pr-14">
              <h3
                className="font-sans font-bold mb-6"
                style={{ fontSize: '1.25rem', color: '#0D0D0D', letterSpacing: '-0.04em' }}
              >
                Traditional approach
              </h3>
              {COMPARISON_LEFT.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-4"
                  style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
                >
                  {/* Icône X grise */}
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.07)' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2l6 6M8 2l-6 6" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span
                    className="font-sans"
                    style={{ fontSize: '0.95rem', color: 'rgba(17,24,39,0.55)', letterSpacing: '-0.03em' }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Colonne Droite */}
            <div className="pl-8 md:pl-14" style={{ borderLeft: '1px solid rgba(0,0,0,0.08)' }}>
              <h3
                className="font-sans font-bold mb-6"
                style={{ fontSize: '1.25rem', color: '#0D0D0D', letterSpacing: '-0.04em' }}
              >
                Shortcut
              </h3>
              {COMPARISON_RIGHT.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-4"
                  style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
                >
                  {/* Icône violette */}
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: '#6845EC' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span
                    className="font-sans font-medium"
                    style={{ fontSize: '0.95rem', color: '#0D0D0D', letterSpacing: '-0.03em' }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </FadeIn>

      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   ZOOM PARALLAX DEMO
───────────────────────────────────────── */
const PARALLAX_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
    alt: 'Modern architecture building',
  },
  {
    src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
    alt: 'Urban cityscape at sunset',
  },
  {
    src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=800&fit=crop&crop=entropy&auto=format&q=80',
    alt: 'Abstract geometric pattern',
  },
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
    alt: 'Mountain landscape',
  },
  {
    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop&crop=entropy&auto=format&q=80',
    alt: 'Minimalist design elements',
  },
  {
    src: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
    alt: 'Ocean waves and beach',
  },
  {
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
    alt: 'Forest trees and sunlight',
  },
]

function ZoomParallaxSection() {
  return (
    <section className="relative w-full" style={{ background: '#FAFAFA' }}>
      <ZoomParallax images={PARALLAX_IMAGES} />
      <div className="h-[20vh]" />
    </section>
  )
}

/* ─────────────────────────────────────────
   PROCESS
───────────────────────────────────────── */
const STEPS = [
  {
    n: '01',
    icon: Upload,
    title: 'Send your content',
    desc: 'Upload your footage, give us a brief, and share your brand assets. Takes less than 5 minutes.',
  },
  {
    n: '02',
    icon: Scissors,
    title: 'We edit & optimize',
    desc: 'Our editors craft your video with precision — optimized for your platform and audience.',
  },
  {
    n: '03',
    icon: Rocket,
    title: 'You get results',
    desc: 'Receive your polished video within 24–72h. Unlimited revisions until you\'re 100% happy.',
  },
]

function Process() {
  return (
    <section id="process" className="py-28" style={{ background: '#FAFAFA' }}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="text-center mb-16">
          <span className="section-label justify-center">How it works</span>
          <h2 className="font-display text-5xl md:text-6xl tracking-wide mb-4" style={{ color: '#111827', letterSpacing: '-0.04em' }}>
            THREE STEPS.<br />ZERO HASSLE.
          </h2>
          <p className="font-sans max-w-md mx-auto" style={{ color: 'rgba(17,24,39,0.45)' }}>
            We made the process as simple as possible so you can focus on creating.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div
            className="hidden md:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-[1px] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(104,69,236,0.3), rgba(45,64,119,0.3), transparent)',
            }}
          />

          {STEPS.map((step, i) => (
            <FadeIn key={step.n} delay={i * 150}>
              <div className="flex flex-col items-center text-center">
                {/* Number + icon */}
                <div className="relative mb-7">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center relative z-10"
                    style={{
                      background: 'linear-gradient(135deg, rgba(104,69,236,0.12), rgba(45,64,119,0.08))',
                      border: '1px solid rgba(104,69,236,0.2)',
                      boxShadow: '0 0 40px rgba(104,69,236,0.1)',
                    }}
                  >
                    <step.icon size={28} style={{ color: '#6845EC' }} />
                  </div>
                  <span
                    className="absolute -top-2 -right-2 font-display text-4xl leading-none z-20"
                    style={{ color: 'rgba(104,69,236,0.5)' }}
                  >
                    {step.n}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-xl mb-3" style={{ color: '#111827' }}>{step.title}</h3>
                <p className="font-sans text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(17,24,39,0.45)' }}>
                  {step.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   WHY US
───────────────────────────────────────── */
const STATS = [
  { value: '24h', label: 'Avg. delivery time', sub: 'Rush options available', icon: Zap },
  { value: '100+', label: 'Happy clients', sub: 'Creators, brands & agencies', icon: Users },
  { value: '4.9★', label: 'Average rating', sub: 'Across all platforms', icon: Star },
  { value: '∞', label: 'Revisions included', sub: 'Until you love it', icon: RefreshCw },
]

const FEATURES = [
  { icon: Clock, title: 'Fast delivery', desc: 'Most projects delivered in 24–72h. Rush delivery available for urgent content.' },
  { icon: Award, title: 'Premium quality', desc: 'Every edit is crafted by experienced video editors who know what converts.' },
  { icon: TrendingUp, title: 'Results-driven', desc: 'We don\'t just make pretty videos — we make videos that grow accounts and sell.' },
  { icon: Globe, title: 'Platform-native', desc: 'Deep knowledge of every platform\'s algorithm, format, and audience behavior.' },
]

function WhyUs() {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background: '#F2EAE4' }}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="text-center mb-16">
          <span className="section-label justify-center">Why shortcut</span>
          <h2 className="font-display text-5xl md:text-6xl tracking-wide mb-4" style={{ color: '#111827', letterSpacing: '-0.04em' }}>
            THE UNFAIR<br />ADVANTAGE
          </h2>
        </FadeIn>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {STATS.map((s, i) => (
            <FadeIn key={s.label} delay={i * 80}>
              <div
                className="p-6 rounded-2xl text-center"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.07)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(104,69,236,0.1)', border: '1px solid rgba(104,69,236,0.18)' }}
                >
                  <s.icon size={18} style={{ color: '#6845EC' }} />
                </div>
                <div className="font-display text-4xl tracking-wide mb-1" style={{ color: '#2D4077' }}>{s.value}</div>
                <div className="font-sans text-sm font-medium mb-0.5" style={{ color: 'rgba(17,24,39,0.7)' }}>{s.label}</div>
                <div className="font-sans text-xs" style={{ color: 'rgba(17,24,39,0.35)' }}>{s.sub}</div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 80}>
              <div
                className="p-6 rounded-2xl flex gap-5 card-glow"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.07)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(104,69,236,0.1)', border: '1px solid rgba(104,69,236,0.18)' }}
                >
                  <f.icon size={18} style={{ color: '#6845EC' }} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base mb-1.5" style={{ color: '#111827' }}>{f.title}</h3>
                  <p className="font-sans text-sm leading-relaxed" style={{ color: 'rgba(17,24,39,0.45)' }}>{f.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   PORTFOLIO
───────────────────────────────────────── */
const PORTFOLIO_FRAMES = [
  { id: 1, video: '/videos/patoche.mp4', defaultPos: { x: 0, y: 0, w: 4, h: 4 }, mediaSize: 1, isHovered: false },
  { id: 2, video: '/videos/jkitout.mp4', defaultPos: { x: 4, y: 0, w: 4, h: 4 }, mediaSize: 1, isHovered: false },
  { id: 3, video: '/videos/appartement-liege.mp4', defaultPos: { x: 8, y: 0, w: 4, h: 4 }, mediaSize: 1, isHovered: false },
  { id: 4, video: '/videos/bakary.mp4', defaultPos: { x: 0, y: 4, w: 4, h: 4 }, mediaSize: 1, isHovered: false },
  { id: 5, video: 'https://static.cdn-luma.com/files/58ab7363888153e3/Logo%20Exported.mp4', defaultPos: { x: 4, y: 4, w: 4, h: 4 }, mediaSize: 1, isHovered: false },
  { id: 6, video: 'https://static.cdn-luma.com/files/58ab7363888153e3/Animation%20Exported%20(4).mp4', defaultPos: { x: 8, y: 4, w: 4, h: 4 }, mediaSize: 1, isHovered: false },
  { id: 7, video: 'https://static.cdn-luma.com/files/58ab7363888153e3/Illustration%20Exported%20(1).mp4', defaultPos: { x: 0, y: 8, w: 4, h: 4 }, mediaSize: 1, isHovered: false },
  { id: 8, video: 'https://static.cdn-luma.com/files/58ab7363888153e3/Art%20Direction%20Exported.mp4', defaultPos: { x: 4, y: 8, w: 4, h: 4 }, mediaSize: 1, isHovered: false },
  { id: 9, video: 'https://static.cdn-luma.com/files/58ab7363888153e3/Product%20Video.mp4', defaultPos: { x: 8, y: 8, w: 4, h: 4 }, mediaSize: 1, isHovered: false },
]

function Portfolio() {
  return (
    <section id="portfolio" className="py-28" style={{ background: '#FAFAFA' }}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="flex flex-col md:flex-row md:items-end gap-4 justify-between mb-14">
          <div>
            <span className="section-label">Our work</span>
            <h2 className="font-display text-5xl md:text-6xl tracking-wide" style={{ color: '#111827', letterSpacing: '-0.04em' }}>
              PORTFOLIO
            </h2>
          </div>
          <a href="#contact" className="btn-secondary shrink-0 self-start md:self-auto">
            Work with us <ArrowRight size={14} />
          </a>
        </FadeIn>

        <div style={{ height: '75vh' }}>
          <DynamicFrameLayout
            frames={PORTFOLIO_FRAMES}
            className="rounded-xl overflow-hidden"
            hoverSize={6}
            gapSize={4}
          />
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote: 'Shortcut doubled my average views within 2 weeks. The edits feel premium but they also hook people in the first second. Game changer.',
    name: 'Jordan Lee',
    role: '@jordan.creates',
    sub: '1.2M followers · TikTok',
    initials: 'JL',
    color: '#6845EC',
  },
  {
    quote: 'Our Meta ad ROAS went from 1.8x to 4.2x after switching to Shortcut. They understand what makes people stop scrolling and buy.',
    name: 'Sarah Mitchell',
    role: 'CEO, Bloom Brand',
    sub: 'E-commerce · 7-figure brand',
    initials: 'SM',
    color: '#2D4077',
  },
  {
    quote: 'Best investment I\'ve made for my property listings. We sold a $3.2M property in 4 days — the video got 847K views organically.',
    name: 'Marcus Devlin',
    role: 'Founder, Devlin Realty',
    sub: 'Luxury Real Estate · Miami',
    initials: 'MD',
    color: '#6845EC',
  },
  {
    quote: 'I\'ve worked with 3 other editing agencies. Shortcut is on a different level. Turnaround is insanely fast and they nail my aesthetic every time.',
    name: 'Priya Sharma',
    role: '@priyalifestyle',
    sub: '890K followers · Instagram',
    initials: 'PS',
    color: '#2D4077',
  },
]

function Testimonials() {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background: '#F2EAE4' }}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="text-center mb-16">
          <span className="section-label justify-center">Testimonials</span>
          <h2 className="font-display text-5xl md:text-6xl tracking-wide mb-4" style={{ color: '#111827', letterSpacing: '-0.04em' }}>
            DON'T TAKE<br />OUR WORD FOR IT
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 100}>
              <div
                className="p-7 rounded-2xl h-full card-glow"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.07)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} style={{ fill: '#6845EC', color: '#6845EC' }} />
                  ))}
                </div>

                {/* Quote mark */}
                <div className="font-display text-6xl leading-none mb-2" style={{ color: 'rgba(104,69,236,0.1)' }}>"</div>

                <p className="font-sans leading-relaxed mb-7 text-base" style={{ color: 'rgba(17,24,39,0.65)' }}>
                  {t.quote}
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-heading font-bold text-white shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-sm" style={{ color: '#111827' }}>{t.name}</p>
                    <p className="font-sans text-xs" style={{ color: 'rgba(17,24,39,0.4)' }}>{t.role} · {t.sub}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   PRICING
───────────────────────────────────────── */
const PLANS = [
  {
    name: 'Vertical Impact',
    price: '$250',
    priceSub: { duration: '30 sec', footage: '30 min' },
    priceAlt: '$350',
    priceAltSub: { duration: '60 sec', footage: '60 min' },
    desc: 'Perfect for quick property visibility. Vertical format optimised for TikTok, Reels & Shorts.',
    features: [
      'Smooth & dynamic transitions',
      'Speed ramping',
      'Premium color grading',
      'Music synchronization',
      'Attention-optimized rhythm',
      'Day / Night effect',
      'Aerial view simulation (drone)',
    ],
    options: [
      { name: 'People Integration', desc: 'Bring the space to life — warm, welcoming and truly lived-in.', price: '$80' },
      { name: 'Interactive Environment', desc: 'Lights turning on, vibrant ambiance, dynamic atmosphere.', price: '$80' },
    ],
    cta: 'Order now',
    highlight: false,
  },
  {
    name: 'Cinematic',
    price: '$450',
    priceSub: { duration: '30 sec', footage: '30 min' },
    priceAlt: '$600',
    priceAltSub: { duration: '60 sec', footage: '60 min' },
    desc: 'Ideal for a more immersive and impactful result, maximising appeal and bookings.',
    features: [
      'Smooth transitions',
      'Optimized dynamics',
      'Speed ramping',
      'Premium color grading',
      'Music synchronization',
      'Attention-optimized rhythm',
      'Day / Night effect',
      'Aerial view simulation (drone)',
      'Enhanced storytelling',
      'Better space highlighting',
    ],
    options: [
      { name: 'Virtual Staging', desc: 'Transforms an empty space into a vibrant, attractive place. Realistic furniture & lifestyle integration to reveal the full potential of the property.', price: '$135' },
      { name: 'People Integration', desc: 'Bring the space to life — warm, welcoming and truly lived-in.', price: '$80' },
      { name: 'Interactive Environment', desc: 'Lights turning on, vibrant ambiance, dynamic atmosphere.', price: '$80' },
    ],
    cta: 'Order now',
    highlight: true,
  },
  {
    name: 'Signature',
    price: 'From $1,000',
    priceSub: '1 video · up to 5 min · no footage limits',
    priceAlt: null,
    priceAltSub: null,
    desc: 'For high-end properties and fully bespoke projects. No limits, no compromises.',
    features: [
      'No limits on footage or duration',
      'Fully custom edit',
      'Dedicated artistic direction',
      'Cinematic storytelling',
      'Premium pacing & narration',
      'Smooth transitions & speed ramping',
      'Advanced color grading',
      'Immersive sound design',
      'Day / Night effect & aerial view',
      'Better space highlighting',
      'People integration — included',
      'Interactive environment — included',
      'Virtual staging — included',
    ],
    options: [],
    cta: 'Order now',
    highlight: false,
  },
]

function PricingCard({ plan, highlight }) {
  const [btnHovered, setBtnHovered] = useState(false)
  const hl = highlight

  const btnStyle = hl
    ? {
      background: btnHovered ? '#5a38d4' : '#6845EC',
      color: '#FFFFFF',
      border: '2px solid #6845EC',
      boxShadow: '0 6px 24px rgba(104,69,236,0.3)',
    }
    : {
      background: btnHovered ? '#6845EC' : '#FFFFFF',
      color: btnHovered ? '#FFFFFF' : '#6845EC',
      border: '2px solid #6845EC',
    }

  return (
    <div
      className="rounded-2xl p-8 h-full flex flex-col relative"
      style={{
        background: '#FFFFFF',
        border: hl ? '2px solid #6845EC' : '1px solid rgba(0,0,0,0.08)',
        boxShadow: hl ? '0 8px 40px rgba(104,69,236,0.15)' : '0 2px 16px rgba(0,0,0,0.05)',
      }}
    >
      {/* MOST POPULAR badge */}
      {hl && (
        <div className="absolute -top-4 left-1/2" style={{ transform: 'translateX(-50%)' }}>
          <span
            className="font-sans font-bold px-5 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap"
            style={{ background: '#6845EC', color: '#fff', fontSize: '0.65rem' }}
          >
            Most Popular
          </span>
        </div>
      )}

      {/* Top section — fixed min-height; desc pushed to bottom via mt-auto so buttons align */}
      <div className="flex flex-col" style={{ minHeight: '220px' }}>
        {/* 1. Title */}
        <p
          className="mb-4"
          style={{
            fontFamily: "'Barlow Semi Condensed', sans-serif",
            fontWeight: 800,
            color: '#111827',
            fontSize: '2rem',
            lineHeight: 1.15,
            letterSpacing: '0.01em',
          }}
        >{plan.name}</p>

        {/* 2. Price block — 2-col grid: prices bottom-aligned in row 1, descriptions in row 2 */}
        {plan.priceAlt ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: '16px',
            alignItems: 'end',
          }}>
            {/* Row 1 — prices */}
            <span
              className="font-display tracking-wide leading-none"
              style={{ fontSize: '4rem', color: '#111827' }}
            >{plan.price}</span>
            <span
              className="font-display tracking-wide leading-none"
              style={{ fontSize: '2.2rem', color: '#6845EC' }}
            >{plan.priceAlt}</span>
            {/* Row 2 — descriptions, same y-start */}
            <p className="font-sans" style={{ color: 'rgba(17,24,39,0.45)', fontSize: '0.75rem', lineHeight: 1.55, marginTop: '5px' }}>
              1 video · up to {plan.priceSub.duration}<br />
              up to {plan.priceSub.footage} footage
            </p>
            <p className="font-sans" style={{ color: 'rgba(17,24,39,0.45)', fontSize: '0.75rem', lineHeight: 1.55, marginTop: '5px' }}>
              1 video · up to {plan.priceAltSub.duration}<br />
              up to {plan.priceAltSub.footage} footage
            </p>
          </div>
        ) : (
          <div>
            <span
              className="font-display tracking-wide leading-none"
              style={{ fontSize: '4rem', color: '#111827' }}
            >{plan.price}</span>
            {plan.priceSub && (
              <p className="font-sans" style={{ color: 'rgba(17,24,39,0.45)', fontSize: '0.75rem', lineHeight: 1.55, marginTop: '5px' }}>
                {plan.priceSub}
              </p>
            )}
          </div>
        )}

        {/* 3. Description — pushed to bottom of top section */}
        <p
          className="font-sans leading-relaxed mt-auto pt-2"
          style={{ color: 'rgba(17,24,39,0.55)', fontSize: '1rem' }}
        >{plan.desc}</p>
      </div>

      {/* 4. CTA button — rounded rectangle, not pill */}
      <a
        href="#contact"
        className="w-full text-center font-sans font-bold py-4 rounded-xl mt-5 mb-5"
        style={{
          textDecoration: 'none',
          display: 'block',
          fontSize: '1.125rem',
          transition: 'all 0.2s ease',
          ...btnStyle,
        }}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
      >
        Order now →
      </a>

      {/* 5. Money-back guarantee with logo */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <img src="/logo-guarantee.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <p className="font-sans font-semibold" style={{ color: '#6845EC', fontSize: '0.8rem' }}>
          100% money-Back Guarantee
        </p>
      </div>

      {/* Divider */}
      <div className="mb-5" style={{ height: '1px', background: 'rgba(0,0,0,0.08)' }} />

      {/* Bottom area — features have fixed minHeight so add-ons start at same y across all 3 columns */}
      <div className="flex flex-col flex-1">
        {/* 6. Included features */}
        <ul className="space-y-3" style={{ minHeight: '340px' }}>
          {plan.features.map(f => (
            <li key={f} className="flex items-start gap-3">
              <Check size={16} className="shrink-0 mt-0.5" style={{ color: '#6845EC' }} strokeWidth={2.5} />
              <span className="font-sans leading-snug" style={{ color: '#111827', fontSize: '1rem' }}>{f}</span>
            </li>
          ))}
        </ul>

        {/* 7. Options / Add-ons */}
        {plan.options.length > 0 && (
          <div className="mt-6">
            <div className="mb-4" style={{ height: '1px', background: 'rgba(0,0,0,0.08)' }} />
            {/* Title with SVG 2-wave underline */}
            <div className="mb-4">
              <p
                style={{
                  fontFamily: "'Barlow Semi Condensed', sans-serif",
                  fontWeight: 800,
                  color: '#111827',
                  fontSize: '1.15rem',
                  lineHeight: 1.3,
                  letterSpacing: '0.01em',
                }}
              >Optional Add-ons</p>
              <svg viewBox="0 0 200 10" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '6px', marginTop: '4px' }}>
                <path d="M0,5 Q25,2 50,5 Q75,8 100,5 Q125,2 150,5 Q175,8 200,5" stroke="#6845EC" strokeWidth="1.8" fill="none" opacity="0.65" />
              </svg>
            </div>
            <ul className="space-y-4">
              {plan.options.map(o => (
                <li key={o.name} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold"
                    style={{ background: 'rgba(104,69,236,0.1)', color: '#6845EC', fontSize: '1rem' }}
                  >+</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-sans font-bold leading-snug" style={{ color: '#111827', fontSize: '1rem' }}>
                        {o.name}
                      </p>
                      <span
                        className="font-sans font-bold"
                        style={{ color: '#6845EC', fontSize: '0.95rem' }}
                      >{o.price}</span>
                    </div>
                    <p className="font-sans leading-snug mt-0.5" style={{ color: 'rgba(17,24,39,0.5)', fontSize: '0.875rem' }}>
                      {o.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function Pricing() {
  return (
    <section id="pricing" className="py-28" style={{ background: '#FAFAFA' }}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="text-center mb-16">
          <span className="section-label justify-center">Pricing</span>
          <h2 className="font-display text-5xl md:text-6xl tracking-wide mb-4" style={{ color: '#111827', letterSpacing: '-0.04em' }}>
            SIMPLE,<br />TRANSPARENT PRICING
          </h2>
          <p className="font-sans max-w-md mx-auto" style={{ color: 'rgba(17,24,39,0.45)' }}>
            No hidden fees. Every package includes unlimited revisions until you're satisfied.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ alignItems: 'stretch' }}>
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 100} className="h-full">
              <PricingCard plan={plan} highlight={plan.highlight} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   FINAL CTA
───────────────────────────────────────── */
function FinalCTA() {
  return (
    <section id="contact" className="py-28 relative overflow-hidden" style={{ background: '#2D4077' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(104,69,236,0.25) 0%, transparent 65%)',
        }}
      />
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <FadeIn>
          <span className="section-label justify-center" style={{ color: 'rgba(242,234,228,0.7)' }}>
            Ready to start?
          </span>
        </FadeIn>
        <FadeIn delay={80}>
          <h2 className="font-display text-[clamp(3rem,8vw,6rem)] tracking-wide leading-[0.92] mb-6" style={{ color: '#FAFAFA', letterSpacing: '-0.05em' }}>
            READY TO UPGRADE<br />
            <span style={{ color: '#F2EAE4' }}>YOUR VIDEOS?</span>
          </h2>
        </FadeIn>
        <FadeIn delay={160}>
          <p className="font-sans text-lg max-w-lg mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(250,250,250,0.55)' }}>
            Join 100+ creators and brands getting premium edits delivered in 24h.
            First project? We'll do a{' '}
            <span style={{ color: '#F2EAE4' }}>free sample edit</span>.
          </p>
        </FadeIn>
        <FadeIn delay={240}>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="mailto:hello@shortcut.video" className="btn-primary text-base px-8 py-4">
              Book a free call <ArrowRight size={16} />
            </a>
            <a
              href="mailto:hello@shortcut.video"
              className="text-base px-8 py-4 inline-flex items-center gap-2 rounded-full font-sans font-semibold transition-all"
              style={{
                background: 'transparent',
                border: '1px solid rgba(242,234,228,0.3)',
                color: '#F2EAE4',
                textDecoration: 'none',
              }}
            >
              Send a project brief
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={320} className="mt-12 flex items-center justify-center gap-8">
          {['No contracts', 'Free revision', 'Fast delivery'].map(item => (
            <div key={item} className="flex items-center gap-2">
              <Check size={14} style={{ color: '#F2EAE4' }} strokeWidth={2.5} />
              <span className="font-sans text-sm" style={{ color: 'rgba(250,250,250,0.4)' }}>{item}</span>
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: '#FAFAFA', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: '#6845EC' }}
              >
                <Zap size={14} className="text-white fill-white" />
              </div>
              <span className="font-heading font-bold text-lg tracking-tight" style={{ color: '#111827' }}>
                shortcut<span style={{ color: '#6845EC' }}>.</span>
              </span>
            </div>
            <p className="font-sans text-sm leading-relaxed max-w-xs mb-6" style={{ color: 'rgba(17,24,39,0.4)' }}>
              High-performing videos for creators, brands, and real estate professionals. Delivered fast.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Youtube, href: '#' },
                { icon: Linkedin, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    background: 'rgba(104,69,236,0.07)',
                    border: '1px solid rgba(104,69,236,0.15)',
                    color: '#6845EC',
                  }}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: 'Services',
              links: ['Short-form', 'Long-form', 'Ads Editing', 'Motion Design', 'Color Grading'],
            },
            {
              title: 'Company',
              links: ['About', 'Work', 'Process', 'Pricing'],
            },
            {
              title: 'Contact',
              links: ['Book a call', 'Send brief', 'Partner with us', 'hello@shortcut.video'],
            },
          ].map(col => (
            <div key={col.title}>
              <p className="font-heading font-bold text-xs uppercase tracking-widest mb-4" style={{ color: 'rgba(17,24,39,0.5)' }}>
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-sans text-sm transition-colors"
                      style={{ color: 'rgba(17,24,39,0.35)' }}
                      onMouseOver={e => e.target.style.color = '#111827'}
                      onMouseOut={e => e.target.style.color = 'rgba(17,24,39,0.35)'}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <p className="font-sans text-xs" style={{ color: 'rgba(17,24,39,0.25)' }}>
            © 2025 Shortcut. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <a key={item} href="#" className="font-sans text-xs transition-colors" style={{ color: 'rgba(17,24,39,0.25)' }}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────
   APP
───────────────────────────────────────── */
export default function App() {
  return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh' }}>
      <Hero />
      <Marquee />
      <Targets />
      <Services />
      <ZoomParallaxSection />
      <Process />
      <WhyUs />
      <Portfolio />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  )
}
