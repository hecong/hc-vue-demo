/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'jsencrypt' {
  export default class JSEncrypt {
    setPublicKey(publicKey: string): void
    setPrivateKey(privateKey: string): void
    encrypt(data: string): string | false
    decrypt(encrypted: string): string | false
  }
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_PORT: string
  readonly VITE_DEMO_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
