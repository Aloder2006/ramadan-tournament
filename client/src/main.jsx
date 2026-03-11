import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/* ─── Service Worker Registration ─── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('✅ SW registered, scope:', reg.scope);

        // Check for updates periodically (every 60 min)
        setInterval(() => reg.update(), 60 * 60 * 1000);
      })
      .catch((err) => {
        console.warn('⚠️ SW registration failed:', err);
      });
  });
}
