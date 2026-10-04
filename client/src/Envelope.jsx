import { useState } from 'react'; import { motion } from 'framer-motion';
import cfg from './config.js'; import { Petals, Burst } from './Petals.jsx';

export default function Envelope({ name, onDone, onStart }) {
  const [open, setOpen] = useState(false);
  const go = () => { if (open) return; onStart?.(); setOpen(true); setTimeout(onDone, 3400); };
  return (
    <main className="grid min-h-svh place-content-center place-items-center gap-10 overflow-hidden p-4" style={{ backgroundImage: `linear-gradient(rgba(22,41,31,.7),rgba(22,41,31,.85)), url(${cfg.backgroundPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <Petals count={12} />
      <motion.div className="relative z-[2] aspect-[3/2] w-[min(88vw,380px)] [perspective:1000px]"
        animate={open ? { y: 50 } : { y: [0, -6, 0] }} transition={open ? { duration: 1.2, delay: 1 } : { repeat: Infinity, duration: 3.5 }}>
        <div className="absolute inset-0 rounded-[3px] bg-[#2B5446] shadow-[0_30px_50px_-12px_rgba(0,0,0,.6)] grain" />
        <div className="absolute inset-x-0 top-0 h-[58%] bg-[#E9DAC3] [clip-path:polygon(0_0,100%_0,50%_100%)] grain" />
        <motion.div className="paper absolute inset-x-3 inset-y-2 z-[2] grid place-items-center rounded-[2px] shadow-md"
          animate={open ? { y: '-64%' } : {}} transition={{ delay: 0.9, duration: 1.2, ease: [0.3, 0.7, 0.2, 1] }}>
          <div className="flex h-[88%] w-[94%] flex-col items-center justify-center gap-2 border border-brass/60 text-center">
            {cfg.envelopePhoto && <img src={cfg.envelopePhoto} alt="" className="h-[84px] w-[68px] rounded-t-full border-[3px] border-white object-cover shadow ring-1 ring-brass" />}
            <p className="m-0 font-serif text-sm italic text-ink/70">You are invited to the wedding of<br /><span className="font-script text-4xl not-italic text-ink">{cfg.partner1} &amp; {cfg.partner2}</span></p>
          </div>
        </motion.div>
        <div className="absolute inset-0 z-[3] drop-shadow-[0_-2px_3px_rgba(0,0,0,.3)]"><div className="h-full w-full rounded-[3px] bg-[#356452] grain [clip-path:polygon(0_0,50%_58%,100%_0,100%_100%,0_100%)]" /></div>
        <p className="absolute inset-x-0 bottom-[10%] z-[4] m-0 text-center font-script text-3xl text-[#F1E6D2]">{name}</p>
        <motion.div className="absolute inset-x-0 top-0 h-[58%] drop-shadow-[0_3px_3px_rgba(0,0,0,.35)]" style={{ transformOrigin: 'top' }}
          animate={open ? { rotateX: 180, zIndex: 1 } : { rotateX: 0, zIndex: 4 }} transition={{ duration: 0.8, delay: 0.3, zIndex: { delay: 0.7, duration: 0 } }}>
          <motion.div className="grain h-full w-full [clip-path:polygon(0_0,100%_0,50%_100%)]" initial={{ backgroundColor: '#3F7561' }}
            animate={{ backgroundColor: open ? '#E9DAC3' : '#3F7561' }} transition={{ delay: 0.6, duration: 0.05 }} />
        </motion.div>
        <motion.button aria-label="Open invitation" onClick={go}
          className="absolute left-1/2 top-[58%] z-[5] -ml-9 -mt-9 grid h-[72px] w-[72px] animate-pulse-ring place-items-center rounded-[48%_52%_50%_50%/52%_48%_52%_48%] bg-[radial-gradient(circle_at_35%_30%,#B53A48,#7A1F2B_70%,#5E1520)] shadow-[0_6px_10px_rgba(0,0,0,.5)]"
          animate={open ? { scale: 1.6, opacity: 0 } : { scale: 1 }} transition={{ duration: 0.35 }}>
          <span className="grid h-12 w-12 place-items-center rounded-full border border-[#F6D9B5]/50 font-script text-2xl text-[#F6D9B5] shadow-[inset_0_2px_4px_rgba(0,0,0,.4),inset_0_-1px_2px_rgba(255,255,255,.2)]">{cfg.partner1[0]}{cfg.partner2[0]}</span>
        </motion.button>
        {open && <Burst />}
      </motion.div>
      <motion.p className="relative z-[2] m-0 text-center font-serif text-lg italic text-[#DCE5DD]" animate={{ opacity: open ? 0 : 1 }}>Tap the seal to open</motion.p>
    </main>
  );
}
