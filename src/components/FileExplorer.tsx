import React from 'react'
import { GitFile } from '../types'
import { Plus, FileText, FileCode, FileImage, File } from 'lucide-react'

interface FileExplorerProps {
  files: GitFile[]
  onAddFile: (file: GitFile) => void
  title: string
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onAddFile }) => {
  const getFileIcon = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase()
    
    if (['ts', 'tsx', 'js', 'jsx'].includes(extension || '')) {
      return <FileCode className="h-4 w-4 text-blue-600" />
    } else if (['md', 'txt'].includes(extension || '')) {
      return <FileText className="h-4 w-4 text-green-600" />
    } else if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(extension || '')) {
      return <FileImage className="h-4 w-4 text-purple-600" />
    } else {
      return <File className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: GitFile['status']) => {
    switch (status) {
      case 'added':
        return 'bg-green-100 text-green-800'
      case 'modified':
        return 'bg-yellow-100 text-yellow-800'
      case 'deleted':
        return 'bg-red-100 text-red-800'
      case 'renamed':
        return 'bg-blue-100 text-blue-800'
      case 'untracked':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No files in working directory</p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.path}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {getFileIcon(file.path)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.path}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                    {file.status}
                  </span>
                  {file.diff && (
                    <span className="text-xs text-gray-500">
                      {file.diff.split('\n').length} lines changed
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onAddFile(file)}
              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-3 w-3 mr-1" />
              Stage
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FileExplorer
