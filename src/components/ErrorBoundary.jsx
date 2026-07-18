import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div style={{ padding: 20, color: '#fff', background: '#0e1420', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: 18 }}>Something went wrong</h1>
        <p style={{ opacity: 0.8, whiteSpace: 'pre-wrap', fontSize: 13 }}>{String(error?.message || error)}</p>
        <button type="button" onClick={() => location.reload()} style={{ marginTop: 16 }}>Reload</button>
      </div>
    )
  }
}
