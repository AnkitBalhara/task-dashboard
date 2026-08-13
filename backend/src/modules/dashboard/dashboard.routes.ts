import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validateRequest } from "../../middleware/validateRequest";
import { dashboardQuerySchema } from "./dashboard.schema";
import * as dashboardController from "./dashboard.controller";

const router = Router();

router.get("/", validateRequest({ query: dashboardQuerySchema }), asyncHandler(dashboardController.getDashboard));

export default router;
