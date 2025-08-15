import { GitStatus } from '../types'

// Type definitions for Electron API
declare global {
  interface Window {
    electronAPI?: {
      git: {
        getStatus: (projectPath: string) => Promise<GitStatus>
        addFile: (projectPath: string, filePath: string) => Promise<{ success: boolean }>
        removeFromStaging: (projectPath: string, filePath: string) => Promise<{ success: boolean }>
        getDiff: (projectPath: string, filePath: string, staged?: boolean) => Promise<string>
        getStagedDiff: (projectPath: string) => Promise<string>
        commit: (projectPath: string, message: string, body?: string) => Promise<{ success: boolean }>
        initRepository: (projectPath: string, repoInfo: any) => Promise<{ success: boolean }>
        pushToGitHub: (projectPath: string, remoteUrl: string, token: string) => Promise<{ success: boolean }>
      }
      fs: {
        readDirectory: (dirPath: string) => Promise<any[]>
        isGitRepository: (dirPath: string) => Promise<boolean>
        getHomeDirectory: () => Promise<string>
        getCurrentDirectory: () => Promise<string>
      }
      isElectron: boolean
      platform: string
    }
    __COMMIT_HELPER_ENV__?: {
      isElectron: boolean
      platform: string
      nodeVersion: string
      electronVersion: string
    }
  }
}

export class ElectronGitService {
  private projectPath: string
  private isElectron: boolean

  constructor(projectPath?: string) {
    this.projectPath = projectPath || ''
    this.isElectron = !!(window.electronAPI?.isElectron)
    
    console.log('ElectronGitService initialized:', {
      isElectron: this.isElectron,
      projectPath: this.projectPath,
      platform: window.electronAPI?.platform
    })
  }

  async getStatus(): Promise<GitStatus> {
    if (!this.isElectron) {
      throw new Error('ElectronGitService requires Electron environment')
    }

    if (!this.projectPath) {
      throw new Error('Project path not set')
    }

    try {
      const status = await window.electronAPI!.git.getStatus(this.projectPath)
      return status
    } catch (error) {
      console.error('Error getting git status via Electron:', error)
      throw error
    }
  }

  async addFile(filePath: string): Promise<void> {
    if (!this.isElectron) {
      throw new Error('ElectronGitService requires Electron environment')
    }

    if (!this.projectPath) {
      throw new Error('Project path not set')
    }

    try {
      const result = await window.electronAPI!.git.addFile(this.projectPath, filePath)
      if (!result.success) {
        throw new Error('Failed to add file to staging')
      }
    } catch (error) {
      console.error('Error adding file via Electron:', error)
      throw error
    }
  }

  async removeFromStaging(filePath: string): Promise<void> {
    if (!this.isElectron) {
      throw new Error('ElectronGitService requires Electron environment')
    }

    if (!this.projectPath) {
      throw new Error('Project path not set')
    }

    try {
      const result = await window.electronAPI!.git.removeFromStaging(this.projectPath, filePath)
      if (!result.success) {
        throw new Error('Failed to remove file from staging')
      }
    } catch (error) {
      console.error('Error removing from staging via Electron:', error)
      throw error
    }
  }

  async getDiff(filePath: string): Promise<string> {
    if (!this.isElectron) {
      throw new Error('ElectronGitService requires Electron environment')
    }

    if (!this.projectPath) {
      throw new Error('Project path not set')
    }

    try {
      return await window.electronAPI!.git.getDiff(this.projectPath, filePath, false)
    } catch (error) {
      console.error('Error getting diff via Electron:', error)
      return 'Error getting diff'
    }
  }

  async commit(message: string, body?: string): Promise<void> {
    if (!this.isElectron) {
      throw new Error('ElectronGitService requires Electron environment')
    }

    if (!this.projectPath) {
      throw new Error('Project path not set')
    }

    try {
      const result = await window.electronAPI!.git.commit(this.projectPath, message, body)
      if (!result.success) {
        throw new Error('Failed to commit changes')
      }
    } catch (error) {
      console.error('Error committing via Electron:', error)
      throw error
    }
  }

  async getStagedDiff(): Promise<string> {
    if (!this.isElectron) {
      throw new Error('ElectronGitService requires Electron environment')
    }

    if (!this.projectPath) {
      throw new Error('Project path not set')
    }

    try {
      return await window.electronAPI!.git.getStagedDiff(this.projectPath)
    } catch (error) {
      console.error('Error getting staged diff via Electron:', error)
      return 'Error getting staged diff'
    }
  }

  async initializeRepository(projectPath: string, repoInfo: any): Promise<boolean> {
    if (!this.isElectron) {
      throw new Error('ElectronGitService requires Electron environment')
    }

    try {
      const result = await window.electronAPI!.git.initRepository(projectPath, repoInfo)
      return result.success
    } catch (error) {
      console.error('Error initializing repository via Electron:', error)
      throw error
    }
  }

  async pushToGitHub(projectPath: string, remoteUrl: string, token: string): Promise<boolean> {
    if (!this.isElectron) {
      throw new Error('ElectronGitService requires Electron environment')
    }

    try {
      const result = await window.electronAPI!.git.pushToGitHub(projectPath, remoteUrl, token)
      return result.success
    } catch (error) {
      console.error('Error pushing to GitHub via Electron:', error)
      throw error
    }
  }

  // File system operations
  async readDirectory(dirPath: string): Promise<any[]> {
    if (!this.isElectron) {
      throw new Error('ElectronGitService requires Electron environment')
    }

    try {
      return await window.electronAPI!.fs.readDirectory(dirPath)
    } catch (error) {
      console.error('Error reading directory via Electron:', error)
      throw error
    }
  }

  async isGitRepository(dirPath: string): Promise<boolean> {
    if (!this.isElectron) {
      throw new Error('ElectronGitService requires Electron environment')
    }

    try {
      return await window.electronAPI!.fs.isGitRepository(dirPath)
    } catch (error) {
      console.error('Error checking git repository via Electron:', error)
      return false
    }
  }

  async getHomeDirectory(): Promise<string> {
    if (!this.isElectron) {
      throw new Error('ElectronGitService requires Electron environment')
    }

    try {
      return await window.electronAPI!.fs.getHomeDirectory()
    } catch (error) {
      console.error('Error getting home directory via Electron:', error)
      throw error
    }
  }

  async getCurrentDirectory(): Promise<string> {
    if (!this.isElectron) {
      throw new Error('ElectronGitService requires Electron environment')
    }

    try {
      return await window.electronAPI!.fs.getCurrentDirectory()
    } catch (error) {
      console.error('Error getting current directory via Electron:', error)
      throw error
    }
  }

  // Utility methods
  setProjectPath(path: string): void {
    this.projectPath = path
  }

  getProjectPath(): string {
    return this.projectPath
  }

  getEnvironment() {
    return {
      platform: 'electron',
      canAccessFileSystem: this.isElectron,
      canExecuteGitCommands: this.isElectron,
      storage: 'fileSystem',
      gitIntegration: this.isElectron ? 'native' : 'mock',
      isElectron: this.isElectron,
      platformInfo: window.electronAPI?.platform || 'unknown'
    }
  }

  // Check if Electron is available
  static isAvailable(): boolean {
    return !!(window.electronAPI?.isElectron)
  }
}
