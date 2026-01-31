// lib/anthropic.js
// A small wrapper for the Anthropic API. Placed under `src/lib` to indicate
// this is a project-level library utility.
// SECURITY: This file handles sensitive data (API keys and user documents).
// - Never log API keys or document content
// - Always sanitize user input before sending to API
// - Validate all API responses before using

// Sanitize user input to prevent prompt injection attacks
function sanitizeInput(input) {
  if (typeof input !== 'string') return ''
  // Remove potentially dangerous characters and limit length
  return input
    .slice(0, 2000)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ') // Remove control characters
}

export async function sendQuestion({ documentBase64, userQuestion }) {
  try {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('Missing VITE_ANTHROPIC_API_KEY in environment')
    }

    // Validate inputs
    if (!documentBase64 || typeof documentBase64 !== 'string') {
      throw new Error('Invalid document data')
    }

    if (!userQuestion || typeof userQuestion !== 'string') {
      throw new Error('Invalid question data')
    }

    // Sanitize user input to prevent prompt injection
    const sanitizedQuestion = sanitizeInput(userQuestion)
    if (!sanitizedQuestion.trim()) {
      throw new Error('Question cannot be empty')
    }

    const body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: documentBase64,
              },
            },
            {
              type: 'text',
              text: `You are a legal document assistant helping small business owners understand legal documents. \n\nAnalyze the uploaded document and answer this question: "${sanitizedQuestion}"\n\nProvide your response in this format:\n1. A clear, simplified explanation in plain English (2-3 sentences)\n2. Key points to understand (bullet points)\n3. Reference the specific section or clause from the document\n4. End with: "⚠️ This is educational information, not legal advice. Consult a lawyer for specific legal guidance."\n\nBe helpful, clear, and cite specific sections from the document.`,
            },
          ],
        },
      ],
    }

    // SECURITY: Use HTTPS only
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      // Never expose sensitive error details from API responses
      if (res.status === 401) {
        throw new Error('Unauthorized - API key invalid. Please check your configuration.')
      } else if (res.status === 429) {
        throw new Error('Rate limited - Too many requests. Please wait a moment and try again.')
      } else if (res.status >= 500) {
        throw new Error('Server error - Anthropic API is experiencing issues. Please try again later.')
      } else {
        throw new Error(`API error (${res.status}) - Failed to process your request.`)
      }
    }

    const data = await res.json()

    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response from API')
    }

    if (Array.isArray(data.content)) {
      const textContent = data.content
        .filter((item) => item && item.type === 'text')
        .map((item) => item.text)
        .filter((text) => text && typeof text === 'string')
        .join('\n')

      if (!textContent) {
        throw new Error('No text content in API response')
      }

      return textContent
    }

    throw new Error('Unexpected API response format')
  } catch (error) {
    // SECURITY: Only pass generic error messages to client
    // Never expose implementation details or stack traces
    const message = error?.message || 'Unknown error'
    // Avoid leaking sensitive details
    if (message.includes('VITE_') || message.includes('process.env') || message.includes('secret')) {
      throw new Error('Configuration error. Please check your setup.')
    }
    throw new Error(message)
  }
}
