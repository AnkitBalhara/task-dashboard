import type { Request, Response } from "express";
import { success } from "../../utils/ApiResponse";
import * as dashboardService from "./dashboard.service";
import type { DashboardQuerySchemaInput } from "./dashboard.schema";

export async function getDashboard(req: Request, res: Response): Promise<void> {
  const { userId } = req.query as unknown as DashboardQuerySchemaInput;
  const stats = await dashboardService.getStats(userId);
  res.status(200).json(success(stats));
}
