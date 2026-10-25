import { createRoot } from 'react-dom/client';
import { StoreProvider } from './store.jsx';
import App from './App.jsx';

// Fonts are bundled with the app (no outside requests), so they also work offline.
import '@fontsource/hanken-grotesk/latin-400.css';
import '@fontsource/hanken-grotesk/latin-500.css';
import '@fontsource/hanken-grotesk/latin-600.css';
import '@fontsource/hanken-grotesk/latin-700.css';
import '@fontsource/mukta/devanagari-400.css';
import '@fontsource/mukta/devanagari-500.css';
import '@fontsource/mukta/devanagari-700.css';
import '@fontsource/instrument-serif/latin-400.css';
import './index.css';

// Remember the browser's install offer so Settings can show an "Install app" button
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__installPrompt = e;
  window.dispatchEvent(new Event('ls-install'));
});

createRoot(document.getElementById('root')).render(
  <StoreProvider>
    <App />
  </StoreProvider>
);
