import type { Request, Response } from "express";
import { success } from "../../utils/ApiResponse";
import * as externalService from "./external.service";

export async function getExternalUsers(_req: Request, res: Response): Promise<void> {
  const users = await externalService.getExternalUsers();
  res.status(200).json(success(users));
}
