import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/figtree'
import '@fontsource/noto-sans-ethiopic/400.css'
import '@fontsource/noto-sans-ethiopic/600.css'
import './index.css'
import App from './App.tsx'
import './i18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Follows the device's "reduce motion" setting for every animation in the app. */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
