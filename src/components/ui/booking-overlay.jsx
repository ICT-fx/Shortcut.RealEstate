import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function BookingOverlay({ open, onClose, src }) {
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

          {/* Centering wrapper — positioning séparé de l'animation */}
          <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '16px',
            pointerEvents: 'none',
          }}>
            {/* Card animée */}
            <motion.div
              key="booking-card"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                maxWidth: 720,
                height: '85vh',
                background: '#fff',
                borderRadius: 20,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
                pointerEvents: 'all',
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
                src={src}
                style={{ flex: 1, border: 'none', width: '100%' }}
                onLoad={() => setLoaded(true)}
                title="Book a Discovery Call"
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
