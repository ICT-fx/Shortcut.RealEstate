import { motion } from 'framer-motion'

// ── Sub-components ──────────────────────────────────────
const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="text-sm font-medium tracking-widest text-neutral-400 transition-colors hover:text-neutral-900"
  >
    {children}
  </a>
)

const SocialIcon = ({ href, icon: Icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-neutral-300 transition-colors hover:text-neutral-800"
  >
    <Icon className="h-4 w-4" />
  </a>
)

// ── Main component ───────────────────────────────────────
export const MinimalistHero = ({
  logoText,
  logoAccentColor = '#7C3AED',
  navLinks = [],
  ctaLabel = 'Book a call',
  ctaHref = '#contact',
  mainText,
  readMoreLink,
  readMoreLabel = 'Learn more',
  imageSrc,
  imageAlt,
  overlayText,
  overlayAccentColor = '#7C3AED',
  circleColor = '#FDE68A',
  socialLinks = [],
  locationText,
  className = '',
}) => {
  return (
    <div
      className={`relative flex h-screen w-full flex-col items-center justify-between overflow-hidden bg-white p-8 md:p-12 ${className}`}
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      {/* Subtle texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.4) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Header ── */}
      <header className="z-30 flex w-full max-w-7xl items-center justify-between">
        <motion.a
          href="#"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-bold tracking-wider text-neutral-900"
          style={{ textDecoration: 'none' }}
        >
          {logoText.replace('.', '')}
          <span style={{ color: logoAccentColor }}>.</span>
        </motion.a>

        {/* Desktop nav */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden items-center space-x-8 md:flex"
        >
          {navLinks.map((link) => (
            <NavLink key={link.label} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.a
          href={ctaHref}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{
            background: logoAccentColor,
            boxShadow: `0 4px 20px ${logoAccentColor}40`,
            textDecoration: 'none',
          }}
        >
          {ctaLabel} →
        </motion.a>

        {/* Mobile burger */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-1.5 md:hidden"
          aria-label="Open menu"
        >
          <span className="block h-0.5 w-6 bg-neutral-900" />
          <span className="block h-0.5 w-6 bg-neutral-900" />
          <span className="block h-0.5 w-5 bg-neutral-900" />
        </motion.button>
      </header>

      {/* ── Main content ── */}
      <div className="relative grid w-full max-w-7xl flex-grow grid-cols-1 items-center md:grid-cols-3">
        {/* Left: text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="z-20 order-2 md:order-1 text-center md:text-left"
        >
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-neutral-500 md:mx-0">
            {mainText}
          </p>
          <a
            href={readMoreLink}
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-neutral-900"
            style={{ textDecoration: 'none', borderBottom: '1px solid currentColor', paddingBottom: '1px' }}
          >
            {readMoreLabel} →
          </a>

          {/* Delivery badge */}
          <div className="mt-6 hidden md:flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Delivered in 24–72h
            </div>
          </div>
        </motion.div>

        {/* Center: image + circle */}
        <div className="relative order-1 md:order-2 flex justify-center items-center h-full">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="absolute z-0 h-[280px] w-[280px] rounded-full md:h-[380px] md:w-[380px] lg:h-[460px] lg:w-[460px]"
            style={{ background: circleColor }}
          />
          <motion.img
            src={imageSrc}
            alt={imageAlt}
            className="relative z-10 h-auto w-52 object-cover md:w-60 lg:w-72"
            style={{ scale: 1.5, transformOrigin: 'bottom center' }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            onError={(e) => {
              e.target.onerror = null
              e.target.src =
                'https://placehold.co/400x600/FDE68A/1a1a1a?text=Shortcut'
            }}
          />
        </div>

        {/* Right: big headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="z-20 order-3 flex items-center justify-center text-center md:justify-start md:text-left"
        >
          <h1
            className="font-extrabold leading-[0.9] tracking-tight"
            style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(4rem, 7vw, 7.5rem)' }}
          >
            <span className="text-neutral-900">{overlayText.part1}</span>
            <br />
            <span style={{ color: overlayAccentColor }}>{overlayText.part2}</span>
          </h1>
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <footer className="z-30 flex w-full max-w-7xl items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="flex items-center space-x-4"
        >
          {socialLinks.map((link, i) => (
            <SocialIcon key={i} href={link.href} icon={link.icon} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="flex items-center gap-3"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
          <span className="text-xs font-medium tracking-wide text-neutral-400">
            {locationText}
          </span>
        </motion.div>
      </footer>
    </div>
  )
}
