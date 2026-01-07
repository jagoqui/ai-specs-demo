import z from "zod";

export const COMMONS_VALIDATIONS = {
  NAME: { min: 1, max: 100 },
  EMAIL: { min: 5, max: 100 },
  ADDRESS: { min: 5, max: 200 },
  PHOTO: { min: 1 },
  PASSWORD: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,18}$/,
  },
  PHONE: { pattern: /^\+?[\d\s\-()]{7,20}$/ },
  BIO: { min: 0, max: 500 },
} as const satisfies Record<
  string,
  { min?: number; max?: number; pattern?: RegExp }
>;

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const objectIdSchema = z.string().regex(objectIdRegex, {
  message:
    "IdOwner must be a 24-character hex string (MongoDB ObjectId format)",
});
