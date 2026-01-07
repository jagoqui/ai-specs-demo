import type { AuthResponseDto } from "@/modules/shared/infrastructure/dtos/auth-response.dto";
import { TOKEN_DTO_MOCK } from "../token/token-dto.mock";
import { USER_DTO_MOCK } from "../users/user-dto.mock";

export const AUTH_RESPONSE_DTO_MOCK: AuthResponseDto = {
  ...TOKEN_DTO_MOCK,
  user: USER_DTO_MOCK,
};
