import React, { useState, useEffect } from 'react'
import { GitService } from '../services/gitService'
import { AIService } from '../services/aiService'
import { GitStatus, GitFile, AISettings } from '../types'
import { DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from '../config/aiModels'
import { FileExplorer, StagingArea, CommitForm, AISettings as AISettingsComponent } from './index'

const CommitHelper: React.FC = () => {
  const [gitService] = useState(() => new GitService())
  const [aiService] = useState(() => new AIService())
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiSettings, setAiSettings] = useState<AISettings>({
    apiKey: '',
    model: DEFAULT_MODEL as any,
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: DEFAULT_MAX_TOKENS
  })
  const [showAISettings, setShowAISettings] = useState(false)

  useEffect(() => {
    loadGitStatus()
    loadAISettings()
  }, [])

  const loadGitStatus = async () => {
    try {
      setLoading(true)
      const status = await gitService.getStatus()
      setGitStatus(status)
    } catch (error) {
      console.error('Error loading git status:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAISettings = () => {
    // Load AI settings from localStorage
    const savedSettings = localStorage.getItem('commitHelperAISettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setAiSettings(parsed)
        aiService.updateSettings(parsed)
      } catch (error) {
        console.error('Error loading AI settings:', error)
      }
    }
  }

  const handleAddFile = async (file: GitFile) => {
    try {
      await gitService.addFile(file.path)
      await loadGitStatus() // Refresh status
    } catch (error) {
      console.error('Error adding file:', error)
    }
  }

  const handleRemoveFromStaging = async (file: GitFile) => {
    try {
      await gitService.removeFromStaging(file.path)
      await loadGitStatus() // Refresh status
    } catch (error) {
      console.error('Error removing file from staging:', error)
    }
  }

  const handleCommit = async (message: string) => {
    try {
      await gitService.commit(message)
      await loadGitStatus() // Refresh status
    } catch (error) {
      console.error('Error committing:', error)
    }
  }

  const handleGenerateAIMessage = async () => {
    if (!gitStatus?.stagingArea.length) {
      alert('No files in staging area to generate commit message for')
      return
    }

    try {
      const stagedDiff = await gitService.getStagedDiff()
      const response = await aiService.generateCommitMessage({
        files: gitStatus.stagingArea,
        diff: stagedDiff
      })
      
      // You could show this in a modal or update the commit form
      console.log('AI generated message:', response.message)
      alert(`AI Generated: ${response.message.type}${response.message.scope ? `(${response.message.scope})` : ''}: ${response.message.description}`)
    } catch (error) {
      console.error('Error generating AI message:', error)
      alert('Error generating AI commit message')
    }
  }

  const handleAISettingsSave = (settings: AISettings) => {
    setAiSettings(settings)
    aiService.updateSettings(settings)
    
    // Save to localStorage
    localStorage.setItem('commitHelperAISettings', JSON.stringify(settings))
    
    setShowAISettings(false)
  }

  const getCurrentModelInfo = () => {
    return aiService.getCurrentModelInfo()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!gitStatus) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          No Git Repository Found
        </h2>
        <p className="text-gray-600">
          Please navigate to a Git repository to use Commit Helper.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with AI Settings */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Git Status - {gitStatus.branch}
          </h2>
          <p className="text-sm text-gray-500">
            {gitStatus.ahead > 0 && `Ahead: ${gitStatus.ahead}`}
            {gitStatus.behind > 0 && `Behind: ${gitStatus.behind}`}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAISettings(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            AI Settings
          </button>
          <button
            onClick={handleGenerateAIMessage}
            disabled={!gitStatus.stagingArea.length || !aiSettings.apiKey}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Generate AI Message
          </button>
        </div>
      </div>

      {/* AI Model Info */}
      {aiSettings.apiKey && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">
                AI Model: {getCurrentModelInfo()?.name || aiSettings.model}
              </span>
              <span className="text-xs text-blue-600">
                (Temperature: {aiSettings.temperature}, Max Tokens: {aiSettings.maxTokens})
              </span>
            </div>
            <span className="text-xs text-blue-600">
              Ready to generate commits
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Working Directory */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Working Directory
            </h3>
            <FileExplorer
              files={gitStatus.workingDirectory}
              onAddFile={handleAddFile}
              title="Modified Files"
            />
          </div>
        </div>

        {/* Staging Area */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Staging Area
            </h3>
            <StagingArea
              files={gitStatus.stagingArea}
              onRemoveFile={handleRemoveFromStaging}
            />
          </div>
        </div>
      </div>

      {/* Commit Form */}
      {gitStatus.stagingArea.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Commit Changes
            </h3>
            <CommitForm
              files={gitStatus.stagingArea}
              onSubmit={handleCommit}
            />
          </div>
        </div>
      )}

      {/* AI Settings Modal */}
      {showAISettings && (
        <AISettingsComponent
          settings={aiSettings}
          onSave={handleAISettingsSave}
          onCancel={() => setShowAISettings(false)}
        />
      )}
    </div>
  )
}

export default CommitHelper
