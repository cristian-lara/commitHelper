/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_OPENAI_API_URL: string
  readonly VITE_APP_ENV: 'development' | 'production' | 'test'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Declare global types for browser environment
declare global {
  interface Window {
    __COMMIT_HELPER_ENV__?: {
      isBrowser: boolean
      isDevelopment: boolean
      isProduction: boolean
    }
  }
}
