import { useEffect } from 'react'

export default function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1600)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="splash">
      <img className="splash-mark" src="/pwa-192.png" alt="SAP logo" />
      <h1>Smart Action Plan</h1>
      <p>Your whole day, planned smart.</p>
    </div>
  )
}
