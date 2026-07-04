import { useEffect, useState } from 'react'

export function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function detectPlatform() {
  const ua = navigator.userAgent || ''
  const isIOS =
    /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (isIOS) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'desktop'
}

export default function InstallGuide({ onSkip }) {
  const [platform] = useState(detectPlatform)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  useEffect(() => {
    if (!installed) return
    const t = setTimeout(onSkip, 900)
    return () => clearTimeout(t)
  }, [installed, onSkip])

  async function handleInstallClick() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  if (installed) {
    return (
      <div className="screen install-guide">
        <div className="install-hero">
          <img src="/pwa-192.png" alt="SAP" className="install-icon" />
          <h1>Installed!</h1>
          <p className="dim">Opening SAP…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="screen install-guide">
      <div className="install-hero">
        <img src="/pwa-192.png" alt="SAP" className="install-icon" />
        <h1>Install Smart Action Plan</h1>
        <p>Add SAP to your home screen for the full app experience — faster, full-screen, and works offline.</p>
      </div>

      {platform === 'ios' && (
        <div className="card install-steps">
          <h2>On iPhone / iPad</h2>
          <ol>
            <li>Tap the <strong>Share</strong> icon <span className="install-glyph">⬆️</span> in Safari's toolbar.</li>
            <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
            <li>Tap <strong>Add</strong> in the top right.</li>
          </ol>
          <p className="small dim">Must be opened in Safari — Chrome or in-app browsers (Instagram, etc.) on iOS can't install apps.</p>
        </div>
      )}

      {platform === 'android' && (
        <div className="card install-steps">
          <h2>On Android</h2>
          {deferredPrompt ? (
            <button onClick={handleInstallClick}>Install Now</button>
          ) : (
            <ol>
              <li>Tap the <strong>⋮</strong> menu in Chrome's toolbar.</li>
              <li>Tap <strong>Add to Home screen</strong> (or <strong>Install app</strong>).</li>
              <li>Tap <strong>Install</strong> to confirm.</li>
            </ol>
          )}
        </div>
      )}

      {platform === 'desktop' && (
        <div className="card install-steps">
          <h2>On this computer</h2>
          {deferredPrompt ? (
            <button onClick={handleInstallClick}>Install Now</button>
          ) : (
            <p className="small dim">
              Look for the install icon in your browser's address bar, or open the browser menu and choose{' '}
              <strong>Install Smart Action Plan…</strong>
            </p>
          )}
        </div>
      )}

      <button className="ghost" onClick={onSkip}>Continue in browser instead</button>
    </div>
  )
}
