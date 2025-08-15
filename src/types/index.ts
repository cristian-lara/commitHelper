export interface GitFile {
  path: string
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked'
  staged: boolean
  diff?: string
}

export interface GitStatus {
  workingDirectory: GitFile[]
  stagingArea: GitFile[]
  branch: string
  ahead: number
  behind: number
}

export interface CommitMessage {
  type: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore'
  scope?: string
  description: string
  body?: string
  breaking?: boolean
  footer?: string
}

export interface AICommitRequest {
  files: GitFile[]
  diff: string
  projectContext?: string
}

export interface AICommitResponse {
  message: CommitMessage
  explanation: string
  confidence: number
}

// AI Model Configuration
export type AIModel = 'gpt-4' | 'gpt-4-1106-preview' | 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k'

export interface AIModelConfig {
  id: AIModel
  name: string
  description: string
  maxTokens: number
  pricePer1KTokens: number
  recommended: boolean
}

export interface AISettings {
  apiKey: string
  model: AIModel
  temperature: number
  maxTokens: number
}
