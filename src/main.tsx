import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/eb-garamond/latin-400.css'
import '@fontsource/eb-garamond/latin-400-italic.css'
import '@fontsource/eb-garamond/latin-600.css'
import '@fontsource/caveat/latin-400.css'
import '@fontsource/caveat/latin-600.css'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
