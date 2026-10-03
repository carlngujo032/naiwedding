import { useEffect, useRef, useState } from 'react'; import cfg from './config.js';
import Envelope from './Envelope.jsx'; import Invitation from './Invitation.jsx'; import Admin from './Admin.jsx';
export const API = import.meta.env.VITE_API_URL || '';
const Note = ({ children }) => <p className="mx-4 mt-[30vh] text-center">{children}</p>;

export default function App() {
  const path = window.location.pathname;
  const [state, setState] = useState({ status: 'loading' });
  const [opened, setOpened] = useState(false);
  const audioRef = useRef(null);
  const startMusic = () => { if (!cfg.music) return; audioRef.current ??= Object.assign(new Audio(cfg.music), { loop: true, volume: 0.6 }); audioRef.current.play().catch(() => {}); };
  const slug = path.startsWith('/invite/') ? path.split('/')[2] : null;

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/api/guests/${slug}`).then(async (r) => {
      const d = await r.json();
      setState(r.ok ? { status: 'ready', ...d } : { status: 'missing' });
    }).catch(() => setState({ status: 'error' }));
  }, [slug]);

  if (path.startsWith('/admin')) return <Admin />;
  if (!slug || state.status === 'missing') return <Note>This invitation link isn't valid. Check the link you were sent.</Note>;
  if (state.status === 'error') return <Note>We couldn't reach the server. Refresh to try again.</Note>;
  if (state.status === 'loading') return <Note>Opening…</Note>;
  return opened ? <Invitation audio={audioRef.current} slug={slug} guest={state.guest} rsvp={state.rsvp} /> : <Envelope onStart={startMusic} name={state.guest.name} onDone={() => setOpened(true)} />;
}
