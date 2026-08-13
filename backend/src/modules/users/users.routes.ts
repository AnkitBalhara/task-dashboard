import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validateRequest } from "../../middleware/validateRequest";
import { createUserSchema } from "./users.schema";
import * as usersController from "./users.controller";

const router = Router();

router.get("/", asyncHandler(usersController.getUsers));
router.post("/", validateRequest({ body: createUserSchema }), asyncHandler(usersController.postUser));

export default router;
