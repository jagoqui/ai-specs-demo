import type { UserRoleDto } from "./role.dto";

export interface UserResponseDto {
  id: string;
  email: string;
  name?: string;
  photoUrl?: string;
  googleId?: string;
  role: UserRoleDto;
  phoneNumber?: string;
  bio?: string;
}

export interface UserPayloadDto {
  id: string;
  email?: string;
  name?: string;
  photoFile?: File;
  googleId?: string;
  role?: UserRoleDto;
  phoneNumber?: string;
  bio?: string;
}

export type CreateUserDto = Pick<UserResponseDto, "email" | "name" | "role"> & {
  password: string;
};
