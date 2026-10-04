# Wedding invitation (React + Express + Neon)
1. Neon: create a project, copy the connection string. Tables are created automatically on first server start.
2. Server (Render, root dir `server`, build `npm install`, start `npm start`): set DATABASE_URL, ADMIN_PASSWORD, CLIENT_ORIGIN (your Vercel URL).
3. Client (Vercel, root dir `client`, framework Vite): set VITE_API_URL to your Render URL.
4. Edit `client/src/config.js` with your names, date, venue, colors.
5. Go to /admin, add guests ("John and Jane, 2" per line), copy each guest's link and send it.
Local: `cd server && npm i && node --env-file=.env index.js`, and `cd client && npm i && npm run dev`.

Photos: put your images in client/public/photos and update heroPhoto and gallery in client/src/config.js.

Editing the site: go to /admin, sign in, then use the "Edit invitation" tab to change names, date, venue, schedule, story, dress code, wedding party, FAQ, contacts and photos, then press Save. Saved edits are stored in Neon and override client/src/config.js. "Reset to original" goes back to config.js. The pencil button on each guest edits their name and seats.

Cloudinary (photos and the song): create a free account, then on Render add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (Cloudinary dashboard > Settings > API Keys). Then /admin > Edit invitation can upload photos and the background song straight to Cloudinary. You can also paste any Cloudinary or other https link instead of uploading.
