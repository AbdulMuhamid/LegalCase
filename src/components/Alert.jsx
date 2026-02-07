import React from 'react'

export default function Alert({ type = 'info', message, onClose }) {
  try {
    const base = 'p-3 rounded-md flex items-start space-x-3'
    const variants = {
      error: 'bg-red-50 text-red-800 border border-red-100',
      success: 'bg-green-50 text-green-800 border border-green-100',
      info: 'bg-blue-50 text-blue-900 border border-blue-100',
    }

    // Sanitize message to prevent XSS
    const safeMessage = String(message || '').slice(0, 1000)

    return (
      <div className={`${base} ${variants[type] || variants.info}`} role="alert">
        <div className="flex-1 text-sm whitespace-pre-wrap break-words">{safeMessage}</div>
        {onClose && (
          <button
            onClick={() => {
              try {
                onClose()
              } catch (err) {
                console.error('Error in onClose:', err)
              }
            }}
            className="text-sm text-gray-500 hover:text-gray-700 ml-4 flex-shrink-0"
            aria-label="Close alert"
          >
            Close
          </button>
        )}
      </div>
    )
  } catch (err) {
    console.error('Error rendering Alert:', err)
    return <div className="p-3 bg-red-50 text-red-800 border border-red-100 rounded-md text-sm">An error occurred displaying this message.</div>
  }
}
