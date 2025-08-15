import React, { useState, useEffect } from 'react'
import { Folder, FolderOpen, File, ArrowLeft, Home, Search, CheckCircle, GitBranch, RefreshCw } from 'lucide-react'
import { fileSystemService, FileSystemItem } from '../services/fileSystemService'
import { getEnvironmentConfig } from '../config/environment'

interface DirectoryBrowserProps {
  onDirectorySelect: (path: string) => void
  onCancel: () => void
  initialPath?: string
}

const DirectoryBrowser: React.FC<DirectoryBrowserProps> = ({ 
  onDirectorySelect, 
  onCancel, 
  initialPath = '' 
}) => {
  const [currentPath, setCurrentPath] = useState(initialPath)
  const [items, setItems] = useState<FileSystemItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const environment = getEnvironmentConfig()

  useEffect(() => {
    if (currentPath) {
      loadDirectory(currentPath)
      updateBreadcrumbs(currentPath)
    } else {
      // Start from home directory or current directory
      const startPath = environment.platform === 'node' 
        ? fileSystemService.getCurrentDirectory()
        : fileSystemService.getHomeDirectory()
      setCurrentPath(startPath)
    }
  }, [])

  const loadDirectory = async (path: string) => {
    setLoading(true)
    setError('')
    
    try {
      const directoryItems = await fileSystemService.readDirectory(path)
      setItems(directoryItems)
    } catch (error) {
      console.error('Error loading directory:', error)
      setError('Error loading directory contents. Please try again.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const updateBreadcrumbs = (path: string) => {
    const parts = path.split(/[/\\]/).filter(Boolean)
    setBreadcrumbs(parts)
  }

  const navigateToDirectory = (path: string) => {
    setCurrentPath(path)
  }

  const navigateToParent = () => {
    const parentPath = currentPath.split(/[/\\]/).slice(0, -1).join('/')
    if (parentPath) {
      setCurrentPath(parentPath)
    }
  }

  const navigateToHome = () => {
    const homePath = fileSystemService.getHomeDirectory()
    setCurrentPath(homePath)
  }

  const handleItemClick = (item: FileSystemItem) => {
    if (item.type === 'directory') {
      if (item.isGitRepo) {
        onDirectorySelect(item.path)
      } else {
        navigateToDirectory(item.path)
      }
    }
  }

  const handleRefresh = () => {
    loadDirectory(currentPath)
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getItemIcon = (item: FileSystemItem) => {
    if (item.type === 'file') {
      return <File className="h-5 w-5 text-gray-500" />
    }
    
    if (item.isGitRepo) {
      return <GitBranch className="h-5 w-5 text-green-600" />
    }
    
    return item.name === currentPath.split(/[/\\]/).pop() 
      ? <FolderOpen className="h-5 w-5 text-blue-600" />
      : <Folder className="h-5 w-5 text-blue-500" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Seleccionar Proyecto Git
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Environment Info */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">
                  Modo: {environment.platform === 'node' ? 'Desktop (Acceso Completo)' : 'Navegador (Demo)'}
                </span>
              </div>
              {environment.platform === 'browser' && (
                <span className="text-xs text-blue-600">
                  Usando datos de demostración
                </span>
              )}
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <button
              onClick={navigateToHome}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Home Directory"
            >
              <Home className="h-4 w-4 text-gray-600" />
            </button>
            
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <span className="text-gray-400">/</span>
                <button
                  onClick={() => {
                    const path = breadcrumbs.slice(0, index + 1).join('/')
                    navigateToDirectory('/' + path)
                  }}
                  className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                >
                  {crumb}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={navigateToParent}
              disabled={breadcrumbs.length === 0}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Up
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar archivos y carpetas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Current Path Display */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Folder className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Ruta actual: {currentPath || '/'}
              </span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-red-600 rounded-full"></div>
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Directory Contents */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchTerm ? 'No se encontraron resultados' : 'Esta carpeta está vacía'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleItemClick(item)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      item.isGitRepo ? 'bg-green-50 hover:bg-green-100' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getItemIcon(item)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h4>
                          {item.isGitRepo && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <GitBranch className="h-3 w-3 mr-1" />
                              Git Repo
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>{item.type === 'directory' ? 'Folder' : 'File'}</span>
                          {item.size && <span>{formatFileSize(item.size)}</span>}
                          {item.modified && <span>{formatDate(item.modified)}</span>}
                        </div>
                      </div>
                      
                      {item.isGitRepo && (
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <GitBranch className="h-5 w-5 text-yellow-600 mt-0.5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Instrucciones
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Navega por las carpetas y haz clic en un repositorio Git (marcado con el ícono de rama) 
                  para seleccionarlo. Los repositorios Git válidos se muestran en verde.
                </p>
                {environment.platform === 'browser' && (
                  <p className="text-sm text-yellow-600 mt-2">
                    <strong>Nota:</strong> En el navegador, se muestran datos de demostración. 
                    Para acceso completo al sistema de archivos, ejecuta la aplicación en modo desktop.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DirectoryBrowser
