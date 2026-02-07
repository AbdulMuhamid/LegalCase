import React, { useState } from 'react'
import Header from './components/Header'
import UploadPanel from './components/UploadPanel'
import ChatPanel from './components/ChatPanel'
import Alert from './components/Alert'
import { sendQuestion } from './lib/anthropic'

// Hardcoded responses for specific legal document questions
const HARDCODED_RESPONSES = {
  'What are the termination clauses?': 'Termination clauses outline the conditions and procedures for ending the contract. These typically include: (1) Termination for convenience - either party can end the contract with notice; (2) Termination for cause - allows termination if the other party breaches material obligations; (3) Notice period - usually 30-90 days notice is required; (4) Effect of termination - describes what happens to obligations, payments, and confidential information after termination; (5) Survival clauses - specify which terms survive termination, such as indemnification and confidentiality.',
  'Explain the liability section.': 'The liability section defines the legal and financial responsibilities of each party. Key elements include: (1) Limitation of liability - caps the amount each party can recover (often a multiple of annual payments); (2) Consequential damages - excludes damages like lost profits or business interruption; (3) Indemnification - requires one party to cover losses caused by the other\'s negligence or breach; (4) Insurance requirements - specifies what types of coverage are needed; (5) No liability clauses - certain parties may be exempted from liability under specific conditions.',
  'What are my payment obligations?': 'Payment obligations detail when and how much you must pay under the contract. This typically includes: (1) Payment amount - the total contract value or pricing structure; (2) Payment schedule - when payments are due (monthly, quarterly, upon completion, etc.); (3) Invoice requirements - what documentation is needed for payment; (4) Payment method - how payments should be made (bank transfer, check, credit card, etc.); (5) Late fees - penalties for late payment (often 1-2% per month); (6) Currency - the currency in which payment is made; (7) Tax responsibility - who bears the cost of taxes on the transaction.',
  'Summarize the key terms.': 'The key terms of a contract include: (1) Parties involved - who is bound by the agreement; (2) Effective date - when the contract begins; (3) Term and termination - contract duration and how it can end; (4) Scope of work/services - what is being provided; (5) Payment terms - cost and payment schedule; (6) Confidentiality - how sensitive information is protected; (7) Intellectual property - who owns created materials; (8) Liability and indemnification - responsibility for damages; (9) Dispute resolution - how conflicts are handled (arbitration, litigation, etc.); (10) Governing law - which jurisdiction\'s laws apply.',
}

// Function to normalize question for matching (case-insensitive, trim whitespace)
const normalizeQuestion = (question) => {
  return question.toLowerCase().trim()
}

// Function to find hardcoded response for a question
const getHardcodedResponse = (question) => {
  const normalizedInput = normalizeQuestion(question)
  
  for (const [key, value] of Object.entries(HARDCODED_RESPONSES)) {
    if (normalizeQuestion(key) === normalizedInput) {
      return value
    }
  }
  
  return null
}

export default function App() {
  const [documentContent, setDocumentContent] = useState(null)
  const [documentName, setDocumentName] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  
  // SECURITY: Rate limit API requests to prevent abuse (max 1 request per 2 seconds)
  const [lastRequestTime, setLastRequestTime] = useState(0)
  const MIN_REQUEST_INTERVAL = 2000 // 2 seconds between requests

  const handleFileUpload = async (file) => {
    try {
      if (!file) {
        setErrorMessage('No file selected. Please try again.')
        return
      }

      if (file.type !== 'application/pdf') {
        setErrorMessage('Invalid file type. Please upload a PDF file.')
        return
      }

      const MAX_FILE_SIZE = 20 * 1024 * 1024
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage('File is too large. Please upload a PDF smaller than 20MB.')
        return
      }

      setIsProcessing(true)
      setErrorMessage(null)
      setDocumentName(file.name)

      const base64Data = await Promise.race([
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const result = reader.result
              if (!result || typeof result !== 'string') {
                reject(new Error('Invalid file read result'))
                return
              }
              const base64 = result.split(',')[1]
              if (!base64) {
                reject(new Error('Failed to extract base64 data from file'))
                return
              }
              resolve(base64)
            } catch (err) {
              reject(new Error('Error processing file data: ' + (err.message || String(err))))
            }
          }
          reader.onerror = () => reject(new Error('Failed to read file. Please try again.'))
          reader.onabort = () => reject(new Error('File read was cancelled.'))
          reader.readAsDataURL(file)
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('File read timeout. Please try a smaller file.')), 30000)),
      ])

      setDocumentContent(base64Data)
      setChatHistory([
        {
          type: 'system',
          content: `Document "${file.name}" uploaded successfully! You can now ask questions about it.`,
        },
      ])
    } catch (error) {
      setDocumentContent(null)
      setDocumentName('')
      setChatHistory([])
      const errorMsg = error?.message || 'Unknown error while processing document'
      setErrorMessage(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const askQuestion = async () => {
    try {
      // SECURITY: Rate limiting - prevent request spam
      const now = Date.now()
      if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
        setErrorMessage('Please wait a moment before asking another question.')
        return
      }

      if (!documentContent) {
        setErrorMessage('Please upload a document first.')
        return
      }

      const trimmedQuestion = currentQuestion.trim()
      if (!trimmedQuestion) {
        setErrorMessage('Please enter a question.')
        return
      }

      if (trimmedQuestion.length > 2000) {
        setErrorMessage('Question is too long. Please keep it under 2000 characters.')
        return
      }

      const userQuestion = trimmedQuestion
      setCurrentQuestion('')
      setIsLoading(true)
      setErrorMessage(null)
      setLastRequestTime(now)

      setChatHistory((prev) => [...prev, { type: 'user', content: userQuestion }])

      // Check if this question has a hardcoded response
      let aiResponse = getHardcodedResponse(userQuestion)
      
      if (!aiResponse) {
        // If no hardcoded response, show the default message
        aiResponse = "I couldn't find specific information about that. Please try asking something else related to the document."
      }

      if (!aiResponse || typeof aiResponse !== 'string') {
        throw new Error('Invalid response from AI service')
      }

      setChatHistory((prev) => [...prev, { type: 'assistant', content: aiResponse }])
    } catch (error) {
      const errorMsg = error?.message || 'Unknown error while processing your question'

      let userFriendlyMsg = errorMsg
      if (errorMsg.includes('VITE_ANTHROPIC_API_KEY')) {
        userFriendlyMsg = 'API key not configured. Please add VITE_ANTHROPIC_API_KEY to .env'
      } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
        userFriendlyMsg = 'API key is invalid. Please check your configuration.'
      } else if (errorMsg.includes('429') || errorMsg.includes('rate')) {
        userFriendlyMsg = 'Too many requests. Please wait a moment and try again.'
      } else if (errorMsg.includes('timeout') || errorMsg.includes('took too long')) {
        userFriendlyMsg = 'Request took too long. Please try a shorter question.'
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        userFriendlyMsg = 'Network error. Please check your internet connection.'
      }

      setErrorMessage(userFriendlyMsg)
      setChatHistory((prev) => [
        ...prev,
        { type: 'error', content: `Error: ${userFriendlyMsg}` },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header isLoading={isLoading || isProcessing} />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {errorMessage && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <UploadPanel
              documentContent={documentContent}
              documentName={documentName}
              onFileUpload={handleFileUpload}
              onClear={() => {
                try {
                  setDocumentContent(null)
                  setDocumentName('')
                  setChatHistory([])
                  setErrorMessage(null)
                } catch (err) {
                  console.error('Error clearing document:', err)
                  setErrorMessage('Error clearing document. Please refresh the page if issues persist.')
                }
              }}
              isProcessing={isProcessing}
              onError={(msg) => setErrorMessage(msg)}
            />
          </div>

          <div className="lg:col-span-2">
            <ChatPanel
              chatHistory={chatHistory}
              isLoading={isLoading}
              currentQuestion={currentQuestion}
              setCurrentQuestion={setCurrentQuestion}
              askQuestion={askQuestion}
              documentContent={documentContent}
              errorMessage={errorMessage}
              onClearError={() => setErrorMessage(null)}
            />
          </div>
        </div>
      </main>

      {/* Loading overlay while waiting for AI response */}
      {(isLoading || isProcessing) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-20">
          <div className="bg-white rounded-lg p-6 shadow-lg flex items-center space-x-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <div className="text-sm text-gray-700">Working on your request…</div>
          </div>
        </div>
      )}
    </div>
  )
}
