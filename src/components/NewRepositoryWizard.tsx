import React, { useState } from 'react'
import { Plus, GitBranch, ExternalLink, FolderOpen, CheckCircle, AlertCircle, X, Copy } from 'lucide-react'
import { gitAdvancedService, GitRepositoryInfo, GitHubRepository } from '../services/gitAdvancedService'
import { getEnvironmentConfig } from '../config/environment'

interface NewRepositoryWizardProps {
  onRepositoryCreated: (repoPath: string) => void
  onCancel: () => void
}

const NewRepositoryWizard: React.FC<NewRepositoryWizardProps> = ({ onRepositoryCreated, onCancel }) => {
  const [step, setStep] = useState<'info' | 'github' | 'local' | 'success'>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  
  // Repository Info
  const [repoInfo, setRepoInfo] = useState<GitRepositoryInfo>({
    name: '',
    description: '',
    isPrivate: false,
    license: 'mit',
    gitignore: 'Node',
    readme: true
  })
  
  // GitHub Integration
  const [githubToken, setGithubToken] = useState('')
  const [githubRepo, setGithubRepo] = useState<GitHubRepository | null>(null)
  const [pushToGitHub, setPushToGitHub] = useState(true)
  
  // Local Repository
  const [localPath, setLocalPath] = useState('')
  const [showDirectoryPicker, setShowDirectoryPicker] = useState(false)
  
  const environment = getEnvironmentConfig()

  const handleNext = () => {
    if (step === 'info') {
      if (!repoInfo.name.trim()) {
        setError('El nombre del repositorio es requerido')
        return
      }
      setStep('github')
    } else if (step === 'github') {
      if (pushToGitHub && !githubToken.trim()) {
        setError('El token de GitHub es requerido para crear repositorios remotos')
        return
      }
      setStep('local')
    }
  }

  const handleBack = () => {
    if (step === 'github') {
      setStep('info')
    } else if (step === 'local') {
      setStep('github')
    }
  }

  const handleCreateGitHubRepo = async () => {
    if (!pushToGitHub) {
      setStep('local')
      return
    }

    setLoading(true)
    setError('')

    try {
      const repo = await gitAdvancedService.createGitHubRepository(repoInfo, githubToken)
      if (repo) {
        setGithubRepo(repo)
        setStep('local')
      }
    } catch (error: any) {
      setError(`Error creando repositorio en GitHub: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectLocalPath = async () => {
    if (environment.platform === 'browser') {
      setShowDirectoryPicker(true)
    } else {
      // In Node.js, we can create the directory
      const defaultPath = `${process.cwd()}/${repoInfo.name}`
      setLocalPath(defaultPath)
    }
  }

  // const _handleDirectorySelect = (path: string) => {
  //   setLocalPath(path)
  //   setShowDirectoryPicker(false)
  // }

  const handleCreateLocalRepo = async () => {
    if (!localPath.trim()) {
      setError('Debes seleccionar una ruta local para el repositorio')
      return
    }

    setLoading(true)
    setError('')

    try {
      let success = false
      
      if (environment.platform === 'node') {
        // Initialize local repository
        success = await gitAdvancedService.initializeRepository(localPath, repoInfo)
        
        if (success && pushToGitHub && githubRepo) {
          // Push to GitHub
          await gitAdvancedService.pushToGitHub(localPath, githubRepo.clone_url, githubToken)
        }
      } else {
        // In browser, we can only create GitHub repo
        success = true
      }

      if (success) {
        setStep('success')
      } else {
        setError('Error creando el repositorio local. Verifica que la ruta sea válida y esté vacía.')
      }
    } catch (error: any) {
      setError(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    onRepositoryCreated(localPath || `/${repoInfo.name}`)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {['info', 'github', 'local', 'success'].map((stepName, index) => (
          <div key={stepName} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === stepName 
                ? 'bg-blue-600 text-white' 
                : step === 'success' || ['info', 'github', 'local'].indexOf(step) > index
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step === 'success' || ['info', 'github', 'local'].indexOf(step) > index ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
            {index < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                ['info', 'github', 'local'].indexOf(step) > index ? 'bg-green-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderInfoStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del Repositorio *
        </label>
        <input
          type="text"
          value={repoInfo.name}
          onChange={(e) => setRepoInfo({ ...repoInfo, name: e.target.value })}
          placeholder="mi-proyecto-awesome"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          value={repoInfo.description}
          onChange={(e) => setRepoInfo({ ...repoInfo, description: e.target.value })}
          placeholder="Una descripción breve de tu proyecto..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center space-x-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={repoInfo.isPrivate}
            onChange={(e) => setRepoInfo({ ...repoInfo, isPrivate: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Repositorio Privado</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={repoInfo.readme}
            onChange={(e) => setRepoInfo({ ...repoInfo, readme: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Crear README</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plantilla .gitignore
          </label>
          <select
            value={repoInfo.gitignore}
            onChange={(e) => setRepoInfo({ ...repoInfo, gitignore: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Node">Node.js</option>
            <option value="Python">Python</option>
            <option value="React">React</option>
            <option value="Vue">Vue.js</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Licencia
          </label>
          <select
            value={repoInfo.license}
            onChange={(e) => setRepoInfo({ ...repoInfo, license: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="mit">MIT</option>
            <option value="apache-2.0">Apache 2.0</option>
            <option value="gpl-3.0">GPL 3.0</option>
            <option value="bsd-3-clause">BSD 3-Clause</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderGitHubStep = () => (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">
              Integración con GitHub
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Crea un repositorio en GitHub y conecta tu proyecto local
            </p>
          </div>
        </div>
      </div>

      <label className="flex items-center">
        <input
          type="checkbox"
          checked={pushToGitHub}
          onChange={(e) => setPushToGitHub(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className="ml-2 text-sm text-gray-700">Crear repositorio en GitHub</span>
      </label>

      {pushToGitHub && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token de Acceso Personal de GitHub *
          </label>
          <div className="relative">
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Necesitas un token con permisos de repositorio. 
            <a 
              href="https://github.com/settings/tokens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 ml-1"
            >
              Crear token aquí
            </a>
          </p>
        </div>
      )}

      {pushToGitHub && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                Importante
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Tu token de GitHub se usará solo para crear el repositorio. 
                No se almacenará permanentemente en la aplicación.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderLocalStep = () => (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <FolderOpen className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-green-800">
              Ubicación Local
            </h4>
            <p className="text-sm text-green-700 mt-1">
              Selecciona dónde quieres crear tu repositorio local
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ruta del Repositorio *
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={localPath}
            onChange={(e) => setLocalPath(e.target.value)}
            placeholder="/ruta/a/tu/proyecto"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSelectLocalPath}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
          >
            <FolderOpen className="h-4 w-4" />
          </button>
        </div>
      </div>

      {environment.platform === 'browser' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">
                Modo Navegador
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                En el navegador, solo puedes crear repositorios en GitHub. 
                Para inicializar repositorios locales, usa la versión de escritorio.
              </p>
            </div>
          </div>
        </div>
      )}

      {githubRepo && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-800">
                Repositorio GitHub Creado
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {githubRepo.full_name}
              </p>
            </div>
            <div className="flex space-x-2">
              <a
                href={githubRepo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-800"
                title="Ver en GitHub"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                onClick={() => copyToClipboard(githubRepo.clone_url)}
                className="p-2 text-gray-600 hover:text-gray-800"
                title="Copiar URL de clonación"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          ¡Repositorio Creado Exitosamente!
        </h3>
        <p className="text-gray-600">
          Tu repositorio "{repoInfo.name}" ha sido creado y configurado.
        </p>
      </div>

      {githubRepo && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-green-800">
                Repositorio GitHub
              </h4>
              <p className="text-sm text-green-700 mt-1">
                {githubRepo.html_url}
              </p>
            </div>
            <a
              href={githubRepo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver en GitHub
            </a>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Próximos Pasos:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Navega a tu directorio del proyecto</p>
          <p>• Comienza a desarrollar tu aplicación</p>
          <p>• Usa Commit Helper para hacer commits inteligentes</p>
        </div>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (step) {
      case 'info':
        return renderInfoStep()
      case 'github':
        return renderGitHubStep()
      case 'local':
        return renderLocalStep()
      case 'success':
        return renderSuccessStep()
      default:
        return null
    }
  }

  const renderActions = () => {
    if (step === 'success') {
      return (
        <div className="flex justify-center">
          <button
            onClick={handleFinish}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <GitBranch className="h-5 w-5 mr-2" />
            Abrir Repositorio
          </button>
        </div>
      )
    }

    if (step === 'local') {
      return (
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Atrás
          </button>
          <button
            onClick={handleCreateLocalRepo}
            disabled={loading || !localPath.trim()}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Plus className="h-5 w-5 mr-2" />
            )}
            {loading ? 'Creando...' : 'Crear Repositorio'}
          </button>
        </div>
      )
    }

    if (step === 'github') {
      return (
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Atrás
          </button>
          <button
            onClick={handleCreateGitHubRepo}
            disabled={loading || (pushToGitHub && !githubToken.trim())}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <ExternalLink className="h-5 w-5 mr-2" />
            )}
            {loading ? 'Creando...' : 'Crear en GitHub'}
          </button>
        </div>
      )
    }

    return (
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!repoInfo.name.trim()}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
          <Plus className="h-5 w-5 ml-2" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-[600px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Crear Nuevo Repositorio
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Step Indicator */}
          {getStepIndicator()}

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

          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200">
            {renderActions()}
          </div>
        </div>
      </div>

      {/* Directory Picker Modal */}
      {showDirectoryPicker && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative top-20 mx-auto p-6 border w-[500px] shadow-lg rounded-md bg-white">
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Seleccionar Ubicación
              </h4>
              <p className="text-gray-600 mb-6">
                En el navegador, solo puedes crear repositorios en GitHub. 
                Para repositorios locales, usa la versión de escritorio.
              </p>
              <button
                onClick={() => setShowDirectoryPicker(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewRepositoryWizard
