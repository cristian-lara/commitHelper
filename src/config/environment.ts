// Environment configuration for Commit Helper
export const isBrowser = typeof window !== 'undefined'
export const isNode = typeof process !== 'undefined' && process.versions && process.versions.node

// Get current working directory based on environment
export const getCurrentWorkingDirectory = (): string => {
  if (isNode) {
    // Node.js environment
    return process.cwd()
  } else if (isBrowser) {
    // Browser environment
    return localStorage.getItem('gitProjectPath') || window.location.pathname || ''
  }
  return ''
}

// Get environment-specific configuration
export const getEnvironmentConfig = () => {
  if (isBrowser) {
    return {
      platform: 'browser',
      canAccessFileSystem: false,
      canExecuteGitCommands: false,
      storage: 'localStorage',
      gitIntegration: 'mock', // Use mock data in browser for demo
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD
    }
  } else if (isNode) {
    return {
      platform: 'node',
      canAccessFileSystem: true,
      canExecuteGitCommands: true,
      storage: 'fileSystem',
      gitIntegration: 'native', // Use actual git commands
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production'
    }
  }
  
  return {
    platform: 'unknown',
    canAccessFileSystem: false,
    canExecuteGitCommands: false,
    storage: 'none',
    gitIntegration: 'mock',
    isDevelopment: false,
    isProduction: false
  }
}

// Check if we're in development mode
export const isDevelopment = import.meta.env.DEV || 
  (isBrowser && window.location.hostname === 'localhost')

// Check if we're in production mode
export const isProduction = import.meta.env.PROD || 
  (isBrowser && window.location.hostname !== 'localhost')

