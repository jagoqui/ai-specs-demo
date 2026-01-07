import type { Auth } from "../models/auth.model";

export interface TokenStorageRepository {
  get(): Auth | null;
  save(args: Auth): void;
  remove(): void;
}
