/// <reference types="vite/client" />

interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_CLOUDINARY_URL: string;
  readonly VITE_SONAR_TOKEN: string;
  readonly VITE_SONAR_HOST_URL: string;
  readonly VITE_SONAR_PROJECT_KEY: string;
  readonly VITE_SNYK_ORG?: string;
  readonly VITE_MODE: "development" | "production" | "test" | "sonar-local";
}

namespace NodeJS {
  type ProcessEnv = ImportMetaEnv;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
