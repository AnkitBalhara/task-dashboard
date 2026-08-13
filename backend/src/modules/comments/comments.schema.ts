import { z } from "zod";

export const createCommentSchema = z.object({
  userId: z.string().uuid("userId must be a valid uuid"),
  comment: z.string().trim().min(1, "comment is required"),
});

export type CreateCommentSchemaInput = z.infer<typeof createCommentSchema>;
