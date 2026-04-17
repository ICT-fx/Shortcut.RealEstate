import { useState, useEffect, useRef } from 'react'
import {
  Zap, Scissors, Layers, Palette, Clock,
  Star, Check, ArrowRight, ArrowLeft, Film,
  Building2, Home, Users, TrendingUp, Award,
  Upload, RefreshCw, Rocket,
  Instagram, Twitter, Youtube, Linkedin,
  BarChart2, Globe, Clapperboard,
} from 'lucide-react'
import { motion } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { ContainerScroll } from './components/ui/container-scroll-animation'
import { ZoomParallax } from './components/ui/zoom-parallax'
import { TestimonialsColumn } from './components/ui/testimonials-columns'

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
    <section id="services" className="pt-28 pb-10 relative overflow-hidden" style={{ background: '#FAFAFA' }}>
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
              <video
                src={encodeURI('/video avant apres/Avant.mp4')}
                autoPlay
                loop
                muted
                playsInline
                className="rounded-2xl object-cover"
                style={{ width: '280px', height: '500px' }}
              />
            </div>

            {/* After */}
            <div className="flex flex-col items-center gap-4">
              <span
                className="font-sans text-sm font-semibold uppercase tracking-widest"
                style={{ color: '#6845EC' }}
              >
                After
              </span>
              <video
                src={encodeURI('/video avant apres/Après.mp4'.normalize('NFD'))}
                autoPlay
                loop
                muted
                playsInline
                className="rounded-2xl object-cover"
                style={{ width: '280px', height: '500px', border: '2px solid #6845EC', boxShadow: '0 0 60px rgba(104,69,236,0.25)' }}
              />
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
    <section className="pt-24 pb-24 relative" style={{ background: '#FAFAFA' }}>
      <div className="max-w-5xl mx-auto px-6">

        {/* ── Header centré ── */}
        <FadeIn className="text-center mb-14">
          {/* Étoiles */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#6845EC">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
            <span className="font-sans text-base font-medium ml-1" style={{ color: '#6845EC', letterSpacing: '-0.03em' }}>
              +1,000 – 5 star reviews
            </span>
          </div>

          {/* Titre */}
          <h2
            className="font-sans font-bold mb-4"
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
              color: '#111827',
              letterSpacing: '-0.05em',
              lineHeight: '1.2',
            }}
          >
            From invisible to high-demand, in 48 hours.
          </h2>

          {/* Sous-titre */}
          <p
            className="font-sans font-medium"
            style={{ fontSize: '1.5rem', color: 'rgba(17,24,39,0.65)', letterSpacing: '-0.03em', lineHeight: '1.5', marginTop: '1rem' }}
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
                style={{ fontSize: '1.75rem', color: '#111827', letterSpacing: '-0.04em' }}
              >
                Traditional approach
              </h3>
              {COMPARISON_LEFT.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-5"
                  style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
                >
                  {/* Icône X grise */}
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.07)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2l6 6M8 2l-6 6" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span
                    className="font-sans font-medium"
                    style={{ fontSize: '1.25rem', color: 'rgba(17,24,39,0.55)', letterSpacing: '-0.03em' }}
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
                style={{ fontSize: '1.75rem', color: '#111827', letterSpacing: '-0.04em' }}
              >
                Shortcut
              </h3>
              {COMPARISON_RIGHT.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-5"
                  style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
                >
                  {/* Icône violette */}
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: '#6845EC' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 11 11" fill="none">
                      <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span
                    className="font-sans font-semibold"
                    style={{ fontSize: '1.25rem', color: '#111827', letterSpacing: '-0.03em' }}
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
   VALUE PROPS
───────────────────────────────────────── */
function VideoPlaceholder({ aspect = '16/9', label = 'Vidéo à venir' }) {
  const isVertical = aspect === '9/16'
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-2xl w-full"
      style={{
        aspectRatio: aspect,
        background: 'rgba(17,24,39,0.06)',
        maxWidth: isVertical ? 280 : '100%',
      }}
    >
      {/* Play button */}
      <div
        className="flex flex-col items-center gap-3"
        style={{ color: 'rgba(17,24,39,0.25)' }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 64, height: 64, background: 'rgba(17,24,39,0.08)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="rgba(17,24,39,0.35)">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <span className="font-sans text-sm" style={{ letterSpacing: '-0.02em' }}>{label}</span>
      </div>
    </div>
  )
}

const slideIn = (dir, delay = 0) => ({
  initial: { opacity: 0, x: dir === 'left' ? -90 : 90 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: delay / 1000 },
})

const popIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.7 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, amount: 0.5 },
  transition: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1], delay: delay / 1000 },
})

const gradientText = {
  backgroundImage: 'linear-gradient(135deg, #6845EC 0%, #9B6FFF 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

function ValueProps() {
  return (
    <section className="py-28" style={{ background: '#FAFAFA' }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-36">

        {/* ── Row 1 — Texte depuis gauche, vidéo depuis droite ── */}
        <div className="grid grid-cols-12 gap-16 items-center">
          <motion.div className="col-span-12 md:col-span-5 flex flex-col gap-6" {...slideIn('left')}>
            <h3
              className="font-sans font-bold"
              style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.4rem)', color: '#111827', letterSpacing: '-0.05em', lineHeight: 1.1 }}
            >
              Increase the perceived{' '}
              <span style={gradientText}>value</span>{' '}
              of your property
            </h3>
            <p
              className="font-sans"
              style={{ fontSize: '1.45rem', color: 'rgba(17,24,39,0.55)', letterSpacing: '-0.03em', lineHeight: 1.65 }}
            >
              The way your property is presented directly impacts how much it's worth in the eyes of clients.
            </p>
          </motion.div>
          <motion.div className="col-span-12 md:col-span-7" {...slideIn('right', 120)}>
            <VideoPlaceholder aspect="16/9" />
          </motion.div>
        </div>

        {/* ── Row 2 — Vidéo depuis gauche, texte depuis droite ── */}
        <div className="grid grid-cols-12 gap-16 items-center">
          <motion.div className="col-span-12 md:col-span-3 flex justify-center md:justify-start" {...slideIn('left')}>
            <VideoPlaceholder aspect="9/16" label="Vidéo réseaux sociaux" />
          </motion.div>
          <motion.div className="col-span-12 md:col-span-9 flex flex-col gap-6" {...slideIn('right', 120)}>
            <h3
              className="font-sans font-bold"
              style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.4rem)', color: '#111827', letterSpacing: '-0.05em', lineHeight: 1.1 }}
            >
              Turn{' '}
              <span style={gradientText}>attention</span>{' '}
              into real bookings
            </h3>
            <p
              className="font-sans"
              style={{ fontSize: '1.45rem', color: 'rgba(17,24,39,0.55)', letterSpacing: '-0.03em', lineHeight: 1.65 }}
            >
              Views don't matter if they don't convert.{' '}
              We create videos designed to make people{' '}
              <span className="font-semibold" style={{ color: '#111827' }}>click, book, and act.</span>
            </p>
          </motion.div>
        </div>

        {/* ── Row 3 — Texte depuis gauche, vidéo depuis droite ── */}
        <div className="grid grid-cols-12 gap-16 items-center">
          <motion.div className="col-span-12 md:col-span-5 flex flex-col gap-6" {...slideIn('left')}>
            <h3
              className="font-sans font-bold"
              style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.4rem)', color: '#111827', letterSpacing: '-0.05em', lineHeight: 1.1 }}
            >
              Sell and rent{' '}
              <span style={gradientText}>faster</span>
            </h3>
            <p
              className="font-sans"
              style={{ fontSize: '1.45rem', color: 'rgba(17,24,39,0.55)', letterSpacing: '-0.03em', lineHeight: 1.65 }}
            >
              The more attractive your property is, the faster it gets attention and results.
            </p>
            <p className="font-sans" style={{ fontSize: '1.45rem', color: 'rgba(17,24,39,0.55)', letterSpacing: '-0.03em', lineHeight: 1.65 }}>
              With our videos, sell your property around{' '}
              <motion.span
                className="font-black"
                style={{ color: '#6845EC', fontSize: '1.55rem', letterSpacing: '-0.05em' }}
                {...popIn(200)}
              >
                30%
              </motion.span>{' '}
              faster and attract{' '}
              <motion.span
                className="font-black"
                style={{ color: '#6845EC', fontSize: '1.55rem', letterSpacing: '-0.05em' }}
                {...popIn(380)}
              >
                40–50%
              </motion.span>{' '}
              more potential renters.
            </p>
          </motion.div>
          <motion.div className="col-span-12 md:col-span-7" {...slideIn('right', 120)}>
            <VideoPlaceholder aspect="16/9" />
          </motion.div>
        </div>

        {/* ── Enter a new way... ── */}
        <div className="text-center py-8 flex flex-col items-center gap-3">
          <motion.p
            className="font-display"
            style={{ fontSize: 'clamp(5rem, 12vw, 10rem)', color: '#111827', letterSpacing: '-0.04em', lineHeight: 1 }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            ENT<span style={gradientText}>ER</span>
          </motion.p>
          <motion.p
            className="font-display"
            style={{ fontSize: 'clamp(2.4rem, 5.5vw, 5rem)', color: '#111827', letterSpacing: '-0.04em', lineHeight: 1.1 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
          >
            A NEW WAY OF SELLING YOUR PROPERTY
          </motion.p>
        </div>

      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   ZOOM PARALLAX DEMO
───────────────────────────────────────── */
const photo = (name) => encodeURI(`/Photos animation /${name}`)

const PARALLAX_IMAGES = [
  { src: '', alt: '' }, // slot 0 — remplacé par le canvas vidéo
  {
    src: photo('Make your property look 10x more attractive.png'),
    alt: 'Property photography',
  },
  {
    src: photo('Increase your bookings instantly.png'),
    alt: 'Property bookings',
  },
  {
    src: photo('Turn views into real bookings.png'),
    alt: 'Convert views to bookings',
  },
  {
    src: photo('Sell your property faster.png'),
    alt: 'Sell property faster',
  },
  {
    src: photo('Stand out in crowded platforms.png'),
    alt: 'Stand out online',
  },
  {
    src: photo("Increase your property\u2019s perceived value.png"),
    alt: 'Property perceived value',
  },
]

function ZoomParallaxSection() {
  return (
    <section className="relative w-full" style={{ background: '#FAFAFA' }}>
      <ZoomParallax images={PARALLAX_IMAGES} />
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
const PORTFOLIO_ITEMS = [
  {
    id: 1,
    title: 'Luxury Villa — Dubai',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=800&fit=crop',
    video: 'https://static.cdn-luma.com/files/58ab7363888153e3/Logo%20Exported.mp4',
  },
  {
    id: 2,
    title: 'Modern Penthouse — Paris',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=800&fit=crop',
    video: 'https://static.cdn-luma.com/files/58ab7363888153e3/Animation%20Exported%20(4).mp4',
  },
  {
    id: 3,
    title: 'Seaside Retreat — Côte d\'Azur',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=800&fit=crop',
    video: 'https://static.cdn-luma.com/files/58ab7363888153e3/Illustration%20Exported%20(1).mp4',
  },
  {
    id: 4,
    title: 'Contemporary Loft — London',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=800&fit=crop',
    video: 'https://static.cdn-luma.com/files/58ab7363888153e3/Art%20Direction%20Exported.mp4',
  },
  {
    id: 5,
    title: 'Exclusive Estate — Miami',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&h=800&fit=crop',
    video: 'https://static.cdn-luma.com/files/58ab7363888153e3/Product%20Video.mp4',
  },
]

function PortfolioCard({ item }) {
  const videoRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  const handleEnter = () => {
    setHovered(true)
    videoRef.current?.play()
  }
  const handleLeave = () => {
    setHovered(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ width: 'min(300px, 80vw)', height: 'min(420px, 112vw)', cursor: 'pointer', userSelect: 'none' }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Image statique */}
      <img
        src={item.image}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      {/* Vidéo au hover */}
      <video
        ref={videoRef}
        src={item.video}
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.35s ease' }}
      />
      {/* Overlay gradient + titre (disparaît au hover) */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-6"
        style={{
          background: 'linear-gradient(to top, rgba(7,7,15,0.88) 0%, rgba(7,7,15,0.18) 55%, transparent 100%)',
          opacity: hovered ? 0 : 1,
          transition: 'opacity 0.35s ease',
          pointerEvents: 'none',
        }}
      >
        <h3
          className="font-sans font-bold text-white text-lg leading-tight"
          style={{ letterSpacing: '-0.04em' }}
        >
          {item.title}
        </h3>
      </div>
    </div>
  )
}

function Portfolio() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: 'start', dragFree: true },
    [WheelGesturesPlugin()]
  )
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const update = () => {
      setCanPrev(emblaApi.canScrollPrev())
      setCanNext(emblaApi.canScrollNext())
      setCurrent(emblaApi.selectedScrollSnap())
    }
    update()
    emblaApi.on('select', update)
    return () => emblaApi.off('select', update)
  }, [emblaApi])

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                border: `1.5px solid ${canPrev ? '#6845EC' : 'rgba(0,0,0,0.15)'}`,
                color: canPrev ? '#6845EC' : 'rgba(0,0,0,0.25)',
                background: 'transparent',
                cursor: canPrev ? 'pointer' : 'default',
              }}
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                border: `1.5px solid ${canNext ? '#6845EC' : 'rgba(0,0,0,0.15)'}`,
                color: canNext ? '#6845EC' : 'rgba(0,0,0,0.25)',
                background: 'transparent',
                cursor: canNext ? 'pointer' : 'default',
              }}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </FadeIn>
      </div>

      {/* Carousel pleine largeur */}
      <div ref={emblaRef} className="overflow-hidden">
        <div
          className="flex gap-4"
          style={{ paddingLeft: 'max(1rem, calc(50vw - 42rem))', paddingRight: '1rem' }}
        >
          {PORTFOLIO_ITEMS.map(item => (
            <div key={item.id} className="shrink-0">
              <PortfolioCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="mt-8 flex justify-center gap-2">
        {PORTFOLIO_ITEMS.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            style={{
              width: '8px', height: '8px', borderRadius: '50%', border: 'none',
              background: current === i ? '#6845EC' : 'rgba(104,69,236,0.2)',
              cursor: 'pointer', padding: 0, transition: 'background 0.25s',
            }}
          />
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   HOW IT WORKS (detailed)
───────────────────────────────────────── */

/* — Visual mockups built in JSX — */
function StepVisual1() {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden flex items-center justify-center p-10"
      style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg, #f0edff 0%, #e8f4ff 100%)' }}>
      {/* Decorative blobs */}
      <div className="absolute w-48 h-48 rounded-full" style={{ background: 'rgba(104,69,236,0.12)', top: '-40px', right: '-40px' }} />
      <div className="absolute w-32 h-32 rounded-full" style={{ background: 'rgba(6,182,212,0.1)', bottom: '-20px', left: '-20px' }} />

      {/* Form card mockup */}
      <div className="relative z-10 w-full max-w-xs flex flex-col gap-3"
        style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', boxShadow: '0 20px 60px rgba(104,69,236,0.15)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded" style={{ background: '#6845EC' }}>
            <svg viewBox="0 0 20 20" fill="white" width="20" height="20"><path d="M3 4h14v2H3zm0 5h14v2H3zm0 5h8v2H3z"/></svg>
          </div>
          <span className="font-sans font-bold text-sm" style={{ color: '#111827', letterSpacing: '-0.03em' }}>Your property brief</span>
        </div>
        {['Property type', 'Target audience', 'Key highlights', 'Tone & style'].map((label, i) => (
          <div key={i}>
            <div className="text-xs mb-1 font-sans" style={{ color: 'rgba(17,24,39,0.4)', letterSpacing: '-0.02em' }}>{label}</div>
            <div className="rounded-lg h-9 px-3 flex items-center" style={{ background: '#F7F7FA', border: '1px solid rgba(0,0,0,0.07)' }}>
              {i === 0 && <span className="font-sans text-sm" style={{ color: '#111827', letterSpacing: '-0.02em' }}>Luxury apartment</span>}
              {i === 1 && <span className="font-sans text-sm" style={{ color: '#111827', letterSpacing: '-0.02em' }}>Young professionals</span>}
              {i > 1 && <div className="h-2 rounded-full w-3/4" style={{ background: 'rgba(17,24,39,0.08)' }} />}
            </div>
          </div>
        ))}
        <div className="mt-2 rounded-xl py-3 text-center font-sans font-semibold text-sm text-white"
          style={{ background: '#6845EC', letterSpacing: '-0.02em' }}>
          Submit brief →
        </div>
      </div>
    </div>
  )
}

function StepVisual2() {
  const tracks = [
    { label: 'Video', color: '#6845EC', w: '78%' },
    { label: 'Music', color: '#06B6D4', w: '85%' },
    { label: 'Color', color: '#F59E0B', w: '60%' },
    { label: 'Text', color: '#2D4077', w: '45%' },
  ]
  return (
    <div className="relative w-full rounded-3xl overflow-hidden flex flex-col justify-between p-8"
      style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1030 100%)' }}>
      <div className="absolute w-64 h-64 rounded-full" style={{ background: 'rgba(104,69,236,0.18)', top: '-60px', left: '-60px', filter: 'blur(40px)' }} />
      <div className="absolute w-40 h-40 rounded-full" style={{ background: 'rgba(6,182,212,0.12)', bottom: '-30px', right: '-30px', filter: 'blur(30px)' }} />

      {/* Preview thumbnail */}
      <div className="relative z-10 rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 20 }}>
        <div className="flex items-center justify-center w-12 h-12 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div className="absolute bottom-2 right-3 font-sans text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>0:47</div>
      </div>

      {/* Timeline tracks */}
      <div className="relative z-10 flex flex-col gap-2">
        {tracks.map((t) => (
          <div key={t.label} className="flex items-center gap-3">
            <span className="font-sans text-xs w-10 shrink-0" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '-0.02em' }}>{t.label}</span>
            <div className="flex-1 h-5 rounded-md" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-md" style={{ width: t.w, background: t.color, opacity: 0.7 }} />
            </div>
          </div>
        ))}
        {/* Playhead */}
        <div className="absolute top-0 bottom-0" style={{ left: 'calc(40px + 52%)', width: 1, background: '#fff', opacity: 0.5 }} />
      </div>
    </div>
  )
}

function StepVisual3() {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden flex items-center justify-center p-10"
      style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg, #e8fff8 0%, #f0f7ff 100%)' }}>
      <div className="absolute w-48 h-48 rounded-full" style={{ background: 'rgba(6,182,212,0.12)', bottom: '-40px', right: '-40px' }} />
      <div className="absolute w-36 h-36 rounded-full" style={{ background: 'rgba(104,69,236,0.08)', top: '-20px', left: '-20px' }} />

      <div className="relative z-10 w-full max-w-xs flex flex-col gap-4">
        {/* Video preview mini */}
        <div className="rounded-2xl overflow-hidden relative flex items-center justify-center"
          style={{ aspectRatio: '16/9', background: 'rgba(17,24,39,0.08)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(17,24,39,0.12)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(17,24,39,0.5)"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>

        {/* Revision comments */}
        {[
          { text: 'Can we brighten the entrance shot?', avatar: 'Y', resolved: false },
          { text: 'Perfect — approved! ✓', avatar: 'S', resolved: true },
        ].map((c, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: c.resolved ? 'rgba(16,185,129,0.08)' : '#fff', border: `1px solid ${c.resolved ? 'rgba(16,185,129,0.2)' : 'rgba(0,0,0,0.07)'}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: c.resolved ? '#10B981' : '#6845EC' }}>
              {c.avatar}
            </div>
            <p className="font-sans text-xs leading-relaxed" style={{ color: c.resolved ? '#059669' : 'rgba(17,24,39,0.7)', letterSpacing: '-0.02em' }}>
              {c.text}
            </p>
          </div>
        ))}

        {/* Deliver button */}
        <div className="rounded-xl py-3 text-center font-sans font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)', color: '#fff', letterSpacing: '-0.02em' }}>
          Download final video ↓
        </div>
      </div>
    </div>
  )
}

const HOW_STEPS = [
  {
    n: '01',
    tag: 'Step #1',
    title: 'Fill in our brief',
    short: "After working with 1,000+ properties, we've refined exactly what we need.",
    paras: [
      'Our brief is designed to be simple and efficient, allowing you to share your property, your positioning, and your goals in just a few minutes, without unnecessary complexity.',
      'This ensures we fully understand how to highlight your property and attract the right audience from the start.',
    ],
    Visual: StepVisual1,
    flip: false,
  },
  {
    n: '02',
    tag: 'Step #2',
    title: 'Receive your video',
    short: 'As soon as we receive your brief, our team starts working immediately.',
    paras: [
      'We carefully edit your footage to create a video that is not only visually appealing, but strategically built to capture attention, keep viewers engaged, and increase demand.',
      'From pacing and transitions to color grading and storytelling, every detail is optimized to make your property stand out across platforms.',
    ],
    Visual: StepVisual2,
    flip: true,
  },
  {
    n: '03',
    tag: 'Step #3',
    title: 'Revise or finalize',
    short: 'Once your video is ready, you can review it and request any adjustments if needed.',
    paras: [
      'We refine the edit based on your feedback until it perfectly matches your expectations.',
      "As soon as it's approved, we deliver the final version, fully optimized and ready to be used on social media or listing platforms to maximize visibility and results.",
    ],
    Visual: StepVisual3,
    flip: false,
  },
]

function HowItWorks() {
  return (
    <section className="py-28" style={{ background: '#FAFAFA' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-label justify-center">How it works</span>
          <h2 className="font-display text-5xl md:text-6xl mt-4" style={{ color: '#111827', letterSpacing: '-0.04em' }}>
            THREE STEPS.<br />ZERO HASSLE.
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col gap-32">
          {HOW_STEPS.map(({ n, tag, title, short, paras, Visual, flip }) => (
            <div key={n} className={`grid grid-cols-1 md:grid-cols-2 gap-16 items-center ${flip ? 'md:[direction:rtl]' : ''}`}>

              {/* Visual */}
              <motion.div
                style={{ direction: 'ltr' }}
                {...slideIn(flip ? 'right' : 'left')}
              >
                <Visual />
              </motion.div>

              {/* Text */}
              <motion.div
                className="flex flex-col gap-6"
                style={{ direction: 'ltr' }}
                {...slideIn(flip ? 'left' : 'right', 130)}
              >
                {/* Step tag + number */}
                <div className="flex items-center gap-4">
                  <span className="font-display text-8xl leading-none" style={{ color: 'rgba(104,69,236,0.12)', letterSpacing: '-0.04em' }}>{n}</span>
                  <span className="font-sans font-semibold text-sm px-3 py-1 rounded-full"
                    style={{ background: 'rgba(104,69,236,0.08)', color: '#6845EC', letterSpacing: '-0.02em' }}>
                    {tag}
                  </span>
                </div>

                <h3 className="font-sans font-bold" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: '#111827', letterSpacing: '-0.05em', lineHeight: 1.1 }}>
                  {title}
                </h3>

                <p className="font-sans font-medium" style={{ fontSize: '1.15rem', color: '#111827', letterSpacing: '-0.03em', lineHeight: 1.6 }}>
                  {short}
                </p>

                {paras.map((p, i) => (
                  <p key={i} className="font-sans" style={{ fontSize: '1.05rem', color: 'rgba(17,24,39,0.5)', letterSpacing: '-0.03em', lineHeight: 1.7 }}>
                    {p}
                  </p>
                ))}
              </motion.div>

            </div>
          ))}
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
    text: 'Shortcut doubled my average views within 2 weeks. The edits feel premium but they also hook people in the first second. Game changer.',
    name: 'Jordan Lee',
    role: '@jordan.creates · 1.2M TikTok',
    initials: 'JL',
    color: '#6845EC',
  },
  {
    text: 'Our Meta ad ROAS went from 1.8x to 4.2x after switching to Shortcut. They understand what makes people stop scrolling and buy.',
    name: 'Sarah Mitchell',
    role: 'CEO, Bloom Brand · E-commerce',
    initials: 'SM',
    color: '#2D4077',
  },
  {
    text: 'Best investment I\'ve made for my property listings. We sold a $3.2M property in 4 days — the video got 847K views organically.',
    name: 'Marcus Devlin',
    role: 'Founder, Devlin Realty · Miami',
    initials: 'MD',
    color: '#6845EC',
  },
  {
    text: 'I\'ve worked with 3 other editing agencies. Shortcut is on a different level. Turnaround is insanely fast and they nail my aesthetic every time.',
    name: 'Priya Sharma',
    role: '@priyalifestyle · 890K Instagram',
    initials: 'PS',
    color: '#2D4077',
  },
  {
    text: 'Our rental bookings went up 38% the month we started using their videos. The quality is outstanding and delivery is always on time.',
    name: 'Thomas Beaumont',
    role: 'Property Manager · Lyon',
    initials: 'TB',
    color: '#6845EC',
  },
  {
    text: 'The first video they made for us went viral locally. We had 12 viewings booked within 48 hours of posting. Absolutely incredible.',
    name: 'Claire Fontaine',
    role: 'Real Estate Agent · Paris',
    initials: 'CF',
    color: '#2D4077',
  },
  {
    text: 'We tried photography only for years. The moment we switched to video edits from Shortcut, the difference was night and day.',
    name: 'David Renard',
    role: 'Founder, Renard Immobilier',
    initials: 'DR',
    color: '#6845EC',
  },
  {
    text: 'Incredible attention to detail. Every cut, every transition perfectly matches the tone of the property. Clients are always impressed.',
    name: 'Anaïs Lebrun',
    role: 'Luxury Portfolio Manager',
    initials: 'AL',
    color: '#2D4077',
  },
  {
    text: 'Fast, reliable, and the results speak for themselves. Our average listing time dropped from 45 days to under 2 weeks.',
    name: 'Nicolas Garnier',
    role: 'CEO, NG Properties · Bordeaux',
    initials: 'NG',
    color: '#6845EC',
  },
]

const tcol1 = TESTIMONIALS.slice(0, 3)
const tcol2 = TESTIMONIALS.slice(3, 6)
const tcol3 = TESTIMONIALS.slice(6, 9)

function Testimonials() {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background: '#FAFAFA' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-2xl mx-auto mb-14 text-center"
        >
          <span className="section-label justify-center">Testimonials</span>
          <h2 className="font-display text-5xl md:text-6xl mt-4 mb-4" style={{ color: '#111827', letterSpacing: '-0.04em' }}>
            DON'T TAKE<br />OUR WORD FOR IT
          </h2>
          <p className="font-sans text-base" style={{ color: 'rgba(17,24,39,0.5)', letterSpacing: '-0.02em' }}>
            See what our clients have to say about us.
          </p>
        </motion.div>

        <div
          className="flex justify-center gap-8 mt-4"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
            maxHeight: 740,
            overflow: 'hidden',
          }}
        >
          <TestimonialsColumn testimonials={tcol1} duration={18} />
          <TestimonialsColumn testimonials={tcol2} duration={22} className="hidden md:block" />
          <TestimonialsColumn testimonials={tcol3} duration={20} className="hidden lg:block" />
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
    <section id="pricing" className="pt-28 pb-6" style={{ background: '#FAFAFA' }}>
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
   TRUST BAR
───────────────────────────────────────── */
function PaymentBadge({ children, bg = '#fff', color = '#111827' }) {
  return (
    <div
      className="flex items-center justify-center rounded-md px-4 py-2 font-bold"
      style={{
        background: bg,
        color,
        border: '1px solid rgba(17,24,39,0.12)',
        minWidth: 72,
        height: 48,
        fontSize: 17,
        letterSpacing: '-0.02em',
      }}
    >
      {children}
    </div>
  )
}

function BrandLogo({ icon, name }) {
  return (
    <div className="flex items-center gap-2" style={{ color: 'rgba(17,24,39,0.45)', fontSize: 16, fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.03em' }}>
      <span style={{ opacity: 0.5, fontSize: 18 }}>{icon}</span>
      <span>{name}</span>
    </div>
  )
}

const BRAND_LOGOS = [
  { icon: '✦', name: 'Accredifi.' },
  { icon: '©', name: 'CopyCatch' },
  { icon: '∞', name: 'Innovinity' },
  { icon: '◎', name: 'Humaify' },
  { icon: '⌂', name: 'PingYou' },
  { icon: '✦', name: 'PureVital' },
  { icon: '◈', name: 'Agint' },
  { icon: '⬡', name: 'supportmagic' },
  { icon: '◉', name: 'persocare' },
  { icon: '▲', name: 'Bloosh' },
]

function TrustBar() {
  return (
    <section className="pt-6 pb-16" style={{ background: '#FAFAFA' }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">

        {/* CTA Button — full width of pricing grid, rectangular, white bg */}
        <a
          href="mailto:hello@shortcut.video"
          className="inline-flex items-center justify-center gap-2 font-sans font-semibold text-lg transition-all w-full"
          style={{
            padding: '22px 40px',
            border: '1.5px solid #6845EC',
            color: '#6845EC',
            background: '#fff',
            textDecoration: 'none',
            letterSpacing: '-0.03em',
            borderRadius: 12,
          }}
        >
          Book a Call →
        </a>

        {/* Guarantee */}
        <div className="text-center">
          <p className="font-sans font-bold text-xl" style={{ color: '#111827', letterSpacing: '-0.04em' }}>
            100% Risk-Free Satisfaction Guarantee
          </p>
          <p className="font-sans mt-1 max-w-lg mx-auto" style={{ fontSize: 16, color: 'rgba(17,24,39,0.45)', letterSpacing: '-0.02em', lineHeight: 1.6 }}>
            We're committed to your success. If you're not completely thrilled with your logo, we'll keep working until you are, or provide a full refund.
          </p>
        </div>

        {/* Payment Logos */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <PaymentBadge color="#1A1F71"><span style={{ fontStyle: 'italic', fontWeight: 900, fontSize: 17 }}>VISA</span></PaymentBadge>
          <PaymentBadge>
            {/* Mastercard placeholder */}
            <span style={{ opacity: 0.25, fontSize: 15 }}>——</span>
          </PaymentBadge>
          <PaymentBadge bg="#016FD0" color="#fff"><span style={{ fontSize: 15, fontWeight: 900 }}>AMEX</span></PaymentBadge>
          <PaymentBadge><span style={{ color: '#6772E5', fontWeight: 700, fontSize: 16 }}>stripe</span></PaymentBadge>
          <PaymentBadge>
            <span style={{ color: '#003087', fontWeight: 900, fontSize: 15 }}>JCB</span>
          </PaymentBadge>
          <PaymentBadge>
            <span style={{ color: '#003087', fontWeight: 700, fontSize: 15 }}>Pay</span>
            <span style={{ color: '#009cde', fontWeight: 700, fontSize: 15 }}>Pal</span>
          </PaymentBadge>
          <PaymentBadge>
            <span style={{ fontWeight: 500, fontSize: 15, color: '#111827' }}>G</span>
            <span style={{ fontWeight: 500, fontSize: 15, color: '#111827', marginLeft: 2 }}>Pay</span>
          </PaymentBadge>
          <PaymentBadge>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>&#xf8ff; Pay</span>
          </PaymentBadge>
          <PaymentBadge>
            {/* Bancontact placeholder */}
            <span style={{ opacity: 0.25, fontSize: 15 }}>——</span>
          </PaymentBadge>
        </div>

        {/* Brand Logos */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 w-full">
          {BRAND_LOGOS.map((b) => (
            <BrandLogo key={b.name} icon={b.icon} name={b.name} />
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
      <ValueProps />
      <ZoomParallaxSection />
      <Process />
      <WhyUs />
      <Portfolio />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <TrustBar />
      <FinalCTA />
      <Footer />
    </div>
  )
}
