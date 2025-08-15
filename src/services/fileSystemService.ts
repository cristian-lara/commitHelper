import { getEnvironmentConfig } from '../config/environment'

export interface FileSystemItem {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modified?: Date
  isGitRepo?: boolean
}

export interface FileSystemService {
  readDirectory(path: string): Promise<FileSystemItem[]>
  isGitRepository(path: string): Promise<boolean>
  getHomeDirectory(): string
  getCurrentDirectory(): string
  pathExists(path: string): Promise<boolean>
  getFileStats(path: string): Promise<{ size: number; modified: Date } | null>
}

class NodeFileSystemService implements FileSystemService {
  async readDirectory(path: string): Promise<FileSystemItem[]> {
    try {
      // In a real Node.js implementation, this would use fs.readdir
      const fs = await import('fs/promises')
      const pathModule = await import('path')
      
      const entries = await fs.readdir(path, { withFileTypes: true })
      const items: FileSystemItem[] = []
      
      for (const entry of entries) {
        const fullPath = pathModule.join(path, entry.name)
        const stats = await fs.stat(fullPath)
        
        const item: FileSystemItem = {
          name: entry.name,
          path: fullPath,
          type: entry.isDirectory() ? 'directory' : 'file',
          size: entry.isFile() ? stats.size : undefined,
          modified: stats.mtime,
          isGitRepo: entry.isDirectory() ? await this.isGitRepository(fullPath) : false
        }
        
        items.push(item)
      }
      
      // Sort: directories first, then files, both alphabetically
      return items.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1
        }
        return a.name.localeCompare(b.name)
      })
    } catch (error) {
      console.error('Error reading directory:', error)
      return []
    }
  }

  async isGitRepository(path: string): Promise<boolean> {
    try {
      const fs = await import('fs/promises')
      const pathModule = await import('path')
      const gitPath = pathModule.join(path, '.git')
      
      const stats = await fs.stat(gitPath)
      return stats.isDirectory()
    } catch (error) {
      return false
    }
  }

  getHomeDirectory(): string {
    const os = require('os')
    return os.homedir()
  }

  getCurrentDirectory(): string {
    return process.cwd()
  }

  async pathExists(path: string): Promise<boolean> {
    try {
      const fs = await import('fs/promises')
      await fs.access(path)
      return true
    } catch (error) {
      return false
    }
  }

  async getFileStats(path: string): Promise<{ size: number; modified: Date } | null> {
    try {
      const fs = await import('fs/promises')
      const stats = await fs.stat(path)
      return {
        size: stats.size,
        modified: stats.mtime
      }
    } catch (error) {
      return null
    }
  }
}

class BrowserFileSystemService implements FileSystemService {
  async readDirectory(path: string): Promise<FileSystemItem[]> {
    // In browser, we can't read arbitrary directories
    // But we can use the File System Access API if available
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker()
        return await this.readDirectoryHandle(dirHandle, path)
      } catch (error) {
        console.log('Directory picker cancelled or not supported')
      }
    }
    
    // Fallback to mock data for demo purposes
    return this.getMockDirectoryContents(path)
  }

  private async readDirectoryHandle(dirHandle: any, basePath: string): Promise<FileSystemItem[]> {
    const items: FileSystemItem[] = []
    
    for await (const [name, handle] of dirHandle.entries()) {
      const fullPath = `${basePath}/${name}`
      
      if (handle.kind === 'directory') {
        const isGitRepo = await this.isGitRepository(handle)
        items.push({
          name,
          path: fullPath,
          type: 'directory',
          isGitRepo
        })
      } else {
        const file = await handle.getFile()
        items.push({
          name,
          path: fullPath,
          type: 'file',
          size: file.size,
          modified: new Date(file.lastModified)
        })
      }
    }
    
    return items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
  }

  async isGitRepository(_dirHandle: any): Promise<boolean> {
    try {
      // const _gitHandle = await _dirHandle.getDirectoryHandle('.git', { create: false })
      return true
    } catch (error) {
      return false
    }
  }

  getHomeDirectory(): string {
    // In browser, we can't access the actual home directory
    return '/home/user'
  }

  getCurrentDirectory(): string {
    // In browser, we can't access the actual current directory
    return '/current/directory'
  }

  async pathExists(_path: string): Promise<boolean> {
    // In browser, we can't check arbitrary paths
    return false
  }

  async getFileStats(_path: string): Promise<{ size: number; modified: Date } | null> {
    // In browser, we can't get stats for arbitrary paths
    return null
  }

  private getMockDirectoryContents(path: string): FileSystemItem[] {
    // Mock data for demo purposes in browser
    const mockItems: FileSystemItem[] = [
      {
        name: 'commitHelper',
        path: `${path}/commitHelper`,
        type: 'directory',
        isGitRepo: true,
        modified: new Date()
      },
      {
        name: 'my-project',
        path: `${path}/my-project`,
        type: 'directory',
        isGitRepo: true,
        modified: new Date(Date.now() - 86400000)
      },
      {
        name: 'website',
        path: `${path}/website`,
        type: 'directory',
        isGitRepo: false,
        modified: new Date(Date.now() - 172800000)
      },
      {
        name: 'README.md',
        path: `${path}/README.md`,
        type: 'file',
        size: 2150,
        modified: new Date()
      },
      {
        name: 'package.json',
        path: `${path}/package.json`,
        type: 'file',
        size: 1250,
        modified: new Date(Date.now() - 3600000)
      }
    ]
    
    return mockItems
  }
}

// Factory function to create the appropriate service
export function createFileSystemService(): FileSystemService {
  const environment = getEnvironmentConfig()
  
  if (environment.platform === 'node') {
    return new NodeFileSystemService()
  } else {
    return new BrowserFileSystemService()
  }
}

// Export the service instance
export const fileSystemService = createFileSystemService()
