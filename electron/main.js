const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')
const fs = require('fs').promises

const execAsync = promisify(exec)

let mainWindow

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png'), // Optional: add an icon
    title: 'Commit Helper - AI-Powered Git Commit Generator',
    show: false // Don't show until ready
  })

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:5174')
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load the built app
   // mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
   mainWindow.loadURL('http://localhost:5174')
   mainWindow.webContents.openDevTools()
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url)
    return { action: 'deny' }
  })
}

// App event handlers
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC handlers for Git operations
ipcMain.handle('git:get-status', async (event, projectPath) => {
  try {
    const { stdout } = await execAsync('git status --porcelain', { cwd: projectPath })
    const lines = stdout.trim().split('\n').filter(Boolean)
    
    const workingDirectory = []
    const stagingArea = []
    
    for (const line of lines) {
      const status = line.substring(0, 2)
      const filePath = line.substring(3)
      
      if (status[0] === ' ' && status[1] !== ' ') {
        // Modified in working directory
        workingDirectory.push({
          path: filePath,
          status: 'modified',
          staged: false
        })
      } else if (status[0] !== ' ' && status[1] === ' ') {
        // Staged
        stagingArea.push({
          path: filePath,
          status: 'modified',
          staged: true
        })
      } else if (status === '??') {
        // Untracked
        workingDirectory.push({
          path: filePath,
          status: 'untracked',
          staged: false
        })
      } else if (status === 'A ') {
        // Added to staging
        stagingArea.push({
          path: filePath,
          status: 'added',
          staged: true
        })
      } else if (status === 'M ') {
        // Modified and staged
        stagingArea.push({
          path: filePath,
          status: 'modified',
          staged: true
        })
      } else if (status === 'D ') {
        // Deleted and staged
        stagingArea.push({
          path: filePath,
          status: 'deleted',
          staged: true
        })
      }
    }
    
    // Get branch info
    const { stdout: branchOutput } = await execAsync('git branch --show-current', { cwd: projectPath })
    const branch = branchOutput.trim()
    
    // Get ahead/behind info
    const { stdout: aheadBehind } = await execAsync('git status --porcelain --branch', { cwd: projectPath })
    const aheadMatch = aheadBehind.match(/\[ahead (\d+)\]/)
    const behindMatch = aheadBehind.match(/\[behind (\d+)\]/)
    
    return {
      workingDirectory,
      stagingArea,
      branch,
      ahead: aheadMatch ? parseInt(aheadMatch[1]) : 0,
      behind: behindMatch ? parseInt(behindMatch[1]) : 0
    }
  } catch (error) {
    console.error('Error getting git status:', error)
    throw new Error(`Failed to get git status: ${error.message}`)
  }
})

ipcMain.handle('git:add-file', async (event, { projectPath, filePath }) => {
  try {
    await execAsync(`git add "${filePath}"`, { cwd: projectPath })
    return { success: true }
  } catch (error) {
    console.error('Error adding file:', error)
    throw new Error(`Failed to add file: ${error.message}`)
  }
})

ipcMain.handle('git:remove-from-staging', async (event, { projectPath, filePath }) => {
  try {
    await execAsync(`git reset HEAD "${filePath}"`, { cwd: projectPath })
    return { success: true }
  } catch (error) {
    console.error('Error removing from staging:', error)
    throw new Error(`Failed to remove from staging: ${error.message}`)
  }
})

ipcMain.handle('git:get-diff', async (event, { projectPath, filePath, staged = false }) => {
  try {
    const command = staged 
      ? `git diff --cached "${filePath}"`
      : `git diff "${filePath}"`
    
    const { stdout } = await execAsync(command, { cwd: projectPath })
    return stdout || 'No changes'
  } catch (error) {
    console.error('Error getting diff:', error)
    return 'Error getting diff'
  }
})

ipcMain.handle('git:get-staged-diff', async (event, { projectPath }) => {
  try {
    const { stdout } = await execAsync('git diff --cached', { cwd: projectPath })
    return stdout || 'No staged changes'
  } catch (error) {
    console.error('Error getting staged diff:', error)
    return 'Error getting staged diff'
  }
})

ipcMain.handle('git:commit', async (event, { projectPath, message, body = '' }) => {
  try {
    const commitCommand = body 
      ? `git commit -m "${message}" -m "${body}"`
      : `git commit -m "${message}"`
    
    await execAsync(commitCommand, { cwd: projectPath })
    return { success: true }
  } catch (error) {
    console.error('Error committing:', error)
    throw new Error(`Failed to commit: ${error.message}`)
  }
})

ipcMain.handle('git:init-repository', async (event, { projectPath, repoInfo }) => {
  try {
    // Check if directory exists and is empty
    try {
      const entries = await fs.readdir(projectPath)
      if (entries.length > 0) {
        throw new Error('Directory is not empty. Please select an empty directory for a new repository.')
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Directory doesn't exist, create it
        await fs.mkdir(projectPath, { recursive: true })
      } else {
        throw error
      }
    }
    
    // Initialize git repository
    await execAsync('git init', { cwd: projectPath })
    
    // Create .gitignore if specified
    if (repoInfo.gitignore) {
      const gitignoreContent = getGitignoreTemplate(repoInfo.gitignore)
      await fs.writeFile(path.join(projectPath, '.gitignore'), gitignoreContent)
    }
    
    // Create README if requested
    if (repoInfo.readme) {
      const readmeContent = getReadmeTemplate(repoInfo.name, repoInfo.description)
      await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent)
    }
    
    // Create package.json for Node.js projects
    const packageJson = getPackageJsonTemplate(repoInfo.name, repoInfo.description)
    await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2))
    
    // Add all files
    await execAsync('git add .', { cwd: projectPath })
    
    // Make initial commit
    const commitMessage = `Initial commit: ${repoInfo.name}`
    await execAsync(`git commit -m "${commitMessage}"`, { cwd: projectPath })
    
    return { success: true }
  } catch (error) {
    console.error('Error initializing repository:', error)
    throw new Error(`Failed to initialize repository: ${error.message}`)
  }
})

ipcMain.handle('git:push-to-github', async (event, { projectPath, remoteUrl, token }) => {
  try {
    // Add remote origin
    await execAsync(`git remote add origin ${remoteUrl}`, { cwd: projectPath })
    
    // Push to GitHub
    await execAsync('git push -u origin main', { cwd: projectPath })
    
    return { success: true }
  } catch (error) {
    console.error('Error pushing to GitHub:', error)
    throw new Error(`Failed to push to GitHub: ${error.message}`)
  }
})

// File system operations
ipcMain.handle('fs:read-directory', async (event, dirPath) => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const items = []
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      const stats = await fs.stat(fullPath)
      
      const item = {
        name: entry.name,
        path: fullPath,
        type: entry.isDirectory() ? 'directory' : 'file',
        size: entry.isFile() ? stats.size : undefined,
        modified: stats.mtime,
        isGitRepo: entry.isDirectory() ? await isGitRepository(fullPath) : false
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
    throw new Error(`Failed to read directory: ${error.message}`)
  }
})

ipcMain.handle('fs:is-git-repository', async (event, dirPath) => {
  return await isGitRepository(dirPath)
})

ipcMain.handle('fs:get-home-directory', async () => {
  return require('os').homedir()
})

ipcMain.handle('fs:get-current-directory', async () => {
  return process.cwd()
})

// Helper functions
async function isGitRepository(dirPath) {
  try {
    const gitPath = path.join(dirPath, '.git')
    const stats = await fs.stat(gitPath)
    return stats.isDirectory()
  } catch (error) {
    return false
  }
}

function getGitignoreTemplate(type) {
  const templates = {
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

function getReadmeTemplate(name, description) {
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

function getPackageJsonTemplate(name, description) {
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
}
