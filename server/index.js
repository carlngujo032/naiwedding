import express from 'express'; import cors from 'cors'; import pg from 'pg'; import rateLimit from 'express-rate-limit'; import crypto from 'node:crypto';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 60 }));

await pool.query(`
CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  max_guests INT NOT NULL DEFAULT 1, opened_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS rsvps (
  guest_id INT PRIMARY KEY REFERENCES guests(id) ON DELETE CASCADE,
  attending BOOLEAN NOT NULL, guest_count INT NOT NULL DEFAULT 1,
  dietary TEXT, song TEXT, message TEXT, updated_at TIMESTAMPTZ DEFAULT now());
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS phone TEXT;
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value JSONB NOT NULL);`);

const slugify = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6);
const clip = (v, n) => (v == null ? null : String(v).slice(0, n));
const admin = (req, res, next) =>
  req.get('x-admin-password') === process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD ? next() : res.status(401).json({ error: 'Wrong password' });

app.get('/api/guests/:slug', async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, max_guests FROM guests WHERE slug=$1', [req.params.slug]);
  if (!rows[0]) return res.status(404).json({ error: 'Invitation not found' });
  await pool.query('UPDATE guests SET opened_at = COALESCE(opened_at, now()) WHERE id=$1', [rows[0].id]);
  const r = await pool.query('SELECT attending, guest_count, email, phone, message FROM rsvps WHERE guest_id=$1', [rows[0].id]);
  res.json({ guest: rows[0], rsvp: r.rows[0] || null });
});

app.post('/api/rsvp', async (req, res) => {
  const { slug, attending, guest_count, email, phone, message } = req.body;
  const { rows } = await pool.query('SELECT id, max_guests FROM guests WHERE slug=$1', [slug]);
  if (!rows[0]) return res.status(404).json({ error: 'Invitation not found' });
  if (typeof attending !== 'boolean') return res.status(400).json({ error: 'Please choose yes or no' });
  if (attending && (!/^\S+@\S+\.\S+$/.test(email || '') || !String(phone || '').trim())) return res.status(400).json({ error: 'Please add a valid email and contact number.' });
  const count = attending ? Math.min(Math.max(parseInt(guest_count) || 1, 1), rows[0].max_guests) : 0;
  await pool.query(
    `INSERT INTO rsvps (guest_id, attending, guest_count, email, phone, message) VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (guest_id) DO UPDATE SET attending=$2, guest_count=$3, email=$4, phone=$5, message=$6, updated_at=now()`,
    [rows[0].id, attending, count, clip(email, 200), clip(phone, 40), clip(message, 1000)]);
  res.json({ ok: true });
});

app.get('/api/admin/guests', admin, async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT g.name, g.slug, g.max_guests, g.opened_at, r.attending, r.guest_count, r.email, r.phone, r.message
     FROM guests g LEFT JOIN rsvps r ON r.guest_id = g.id ORDER BY g.id`);
  res.json(rows);
});

app.post('/api/admin/guests', admin, async (req, res) => {
  const list = (req.body.guests || []).filter((g) => g.name?.trim());
  for (const g of list)
    await pool.query('INSERT INTO guests (slug, name, max_guests) VALUES ($1,$2,$3)', [slugify(g.name), g.name.trim().slice(0, 100), Math.min(parseInt(g.max_guests) || 1, 20)]);
  res.json({ added: list.length });
});

app.get('/api/wishes', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT g.name, r.message FROM rsvps r JOIN guests g ON g.id = r.guest_id
     WHERE r.message IS NOT NULL AND r.message <> '' ORDER BY r.updated_at DESC LIMIT 50`);
  res.json(rows);
});

app.delete('/api/admin/guests/:slug', admin, async (req, res) => {
  await pool.query('DELETE FROM guests WHERE slug=$1', [req.params.slug]);
  res.json({ ok: true });
});

// ---- editable invitation content (overrides client/src/config.js) ----
app.get('/api/config', async (_req, res) => {
  const { rows } = await pool.query("SELECT value FROM settings WHERE key='config'");
  res.set('Cache-Control', 'no-store').json(rows[0]?.value || {});
});

app.put('/api/admin/config', admin, async (req, res) => {
  const c = req.body.config;
  if (!c || typeof c !== 'object' || Array.isArray(c)) return res.status(400).json({ error: 'Bad config' });
  await pool.query(`INSERT INTO settings (key, value) VALUES ('config', $1) ON CONFLICT (key) DO UPDATE SET value=$1`, [JSON.stringify(c)]);
  res.json({ ok: true });
});

app.delete('/api/admin/config', admin, async (_req, res) => {
  await pool.query("DELETE FROM settings WHERE key='config'");
  res.json({ ok: true });
});

// Signed upload to Cloudinary: the browser sends the file straight to Cloudinary, the secret never leaves the server.
app.post('/api/admin/upload-signature', admin, (_req, res) => {
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: secret } = process.env;
  if (!cloudName || !apiKey || !secret) return res.status(500).json({ error: 'Cloudinary is not set up on the server yet.' });
  const timestamp = Math.floor(Date.now() / 1000), folder = 'wedding';
  const signature = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest('hex');
  res.json({ cloudName, apiKey, timestamp, folder, signature });
});

app.put('/api/admin/guests/:slug', admin, async (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 100);
  if (!name) return res.status(400).json({ error: 'Name is required' });
  await pool.query('UPDATE guests SET name=$1, max_guests=$2 WHERE slug=$3', [name, Math.min(Math.max(parseInt(req.body.max_guests) || 1, 1), 20), req.params.slug]);
  res.json({ ok: true });
});

app.get('/health', (_req, res) => res.send('ok'));
app.listen(process.env.PORT || 4000, () => console.log('API ready'));
