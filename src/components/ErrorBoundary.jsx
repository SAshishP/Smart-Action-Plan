import { Component } from 'react'

// Unregisters service workers + clears caches (fixes stuck updates),
// optionally clears this phone's SAP data, then reloads.
export async function selfHeal(clearData) {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
    if (window.caches) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
    if (clearData) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('sap_'))
        .forEach((k) => localStorage.removeItem(k))
    }
  } catch { /* best effort */ }
  window.location.reload()
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('SAP crash:', error, info?.componentStack)
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className={'screen' + (this.props.inline ? ' with-tabbar' : '')}
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="card err-card">
          <h2>😵 Something went wrong{this.props.inline ? ' on this screen' : ''}</h2>
          <p className="dim small" style={{ margin: '8px 0 14px' }}>
            Your data is safe. Pick a way back in:
          </p>
          <button type="button" onClick={() => this.setState({ error: null })}>
            Try again
          </button>
          <button className="ghost" type="button" style={{ marginTop: 8 }}
            onClick={() => selfHeal(false)}>
            Reload fresh (fixes stuck updates)
          </button>
          <button className="ghost" type="button" style={{ marginTop: 8 }}
            onClick={() => {
              if (window.confirm('Clear SAP data on this phone? Your cloud account data stays safe.')) selfHeal(true)
            }}>
            Reset app data on this phone
          </button>
          <p className="dim" style={{ fontSize: 11, marginTop: 14, wordBreak: 'break-word' }}>
            Details: {String(this.state.error?.message || this.state.error)}
          </p>
        </div>
      </div>
    )
  }
}
