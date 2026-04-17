import React from 'react'
import { motion } from 'framer-motion'

export function TestimonialsColumn({ className = '', testimonials, duration = 10 }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        animate={{ translateY: '-50%' }}
        transition={{ duration, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...Array(2)].map((_, idx) => (
          <React.Fragment key={idx}>
            {testimonials.map(({ text, initials, color, name, role }, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl w-full"
              style={{ minWidth: 340 }}
                style={{
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.07)',
                  boxShadow: '0 4px 24px rgba(104,69,236,0.07)',
                }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#6845EC">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p
                  className="font-sans leading-relaxed mb-6"
                  style={{ color: 'rgba(17,24,39,0.65)', fontSize: '0.95rem', letterSpacing: '-0.02em' }}
                >
                  {text}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: color }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-sm" style={{ color: '#111827', letterSpacing: '-0.03em' }}>
                      {name}
                    </p>
                    <p className="font-sans text-xs" style={{ color: 'rgba(17,24,39,0.4)', letterSpacing: '-0.02em' }}>
                      {role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  )
}
