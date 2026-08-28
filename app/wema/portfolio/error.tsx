'use client'

// Error surface · what happened, what to do, whether anything was lost.
// Never a status code.

import { useRouter } from 'next/navigation'

export default function PortfolioError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  return (
    <div className="wema-main">
      <header className="wema-crumb">
        <h1>Portfolio</h1>
      </header>

      <div className="wema-panel wema-error">
        <h2>Portfolio data couldn&apos;t refresh</h2>
        <p>{error.message}</p>
        <p>
          Nothing was lost · the last good view remains intact and the sync will be
          retried automatically.
        </p>
        <div className="wema-error-actions">
          <button type="button" className="wema-btn" onClick={reset}>
            Try again
          </button>
          <button
            type="button"
            className="wema-btn ghost"
            onClick={() => router.replace('/wema/portfolio')}
          >
            Return to live view
          </button>
        </div>
      </div>
    </div>
  )
}