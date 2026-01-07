export const USER_ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
} as const satisfies Readonly<Record<string, string>>;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
