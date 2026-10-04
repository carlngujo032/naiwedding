import { useEffect, useState } from 'react'; import { motion } from 'framer-motion'; import { FaLocationDot, FaCalendarPlus, FaVolumeHigh, FaVolumeXmark, FaGoogle, FaApple, FaPaperPlane, FaBookOpen, FaImages, FaGift, FaEnvelopeOpenText, FaCopy, FaXmark, FaUsers, FaChevronDown, FaCircleQuestion } from 'react-icons/fa6';
import cfg from './config.js'; import { API } from './App.jsx'; import { Petals } from './Petals.jsx';

const when = new Date(cfg.date);
const fmt = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const s = Math.max(0, Math.floor((when - now) / 1000));
  return [['days', Math.floor(s / 86400)], ['hours', Math.floor(s / 3600) % 24], ['min', Math.floor(s / 60) % 60], ['sec', s % 60]];
}
function downloadIcs() {
  const end = new Date(when.getTime() + 4 * 3600e3);
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${fmt(when)}@wedding\nDTSTAMP:${fmt(new Date())}\nDTSTART:${fmt(when)}\nDTEND:${fmt(end)}\nSUMMARY:${cfg.partner1} & ${cfg.partner2}'s Wedding\nLOCATION:${cfg.venue}, ${cfg.address}\nEND:VEVENT\nEND:VCALENDAR`;
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'wedding.ics'; a.click();
}
const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(cfg.partner1 + ' & ' + cfg.partner2 + "'s Wedding")}&dates=${fmt(when)}/${fmt(new Date(when.getTime() + 4 * 3600e3))}&location=${encodeURIComponent(cfg.venue + ', ' + cfg.address)}`;

function Rsvp({ slug, guest, rsvp }) {
  const [f, setF] = useState({ attending: rsvp?.attending ?? null, guest_count: rsvp?.guest_count || 1, email: rsvp?.email || '', phone: rsvp?.phone || '', message: rsvp?.message || '' });
  const [st, setSt] = useState(rsvp ? 'done' : 'idle'); const [msg, setMsg] = useState('');
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  async function submit(e) {
    e.preventDefault(); if (f.attending === null) return setSt('pick'); setSt('sending');
    const r = await fetch(`${API}/api/rsvp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, ...f }) }).catch(() => null);
    if (r?.ok) return setSt('done');
    setMsg((await r?.json().catch(() => null))?.error || "Your reply didn't save. Try again."); setSt('error');
  }
  const lab = 'grid gap-1 text-sm font-medium';
  const pick = (on) => `cursor-pointer rounded-md border border-ink p-3 ${on ? 'bg-ink text-paper' : 'bg-transparent'}`;
  if (st === 'done') return (<div><h3 className="mb-1 text-2xl">{f.attending ? 'See you there' : "We'll miss you"}, {guest.name}.</h3><p>Your reply is saved.</p><button className="btn btn-ghost" onClick={() => setSt('idle')}>Change my reply</button></div>);
  return (
    <form onSubmit={submit} className="grid gap-4 text-left">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={pick(f.attending === true)} onClick={() => set('attending', true)}>Joyfully accept</button>
        <button type="button" className={pick(f.attending === false)} onClick={() => set('attending', false)}>Regretfully decline</button>
      </div>
      {f.attending && <>
        {guest.max_guests > 1 && <label className={lab}>Number of guests<select className="field" value={f.guest_count} onChange={(e) => set('guest_count', +e.target.value)}>{Array.from({ length: guest.max_guests }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></label>}
        <label className={lab}>Email<input className="field" type="email" required autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} /></label>
        <label className={lab}>Contact number<input className="field" type="tel" required autoComplete="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} /></label>
      </>}
      <label className={lab}>Message for the couple<textarea className="field" rows="3" value={f.message} onChange={(e) => set('message', e.target.value)} /></label>
      {st === 'pick' && <p className="text-seal">Choose accept or decline first.</p>}
      {st === 'error' && <p className="text-seal">{msg}</p>}
      <button className="btn" disabled={st === 'sending'}><FaPaperPlane />{st === 'sending' ? 'Sending…' : 'Send reply'}</button>
    </form>
  );
}

const Tel = ({ c }) => <a href={`tel:${c[1].replace(/\s/g, '')}`} className="whitespace-nowrap font-medium underline">{c[0]} {c[1]}</a>;

const Sec = ({ id, title, children }) => <section id={id} className="scroll-mt-4 border-t border-ink/15 py-10"><h2 className="mb-4 text-3xl">{title}</h2>{children}</section>;
const show = (id) => !cfg.hidden?.includes(id);
const extra = (id) => (cfg.extra || []).map((x, i) => [x, i]).filter(([x]) => (x.after || 'faq') === id).map(([x, i]) => (
  <Sec key={`x${i}`} id={`custom-${i}`} title={x.title}>
    {x.photo && <img src={x.photo} alt="" loading="lazy" className="mx-auto mb-4 w-full rounded-md object-cover" />}
    {(x.text || '').split('\n').filter(Boolean).map((t, j) => <p key={j} className="mx-auto mb-3 max-w-[38ch] leading-relaxed">{t}</p>)}
    {x.buttonUrl && <a className="btn mt-2" href={x.buttonUrl} target="_blank" rel="noreferrer">{x.buttonLabel || 'Learn more'}</a>}
  </Sec>));
const NAV = [['details', FaLocationDot, 'Details'], ['story', FaBookOpen, 'Our story'], ['entourage', FaUsers, 'Entourage'], ['gallery', FaImages, 'Photos'], ['faq', FaCircleQuestion, 'FAQ'], ['rsvp', FaEnvelopeOpenText, 'RSVP']];

export default function Invitation({ slug, guest, rsvp, audio }) {
  const cd = useCountdown();
  const [play, setPlay] = useState(!!audio && !audio.paused);
  const toggle = () => { if (audio.paused) { audio.play().catch(() => {}); setPlay(true); } else { audio.pause(); setPlay(false); } };
  const [big, setBig] = useState(null);
  const [wishes, setWishes] = useState([]);
  useEffect(() => { fetch(`${API}/api/wishes`).then((r) => r.json()).then(setWishes).catch(() => {}); }, []);
  return (
    <>
    <div aria-hidden className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${cfg.backgroundPhoto})` }}><div className="absolute inset-0 bg-paper/25" /></div>
    <motion.main className="relative z-[2] mx-auto max-w-[560px] px-3 pb-28 pt-6 text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
      <Petals count={14} />
      {audio && <button aria-label={play ? 'Pause music' : 'Play music'} className="fixed right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-ink bg-paper" onClick={toggle}>{play ? <FaVolumeHigh /> : <FaVolumeXmark />}</button>}
      <div className="rounded-sm border border-white/60 bg-white/50 shadow-[0_24px_60px_-20px_rgba(31,58,50,.5)] ring-1 ring-brass/30 backdrop-blur-xl backdrop-saturate-150"><div className="m-2 border border-brass/50 px-5 pb-6 pt-8">
      <header>
        <div className="mx-auto aspect-[4/5] w-[min(78vw,320px)] overflow-hidden rounded-t-full border-[6px] border-white shadow-xl ring-1 ring-brass"><img src={cfg.heroPhoto} alt={`${cfg.partner1} and ${cfg.partner2}`} className="h-full w-full object-cover" /></div>
        <p className="mt-8 font-serif italic">Dear {guest.name}</p>
        <h1 className="my-4 font-script text-[clamp(3.2rem,17vw,5.2rem)] leading-[1.05] text-ink">{cfg.partner1}<span className="block text-[.45em] text-brass">&amp;</span>{cfg.partner2}</h1>
        <p>{cfg.tagline}</p>
        <p className="mt-5 text-lg font-medium">{when.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </header>
      <div className="my-8 grid grid-cols-4 gap-2 border-y border-brass/60 py-4">
        {cd.map(([l, v]) => <div key={l}><b className="block font-serif text-3xl font-light">{String(v).padStart(2, '0')}</b><span className="text-xs opacity-70">{l}</span></div>)}
      </div>
      {show('details') && <Sec id="details" title="Where and when">
        <p>{when.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} at <b>{cfg.venue}</b><br />{cfg.address}</p>
        <a className="btn mt-3" href={cfg.mapUrl} target="_blank" rel="noreferrer"><FaLocationDot />Open in Google Maps</a>
        <div className="flex flex-wrap justify-center">
          <a className="btn btn-ghost" href={gcal} target="_blank" rel="noreferrer"><FaGoogle />Google Calendar</a>
          <button className="btn btn-ghost" onClick={downloadIcs}><FaApple />Apple / Outlook</button>
        </div>
        <ol className="m-0 mt-8 inline-block list-none border-l-2 border-sage p-0 text-left">{cfg.schedule.map(([t, e]) => <li key={t} className="py-1.5 pl-4"><b className="inline-block min-w-[5.5rem]">{t}</b>{e}</li>)}</ol>
      </Sec>}{extra('details')}
      {show('dress') && <Sec id="dress" title="Dress code">
        <p className="mx-auto max-w-[34ch]">{cfg.dress.note}</p>
        <div className="mt-3 flex justify-center gap-5">{cfg.palette.map(([n, c]) => <div key={n} className="text-sm"><i className="mx-auto mb-1 block h-11 w-11 rounded-full border border-black/20" style={{ background: c }} />{n}</div>)}</div>
        <div className="mt-5 grid grid-cols-2 gap-3">{cfg.dress.photos.map(([l, src]) => <figure key={l} className="m-0"><img src={src} alt={l} loading="lazy" className="aspect-[3/4] w-full rounded-t-full object-cover" /><figcaption className="mt-2 text-sm">{l}</figcaption></figure>)}</div>
      </Sec>}{extra('dress')}
      {show('story') && <Sec id="story" title="Our story">{cfg.story.map((t, i) => <p key={i} className="mx-auto mb-4 max-w-[34ch] font-serif text-lg leading-relaxed">{t}</p>)}</Sec>}{extra('story')}
      {show('entourage') && <Sec id="entourage" title="Our wedding party">
        <div className="grid gap-6">{cfg.entourage.map(([role, names]) => (
          <div key={role}><h3 className="mb-1 font-serif text-lg italic text-brass">{role}</h3>{names.map((n, i) => <p key={i} className="m-0">{n}</p>)}</div>))}</div>
      </Sec>}{extra('entourage')}
      {show('gallery') && <Sec id="gallery" title="Photos">
        <div className="grid grid-cols-2 gap-2">{cfg.gallery.map((src, i) => (
          <button key={src} onClick={() => setBig(src)} aria-label="View photo larger" className={`overflow-hidden rounded-md ${i === 0 ? 'col-span-2 aspect-[16/10]' : i % 3 === 1 ? 'row-span-2' : 'aspect-square'}`}><img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" /></button>
        ))}</div>
      </Sec>}{extra('gallery')}
      {show('faq') && <Sec id="faq" title="Good to know"><div className="grid gap-2 text-left">{cfg.faq.map(([q, a]) => (
        <details key={q} className="group rounded-md border border-ink/20 bg-white/40 px-4 py-3 backdrop-blur-sm"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium [&::-webkit-details-marker]:hidden">{q}<FaChevronDown className="shrink-0 transition-transform group-open:rotate-180" /></summary><p className="mb-0 mt-2 text-sm">{a}</p></details>))}</div></Sec>}{extra('faq')}
      <Sec id="rsvp" title="R.S.V.P.">
        <p className="font-serif text-lg italic">Répondez s'il vous plaît</p>
        {cfg.rsvpBy && <p className="mb-6 text-sm">Kindly reply by {new Date(cfg.rsvpBy + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>}
        <Rsvp slug={slug} guest={guest} rsvp={rsvp} />
        <p className="mx-auto mt-8 max-w-[38ch] text-sm leading-relaxed">Questions? Contact our wedding coordinator, <Tel c={cfg.contacts.coordinator} />, or reach us directly: {cfg.contacts.couple.map((c, i) => <span key={c[0]}>{i > 0 && ', '}<Tel c={c} /></span>)}.</p>
      </Sec>{extra('rsvp')}
      {wishes.length > 0 && <Sec title="Words from guests"><div className="grid gap-3 text-left">{wishes.map((w, i) => <blockquote key={i} className="m-0 rounded-md border border-white/60 bg-white/50 p-4 backdrop-blur-sm"><p className="m-0">{w.message}</p><footer className="mt-1 text-sm text-brass">{w.name}</footer></blockquote>)}</div></Sec>}
      </div></div>
      <nav aria-label="Sections" className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1 rounded-full bg-ink/70 px-2 py-1.5 shadow-lg backdrop-blur-md">
        {NAV.filter(([id]) => id === 'rsvp' || show(id)).map(([id, Icon, label]) => <a key={id} href={`#${id}`} aria-label={label} className="grid h-10 w-10 place-items-center rounded-full text-paper hover:bg-white/15"><Icon /></a>)}
      </nav>
      {big && <div role="dialog" aria-label="Photo" className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4" onClick={() => setBig(null)}><img src={big} alt="" className="max-h-[85svh] max-w-full rounded" /><button aria-label="Close" className="absolute right-4 top-4 text-3xl text-paper"><FaXmark /></button></div>}
    </motion.main>
    </>
  );
}
