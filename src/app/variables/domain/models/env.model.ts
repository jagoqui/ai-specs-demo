export interface Env {
  VITE_API_BASE_URL: string;
  VITE_GOOGLE_CLIENT_ID: string;
  VITE_CLOUDINARY_URL: string;
  VITE_SONAR_TOKEN: string;
  VITE_SONAR_HOST_URL?: string;
  VITE_SONAR_PROJECT_KEY: string;
  VITE_MODE: "development" | "staging" | "test" | "sonar-local" | "production";
  VITE_SNYK_ORG?: string;
}
