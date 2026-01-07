import type { TokenStorageRepository } from "@/modules/shared/domain/storage/token-storage.repository";
import { getTokenAdapter } from "./get-token/get-token-storage.adapter";
import { removeTokenStorageAdapter } from "./remove-token/remove-token-storage.adapter";
import { saveTokenAdapter } from "./save-token/save-token.adapter";

export const tokenStorageRepositoryImpl: TokenStorageRepository = {
  get: getTokenAdapter,
  save: saveTokenAdapter,
  remove: removeTokenStorageAdapter,
};
