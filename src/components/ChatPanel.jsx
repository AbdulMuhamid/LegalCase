import React from 'react'
import { AlertCircle, Send } from 'lucide-react'

export default function ChatPanel({ chatHistory, isLoading, currentQuestion, setCurrentQuestion, askQuestion, documentContent, errorMessage, onClearError }) {
  const handleKeyPress = (e) => {
    try {
      if (!e) return
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        // Validate before submitting
        const trimmedQuestion = currentQuestion.trim()
        if (trimmedQuestion === '') {
          return // Do nothing if input is empty
        }
        askQuestion()
      }
    } catch (err) {
      console.error('Error in handleKeyPress:', err)
    }
  }

  const handleInputChange = (e) => {
    try {
      if (!e || !e.target) return
      // Limit input to 2000 characters to prevent UI lag
      const value = e.target.value
      if (value.length <= 2500) {
        setCurrentQuestion(value)
      }
    } catch (err) {
      console.error('Error in handleInputChange:', err)
    }
  }

  // Check if the question is empty (for disabling the Send button)
  const isQuestionEmpty = !currentQuestion.trim()

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col" style={{ height: '600px' }} role="region" aria-label="Chat area">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Ask Questions</h2>
        <p className="text-sm text-gray-600">Get simplified explanations of legal terms and clauses</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-label="Chat messages">
        {errorMessage && (
          <div className="mb-4" role="alert" aria-live="assertive">
            <div className="p-3 rounded-md bg-red-50 text-red-800 border border-red-100 flex items-start justify-between">
              <div className="text-sm">{errorMessage}</div>
              <button onClick={onClearError} className="text-sm text-red-700 hover:underline ml-4" aria-label="Dismiss error message">Dismiss</button>
            </div>
          </div>
        )}
        {chatHistory.length === 0 && !documentContent && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" aria-hidden="true" />
            <p className="text-gray-600">Upload a legal document to get started</p>
          </div>
        )}

        {chatHistory.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-3xl rounded-lg px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-indigo-600 text-white'
                  : message.type === 'system'
                  ? 'bg-blue-50 text-blue-900 border border-blue-200'
                  : message.type === 'error'
                  ? 'bg-red-50 text-red-900 border border-red-200'
                  : 'bg-gray-100 text-gray-900'
              }`}
              role={message.type === 'error' ? 'alert' : 'article'}
              aria-label={`${message.type} message`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start" role="status" aria-label="Loading response">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="animate-bounce">●</div>
                <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>
                  ●
                </div>
                <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>
                  ●
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <label htmlFor="question-input" className="sr-only">
            Ask a question about your document
          </label>
          <input
            id="question-input"
            type="text"
            value={currentQuestion}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={documentContent ? 'Ask a question about your document...' : 'Upload a document first...'}
            disabled={!documentContent || isLoading}
            maxLength="2500"
            aria-describedby="question-hint"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={askQuestion}
            disabled={!documentContent || isQuestionEmpty || isLoading}
            title={isQuestionEmpty ? "Please enter a question" : "Send question"}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            aria-label="Send question to AI assistant"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>Send</span>
          </button>
        </div>
        <p id="question-hint" className="text-xs text-gray-500 mt-2">
          ⚠️ This tool provides educational information only, not legal advice.
        </p>
        {isQuestionEmpty && documentContent && (
          <p className="text-xs text-red-600 mt-2">
            ⚠️ Please enter a question before submitting.
          </p>
        )}
      </div>
    </div>
  )
}
