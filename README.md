# Commit Helper - AI Git Assistant

Una aplicación de escritorio moderna para gestionar commits de Git con generación automática de mensajes usando IA.

## 📊 Project Status

### ✅ **Completed Tasks**
- [x] **Base Architecture** - React + TypeScript + Vite + Tailwind CSS
- [x] **User Interface** - Modular and responsive React components
- [x] **AI Integration** - OpenAI GPT API for commit generation
- [x] **Model Configuration** - Support for GPT-4, GPT-3.5 and configurable parameters
- [x] **Staging System** - Visual management of staging area and working directory
- [x] **Conventional Commits** - Automatic generation following the standard
- [x] **Project Selection** - Main screen with directory browser
- [x] **File Browser** - File system exploration
- [x] **Repository Detection** - Automatic validation of Git directories
- [x] **Project History** - List of recent projects
- [x] **AI Configuration** - API keys, models, parameters and cost estimation
- [x] **Electron Integration** - Native desktop application
- [x] **File System Access** - Real Git and file operations
- [x] **IPC and Preload** - Secure communication between Electron processes
- [x] **Build and Packaging** - electron-builder configuration
- [x] **Git Versioning** - Complete repository on GitHub

### 🔄 **In Development/Testing**
- [ ] **Electron Error Resolution** - Blank screen and TypeScript errors
- [ ] **Complete Git Integration** - Real commands vs mock data
- [ ] **File Operations** - Real system read/write

### 📋 **Pending Tasks (Roadmap)**
- [ ] **Advanced Git Features**
  - [ ] Repository initialization
  - [ ] Push/pull to remote repositories
  - [ ] Branch management
  - [ ] Commit history
  - [ ] Conflict resolution
- [ ] **AI Improvements**
  - [ ] Deeper context analysis
  - [ ] Refactoring suggestions
  - [ ] Breaking changes detection
  - [ ] Changelog generation
- [ ] **Additional Features**
  - [ ] Customizable commit templates
  - [ ] GitHub/GitLab integration
  - [ ] Notifications and reminders
  - [ ] Automatic configuration backup
  - [ ] Offline mode with local AI
- [ ] **UX/UI Improvements**
  - [ ] Dark/light themes
  - [ ] Keyboard shortcuts
  - [ ] Drag & drop for files
  - [ ] Visual diff view
- [ ] **Testing and Quality**
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] E2E tests
  - [ ] CI/CD pipeline
- [ ] **Documentation**
  - [ ] Complete user guide
  - [ ] API documentation
  - [ ] Contributing guidelines
  - [ ] Automatic changelog

### 🐛 **Known Issues**
- **Blank screen in Electron** - Frontend loading error
- **TypeScript errors** - Unused variables and types
- **Port configuration** - Mismatch between Vite and Electron
- **Absolute vs relative paths** - Production build issues

### 🎯 **Immediate Next Steps**
1. **Resolve Electron errors** - Blank screen and frontend loading
2. **Complete Git integration** - Replace mock data with real operations
3. **Feature testing** - Verify everything works in real environment
4. **Build optimization** - Resolve path and configuration issues

## 🚀 Características

- **Interfaz visual intuitiva** para gestionar archivos Git
- **Generación automática de commits** usando IA (OpenAI GPT)
- **Formato de Conventional Commits** automático
- **Gestión visual del staging area** y working directory
- **Sugerencias inteligentes** basadas en los cambios
- **Interfaz moderna** con Tailwind CSS
- **Configuración avanzada de modelos de IA** con control de costos
- **Selección inteligente de proyectos** con navegador de directorios
- **Historial de proyectos recientes** para acceso rápido

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Integration**: OpenAI GPT API

## 📦 Instalación

1. **Clona el repositorio:**
```bash
git clone <repository-url>
cd commitHelper
```

2. **Instala las dependencias:**
```bash
npm install
```

3. **Configura tu API key de OpenAI:**
   - Ve a [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Crea una nueva API key
   - Configúrala en la aplicación usando el botón "AI Settings"

## 🚀 Uso

### Desarrollo
```bash
npm run dev
```

### Build para producción
```bash
npm run build
```

### Preview de producción
```bash
npm run preview
```

## 🎯 Cómo usar

### 1. **Seleccionar Proyecto Git**
- La aplicación se abre con una pantalla de selección de proyectos
- Puedes elegir entre proyectos recientes o navegar por el sistema de archivos
- Solo se muestran directorios que contengan repositorios Git válidos

### 2. **Ver archivos modificados**
- Una vez seleccionado el proyecto, la aplicación muestra automáticamente los archivos en tu working directory
- Cada archivo muestra su estado (modified, added, deleted, etc.)

### 3. **Mover archivos a staging**
- Haz clic en "Stage" para mover archivos del working directory al staging area
- Los archivos staged se muestran en verde

### 4. **Generar mensaje de commit con IA**
- Con archivos en staging, haz clic en "Generate AI Message"
- La IA analiza los cambios y genera un mensaje de conventional commit
- Puedes editar el mensaje antes de hacer commit

### 5. **Hacer commit**
- Escribe tu mensaje de commit o usa el generado por IA
- Haz clic en "Commit Changes"
- Los archivos se commitean y se limpia el staging area

### 6. **Cambiar de Proyecto**
- Usa "Cambiar Proyecto" para abrir otro repositorio
- Usa "Seleccionar Otro" para volver a la pantalla de selección

## 🗂️ Selección de Proyectos

### **Pantalla Principal de Selección:**
- **Proyectos Recientes**: Lista de los últimos 10 proyectos utilizados
- **Búsqueda**: Filtra proyectos por nombre o ruta
- **Acciones Rápidas**: Botones para diferentes tipos de proyectos

### **Navegador de Directorios:**
- **Navegación Intuitiva**: Breadcrumbs y botones de navegación
- **Detección Automática**: Identifica repositorios Git válidos
- **Búsqueda en Tiempo Real**: Filtra archivos y carpetas
- **Información Detallada**: Muestra tamaño, fecha de modificación y tipo

### **Tipos de Proyectos Soportados:**
- **Repositorios Existentes**: Proyectos Git ya inicializados
- **Nuevos Repositorios**: Inicializar Git en proyectos nuevos
- **Repositorios Remotos**: Clonar desde GitHub, GitLab, etc.

## 🤖 Configuración de IA

### **Modelos Disponibles:**

#### **⭐ GPT-4 Turbo (Recomendado)**
- **ID**: `gpt-4-1106-preview`
- **Descripción**: El modelo más avanzado y preciso para análisis de código
- **Max Tokens**: 128,000
- **Costo**: $0.01 por 1K tokens
- **Uso**: Commits complejos y análisis detallado

#### **⭐ GPT-4 (Excelente)**
- **ID**: `gpt-4`
- **Descripción**: Excelente para análisis de código y commits de alta calidad
- **Max Tokens**: 8,192
- **Costo**: $0.03 por 1K tokens
- **Uso**: Commits de calidad profesional

#### **GPT-3.5 Turbo 16K (Económico)**
- **ID**: `gpt-3.5-turbo-16k`
- **Descripción**: Buena relación calidad-precio para commits básicos
- **Max Tokens**: 16,384
- **Costo**: $0.003 por 1K tokens
- **Uso**: Commits simples y económicos

#### **GPT-3.5 Turbo (Más Económico)**
- **ID**: `gpt-3.5-turbo`
- **Descripción**: Opción económica para commits simples
- **Max Tokens**: 4,096
- **Costo**: $0.002 por 1K tokens
- **Uso**: Commits básicos y rápidos

### **Configuración Avanzada:**

#### **Temperature (Creatividad)**
- **0.0**: Muy enfocado y consistente
- **0.5**: Balanceado (recomendado)
- **1.0**: Muy creativo y variado

#### **Max Tokens**
- **50-100**: Mensajes cortos
- **200**: Balanceado (recomendado)
- **300-500**: Mensajes largos con contexto

### **Estimación de Costos:**
- **GPT-4 Turbo**: ~$0.002 por commit
- **GPT-4**: ~$0.006 por commit
- **GPT-3.5 Turbo**: ~$0.0004 por commit

## 📝 Formato de Conventional Commits

La aplicación genera automáticamente mensajes que siguen el estándar:

```
type(scope): description

[optional body]

[optional footer]
```

**Tipos disponibles:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `docs`: Documentación
- `style`: Cambios de estilo/formato
- `refactor`: Refactorización de código
- `test`: Añadir o modificar tests
- `chore`: Tareas de mantenimiento

## ⚙️ Configuración de IA

1. **Haz clic en "AI Settings"**
2. **Ingresa tu OpenAI API key**
3. **Selecciona el modelo de IA** (recomendamos GPT-4 Turbo)
4. **Ajusta la temperatura** para controlar la creatividad
5. **Configura el máximo de tokens** según tus necesidades
6. **Guarda la configuración**
7. **Usa "Generate AI Message"** para generar commits automáticamente

## 🔧 Estructura del Proyecto

```
commitHelper/
├── src/
│   ├── components/          # Componentes React
│   │   ├── CommitHelper.tsx # Componente principal de commits
│   │   ├── FileExplorer.tsx # Explorador de archivos
│   │   ├── StagingArea.tsx  # Área de staging
│   │   ├── CommitForm.tsx   # Formulario de commit
│   │   ├── AISettings.tsx   # Configuración de IA
│   │   ├── ProjectSelector.tsx # Selector de proyectos
│   │   ├── DirectoryBrowser.tsx # Navegador de directorios
│   │   └── index.ts         # Exportaciones de componentes
│   ├── services/            # Servicios de negocio
│   │   ├── gitService.ts    # Operaciones Git
│   │   └── aiService.ts     # Generación de commits con IA
│   ├── config/              # Configuración del entorno
│   │   ├── environment.ts   # Detección de entorno
│   │   └── aiModels.ts      # Configuración de modelos IA
│   ├── types/               # Definiciones TypeScript
│   │   └── index.ts         # Interfaces y tipos
│   ├── App.tsx              # Componente raíz con navegación
│   ├── main.tsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── package.json             # Dependencias y scripts
├── vite.config.ts           # Configuración de Vite
├── tailwind.config.js       # Configuración de Tailwind
├── env.development          # Variables de entorno para desarrollo
└── README.md                # Este archivo
```

## 🎨 Personalización

### Colores y temas
Modifica `tailwind.config.js` para personalizar colores y estilos.

### Componentes
Cada componente está modularizado y puede ser fácilmente modificado o extendido.

### Modelos de IA
Puedes agregar nuevos modelos en `src/config/aiModels.ts`.

### Navegación de Proyectos
Personaliza la lógica de detección de repositorios en `ProjectSelector.tsx`.

## 🐛 Solución de Problemas

### "No Git Repository Found"
- Asegúrate de estar en un directorio con repositorio Git
- Ejecuta `git init` si es necesario
- Usa el navegador de directorios para encontrar repositorios válidos

### Error de API de IA
- Verifica que tu API key sea válida
- Asegúrate de tener créditos en tu cuenta de OpenAI
- Revisa la consola del navegador para más detalles

### Archivos no se actualizan
- Usa el botón de refresh o recarga la página
- Verifica que no haya errores en la consola

### Error "process is not defined"
- **Este error ya está solucionado** en la versión actual
- La aplicación detecta automáticamente si está corriendo en el navegador o Node.js
- En el navegador, usa datos mock para demostración
- En Node.js, puede usar comandos Git reales

### Configuración del entorno
- La aplicación detecta automáticamente el entorno (browser vs Node.js)
- En desarrollo, usa `env.development` para configuraciones
- En producción, las variables se configuran automáticamente

### Problemas con modelos de IA
- Verifica que el modelo seleccionado esté disponible en tu cuenta de OpenAI
- Algunos modelos pueden requerir acceso especial
- GPT-4 Turbo es el más reciente y recomendado

### Problemas de selección de proyectos
- Verifica que el directorio contenga una carpeta `.git`
- Asegúrate de tener permisos de lectura en el directorio
- Usa el navegador de directorios para explorar el sistema de archivos

## 🔄 Modo Demo vs Producción

### Modo Demo (Navegador)
- Usa datos mock para demostrar la funcionalidad
- No requiere acceso al sistema de archivos
- Perfecto para probar la interfaz y funcionalidades

### Modo Producción (Node.js/Electron)
- Acceso completo al sistema de archivos
- Ejecuta comandos Git reales
- Integración completa con repositorios Git

## 💰 Optimización de Costos

### **Para Uso Personal:**
- Usa **GPT-3.5 Turbo** para commits simples
- Costo estimado: ~$0.0004 por commit

### **Para Proyectos Profesionales:**
- Usa **GPT-4 Turbo** para commits complejos
- Costo estimado: ~$0.002 por commit

### **Para Equipos:**
- Usa **GPT-4** para consistencia y calidad
- Costo estimado: ~$0.006 por commit

## 🚀 Flujo de Trabajo Recomendado

### **1. Selección de Proyecto:**
- Abre Commit Helper
- Selecciona un proyecto existente o navega por directorios
- La aplicación valida automáticamente que sea un repositorio Git

### **2. Configuración de IA:**
- Configura tu API key de OpenAI
- Selecciona el modelo apropiado para tus necesidades
- Ajusta parámetros de creatividad y longitud

### **3. Trabajo Diario:**
- Revisa archivos modificados en el working directory
- Mueve archivos relevantes al staging area
- Genera mensajes de commit con IA
- Revisa y edita los mensajes generados
- Haz commit de los cambios

### **4. Cambio de Proyectos:**
- Usa "Cambiar Proyecto" para trabajar en otro repositorio
- Los proyectos recientes se guardan automáticamente
- Acceso rápido a proyectos frecuentemente utilizados

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [Conventional Commits](https://www.conventionalcommits.org/) por el estándar de commits
- [OpenAI](https://openai.com/) por la API de IA
- [Tailwind CSS](https://tailwindcss.com/) por el framework de CSS
- [Lucide](https://lucide.dev/) por los iconos

---

**¡Disfruta usando Commit Helper para hacer commits más inteligentes y consistentes! 🎉**
