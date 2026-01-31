import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// SECURITY: Prevent accidental exposure of secrets in development
if (import.meta.env.MODE === 'development') {
  // Disable console methods that could leak secrets
  const originalWarn = console.warn
  const originalError = console.error
  const originalLog = console.log

  // Only allow safe logging in development
  const dangerousPatterns = /VITE_ANTHROPIC_API_KEY|sk-|api[._-]key|secret|password|token/i

  console.warn = function (...args) {
    const message = args.map(String).join(' ')
    if (!dangerousPatterns.test(message)) {
      originalWarn.apply(console, args)
    }
  }

  console.error = function (...args) {
    const message = args.map(String).join(' ')
    if (!dangerousPatterns.test(message)) {
      originalError.apply(console, args)
    }
  }

  console.log = function (...args) {
    const message = args.map(String).join(' ')
    if (!dangerousPatterns.test(message)) {
      originalLog.apply(console, args)
    }
  }
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)
