import React, { useState } from 'react'
import { GitFile } from '../types'
import { GitCommit, MessageSquare, AlertCircle } from 'lucide-react'

interface CommitFormProps {
  files: GitFile[]
  onSubmit: (message: string) => void
}

const CommitForm: React.FC<CommitFormProps> = ({ files, onSubmit }) => {
  const [commitMessage, setCommitMessage] = useState('')
  const [commitBody, setCommitBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!commitMessage.trim()) {
      setError('Commit message is required')
      return
    }

    if (commitMessage.length > 72) {
      setError('Commit message should be 72 characters or less')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      
      const fullMessage = commitBody.trim() 
        ? `${commitMessage}\n\n${commitBody}`
        : commitMessage
      
      await onSubmit(fullMessage)
      
      // Reset form after successful commit
      setCommitMessage('')
      setCommitBody('')
    } catch (error) {
      setError('Failed to commit changes. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCommitTypeSuggestion = () => {
    const hasNewFiles = files.some(f => f.status === 'added')
    const hasModifiedFiles = files.some(f => f.status === 'modified')
    const hasDeletedFiles = files.some(f => f.status === 'deleted')
    
    if (hasNewFiles && hasModifiedFiles) return 'feat: add new features and update existing code'
    if (hasNewFiles) return 'feat: add new functionality'
    if (hasModifiedFiles) return 'fix: fix issues and improve code'
    if (hasDeletedFiles) return 'refactor: remove unused code and refactor'
    return 'chore: update project files'
  }

  return (
    <div className="space-y-4">
      {/* Files Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Files to commit ({files.length})
        </h4>
        <div className="space-y-1">
          {files.map((file) => (
            <div key={file.path} className="flex items-center space-x-2 text-sm text-gray-600">
              <span className={`inline-block w-2 h-2 rounded-full ${
                file.status === 'added' ? 'bg-green-500' :
                file.status === 'modified' ? 'bg-yellow-500' :
                file.status === 'deleted' ? 'bg-red-500' : 'bg-blue-500'
              }`} />
              <span className="font-mono text-xs">{file.path}</span>
              <span className="text-xs text-gray-400">({file.status})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Commit Message Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Message Input */}
        <div>
          <label htmlFor="commit-message" className="block text-sm font-medium text-gray-700 mb-2">
            Commit Message <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="commit-message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="feat: add new feature"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              maxLength={72}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-xs text-gray-400">
                {commitMessage.length}/72
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Use conventional commit format: type(scope): description
          </p>
        </div>

        {/* Message Body */}
        <div>
          <label htmlFor="commit-body" className="block text-sm font-medium text-gray-700 mb-2">
            Commit Body (optional)
          </label>
          <textarea
            id="commit-body"
            value={commitBody}
            onChange={(e) => setCommitBody(e.target.value)}
            placeholder="Detailed description of changes..."
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Suggestion */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Suggested message:</p>
              <p className="text-sm text-blue-700 mt-1 font-mono">
                {getCommitTypeSuggestion()}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !commitMessage.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Committing...
              </>
            ) : (
              <>
                <GitCommit className="h-4 w-4 mr-2" />
                Commit Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CommitForm
