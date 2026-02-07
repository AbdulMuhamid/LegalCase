import React from 'react'
import { FileText } from 'lucide-react'

export default function Header({ isLoading = false }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">LegalEase AI</h1>
              <p className="text-sm text-gray-600">Simplify legal documents instantly</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isLoading && (
              <div className="flex items-center space-x-2">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                <span className="text-sm text-gray-600">Processing...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
