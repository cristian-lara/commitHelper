import React, { useState } from 'react'
import { Settings, Key, Eye, EyeOff, Info, CheckCircle, Brain, DollarSign, Zap } from 'lucide-react'
import { AISettings as AISettingsType, AIModel } from '../types'
import { AI_MODELS, formatCost } from '../config/aiModels'

interface AISettingsProps {
  settings: AISettingsType
  onSave: (settings: AISettingsType) => void
  onCancel: () => void
}

const AISettings: React.FC<AISettingsProps> = ({ settings, onSave, onCancel }) => {
  const [inputSettings, setInputSettings] = useState<AISettingsType>(settings)
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!inputSettings.apiKey.trim()) {
      setError('API key is required')
      return
    }

    try {
      setIsSaving(true)
      setError('')
      await onSave(inputSettings)
    } catch (error) {
      setError('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setInputSettings(settings)
    setError('')
    onCancel()
  }

  const isSettingsValid = inputSettings.apiKey.trim().length > 0

  // const _recommendedModels = getRecommendedModels()
  const currentModelInfo = AI_MODELS[inputSettings.model]

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">
                AI Settings
              </h3>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Settings Form */}
          <div className="space-y-4">
            {/* API Key Input */}
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  id="api-key"
                  value={inputSettings.apiKey}
                  onChange={(e) => setInputSettings({...inputSettings, apiKey: e.target.value})}
                  placeholder="sk-..."
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Your API key is stored locally and never sent to our servers
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label htmlFor="ai-model" className="block text-sm font-medium text-gray-700 mb-2">
                AI Model <span className="text-red-500">*</span>
              </label>
              <select
                id="ai-model"
                value={inputSettings.model}
                onChange={(e) => setInputSettings({...inputSettings, model: e.target.value as AIModel})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {Object.values(AI_MODELS).map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} {model.recommended && '⭐'} - {formatCost(model.pricePer1KTokens)}
                  </option>
                ))}
              </select>
              
              {/* Model Info */}
              {currentModelInfo && (
                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium">{currentModelInfo.description}</p>
                      <p className="mt-1">
                        Max tokens: {currentModelInfo.maxTokens.toLocaleString()} | 
                        Cost: {formatCost(currentModelInfo.pricePer1KTokens)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Temperature Setting */}
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
                Creativity (Temperature): {inputSettings.temperature}
              </label>
              <input
                type="range"
                id="temperature"
                min="0"
                max="1"
                step="0.1"
                value={inputSettings.temperature}
                onChange={(e) => setInputSettings({...inputSettings, temperature: parseFloat(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Focused (0.0)</span>
                <span>Balanced (0.5)</span>
                <span>Creative (1.0)</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div>
              <label htmlFor="max-tokens" className="block text-sm font-medium text-gray-700 mb-2">
                Max Tokens: {inputSettings.maxTokens}
              </label>
              <input
                type="range"
                id="max-tokens"
                min="50"
                max="500"
                step="25"
                value={inputSettings.maxTokens}
                onChange={(e) => setInputSettings({...inputSettings, maxTokens: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Short (50)</span>
                <span>Medium (200)</span>
                <span>Long (500)</span>
              </div>
            </div>

            {/* Cost Estimation */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Cost Estimation:</p>
                  <p className="text-sm text-green-700 mt-1">
                    Typical commit message: ~{formatCost(currentModelInfo?.pricePer1KTokens || 0)} per request
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">How it works:</p>
                  <ul className="text-xs text-blue-700 mt-1 space-y-1">
                    <li>• AI analyzes your staged changes</li>
                    <li>• Generates conventional commit messages</li>
                    <li>• Follows Git commit best practices</li>
                    <li>• Works with OpenAI GPT models</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {settings.apiKey && !error && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Settings configured successfully
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isSettingsValid || isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2 inline-block" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AISettings
