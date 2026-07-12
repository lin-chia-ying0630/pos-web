/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_SECURITY_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
