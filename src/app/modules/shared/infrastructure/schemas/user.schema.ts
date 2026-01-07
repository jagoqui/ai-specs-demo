import z from "zod";
import type {
  CreateUser,
  LoginUserWithEmailAndPassword,
  User,
} from "../../domain/models/user.model";
import {
  COMMONS_VALIDATIONS,
  objectIdSchema,
} from "./commons-validations.schema";
import { userRoleSchema } from "./user-role.schema";

export const userSchema = z.object({
  id: objectIdSchema,
  email: z.email(),
  name: z
    .string()
    .min(COMMONS_VALIDATIONS.NAME.min)
    .max(COMMONS_VALIDATIONS.NAME.max)
    .optional(),
  photoUrl: z.url().min(COMMONS_VALIDATIONS.PHOTO.min).optional(),
  googleId: z.string().optional(),
  role: userRoleSchema,
  isAdmin: z.boolean(),
  phone: z.string().regex(COMMONS_VALIDATIONS.PHONE.pattern).optional(),
  bio: z
    .string()
    .min(COMMONS_VALIDATIONS.BIO.min)
    .max(COMMONS_VALIDATIONS.BIO.max)
    .optional(),
}) satisfies z.ZodType<User>;

export const createUserSchema = userSchema
  .pick({
    email: true,
    name: true,
    role: true,
  })
  .extend({
    password: z.string().regex(COMMONS_VALIDATIONS.PASSWORD.pattern, {
      message:
        "Password must include uppercase, lowercase, number, and special character and be between 6 and 18 characters long.",
    }),
  }) satisfies z.ZodType<CreateUser>;

export const loginUserWithEmailAndPasswordSchema = createUserSchema.pick({
  email: true,
  password: true,
}) satisfies z.ZodType<LoginUserWithEmailAndPassword>;
