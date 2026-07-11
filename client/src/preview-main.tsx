/** Entry for the single-file artifact preview build (preview.vite.config.mts;
 *  `npm run preview:build`). Not part of the shipped app — the production
 *  entry stays main.tsx. Mounts the real App on an in-memory router pinned to
 *  "/" so the preview renders the marketing surface regardless of the host
 *  URL (artifact pages don't serve our routes). */
import { createRoot } from 'react-dom/client';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import App from './App';
import './index.css';
import './styles/cdTokens.css';

const { hook } = memoryLocation({ path: '/' });

createRoot(document.getElementById('root')!).render(
  <Router hook={hook}>
    <App />
  </Router>,
);
