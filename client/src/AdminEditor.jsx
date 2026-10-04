import { useEffect, useState } from 'react'; import { FaFloppyDisk, FaPlus, FaTrash, FaUpload, FaRotateLeft } from 'react-icons/fa6';
import { API } from './App.jsx'; import { defaults } from './config.js';

const lab = 'grid gap-1 text-sm font-medium';
const Card = ({ title, children }) => <section className="grid gap-3 rounded-md border border-ink/20 bg-white/50 p-4"><h2 className="text-xl">{title}</h2>{children}</section>;
const Del = ({ onClick }) => <button type="button" aria-label="Remove" className="btn btn-ghost !m-0 !px-3 !py-2 !text-seal" onClick={onClick}><FaTrash /></button>;
const Add = ({ onClick, children }) => <button type="button" className="btn btn-ghost !m-0 w-fit !py-2" onClick={onClick}><FaPlus />{children}</button>;

// resize in the browser so uploads stay small (max 1600px wide JPEG)
const shrink = (file) => new Promise((ok, no) => {
  const img = new Image(); img.onload = () => {
    const k = Math.min(1, 1600 / img.width), c = document.createElement('canvas');
    c.width = img.width * k; c.height = img.height * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', 0.85));
  }; img.onerror = no; img.src = URL.createObjectURL(file);
});

export default function AdminEditor({ headers }) {
  const [c, setC] = useState(null); const [msg, setMsg] = useState('');
  useEffect(() => { fetch(`${API}/api/config`).then((r) => r.json()).then((o) => setC({ ...structuredClone(defaults), ...o })); }, []);
  if (!c) return <p>Loading…</p>;
  const set = (k, v) => setC((p) => ({ ...p, [k]: v }));
  const setAt = (k, i, v) => set(k, c[k].map((x, j) => (j === i ? v : x)));
  const drop = (k, i) => set(k, c[k].filter((_, j) => j !== i));
  const push = (k, v) => set(k, [...c[k], v]);
  const text = (k, label, type = 'text') => <label className={lab}>{label}<input className="field" type={type} value={c[k] ?? ''} onChange={(e) => set(k, e.target.value)} /></label>;

  async function save() {
    setMsg('Saving…');
    const r = await fetch(`${API}/api/admin/config`, { method: 'PUT', headers, body: JSON.stringify({ config: c }) }).catch(() => null);
    setMsg(r?.ok ? 'Saved. Open a guest link to see it live.' : 'Could not save. Check your password and try again.');
  }
  async function reset() {
    if (!confirm('Throw away all your edits and go back to the original text and photos?')) return;
    await fetch(`${API}/api/admin/config`, { method: 'DELETE', headers }); setC(structuredClone(defaults)); setMsg('Reset to defaults.');
  }
  // kind: 'image' (resized first, optimised by Cloudinary) or 'audio' (sent as is)
  async function upload(file, done, kind = 'image') {
    if (!file) return; setMsg(kind === 'audio' ? 'Uploading song…' : 'Uploading photo…');
    try {
      const sg = await fetch(`${API}/api/admin/upload-signature`, { method: 'POST', headers });
      const sig = await sg.json(); if (!sg.ok) throw new Error(sig.error);
      const body = new FormData();
      body.append('file', kind === 'audio' ? file : await (await fetch(await shrink(file))).blob());
      for (const k of ['api_key:apiKey', 'timestamp:timestamp', 'folder:folder', 'signature:signature']) { const [f, v] = k.split(':'); body.append(f, sig[v]); }
      const r = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, { method: 'POST', body });
      const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || 'Cloudinary refused the file');
      done(kind === 'audio' ? j.secure_url : j.secure_url.replace('/upload/', '/upload/f_auto,q_auto/'));
      setMsg(`${kind === 'audio' ? 'Song' : 'Photo'} uploaded. Press Save changes to publish it.`);
    } catch (e) { setMsg(`Upload failed: ${e.message || 'try again'}`); }
  }
  const Photo = ({ src, onChange, onRemove, round }) => (
    <div className="grid gap-1">
      {src && <img src={src} alt="" className={`h-28 w-full object-cover ${round ? 'rounded-t-full' : 'rounded-md'}`} />}
      <div className="flex gap-1">
        <label className="btn btn-ghost !m-0 !px-3 !py-2 text-sm"><FaUpload />Upload<input type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files[0], onChange)} /></label>
        {onRemove && <Del onClick={onRemove} />}
      </div>
      <input className="field !py-1.5 text-xs" placeholder="or paste an image link" value={src?.startsWith('http') ? src : ''} onChange={(e) => onChange(e.target.value.trim())} />
    </div>);

  return (
    <div className="grid gap-4">
      <Card title="Show or hide sections">
        <div className="grid grid-cols-2 gap-2 text-sm">{[['details', 'Where and when'], ['dress', 'Dress code'], ['story', 'Our story'], ['entourage', 'Wedding party'], ['gallery', 'Photos'], ['faq', 'Questions and answers']].map(([id, l]) => (
          <label key={id} className="flex items-center gap-2"><input type="checkbox" checked={!c.hidden.includes(id)} onChange={(e) => set('hidden', e.target.checked ? c.hidden.filter((h) => h !== id) : [...c.hidden, id])} />{l}</label>))}</div>
      </Card>

      <Card title="Your own sections">
        <p className="text-sm opacity-70">Add anything else guests should see: gift ideas, accommodation, travel tips, a video link, a live stream.</p>
        {c.extra.map((x, i) => { const up = (patch) => set('extra', c.extra.map((e, j) => (j === i ? { ...e, ...patch } : e)));
          return (
            <div key={i} className="grid gap-2 rounded-md border border-ink/15 p-3">
              <div className="flex gap-2"><input className="field font-medium" placeholder="Section title" value={x.title} onChange={(e) => up({ title: e.target.value })} /><Del onClick={() => drop('extra', i)} /></div>
              <textarea className="field" rows="3" placeholder="Text (a new line starts a new paragraph)" value={x.text} onChange={(e) => up({ text: e.target.value })} />
              <Photo src={x.photo} onChange={(p) => up({ photo: p })} onRemove={x.photo ? () => up({ photo: '' }) : null} />
              <div className="flex gap-2"><input className="field" placeholder="Button text (optional)" value={x.buttonLabel} onChange={(e) => up({ buttonLabel: e.target.value })} /><input className="field" placeholder="Button link https://…" value={x.buttonUrl} onChange={(e) => up({ buttonUrl: e.target.value.trim() })} /></div>
              <label className={lab}>Show it after<select className="field" value={x.after} onChange={(e) => up({ after: e.target.value })}>{[['details', 'Where and when'], ['dress', 'Dress code'], ['story', 'Our story'], ['entourage', 'Wedding party'], ['gallery', 'Photos'], ['faq', 'Questions and answers'], ['rsvp', 'RSVP (very bottom)']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            </div>); })}
        <Add onClick={() => push('extra', { title: '', text: '', photo: '', buttonLabel: '', buttonUrl: '', after: 'faq' })}>Add a section</Add>
      </Card>

      <Card title="Couple and event">
        <div className="grid grid-cols-2 gap-3">{text('partner1', 'Partner 1')}{text('partner2', 'Partner 2')}</div>
        {text('tagline', 'Tagline')}
        <label className={lab}>Date and time (Philippine time)<input className="field" type="datetime-local" value={(c.date || '').slice(0, 16)} onChange={(e) => e.target.value && set('date', e.target.value + ':00+08:00')} /></label>
        {text('venue', 'Venue')}{text('address', 'Address')}{text('mapUrl', 'Google Maps link')}
        {text('tabTitle', 'Browser tab title')}
        <div className="grid gap-1"><b className="text-sm">Browser tab icon (square image works best)</b>
          <div className="flex items-center gap-3">{c.favicon && <img src={c.favicon} alt="" className="h-10 w-10 rounded" />}<div className="flex-1"><Photo src={c.favicon} onChange={(p) => set('favicon', p)} onRemove={c.favicon ? () => set('favicon', '') : null} /></div></div></div>
        <label className={lab}>RSVP deadline (clear it to hide)<input className="field" type="date" value={c.rsvpBy || ''} onChange={(e) => set('rsvpBy', e.target.value)} /></label>
      </Card>

      <Card title="Schedule">
        {c.schedule.map(([t, e], i) => <div key={i} className="flex gap-2"><input className="field !w-32" value={t} placeholder="2:30 PM" onChange={(x) => setAt('schedule', i, [x.target.value, e])} /><input className="field" value={e} placeholder="Guests arrive" onChange={(x) => setAt('schedule', i, [t, x.target.value])} /><Del onClick={() => drop('schedule', i)} /></div>)}
        <Add onClick={() => push('schedule', ['', ''])}>Add item</Add>
      </Card>

      <Card title="Our story">
        {c.story.map((t, i) => <div key={i} className="flex gap-2"><textarea className="field" rows="3" value={t} onChange={(x) => setAt('story', i, x.target.value)} /><Del onClick={() => drop('story', i)} /></div>)}
        <Add onClick={() => push('story', '')}>Add paragraph</Add>
      </Card>

      <Card title="Dress code">
        <label className={lab}>Note<textarea className="field" rows="2" value={c.dress.note} onChange={(e) => set('dress', { ...c.dress, note: e.target.value })} /></label>
        <h3 className="text-sm font-medium">Colour palette</h3>
        {c.palette.map(([n, col], i) => <div key={i} className="flex gap-2"><input className="field" value={n} onChange={(x) => setAt('palette', i, [x.target.value, col])} /><input type="color" className="h-11 w-14 rounded border border-ink/30" value={col} onChange={(x) => setAt('palette', i, [n, x.target.value])} /><Del onClick={() => drop('palette', i)} /></div>)}
        <Add onClick={() => push('palette', ['New colour', '#cccccc'])}>Add colour</Add>
        <h3 className="text-sm font-medium">Outfit photos</h3>
        <div className="grid grid-cols-2 gap-3">{c.dress.photos.map(([l, s], i) => (
          <div key={i} className="grid gap-1"><input className="field" value={l} onChange={(x) => set('dress', { ...c.dress, photos: c.dress.photos.map((p, j) => (j === i ? [x.target.value, s] : p)) })} />
            <Photo round src={s} onChange={(path) => set('dress', { ...c.dress, photos: c.dress.photos.map((p, j) => (j === i ? [l, path] : p)) })} /></div>))}</div>
      </Card>

      <Card title="Wedding party">
        {c.entourage.map(([role, names], i) => (
          <div key={i} className="grid gap-1 border-b border-ink/10 pb-3">
            <div className="flex gap-2"><input className="field font-medium" value={role} onChange={(x) => setAt('entourage', i, [x.target.value, names])} /><Del onClick={() => drop('entourage', i)} /></div>
            <textarea className="field" rows={Math.max(2, names.length)} placeholder="One name per line" value={names.join('\n')} onChange={(x) => setAt('entourage', i, [role, x.target.value.split('\n')])} />
          </div>))}
        <Add onClick={() => push('entourage', ['New role', ['']])}>Add role</Add>
      </Card>

      <Card title="Photos">
        <b className="text-sm">Envelope card (3 photos: left, centre, right)</b>
        <div className="grid grid-cols-3 gap-3">{[0, 1, 2].map((i) => <div key={i}><span className="text-xs opacity-70">{['Left', 'Centre', 'Right'][i]}</span><Photo round src={c.envelopePhotos[i]} onChange={(p) => set('envelopePhotos', [0, 1, 2].map((j) => (j === i ? p : c.envelopePhotos[j] || '')))} onRemove={c.envelopePhotos[i] ? () => set('envelopePhotos', [0, 1, 2].map((j) => (j === i ? '' : c.envelopePhotos[j] || ''))) : null} /></div>)}</div>
        <div className="grid grid-cols-2 gap-3">
          <div><b className="text-sm">Main photo</b><Photo round src={c.heroPhoto} onChange={(p) => set('heroPhoto', p)} /></div>
          <div><b className="text-sm">Background</b><Photo src={c.backgroundPhoto} onChange={(p) => set('backgroundPhoto', p)} /></div>
        </div>
        <b className="text-sm">Gallery</b>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{c.gallery.map((s, i) => <Photo key={i} src={s} onChange={(p) => setAt('gallery', i, p)} onRemove={() => drop('gallery', i)} />)}</div>
        <Add onClick={() => push('gallery', '')}>Add photo slot</Add>
      </Card>

      <Card title="Background song">
        {c.music ? <audio controls src={c.music} className="w-full" /> : <p className="text-sm opacity-70">No song. The invitation will be silent.</p>}
        <div className="flex flex-wrap gap-2">
          <label className="btn btn-ghost !m-0 !px-3 !py-2 text-sm"><FaUpload />Upload new song (mp3)<input type="file" accept="audio/*" hidden onChange={(e) => upload(e.target.files[0], (u) => set('music', u), 'audio')} /></label>
          {c.music && <button type="button" className="btn btn-ghost !m-0 !px-3 !py-2 text-sm !text-seal" onClick={() => set('music', '')}><FaTrash />Remove song</button>}
        </div>
        <input className="field text-sm" placeholder="or paste a link to an mp3" value={c.music?.startsWith('http') ? c.music : ''} onChange={(e) => set('music', e.target.value.trim())} />
      </Card>

      <Card title="Questions and answers">
        {c.faq.map(([q, a], i) => <div key={i} className="grid gap-1 border-b border-ink/10 pb-3"><div className="flex gap-2"><input className="field font-medium" value={q} placeholder="Question" onChange={(x) => setAt('faq', i, [x.target.value, a])} /><Del onClick={() => drop('faq', i)} /></div><textarea className="field" rows="2" value={a} placeholder="Answer" onChange={(x) => setAt('faq', i, [q, x.target.value])} /></div>)}
        <Add onClick={() => push('faq', ['', ''])}>Add question</Add>
      </Card>

      <Card title="Contacts">
        <div className="flex gap-2"><input className="field" placeholder="Coordinator name" value={c.contacts.coordinator[0]} onChange={(e) => set('contacts', { ...c.contacts, coordinator: [e.target.value, c.contacts.coordinator[1]] })} /><input className="field" placeholder="Number" value={c.contacts.coordinator[1]} onChange={(e) => set('contacts', { ...c.contacts, coordinator: [c.contacts.coordinator[0], e.target.value] })} /></div>
        {c.contacts.couple.map(([n, p], i) => { const up = (v) => set('contacts', { ...c.contacts, couple: c.contacts.couple.map((x, j) => (j === i ? v : x)) });
          return <div key={i} className="flex gap-2"><input className="field" value={n} onChange={(e) => up([e.target.value, p])} /><input className="field" value={p} onChange={(e) => up([n, e.target.value])} /></div>; })}
      </Card>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-2 rounded-md bg-ink/90 p-3 text-paper backdrop-blur">
        <button className="btn !m-0 !border-paper" onClick={save}><FaFloppyDisk />Save changes</button>
        <button className="btn btn-ghost !m-0 !border-paper !text-paper" onClick={reset}><FaRotateLeft />Reset to original</button>
        <span className="text-sm">{msg}</span>
      </div>
    </div>);
}
