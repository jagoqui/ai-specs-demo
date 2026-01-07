import type { UserRole } from "../../domain/models/user-role.model";

export const USER_ROLES_DTO = {
  OWNER: 0,
  ADMIN: 1,
} as const satisfies Readonly<Record<UserRole, number>>;

export type UserRoleDto = (typeof USER_ROLES_DTO)[keyof typeof USER_ROLES_DTO];
