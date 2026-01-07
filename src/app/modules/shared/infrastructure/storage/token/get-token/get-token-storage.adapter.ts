import { AUTH_RESPONSE_STORAGE_KEY } from "@/modules/shared/domain/constants/local-storage-keys.constants";
import type { Auth } from "@/modules/shared/domain/models/auth.model";
import { authSchema } from "@/modules/shared/infrastructure/schemas/auth.schema";

export const getTokenAdapter = (): Auth | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(AUTH_RESPONSE_STORAGE_KEY);
    if (!stored) return null;

    const parsed = authSchema.parse(JSON.parse(stored));

    if (!parsed.accessToken || !parsed.refreshToken) {
      localStorage.removeItem(AUTH_RESPONSE_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(AUTH_RESPONSE_STORAGE_KEY);
    return null;
  }
};
