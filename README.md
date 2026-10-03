# Wedding invitation (React + Express + Neon)
1. Neon: create a project, copy the connection string. Tables are created automatically on first server start.
2. Server (Render, root dir `server`, build `npm install`, start `npm start`): set DATABASE_URL, ADMIN_PASSWORD, CLIENT_ORIGIN (your Vercel URL).
3. Client (Vercel, root dir `client`, framework Vite): set VITE_API_URL to your Render URL.
4. Edit `client/src/config.js` with your names, date, venue, colors.
5. Go to /admin, add guests ("John and Jane, 2" per line), copy each guest's link and send it.
Local: `cd server && npm i && node --env-file=.env index.js`, and `cd client && npm i && npm run dev`.

Photos: put your images in client/public/photos and update heroPhoto and gallery in client/src/config.js.
