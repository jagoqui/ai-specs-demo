import type { User } from "./user.model";

export interface Auth {
  accessToken: string;
  refreshToken: string;
  user: User;
}
