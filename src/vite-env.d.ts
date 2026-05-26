/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_MSG91_WIDGET_ID?: string
  readonly VITE_MSG91_TOKEN_AUTH?: string
  /** Comma-separated 10-digit phones that bypass the MSG91 widget. */
  readonly VITE_TEST_PHONES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
