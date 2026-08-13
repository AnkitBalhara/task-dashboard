import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import * as externalController from "./external.controller";

const router = Router();

// GET /api/external/users - demonstrates integrating a third-party public API
// (JSONPlaceholder), including timeout handling and a short-lived cache to
// respect the upstream service.
router.get("/users", asyncHandler(externalController.getExternalUsers));

export default router;
