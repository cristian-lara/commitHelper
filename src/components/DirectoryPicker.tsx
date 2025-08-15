import React, { useState } from 'react'
import { FolderOpen, Upload, AlertCircle, CheckCircle, X } from 'lucide-react'

interface DirectoryPickerProps {
  onDirectorySelect: (path: string, handle?: any) => void
  onCancel: () => void
}

const DirectoryPicker: React.FC<DirectoryPickerProps> = ({ onDirectorySelect, onCancel }) => {
  const [selectedDirectory, setSelectedDirectory] = useState<any>(null)
  const [directoryName, setDirectoryName] = useState<string>('')
  const [isGitRepo, setIsGitRepo] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [isFileSystemAccessSupported] = useState(() => 'showDirectoryPicker' in window)

  const handleSelectDirectory = async () => {
    if (!isFileSystemAccessSupported) {
      setError('File System Access API no está disponible en este navegador. Usa Chrome, Edge o un navegador moderno.')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      // Use the native directory picker
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'read'
      })
      
      setSelectedDirectory(dirHandle)
      setDirectoryName(dirHandle.name)
      
      // Check if it's a Git repository
      try {
        // const _gitHandle = await dirHandle.getDirectoryHandle('.git', { create: false })
        setIsGitRepo(true)
      } catch (error) {
        setIsGitRepo(false)
      }
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User cancelled the picker
        return
      }
      console.error('Error selecting directory:', error)
      setError('Error al seleccionar el directorio. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmSelection = () => {
    if (selectedDirectory) {
      // Pass both the path-like string and the actual handle
      const path = `/${directoryName}`
      onDirectorySelect(path, selectedDirectory)
    }
  }

  const handleCancel = () => {
    setSelectedDirectory(null)
    setDirectoryName('')
    setIsGitRepo(false)
    setError('')
    onCancel()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-[500px] shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Seleccionar Directorio del Proyecto
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* File System Access API Support Check */}
          {!isFileSystemAccessSupported && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    Navegador No Compatible
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    Tu navegador no soporta la API de acceso al sistema de archivos. 
                    Usa Chrome, Edge o un navegador moderno para esta funcionalidad.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Directory Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecciona el directorio de tu proyecto:
            </label>
            
            <button
              onClick={handleSelectDirectory}
              disabled={loading || !isFileSystemAccessSupported}
              className="w-full inline-flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
              ) : (
                <FolderOpen className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Seleccionando...' : 'Seleccionar Directorio'}
            </button>
          </div>

          {/* Selected Directory Info */}
          {selectedDirectory && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-green-800">
                    Directorio Seleccionado
                  </h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Nombre:</span>
                      <span className="text-sm text-gray-900">{directoryName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Tipo:</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isGitRepo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {isGitRepo ? 'Repositorio Git' : 'Directorio Regular'}
                      </span>
                    </div>
                    
                    {!isGitRepo && (
                      <div className="text-xs text-yellow-600">
                        Este directorio no parece ser un repositorio Git. 
                        Puedes inicializarlo como uno nuevo.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    Error
                  </h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Upload className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">
                  Cómo Funciona
                </h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Haz clic en "Seleccionar Directorio"</li>
                  <li>• Navega por tu sistema de archivos</li>
                  <li>• Selecciona la carpeta de tu proyecto</li>
                  <li>• La aplicación verificará si es un repositorio Git</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleConfirmSelection}
              disabled={!selectedDirectory}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Selección
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DirectoryPicker
