import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validateRequest } from "../../middleware/validateRequest";
import { createTaskSchema, listTasksQuerySchema, updateTaskSchema } from "./tasks.schema";
import * as tasksController from "./tasks.controller";
import commentsRouter from "../comments/comments.routes";

const router = Router();

router.get("/", validateRequest({ query: listTasksQuerySchema }), asyncHandler(tasksController.getTasks));
router.get("/:id", asyncHandler(tasksController.getTask));
router.post("/", validateRequest({ body: createTaskSchema }), asyncHandler(tasksController.postTask));
router.put("/:id", validateRequest({ body: updateTaskSchema }), asyncHandler(tasksController.putTask));
router.delete("/:id", asyncHandler(tasksController.deleteTask));

// Mounted here (rather than app.ts) so the comments router can read the
// task id as req.params.id via mergeParams: /api/tasks/:id/comments
router.use("/:id/comments", commentsRouter);

export default router;
