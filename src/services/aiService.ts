import { AICommitRequest, AICommitResponse, CommitMessage, AIModel, AISettings } from '../types'
import { AI_MODELS, DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS, calculateCost } from '../config/aiModels'

export class AIService {
  private settings: AISettings

  constructor(settings?: Partial<AISettings>) {
    this.settings = {
      apiKey: settings?.apiKey || '',
      model: settings?.model || DEFAULT_MODEL as AIModel,
      temperature: settings?.temperature || DEFAULT_TEMPERATURE,
      maxTokens: settings?.maxTokens || DEFAULT_MAX_TOKENS
    }
  }

  async generateCommitMessage(request: AICommitRequest): Promise<AICommitResponse> {
    try {
      if (!this.settings.apiKey) {
        // Return a mock response for demo purposes
        return this.generateMockCommitMessage(request)
      }

      const prompt = this.buildPrompt(request)
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.settings.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.settings.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert Git commit message generator. Generate conventional commit messages based on the code changes provided. Always follow the conventional commit format: type(scope): description'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.settings.temperature,
          max_tokens: this.settings.maxTokens
        })
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0].message.content
      
      // Calculate cost for this request
      const tokensUsed = data.usage?.total_tokens || 0
      const cost = calculateCost(this.settings.model, tokensUsed)
      
      console.log(`AI request completed - Model: ${this.settings.model}, Tokens: ${tokensUsed}, Cost: $${cost.toFixed(4)}`)
      
      return this.parseAIResponse(content, request)
    } catch (error) {
      console.error('Error generating commit message:', error)
      // Fallback to mock response
      return this.generateMockCommitMessage(request)
    }
  }

  private buildPrompt(request: AICommitRequest): string {
    const { files, diff, projectContext } = request
    
    let prompt = `Generate a conventional commit message for the following changes:\n\n`
    
    if (projectContext) {
      prompt += `Project Context: ${projectContext}\n\n`
    }
    
    prompt += `Files changed:\n`
    files.forEach(file => {
      prompt += `- ${file.path} (${file.status})\n`
    })
    
    prompt += `\nCode changes:\n\`\`\`\n${diff}\n\`\`\`\n\n`
    prompt += `Please provide a conventional commit message in this format:\n`
    prompt += `type(scope): description\n\n`
    prompt += `Where type is one of: feat, fix, docs, style, refactor, test, chore\n`
    prompt += `And include a brief explanation of why this change was made.`
    
    return prompt
  }

  private parseAIResponse(content: string, request: AICommitRequest): AICommitResponse {
    // Parse the AI response to extract commit message components
    // This is a simplified parser - in production you'd want more robust parsing
    
    const lines = content.split('\n')
    const firstLine = lines[0]
    
    // Extract type, scope, and description from first line
    const match = firstLine.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/)
    
    if (match) {
      const [, type, scope, description] = match
      
      const message: CommitMessage = {
        type: type as any,
        scope: scope || undefined,
        description: description.trim(),
        body: lines.slice(1).join('\n').trim() || undefined
      }
      
      return {
        message,
        explanation: `AI generated commit message for ${request.files.length} file(s) using ${this.settings.model}`,
        confidence: 0.85
      }
    }
    
    // Fallback to simple format
    const message: CommitMessage = {
      type: 'feat',
      description: content.trim(),
    }
    
    return {
      message,
      explanation: `AI generated commit message (parsed as feat) using ${this.settings.model}`,
      confidence: 0.7
    }
  }

  private generateMockCommitMessage(request: AICommitRequest): AICommitResponse {
    const { files } = request
    
    // Generate a mock conventional commit message based on file changes
    const hasNewFiles = files.some(f => f.status === 'added')
    const hasModifiedFiles = files.some(f => f.status === 'modified')
    const hasDeletedFiles = files.some(f => f.status === 'deleted')
    
    let type: CommitMessage['type'] = 'chore'
    let description = 'Update project files'
    
    if (hasNewFiles && hasModifiedFiles) {
      type = 'feat'
      description = 'Add new features and update existing code'
    } else if (hasNewFiles) {
      type = 'feat'
      description = 'Add new functionality'
    } else if (hasModifiedFiles) {
      type = 'fix'
      description = 'Fix issues and improve code'
    } else if (hasDeletedFiles) {
      type = 'refactor'
      description = 'Remove unused code and refactor'
    }
    
    const message: CommitMessage = {
      type,
      description,
      body: `Changes affect ${files.length} file(s):\n${files.map(f => `- ${f.path} (${f.status})`).join('\n')}`
    }
    
    return {
      message,
      explanation: 'Mock commit message generated based on file changes',
      confidence: 0.9
    }
  }

  // Update settings
  updateSettings(newSettings: Partial<AISettings>): void {
    this.settings = { ...this.settings, ...newSettings }
  }

  // Get current settings
  getSettings(): AISettings {
    return { ...this.settings }
  }

  // Get available models
  getAvailableModels() {
    return AI_MODELS
  }

  // Get current model info
  getCurrentModelInfo() {
    return AI_MODELS[this.settings.model]
  }

  // Estimate cost for a typical commit message
  estimateCost(): number {
    // Typical commit message generation uses about 150-200 tokens
    return calculateCost(this.settings.model, 200)
  }
}
