import { z } from "zod";
import { USER_ROLES } from "@task-dashboard/shared-types";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  email: z.string().trim().email("email must be a valid email address"),
  role: z.enum(USER_ROLES).optional().default("MEMBER"),
});

export type CreateUserSchemaInput = z.infer<typeof createUserSchema>;
