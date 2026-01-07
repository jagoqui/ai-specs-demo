import z from "zod";
import type { Auth } from "../../domain/models/auth.model";
import { userSchema } from "./user.schema";

export const authSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: userSchema,
}) satisfies z.ZodType<Auth>;
