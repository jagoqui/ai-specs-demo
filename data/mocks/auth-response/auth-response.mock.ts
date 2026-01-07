import type { Auth } from '@/modules/shared/domain/models/auth.model';
import { TOKEN_MOCK } from '../token/token.mock';
import { USER_MOCK } from '../users/user.mock';

export const AUTH_RESPONSE_MOCK: Auth = {
  ...TOKEN_MOCK,
  user: USER_MOCK,
};
