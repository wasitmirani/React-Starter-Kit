import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import "./assets/styles/globals.css"
import "./assets/styles/app.css"
import "./assets/styles/template-editor.css"
import "./assets/styles/components.css"
import "./assets/styles/inbox.css"
import "./assets/styles/theme.css"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
