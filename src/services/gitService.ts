import { GitStatus } from '../types'
import { getCurrentWorkingDirectory, getEnvironmentConfig } from '../config/environment'
import { ElectronGitService } from './electronGitService'

export class GitService {
  private projectPath: string
  private environment: ReturnType<typeof getEnvironmentConfig>
  private electronService: ElectronGitService | null = null

  constructor(projectPath?: string) {
    this.environment = getEnvironmentConfig()
    this.projectPath = projectPath || getCurrentWorkingDirectory()
    
    // Check if Electron is available and create service
    if (ElectronGitService.isAvailable()) {
      this.electronService = new ElectronGitService(this.projectPath)
      console.log('ElectronGitService available, using native Git integration')
    }
    
    console.log('GitService initialized with environment:', this.environment)
  }

  async getStatus(): Promise<GitStatus> {
    try {
      // Use Electron service if available (native Git)
      if (this.electronService) {
        return await this.electronService.getStatus()
      }
      
      // Fallback to mock data for browser demo
      if (this.environment.gitIntegration === 'mock') {
        return this.getMockStatus()
      } else {
        // In Node.js environment, this would execute actual git commands
        // For now, return mock data
        return this.getMockStatus()
      }
    } catch (error) {
      console.error('Error getting git status:', error)
      throw error
    }
  }

  private getMockStatus(): GitStatus {
    return {
      workingDirectory: [
        {
          path: 'src/components/Button.tsx',
          status: 'modified',
          staged: false,
          diff: '+ export const Button = () => { ... }'
        },
        {
          path: 'src/utils/helpers.ts',
          status: 'added',
          staged: false
        },
        {
          path: 'src/types/index.ts',
          status: 'modified',
          staged: false,
          diff: '+ interface GitFile { ... }'
        }
      ],
      stagingArea: [
        {
          path: 'src/components/Header.tsx',
          status: 'modified',
          staged: true,
          diff: '+ const Header = () => { ... }'
        }
      ],
      branch: 'main',
      ahead: 0,
      behind: 0
    }
  }

  async addFile(filePath: string): Promise<void> {
    try {
      // Use Electron service if available (native Git)
      if (this.electronService) {
        await this.electronService.addFile(filePath)
        return
      }
      
      if (this.environment.gitIntegration === 'mock') {
        console.log(`[MOCK] Adding file to staging: ${filePath}`)
        // In a real implementation, this would update the mock data
        // For now, just log the action
      } else {
        // This would execute: git add <filePath>
        console.log(`Adding file to staging: ${filePath}`)
      }
    } catch (error) {
      console.error('Error adding file:', error)
      throw error
    }
  }

  async removeFromStaging(filePath: string): Promise<void> {
    try {
      // Use Electron service if available (native Git)
      if (this.electronService) {
        await this.electronService.removeFromStaging(filePath)
        return
      }
      
      if (this.environment.gitIntegration === 'mock') {
        console.log(`[MOCK] Removing file from staging: ${filePath}`)
        // In a real implementation, this would update the mock data
        // For now, just log the action
      } else {
        // This would execute: git reset HEAD <filePath>
        console.log(`Removing file from staging: ${filePath}`)
      }
    } catch (error) {
      console.error('Error removing file from staging:', error)
      throw error
    }
  }

  async getDiff(filePath: string): Promise<string> {
    try {
      // Use Electron service if available (native Git)
      if (this.electronService) {
        return await this.electronService.getDiff(filePath)
      }
      
      if (this.environment.gitIntegration === 'mock') {
        // Return mock diff for demo purposes
        return `+ // Sample diff for ${filePath}\n+ export const newFunction = () => {\n+   return 'Hello World'\n+ }`
      } else {
        // This would execute: git diff <filePath> or git diff --cached <filePath>
        return `+ // Sample diff for ${filePath}\n+ export const newFunction = () => {\n+   return 'Hello World'\n+ }`
      }
    } catch (error) {
      console.error('Error getting diff:', error)
      return ''
    }
  }

  async commit(message: string): Promise<void> {
    try {
      // Use Electron service if available (native Git)
      if (this.electronService) {
        await this.electronService.commit(message)
        return
      }
      
      if (this.environment.gitIntegration === 'mock') {
        console.log(`[MOCK] Committing with message: ${message}`)
        // In a real implementation, this would update the mock data
        // For now, just log the action
      } else {
        // This would execute: git commit -m "<message>"
        console.log(`Committing message: ${message}`)
      }
    } catch (error) {
      console.error('Error committing:', error)
      throw error
    }
  }

  async getStagedDiff(): Promise<string> {
    try {
      // Use Electron service if available (native Git)
      if (this.electronService) {
        return await this.electronService.getStagedDiff()
      }
      
      if (this.environment.gitIntegration === 'mock') {
        // Return mock staged diff for demo purposes
        return `+ // Staged changes diff\n+ export const stagedFunction = () => {\n+   return 'Staged'\n+ }`
      } else {
        // This would execute: git diff --cached
        return `+ // Staged changes diff\n+ export const stagedFunction = () => {\n+   return 'Staged'\n+ }`
      }
    } catch (error) {
      console.error('Error getting staged diff:', error)
      return ''
    }
  }

  // Method to set project path (useful for browser environment)
  setProjectPath(path: string): void {
    this.projectPath = path
    
    // Update Electron service if available
    if (this.electronService) {
      this.electronService.setProjectPath(path)
    }
    
    if (this.environment.storage === 'localStorage') {
      localStorage.setItem('gitProjectPath', path)
    }
  }

  // Method to get current project path
  getProjectPath(): string {
    return this.projectPath
  }

  // Get environment information
  getEnvironment() {
    return this.environment
  }
}
