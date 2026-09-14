import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { loadConfig } from './config'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './i18n/config'
import App from './App.jsx'

// Kicked off here (not awaited) so it resolves in parallel with app boot —
// by the time any screen needs to call the API, the config is already in
// hand. Errors surface when a caller awaits loadConfig().
void loadConfig().catch(() => {})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
