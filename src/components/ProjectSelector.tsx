import React, { useState, useEffect } from 'react'
import { FolderOpen, GitBranch, Clock, Plus, Search, Folder, FileCode, Database, Package } from 'lucide-react'
import { GitService } from '../services/gitService'
import DirectoryBrowser from './DirectoryBrowser'
import DirectoryPicker from './DirectoryPicker'
import NewRepositoryWizard from './NewRepositoryWizard'
import { getEnvironmentConfig } from '../config/environment'

interface ProjectInfo {
  path: string
  name: string
  branch: string
  lastUsed: number
  isGitRepo: boolean
  fileCount?: number
  language?: string
}

interface ProjectSelectorProps {
  onProjectSelect: (projectPath: string) => void
  currentProject?: string
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ onProjectSelect, currentProject }) => {
  const [recentProjects, setRecentProjects] = useState<ProjectInfo[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showDirectoryBrowser, setShowDirectoryBrowser] = useState(false)
  const [showDirectoryPicker, setShowDirectoryPicker] = useState(false)
  const [showNewRepositoryWizard, setShowNewRepositoryWizard] = useState(false)
  const [loading, setLoading] = useState(false)
  const environment = getEnvironmentConfig()

  useEffect(() => {
    loadRecentProjects()
  }, [])

  const loadRecentProjects = () => {
    try {
      const saved = localStorage.getItem('commitHelperRecentProjects')
      if (saved) {
        const projects = JSON.parse(saved)
        setRecentProjects(projects)
      }
    } catch (error) {
      console.error('Error loading recent projects:', error)
    }
  }

  const addProjectToRecent = (projectPath: string) => {
    try {
      const projectInfo: ProjectInfo = {
        path: projectPath,
        name: projectPath.split(/[/\\]/).pop() || 'Unknown Project',
        branch: 'main',
        lastUsed: Date.now(),
        isGitRepo: true
      }

      const updated = [projectInfo, ...recentProjects.filter(p => p.path !== projectPath)]
      const limited = updated.slice(0, 10) // Keep only 10 recent projects
      
      setRecentProjects(limited)
      localStorage.setItem('commitHelperRecentProjects', JSON.stringify(limited))
    } catch (error) {
      console.error('Error adding project to recent:', error)
    }
  }

  const handleProjectSelect = async (projectPath: string) => {
    setLoading(true)
    try {
      // Validate that it's a Git repository
      const gitService = new GitService(projectPath)
      const status = await gitService.getStatus()
      
      if (status) {
        addProjectToRecent(projectPath)
        onProjectSelect(projectPath)
      }
    } catch (error) {
      console.error('Error validating Git repository:', error)
      alert('This directory is not a valid Git repository. Please select a directory with a .git folder.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDirectoryBrowser = () => {
    setShowDirectoryBrowser(true)
  }

  const handleDirectorySelect = (projectPath: string) => {
    setShowDirectoryBrowser(false)
    handleProjectSelect(projectPath)
  }

  const handleOpenDirectoryPicker = () => {
    setShowDirectoryPicker(true)
  }

  const handleDirectoryPickerSelect = (projectPath: string) => {
    setShowDirectoryPicker(false)
    // For now, we'll use the path string, but in the future we could use the handle
    handleProjectSelect(projectPath)
  }

  const handleOpenNewRepositoryWizard = () => {
    setShowNewRepositoryWizard(true)
  }

  const handleRepositoryCreated = (repoPath: string) => {
    setShowNewRepositoryWizard(false)
    // Add to recent projects and open it
    addProjectToRecent(repoPath)
    onProjectSelect(repoPath)
  }

  const filteredProjects = recentProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.path.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getProjectIcon = (project: ProjectInfo) => {
    const name = project.name.toLowerCase()
    
    if (name.includes('react') || name.includes('vue') || name.includes('angular')) {
      return <FileCode className="h-8 w-8 text-blue-600" />
    } else if (name.includes('node') || name.includes('express')) {
      return <Package className="h-8 w-8 text-green-600" />
    } else if (name.includes('database') || name.includes('db')) {
      return <Database className="h-8 w-8 text-purple-600" />
    } else {
      return <Folder className="h-8 w-8 text-gray-600" />
    }
  }

  const formatLastUsed = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  const getDirectorySelectionMethod = () => {
    if (environment.platform === 'node') {
      return 'DirectoryBrowser'
    } else if (environment.platform === 'browser' && 'showDirectoryPicker' in window) {
      return 'DirectoryPicker'
    } else {
      return 'DirectoryBrowser' // Fallback to browser with mock data
    }
  }

  const handleOpenProject = () => {
    const method = getDirectorySelectionMethod()
    
    if (method === 'DirectoryPicker') {
      handleOpenDirectoryPicker()
    } else {
      handleOpenDirectoryBrowser()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white rounded-full shadow-lg">
              <GitBranch className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Commit Helper
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecciona tu proyecto Git para comenzar a generar commits inteligentes con IA
          </p>
        </div>

        {/* Environment Info */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">
                Modo: {environment.platform === 'node' ? 'Desktop (Acceso Completo)' : 'Navegador (Demo)'}
              </span>
            </div>
            <span className="text-xs text-blue-600">
              {environment.platform === 'node' 
                ? 'Acceso completo al sistema de archivos' 
                : 'Usando datos de demostración'
              }
            </span>
          </div>
        </div>

        {/* Search and Add Project */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar proyectos recientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={handleOpenProject}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              {loading ? 'Validando...' : 'Abrir Proyecto'}
            </button>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Clock className="h-6 w-6 mr-2 text-gray-600" />
            Proyectos Recientes
          </h2>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay proyectos recientes
              </h3>
              <p className="text-gray-500 mb-6">
                Selecciona tu primer proyecto Git para comenzar
              </p>
              <button
                onClick={handleOpenProject}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Seleccionar Proyecto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.path}
                  onClick={() => handleProjectSelect(project.path)}
                  className={`group cursor-pointer p-4 border-2 rounded-lg transition-all duration-200 hover:shadow-md ${
                    currentProject === project.path
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getProjectIcon(project)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {project.path}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <GitBranch className="h-3 w-3 mr-1" />
                          {project.branch}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatLastUsed(project.lastUsed)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {currentProject === project.path && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Proyecto Actual
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <GitBranch className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Repositorio Existente
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Selecciona un proyecto Git existente para comenzar
            </p>
            <button
              onClick={handleOpenProject}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Seleccionar →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nuevo Repositorio
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Inicializa un nuevo repositorio Git en tu proyecto
            </p>
            <button 
              onClick={handleOpenNewRepositoryWizard}
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              Crear →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileCode className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Clonar Repositorio
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Clona un repositorio remoto desde GitHub, GitLab, etc.
            </p>
            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              Clonar →
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Commit Helper - Genera commits inteligentes con IA
          </p>
        </div>
      </div>

      {/* Directory Browser Modal */}
      {showDirectoryBrowser && (
        <DirectoryBrowser
          onDirectorySelect={handleDirectorySelect}
          onCancel={() => setShowDirectoryBrowser(false)}
          initialPath=""
        />
      )}

      {/* Directory Picker Modal */}
      {showDirectoryPicker && (
        <DirectoryPicker
          onDirectorySelect={handleDirectoryPickerSelect}
          onCancel={() => setShowDirectoryPicker(false)}
        />
      )}

      {/* New Repository Wizard Modal */}
      {showNewRepositoryWizard && (
        <NewRepositoryWizard
          onRepositoryCreated={handleRepositoryCreated}
          onCancel={() => setShowNewRepositoryWizard(false)}
        />
      )}
    </div>
  )
}

export default ProjectSelector
