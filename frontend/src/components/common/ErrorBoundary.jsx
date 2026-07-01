import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

/**
 * Global Error Boundary.
 * Catches runtime errors from any child component tree.
 * Must be a class component — React does not support error boundaries as functions.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  handleReset() {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: 'var(--color-bg-base)' }}>
        <div className="text-center max-w-md px-6 space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                 style={{ background: 'rgba(239,68,68,0.12)' }}>
              <AlertTriangle className="w-8 h-8" style={{ color: 'var(--color-danger)' }} />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-semibold"
                style={{ color: 'var(--color-text-primary)' }}>
              Something went wrong
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              An unexpected error occurred. The application will reset.
            </p>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <pre className="text-left text-xs p-4 rounded-xl overflow-auto max-h-40"
                 style={{
                   background: 'var(--color-bg-overlay)',
                   color: 'var(--color-danger)',
                   border: '1px solid var(--color-border)',
                 }}>
              {this.state.error?.message}
            </pre>
          )}

          <button
            onClick={() => this.handleReset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }
}
