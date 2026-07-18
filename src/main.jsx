import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary, { selfHeal } from './components/ErrorBoundary.jsx'
import './styles.css'

// If the app hard-crashes twice in one session, assume a stuck update
// (stale service worker / half-cached files) and self-heal once.
const CRASH_KEY = 'sap_boot_crashes'
function noteCrash() {
  try {
    const n = Number(sessionStorage.getItem(CRASH_KEY) || 0) + 1
    sessionStorage.setItem(CRASH_KEY, String(n))
    if (n >= 2) {
      sessionStorage.setItem(CRASH_KEY, '0')
      selfHeal(false)
      return true
    }
  } catch { /* ignore */ }
  return false
}

// Last-resort screen if even React fails to mount — never a blank page.
function showFatal(msg) {
  const root = document.getElementById('root')
  if (root && root.childElementCount === 0) {
    root.innerHTML =
      '<div style="font-family:system-ui;color:#f2f5f9;background:#0e1420;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center">' +
      '<div style="font-size:40px">😵</div>' +
      '<h2 style="margin:10px 0;font-weight:700">SAP hit a problem while loading</h2>' +
      '<p style="color:#8fa0b8;max-width:320px;font-size:14px;line-height:1.5">' +
      String(msg || 'Unknown error') + '</p>' +
      '<button onclick="location.reload()" style="margin-top:16px;padding:12px 24px;border:0;border-radius:12px;background:#2dd4a7;color:#0b1018;font-weight:700;font-size:15px">Reload</button>' +
      '</div>'
  }
}

window.addEventListener('error', (e) => {
  console.error('SAP error:', e.message)
  if (!noteCrash()) showFatal(e.message)
})
window.addEventListener('unhandledrejection', (e) => {
  // async failures (network, AI quota…) are handled in-place by screens; just log
  console.error('SAP async error:', e.reason)
})

try {
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  )
  try { sessionStorage.setItem(CRASH_KEY, '0') } catch { /* ignore */ }
} catch (e) {
  console.error('SAP mount failed:', e)
  if (!noteCrash()) showFatal(e && e.message)
}
