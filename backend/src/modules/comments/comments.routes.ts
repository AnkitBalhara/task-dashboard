import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validateRequest } from "../../middleware/validateRequest";
import { createCommentSchema } from "./comments.schema";
import * as commentsController from "./comments.controller";

// mergeParams so req.params.id (the task id) is available when mounted at
// /api/tasks/:id/comments (see tasks.routes.ts)
const router = Router({ mergeParams: true });

router.get("/", asyncHandler(commentsController.getComments));
router.post("/", validateRequest({ body: createCommentSchema }), asyncHandler(commentsController.postComment));

export default router;
