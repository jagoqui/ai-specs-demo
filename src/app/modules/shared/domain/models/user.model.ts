import type { UserRole } from "./user-role.model";

export interface User {
  id: string;
  email: string;
  name?: string;
  photoUrl?: string;
  googleId?: string;
  role: UserRole;
  isAdmin: boolean;
  phone?: string;
  bio?: string;
}

export type UpdateUser = Omit<User, "photoUrl">;

export type CreateUser = Pick<User, "email" | "name" | "role"> & {
  password: string;
};

export type LoginUserWithEmailAndPassword = Pick<
  CreateUser,
  "email" | "password"
>;

export type ChangeUserPassword = Pick<User, "id"> & { newPassword: string };
