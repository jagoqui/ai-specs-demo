import { type Env } from '@/variables/domain/models/env.model';

export const ENVS_MOCK: Env = {
  VITE_API_BASE_URL: 'https://api.example.com',
  VITE_GOOGLE_CLIENT_ID: 'google-client-id-mock',
  VITE_CLOUDINARY_URL: 'https://cloudinary.mock.com',
  VITE_SONAR_TOKEN: 'test-token',
  VITE_SONAR_HOST_URL: 'https://sonar.test.com',
  VITE_SONAR_PROJECT_KEY: 'test-project',
  VITE_SNYK_ORG: '00000000-0000-0000-0000-000000000000',
  VITE_MODE: 'test',
} as const;
