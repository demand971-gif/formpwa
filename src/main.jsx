import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Guard: the boot watchdog in index.html may re-load this bundle as a classic
// script if the module load fails. Whichever copy mounts first claims the
// flag so the app is never mounted twice.
if (!window.__formBooted) {
  window.__formBooted = true
  createRoot(document.getElementById('root')).render(<App />)
}
