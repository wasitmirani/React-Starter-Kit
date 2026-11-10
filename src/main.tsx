import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import "./assets/styles/globals.css"
import "./assets/styles/app.css"
import "./assets/styles/template-editor.css"
import "./assets/styles/components.css"
import "./assets/styles/inbox.css"
import "./assets/styles/theme.css"
import "./assets/styles/saas.css"
// Alloce Material layout (dark sidebar, boxed topbar, Material cards).
import "./assets/styles/material.css"
import "./assets/styles/toast.css"
import "./assets/styles/auth.css"
// Last: the brand colour theme chosen under My profile → Appearance.
import "./assets/styles/brand-themes.css"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
