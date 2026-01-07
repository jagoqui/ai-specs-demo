import { AUTH_RESPONSE_STORAGE_KEY } from "@/modules/shared/domain/constants/local-storage-keys.constants";

export const removeTokenStorageAdapter = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_RESPONSE_STORAGE_KEY);
};
