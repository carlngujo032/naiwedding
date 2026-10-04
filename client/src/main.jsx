import React from 'react'; import { createRoot } from 'react-dom/client'; import { loadConfig, applyTab } from './config.js'; import './index.css';
// load saved edits first: Invitation.jsx reads the date at import time, so App is imported afterwards
loadConfig().then(() => { applyTab(); return import('./App.jsx'); }).then(({ default: App }) => createRoot(document.getElementById('root')).render(<App />));
