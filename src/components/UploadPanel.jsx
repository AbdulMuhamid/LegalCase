import React from 'react'
import { Upload, CheckCircle } from 'lucide-react'

export default function UploadPanel({ documentContent, documentName, onFileUpload, onClear, isProcessing, onError }) {
  const handleDrop = (e) => {
    try {
      e.preventDefault()
      const files = e.dataTransfer?.files
      if (!files || files.length === 0) {
        onError && onError('No file found in drop. Please try again.')
        return
      }
      const file = files[0]
      if (!file) {
        onError && onError('Invalid file. Please try again.')
        return
      }
      if (file.type !== 'application/pdf') {
        onError && onError('Invalid file type. Please upload a PDF file.')
        return
      }
      onFileUpload(file)
    } catch (err) {
      onError && onError('Error processing dropped file: ' + (err.message || String(err)))
    }
  }

  const handleFileSelect = (e) => {
    try {
      const files = e.target?.files
      if (!files || files.length === 0) {
        return
      }
      const file = files[0]
      if (!file) {
        onError && onError('Invalid file. Please try again.')
        return
      }
      if (file.type !== 'application/pdf') {
        onError && onError('Invalid file type. Please upload a PDF file.')
        return
      }
      onFileUpload(file)
    } catch (err) {
      onError && onError('Error processing selected file: ' + (err.message || String(err)))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6" role="region" aria-label="Document upload section">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h2>

      {!documentContent ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer"
          role="region"
          aria-label="Drop zone for PDF files"
        >
          <input type="file" accept="application/pdf" onChange={handleFileSelect} className="hidden" id="file-upload" aria-label="Select PDF file" />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-700">Drop PDF here or click to upload</p>
            <p className="text-xs text-gray-500 mt-2">Contracts, NDAs, Agreements, etc.</p>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4" role="status" aria-live="polite">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Document Loaded</p>
                <p className="text-xs text-green-700 mt-1 break-all">{documentName}</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClear}
            className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            aria-label="Upload a different document"
          >
            Upload Different Document
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="mt-4 text-center" role="status" aria-live="polite">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-gray-600 mt-2">Processing document...</p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Example Questions:</h3>
        <ul className="text-xs text-gray-600 space-y-2">
          <li>• What are the termination clauses?</li>
          <li>• Explain the liability section</li>
          <li>• What are my payment obligations?</li>
          <li>• Summarize the key terms</li>
        </ul>
      </div>
    </div>
  )
}
