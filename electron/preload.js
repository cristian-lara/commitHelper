const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Git operations
  git: {
    getStatus: (projectPath) => ipcRenderer.invoke('git:get-status', projectPath),
    addFile: (projectPath, filePath) => ipcRenderer.invoke('git:add-file', { projectPath, filePath }),
    removeFromStaging: (projectPath, filePath) => ipcRenderer.invoke('git:remove-from-staging', { projectPath, filePath }),
    getDiff: (projectPath, filePath, staged) => ipcRenderer.invoke('git:get-diff', { projectPath, filePath, staged }),
    getStagedDiff: (projectPath) => ipcRenderer.invoke('git:get-staged-diff', { projectPath }),
    commit: (projectPath, message, body) => ipcRenderer.invoke('git:commit', { projectPath, message, body }),
    initRepository: (projectPath, repoInfo) => ipcRenderer.invoke('git:init-repository', { projectPath, repoInfo }),
    pushToGitHub: (projectPath, remoteUrl, token) => ipcRenderer.invoke('git:push-to-github', { projectPath, remoteUrl, token })
  },
  
  // File system operations
  fs: {
    readDirectory: (dirPath) => ipcRenderer.invoke('fs:read-directory', dirPath),
    isGitRepository: (dirPath) => ipcRenderer.invoke('fs:is-git-repository', dirPath),
    getHomeDirectory: () => ipcRenderer.invoke('fs:get-home-directory'),
    getCurrentDirectory: () => ipcRenderer.invoke('fs:get-current-directory')
  },
  
  // Environment detection
  isElectron: true,
  platform: process.platform
})

// Expose environment info for debugging
contextBridge.exposeInMainWorld('__COMMIT_HELPER_ENV__', {
  isElectron: true,
  platform: process.platform,
  nodeVersion: process.versions.node,
  electronVersion: process.versions.electron
})
