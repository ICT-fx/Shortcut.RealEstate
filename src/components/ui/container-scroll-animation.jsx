import { useRef, useState, useEffect } from 'react'
import { useScroll, useTransform, useSpring, motion } from 'framer-motion'

export function ContainerScroll({ titleComponent, children }) {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'start 0.1'],
  })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const rotateRaw    = useTransform(scrollYProgress, [0, 1], [20, 0])
  const scaleRaw     = useTransform(scrollYProgress, [0, 1], isMobile ? [0.85, 1] : [0.92, 1])
  const translateRaw = useTransform(scrollYProgress, [0, 1], [60, 0])

  const rotate    = useSpring(rotateRaw,    { stiffness: 60, damping: 20 })
  const scale     = useSpring(scaleRaw,     { stiffness: 60, damping: 20 })
  const translateY = useSpring(translateRaw, { stiffness: 60, damping: 20 })

  return (
    <div
      ref={containerRef}
      className="h-[55rem] md:h-[62rem] flex items-start justify-center relative px-2 md:px-20"
    >
      <div className="pt-24 w-full relative" style={{ perspective: '1000px' }}>
        {/* Title */}
        <motion.div
          style={{ translateY }}
          className="max-w-5xl mx-auto text-center mb-0"
        >
          {titleComponent}
        </motion.div>

        {/* Card */}
        <motion.div
          style={{
            rotateX: rotate,
            scale,
            boxShadow:
              '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
          }}
          className="max-w-6xl mx-auto h-[34rem] md:h-[48rem] w-full border-4 border-[#6C6C6C] p-2 md:p-4 bg-[#111111] rounded-[30px] shadow-2xl"
        >
          <div className="h-full w-full overflow-hidden rounded-2xl bg-black">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
