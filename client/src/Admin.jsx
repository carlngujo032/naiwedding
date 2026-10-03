import { useState } from 'react'; import { FaCopy, FaCheck, FaDownload, FaUserPlus, FaShareNodes, FaTrash } from 'react-icons/fa6'; import { API } from './App.jsx';
export default function Admin() {
  const [pw, setPw] = useState(''); const [rows, setRows] = useState(null); const [txt, setTxt] = useState(''); const [err, setErr] = useState(''); const [copied, setCopied] = useState('');
  const h = { 'Content-Type': 'application/json', 'x-admin-password': pw };
  const load = async () => { const r = await fetch(`${API}/api/admin/guests`, { headers: h }); if (!r.ok) return setErr('Wrong password'); setErr(''); setRows(await r.json()); };
  const add = async () => {
    const guests = txt.split('\n').map((l) => { const [name, n] = l.split(','); return { name, max_guests: n }; });
    await fetch(`${API}/api/admin/guests`, { method: 'POST', headers: h, body: JSON.stringify({ guests }) }); setTxt(''); load();
  };
  const csv = () => { const head = 'name,attending,guests,email,phone,message\n'; const body = rows.map((r) => [r.name, r.attending, r.guest_count, r.email, r.phone, r.message].map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([head + body])); a.download = 'rsvps.csv'; a.click(); };
  const copy = (slug) => { navigator.clipboard.writeText(`${location.origin}/invite/${slug}`); setCopied(slug); setTimeout(() => setCopied(''), 1500); };
  const share = (r) => { const url = `${location.origin}/invite/${r.slug}`; navigator.share ? navigator.share({ title: 'Wedding invitation', text: `Hi ${r.name}, you're invited!`, url }).catch(() => {}) : copy(r.slug); };
  const del = async (r) => { if (!confirm(`Delete ${r.name}? Their link will stop working.`)) return; await fetch(`${API}/api/admin/guests/${r.slug}`, { method: 'DELETE', headers: h }); load(); };
  const wrap = 'mx-auto grid max-w-3xl gap-4 px-4 py-8';
  if (!rows) return <main className={wrap}><h1 className="text-3xl">Admin</h1><input className="field" type="password" placeholder="Admin password" value={pw} onChange={(e) => setPw(e.target.value)} /><button className="btn" onClick={load}>Sign in</button>{err && <p className="text-seal">{err}</p>}</main>;
  const yes = rows.filter((r) => r.attending).reduce((s, r) => s + r.guest_count, 0);
  const stat = (n, l) => <div className="rounded-md bg-ink p-3 text-paper"><b className="block font-serif text-2xl font-light">{n}</b><span className="text-xs opacity-70">{l}</span></div>;
  return (
    <main className={wrap}>
      <h1 className="text-3xl">Guests</h1>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{stat(yes, 'attending')}{stat(rows.filter((r) => r.attending === false).length, 'declined')}{stat(rows.filter((r) => r.attending === null).length, 'no reply')}{stat(rows.filter((r) => r.opened_at).length, 'opened')}</div>
      <textarea className="field" rows="4" placeholder={'One guest per line: name, seats\nJohn and Jane, 2'} value={txt} onChange={(e) => setTxt(e.target.value)} />
      <div className="flex"><button className="btn" onClick={add}><FaUserPlus />Add guests</button><button className="btn btn-ghost" onClick={csv}><FaDownload />Export CSV</button></div>
      <table className="w-full border-collapse"><tbody>{rows.map((r) => (
        <tr key={r.slug} className="border-b border-ink/15 align-top"><td className="p-2"><b>{r.name}</b><div className="text-xs opacity-70">{[r.email, r.phone, r.message && `"${r.message}"`].filter(Boolean).join(' · ')}</div></td>
          <td className="whitespace-nowrap p-2">{r.attending === null ? 'No reply' : r.attending ? `Yes (${r.guest_count})` : 'No'}</td>
          <td className="whitespace-nowrap p-2 text-right">
            <button aria-label="Copy link" className="btn btn-ghost !m-0 !px-3 !py-2" onClick={() => copy(r.slug)}>{copied === r.slug ? <FaCheck /> : <FaCopy />}</button>
            <button aria-label="Share link" className="btn btn-ghost !ml-1 !mr-0 !mt-0 !mb-0 !px-3 !py-2" onClick={() => share(r)}><FaShareNodes /></button>
            <button aria-label="Delete guest" className="btn btn-ghost !ml-1 !mr-0 !mt-0 !mb-0 !px-3 !py-2 !text-seal" onClick={() => del(r)}><FaTrash /></button></td></tr>))}</tbody></table>
    </main>
  );
}
