'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef, useEffect } from 'react';

/* ─── Video frame sequence ─────────────────────────────────── */
const FRAME_COUNT = 302;
const FRAME_URLS = Array.from({ length: FRAME_COUNT }, (_, i) =>
  `/images video scroll/0414_${String(i + 1).padStart(6, '0')}.jpg`
);

function drawCover(ctx, img, w, h) {
  if (!img.complete || img.naturalWidth === 0) return;
  const ia = img.naturalWidth / img.naturalHeight;
  const ca = w / h;
  let sx, sy, sw, sh;
  if (ia > ca) {
    sh = img.naturalHeight; sw = sh * ca; sx = (img.naturalWidth - sw) / 2; sy = 0;
  } else {
    sw = img.naturalWidth; sh = sw / ca; sx = 0; sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

/* ─── Image positions (flex-center + relative offset) ───────────
   i=0  top wide     : 37.5→72.5vw,   5→35vh     [unchanged]
   i=1  left tall    : 15→35vw,       14→66vh     h 45→52vh
   i=2  right centre : 65→90vw,      37.5→62.5vh  reverted to original (no canvas overlap)
   i=3  lower centre : 45→65vw,      71.5→96.5vh  top 27.5→34vh
   i=4  lower left   : 12.5→42.5vw,  71.5→96.5vh  top 27.5→34vh
   i=5  lower right  : 66→84vw,      71.5→96.5vh  aligned bottom with i=3/i=4
   Canvas             : 37.5→62.5vw,  37.5→62.5vh
────────────────────────────────────────────────────────────── */
const LABEL_BASE = {
  fontFamily: "'Syne', sans-serif",
  fontWeight: 700,
  color: '#07070F',
  letterSpacing: '-0.04em',
  lineHeight: 1.15,
  position: 'absolute',
  pointerEvents: 'none',
};

const ACCENT = '#6845EC';

const SLOTS = [
  {
    // i=0 — top wide — RIGHT of image (image ends 72.5vw) [unchanged]
    phrase: ['Make your property look ', '10x', ' more attractive'],
    style: { top: '7vh', left: '74vw', width: '17vw', textAlign: 'left' },
    size: '1.5vw',
  },
  {
    // i=1 — left tall — ABOVE image, aligned with image left edge (15vw)
    // image: 15→35vw, 14→66vh
    phrase: ['Increase your bookings', ' instantly', ''],
    style: { top: '7vh', left: '15vw', width: '22vw', textAlign: 'left' },
    size: '1.5vw',
  },
  {
    // i=2 — right centre — ABOVE image, upper-right column (right of i=0)
    // image: 65→90vw, 37.5→62.5vh — label at 74vw avoids i=0 (ends 72.5vw)
    phrase: ['Turn views into ', 'real bookings', ''],
    style: { top: '30vh', left: '74vw', width: '17vw', textAlign: 'left' },
    size: '1.5vw',
  },
  {
    // i=3 — lower centre — ABOVE image, aligned left (image: 45→65vw, starts 71.5vh)
    phrase: ['Sell your property', ' faster', ''],
    style: { top: '67vh', left: '45vw', width: '20vw', textAlign: 'left' },
    size: '1.5vw',
  },
  {
    // i=4 — lower left — ABOVE image, aligned left (image: 12.5→42.5vw, starts 71.5vh)
    phrase: ['Stand out in', ' crowded platforms', ''],
    style: { top: '67vh', left: '12.5vw', width: '29vw', textAlign: 'left' },
    size: '1.5vw',
  },
  {
    // i=5 — lower right — ABOVE image, aligned left (image: 66→84vw, starts 71.5vh)
    phrase: ["Increase your property\u2019s", ' perceived value', ''],
    style: { top: '64vh', left: '66vw', width: '22vw', textAlign: 'left' },
    size: '1.5vw',
  },
];

function PhraseLabel({ slot }) {
  const [before, accent, after] = slot.phrase;
  return (
    <p style={{ ...LABEL_BASE, ...slot.style, fontSize: slot.size }}>
      {before}
      {accent && <span style={{ color: ACCENT }}>{accent}</span>}
      {after}
    </p>
  );
}

/* ─── Component ─────────────────────────────────────────────── */
export function ZoomParallax({ images = [] }) {
  const container = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const isVisibleRef = useRef(false);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

  const surroundingScales = [scale5, scale6, scale5, scale6, scale8, scale9];

  useEffect(() => {
    const imgs = FRAME_URLS.map((url, i) => {
      const img = new Image();
      img.onload = () => {
        if (i === 0) {
          const canvas = canvasRef.current;
          if (canvas) drawCover(canvas.getContext('2d'), img, canvas.width, canvas.height);
        }
      };
      img.src = url;
      return img;
    });
    framesRef.current = imgs;
  }, []);

  useEffect(() => {
    let lastFrame = -1;
    const unsubscribe = scrollYProgress.on('change', (progress) => {
      if (!isVisibleRef.current) return;
      const frameIdx = Math.min(Math.round(progress * (FRAME_COUNT - 1)), FRAME_COUNT - 1);
      if (frameIdx === lastFrame) return;
      lastFrame = frameIdx;
      const canvas = canvasRef.current;
      const img = framesRef.current[frameIdx];
      if (!canvas || !img || !img.complete) return;
      drawCover(canvas.getContext('2d'), img, canvas.width, canvas.height);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    if (container.current) obs.observe(container.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={container} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* ── Center: scroll-driven video ── */}
        <motion.div
          style={{ scale: scale4, willChange: 'transform' }}
          className="absolute top-0 flex h-full w-full items-center justify-center"
        >
          <div className="relative h-[25vh] w-[25vw]">
            <canvas
              ref={canvasRef}
              width={640}
              height={360}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>
        </motion.div>

        {/* ── Surrounding images + labels ── */}
        {images.slice(1).map(({ src, alt }, i) => {
          const scale = surroundingScales[i % surroundingScales.length];
          const slot = SLOTS[i];
          return (
            <motion.div
              key={i}
              style={{ scale, willChange: 'transform' }}
              className={`absolute top-0 flex h-full w-full items-center justify-center
                ${i === 0 ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]' : ''}
                ${i === 1 ? '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[52vh] [&>div]:!w-[20vw]' : ''}
                ${i === 2 ? '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]' : ''}
                ${i === 3 ? '[&>div]:!top-[34vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]' : ''}
                ${i === 4 ? '[&>div]:!top-[34vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]' : ''}
                ${i === 5 ? '[&>div]:!top-[34vh] [&>div]:!left-[28vw] [&>div]:!h-[25vh] [&>div]:!w-[24vw]' : ''}
              `}
            >
              <div className="relative h-[25vh] w-[25vw]">
                <img
                  src={src || '/placeholder.svg'}
                  alt={alt || `Image ${i + 2}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              {slot && <PhraseLabel slot={slot} />}
            </motion.div>
          );
        })}

      </div>
    </div>
  );
}