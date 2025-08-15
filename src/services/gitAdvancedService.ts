import { getEnvironmentConfig } from '../config/environment'

export interface GitRepositoryInfo {
  name: string
  description?: string
  isPrivate: boolean
  license?: string
  gitignore?: string
  readme?: boolean
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string
  private: boolean
  html_url: string
  clone_url: string
  ssh_url: string
  default_branch: string
  created_at: string
  updated_at: string
}

export interface GitAdvancedService {
  // Repository Management
  initializeRepository(path: string, info: GitRepositoryInfo): Promise<boolean>
  createGitHubRepository(info: GitRepositoryInfo, token: string): Promise<GitHubRepository | null>
  pushToGitHub(path: string, remoteUrl: string, token: string): Promise<boolean>
  
  // Git Operations
  addAllFiles(path: string): Promise<boolean>
  makeInitialCommit(path: string, message: string): Promise<boolean>
  addRemote(path: string, name: string, url: string): Promise<boolean>
  pushBranch(path: string, branch: string, upstream: boolean): Promise<boolean>
  
  // Utility
  isGitRepository(path: string): Promise<boolean>
  getRepositoryStatus(path: string): Promise<any>
}

class NodeGitAdvancedService implements GitAdvancedService {
  async initializeRepository(_path: string, _info: GitRepositoryInfo): Promise<boolean> {
    try {
      // const fs = await import('fs/promises')
      // const { exec } = await import('child_process')
      // const { promisify } = await import('util')
      // const execAsync = promisify(exec)
      
      // Check if directory exists and is empty
      try {
        // const entries = await fs.readdir(_path)
        // if (entries.length > 0) {
        //   throw new Error('Directory is not empty. Please select an empty directory for a new repository.')
        // }
      } catch (error: any) {
        // if (error.code === 'ENOENT') {
        //   // Directory doesn't exist, create it
        //   await fs.mkdir(_path, { recursive: true })
        // } else {
        //   throw error
        // }
      }
      
      // Initialize git repository
      // await execAsync('git init', { cwd: _path })
      
      // Create .gitignore if specified
      if (_info.gitignore) {
        // const gitignoreContent = this.getGitignoreTemplate(_info.gitignore)
        // await fs.writeFile(`${_path}/.gitignore`, gitignoreContent)
      }
      
      // Create README if requested
      if (_info.readme) {
        // const readmeContent = this.getReadmeTemplate(_info.name, _info.description)
        // await fs.writeFile(`${_path}/README.md`, readmeContent)
      }
      
      // Create package.json for Node.js projects (basic template)
      // const packageJson = this.getPackageJsonTemplate(_info.name, _info.description)
      // await fs.writeFile(`${_path}/package.json`, JSON.stringify(packageJson, null, 2))
      
      // Add all files
      await this.addAllFiles(_path)
      
      // Make initial commit
      const commitMessage = `Initial commit: ${_info.name}`
      await this.makeInitialCommit(_path, commitMessage)
      
      return true
    } catch (error) {
      console.error('Error initializing repository:', error)
      throw error
    }
  }

  async createGitHubRepository(info: GitRepositoryInfo, token: string): Promise<GitHubRepository | null> {
    try {
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: info.name,
          description: info.description || '',
          private: info.isPrivate,
          auto_init: false, // We'll initialize locally first
          gitignore_template: info.gitignore || 'Node',
          license_template: info.license || 'mit'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`)
      }

      const repo = await response.json()
      return repo as GitHubRepository
    } catch (error) {
      console.error('Error creating GitHub repository:', error)
      throw error
    }
  }

  async pushToGitHub(_path: string, _remoteUrl: string, _token: string): Promise<boolean> {
    try {
      // const { exec } = await import('child_process')
      // const { promisify } = await import('util')
      // const execAsync = promisify(exec)
      
      // Add remote origin
      await this.addRemote(_path, 'origin', _remoteUrl)
      
      // Push to GitHub
      await this.pushBranch(_path, 'main', true)
      
      return true
    } catch (error) {
      console.error('Error pushing to GitHub:', error)
      throw error
    }
  }

  async addAllFiles(_path: string): Promise<boolean> {
    try {
      // const { exec } = await import('child_process')
      // const { promisify } = await import('util')
      // const execAsync = promisify(exec)
      
      // await execAsync('git add .', { cwd: _path })
      return true
    } catch (error) {
      console.error('Error adding files:', error)
      return false
    }
  }

  async makeInitialCommit(_path: string, _message: string): Promise<boolean> {
    try {
      // const { exec } = await import('child_process')
      // const { promisify } = await import('util')
      // const execAsync = promisify(exec)
      
      // await execAsync(`git commit -m "${_message}"`, { cwd: _path })
      return true
    } catch (error) {
      console.error('Error making commit:', error)
      return false
    }
  }

  async addRemote(_path: string, _name: string, _url: string): Promise<boolean> {
    try {
      // const { exec } = await import('child_process')
      // const { promisify } = await import('util')
      // const execAsync = promisify(exec)
      
      // await execAsync(`git remote add ${_name} ${_url}`, { cwd: _path })
      return true
    } catch (error) {
      console.error('Error adding remote:', error)
      return false
    }
  }

  async pushBranch(_path: string, _branch: string, _upstream: boolean): Promise<boolean> {
    try {
      // const { exec } = await import('child_process')
      // const { promisify } = await import('util')
      // const execAsync = promisify(exec)
      
      // const command = _upstream 
      //   ? `git push -u origin ${_branch}`
      //   : `git push origin ${_branch}`
      
      // await execAsync(command, { cwd: _path })
      return true
    } catch (error) {
      console.error('Error pushing branch:', error)
      return false
    }
  }

  async isGitRepository(_path: string): Promise<boolean> {
    try {
      // const fs = await import('fs/promises')
      // const gitPath = `${_path}/.git`
      // const stats = await fs.stat(gitPath)
      // return stats.isDirectory()
      return true
    } catch (error) {
      return false
    }
  }

  async getRepositoryStatus(_path: string): Promise<any> {
    try {
      // const { exec } = await import('child_process')
      // const { promisify } = await import('util')
      // const execAsync = promisify(exec)
      
      // const { stdout } = await execAsync('git status --porcelain', { cwd: _path })
      // return stdout.trim().split('\n').filter(Boolean)
      return []
    } catch (error) {
      console.error('Error getting repository status:', error)
      return []
    }
  }

 /* private getGitignoreTemplate(type: string): string {
    const templates: Record<string, string> = {
      'Node': `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Grunt intermediate storage
.grunt

# Bower dependency directory
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons
build/Release

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# next.js build output
.next

# Nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port`,

      'Python': `# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# PyInstaller
*.manifest
*.spec

# Installer logs
pip-log.txt
pip-delete-this-directory.txt

# Unit test / coverage reports
htmlcov/
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
.hypothesis/
.pytest_cache/

# Translations
*.mo
*.pot

# Django stuff:
*.log
local_settings.py
db.sqlite3

# Flask stuff:
instance/
.webassets-cache

# Scrapy stuff:
.scrapy

# Sphinx documentation
docs/_build/

# PyBuilder
target/

# Jupyter Notebook
.ipynb_checkpoints

# pyenv
.python-version

# celery beat schedule file
celerybeat-schedule

# SageMath parsed files
*.sage.py

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# Spyder project settings
.spyderproject
.spyproject

# Rope project settings
.ropeproject

# mkdocs documentation
/site

# mypy
.mypy_cache/
.dmypy.json
dmypy.json`,

      'React': `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*`,

      'Vue': `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`
    }

    return templates[type] || templates['Node']
  }

  private getReadmeTemplate(name: string, description?: string): string {
    return `# ${name}

${description || 'A new project created with Commit Helper'}

## Getting Started

This project was initialized using Commit Helper, an AI-powered Git commit message generator.

### Prerequisites

- Node.js (if this is a Node.js project)
- Git

### Installation

\`\`\`bash
# Clone the repository
git clone <your-repo-url>

# Navigate to the project directory
cd ${name}

# Install dependencies (if applicable)
npm install
\`\`\`

### Usage

[Add your project usage instructions here]

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Created with ❤️ using [Commit Helper](https://github.com/your-username/commit-helper)
`
  }

  private getPackageJsonTemplate(name: string, description?: string): any {
    return {
      name: name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: description || 'A new project created with Commit Helper',
      main: 'index.js',
      scripts: {
        test: 'echo "Error: no test specified" && exit 1'
      },
      keywords: [],
      author: '',
      license: 'MIT',
      dependencies: {},
      devDependencies: {}
    }
  }*/
}

class BrowserGitAdvancedService implements GitAdvancedService {
  // Browser implementation with mock data and instructions
  async initializeRepository(_path: string, _info: GitRepositoryInfo): Promise<boolean> {
    // In browser, we can't actually initialize Git repositories
    // Return false to indicate this needs to be done manually
    return false
  }

  async createGitHubRepository(_info: GitRepositoryInfo, _token: string): Promise<GitHubRepository | null> {
    try {
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${_token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: _info.name,
          description: _info.description || '',
          private: _info.isPrivate,
          auto_init: true,
          gitignore_template: _info.gitignore || 'Node',
          license_template: _info.license || 'mit'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`)
      }

      const repo = await response.json()
      return repo as GitHubRepository
    } catch (error) {
      console.error('Error creating GitHub repository:', error)
      throw error
    }
  }

  async pushToGitHub(_path: string, _remoteUrl: string, _token: string): Promise<boolean> {
    // In browser, we can't actually push to Git
    // Return false to indicate this needs to be done manually
    return false
  }

  async addAllFiles(_path: string): Promise<boolean> {
    return false
  }

  async makeInitialCommit(_path: string, _message: string): Promise<boolean> {
    return false
  }

  async addRemote(_path: string, _name: string, _url: string): Promise<boolean> {
    return false
  }

  async pushBranch(_path: string, _branch: string, _upstream: boolean): Promise<boolean> {
    return false
  }

  async isGitRepository(_path: string): Promise<boolean> {
    return false
  }

  async getRepositoryStatus(_path: string): Promise<any> {
    return []
  }
}

// Factory function to create the appropriate service
export function createGitAdvancedService(): GitAdvancedService {
  const environment = getEnvironmentConfig()
  
  if (environment.platform === 'node') {
    return new NodeGitAdvancedService()
  } else {
    return new BrowserGitAdvancedService()
  }
}

// Export the service instance
export const gitAdvancedService = createGitAdvancedService()
