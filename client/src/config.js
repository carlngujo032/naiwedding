// Default wedding details. Once you save changes in /admin, those override these values.
export const defaults = {
  partner1: 'Maria', partner2: 'Josh',
  tagline: 'are getting married and want you there',
  date: '2027-02-14T15:00:00+08:00',
  venue: 'Garden Chapel', address: '123 Rose Street, Your City',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Garden+Chapel+Your+City',
  dressCode: 'Garden formal',
  palette: [['Sage', '#8FA58C'], ['Blush', '#E3B5B0'], ['Ink', '#1F3A32']],
  schedule: [['2:30 PM', 'Guests arrive'], ['3:00 PM', 'Ceremony'], ['4:30 PM', 'Photos and cocktails'], ['6:00 PM', 'Dinner and dancing']],
  rsvpBy: '2027-01-15', // last day guests can reply (YYYY-MM-DD), or '' to hide
  heroPhoto: '/photos/hero.jpg', // swap with your own: put hero.jpg in client/public/photos and set '/photos/hero.jpg'
  gallery: ['/photos/g1.jpg', '/photos/g2.jpg', '/photos/g3.jpg', '/photos/g4.jpg'],
  story: ['We met on a rainy Tuesday and neither of us has owned an umbrella since.', 'After years of adventures, one question, and one very quick yes, we are getting married. Write your own story here.'],
  dress: { note: 'Garden formal. Soft, natural tones; please avoid white and ivory.', photos: [['Ladies', '/photos/dress-women.jpg'], ['Gentlemen', '/photos/dress-men.jpg']] },
  faq: [['Can I bring a plus one?', 'Your invitation lists exactly how many seats are reserved for you.'], ['Are children welcome?', 'Yes, children are welcome. Please include them in your guest count.'], ['Is there parking?', 'Free parking is available at the venue.'], ['What if it rains?', 'The ceremony has a covered backup space, so the day goes ahead either way.']],
  entourage: [
    ['Parents of the Groom', ['Mr. Groom Father', 'Mrs. Groom Mother']],
    ['Parents of the Bride', ['Mr. Bride Father', 'Mrs. Bride Mother']],
    ['Maid of Honor', ['Name Surname']], ['Best Man', ['Name Surname']],
    ['Bridesmaids', ['Name Surname', 'Name Surname', 'Name Surname']], ['Groomsmen', ['Name Surname', 'Name Surname', 'Name Surname']],
    ['Principal Sponsors', ['Mr. and Mrs. Name Surname', 'Mr. and Mrs. Name Surname']],
    ['Flower Girl', ['Name Surname']], ['Ring Bearer', ['Name Surname']],
  ],
  contacts: { coordinator: ['Coordinator Name', '0900 000 0000'], couple: [['Maria', '0900 000 0001'], ['Josh', '0900 000 0002']] },
  backgroundPhoto: '/photos/bg.jpg', // the picture behind the frosted-glass cards
  music: '/song.mp3', // optional: put an mp3 in client/public and set '/song.mp3'
  envelopePhoto: '/photos/hero.jpg', // small photo on the card inside the envelope; empty = no photo
  favicon: '', // browser tab icon: leave empty to use /favicon.svg, or set from /admin
  tabTitle: "You're invited", // text shown on the browser tab
  hidden: [], // built-in sections to hide: 'details','dress','story','entourage','gallery','faq'
  extra: [] // your own sections added from /admin: { title, text, photo, buttonLabel, buttonUrl, after }
};

const API = import.meta.env.VITE_API_URL || '';
const cfg = structuredClone(defaults);
export async function loadConfig() {
  try { const r = await fetch(`${API}/api/config`); if (r.ok) Object.assign(cfg, await r.json()); } catch { /* keep defaults */ }
}
export default cfg;
export function applyTab() {
  if (cfg.tabTitle) document.title = cfg.tabTitle;
  if (cfg.favicon) { let l = document.querySelector('link[rel="icon"]'); if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.append(l); } l.removeAttribute('type'); l.href = cfg.favicon; }
}
