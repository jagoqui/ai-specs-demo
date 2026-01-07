import { AUTH_RESPONSE_STORAGE_KEY } from "@/modules/shared/domain/constants/local-storage-keys.constants";
import type { Auth } from "@/modules/shared/domain/models/auth.model";

export const saveTokenAdapter = (args: Auth): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(AUTH_RESPONSE_STORAGE_KEY, JSON.stringify(args));
};
