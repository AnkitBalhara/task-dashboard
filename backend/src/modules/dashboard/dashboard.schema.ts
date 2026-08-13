import { z } from "zod";

export const dashboardQuerySchema = z.object({
  userId: z.string().optional(),
});

export type DashboardQuerySchemaInput = z.infer<typeof dashboardQuerySchema>;
