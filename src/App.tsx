import { useState, useEffect } from 'react'
import CommitHelper from './components/CommitHelper'
import ProjectSelector from './components/ProjectSelector'
import DirectoryBrowser from './components/DirectoryBrowser'
import { GitService } from './services/gitService'

function App() {
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [showDirectoryBrowser, setShowDirectoryBrowser] = useState(false)
  const [, setGitService] = useState<GitService | null>(null)

  useEffect(() => {
    // Load last used project from localStorage
    const lastProject = localStorage.getItem('commitHelperLastProject')
    if (lastProject) {
      setSelectedProject(lastProject)
      initializeGitService(lastProject)
    }
  }, [])

  const initializeGitService = (projectPath: string) => {
    try {
      const service = new GitService(projectPath)
      setGitService(service)
    } catch (error) {
      console.error('Error initializing Git service:', error)
    }
  }

  const handleProjectSelect = (projectPath: string) => {
    setSelectedProject(projectPath)
    localStorage.setItem('commitHelperLastProject', projectPath)
    initializeGitService(projectPath)
  }

  const handleOpenDirectoryBrowser = () => {
    setShowDirectoryBrowser(true)
  }

  const handleDirectorySelect = (projectPath: string) => {
    setShowDirectoryBrowser(false)
    handleProjectSelect(projectPath)
  }

  const handleBackToProjectSelector = () => {
    setSelectedProject('')
    setGitService(null)
    localStorage.removeItem('commitHelperLastProject')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!selectedProject ? (
        // Show Project Selector
        <ProjectSelector 
          onProjectSelect={handleProjectSelect}
          currentProject={selectedProject}
        />
      ) : (
        // Show Commit Helper with Project Info
        <div>
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Commit Helper
                    </h1>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      AI Powered
                    </span>
                  </div>
                  
                  {/* Project Info */}
                  <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {selectedProject.split(/[/\\]/).pop()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {selectedProject}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleOpenDirectoryBrowser}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cambiar Proyecto
                  </button>
                  <button
                    onClick={handleBackToProjectSelector}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Seleccionar Otro
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <CommitHelper />
          </main>
        </div>
      )}

      {/* Directory Browser Modal */}
      {showDirectoryBrowser && (
        <DirectoryBrowser
          onDirectorySelect={handleDirectorySelect}
          onCancel={() => setShowDirectoryBrowser(false)}
          initialPath={selectedProject}
        />
      )}
    </div>
  )
}

export default App
