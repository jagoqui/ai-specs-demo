import z from "zod";
import type { UserRole } from "../../domain/models/user-role.model";

export const userRoleSchema = z.custom<UserRole>();
