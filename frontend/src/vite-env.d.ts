/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JIRA_REDIRECT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
