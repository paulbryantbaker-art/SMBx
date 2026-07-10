/** ONE-OFF entry for the single-file artifact preview (not committed, not part
 *  of the app). Mounts the real App on an in-memory router pinned to "/" so
 *  the preview renders the marketing surface regardless of the host URL
 *  (artifact pages don't serve our routes). */
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
