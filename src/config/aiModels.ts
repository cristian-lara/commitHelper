import { AIModelConfig } from '../types'

export const AI_MODELS: Record<string, AIModelConfig> = {
  'gpt-4-1106-preview': {
    id: 'gpt-4-1106-preview',
    name: 'GPT-4 Turbo',
    description: 'El modelo más avanzado y preciso para análisis de código',
    maxTokens: 128000,
    pricePer1KTokens: 0.01,
    recommended: true
  },
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Excelente para análisis de código y commits de alta calidad',
    maxTokens: 8192,
    pricePer1KTokens: 0.03,
    recommended: true
  },
  'gpt-3.5-turbo-16k': {
    id: 'gpt-3.5-turbo-16k',
    name: 'GPT-3.5 Turbo 16K',
    description: 'Buena relación calidad-precio para commits básicos',
    maxTokens: 16384,
    pricePer1KTokens: 0.003,
    recommended: false
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Opción económica para commits simples',
    maxTokens: 4096,
    pricePer1KTokens: 0.002,
    recommended: false
  }
}

export const DEFAULT_MODEL: string = 'gpt-4-1106-preview'
export const DEFAULT_TEMPERATURE = 0.7
export const DEFAULT_MAX_TOKENS = 200

// Helper function to get model info
export const getModelInfo = (modelId: string): AIModelConfig | undefined => {
  return AI_MODELS[modelId]
}

// Helper function to get recommended models
export const getRecommendedModels = (): AIModelConfig[] => {
  return Object.values(AI_MODELS).filter(model => model.recommended)
}

// Helper function to calculate cost for a given number of tokens
export const calculateCost = (modelId: string, tokens: number): number => {
  const model = AI_MODELS[modelId]
  if (!model) return 0
  
  return (tokens / 1000) * model.pricePer1KTokens
}

// Helper function to format cost
export const formatCost = (cost: number): string => {
  if (cost < 0.01) {
    return `$${(cost * 1000).toFixed(2)} por 1K tokens`
  }
  return `$${cost.toFixed(4)}`
}
