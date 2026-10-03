import { useMemo } from 'react'; import { motion } from 'framer-motion';
const COLORS = ['#E3B5B0', '#F1D3CE', '#D9A5A0', '#C9D6C5', '#F6E7D8'];

export function Petals({ count = 16 }) {
  const items = useMemo(() => Array.from({ length: count }, () => {
    const s = 10 + Math.random() * 12;
    return { left: Math.random() * 100, w: s, h: s * 1.3, c: COLORS[Math.floor(Math.random() * COLORS.length)],
      dx: (Math.random() - 0.5) * 160, dur: 9 + Math.random() * 9, delay: -Math.random() * 15 };
  }), [count]);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] overflow-hidden motion-reduce:hidden">
      {items.map((p, i) => (
        <span key={i} className="absolute top-0 animate-fall opacity-70"
          style={{ left: `${p.left}%`, width: p.w, height: p.h, background: p.c, borderRadius: '150% 0 150% 0', '--dx': `${p.dx}px`, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
      ))}
    </div>
  );
}

export function Burst() {
  const parts = useMemo(() => Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2 + Math.random() * 0.3, d = 90 + Math.random() * 130;
    return { x: Math.cos(a) * d, y: Math.sin(a) * d + 70, r: Math.random() * 540, c: ['#B08D57', '#E3B5B0', '#F2F3EE', '#8FA58C', '#7A1F2B'][i % 5], w: 6 + Math.random() * 6, t: 1.3 + Math.random() * 0.8 };
  }), []);
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-[58%] z-[6] motion-reduce:hidden">
      {parts.map((p, i) => (
        <motion.span key={i} className="absolute block rounded-[2px]" style={{ width: p.w, height: p.w * 0.6, background: p.c }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }} animate={{ x: p.x, y: p.y, rotate: p.r, opacity: 0, scale: 1 }} transition={{ duration: p.t, ease: 'easeOut' }} />
      ))}
    </div>
  );
}
