import type { UserResponseDto } from "./user.dto";

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}
