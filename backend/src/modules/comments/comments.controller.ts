import type { Request, Response } from "express";
import { success } from "../../utils/ApiResponse";
import * as commentsService from "./comments.service";

export async function getComments(req: Request, res: Response): Promise<void> {
  // Mounted at /api/tasks/:id/comments (see tasks.routes.ts), so the task id
  // arrives as req.params.id via the parent router's mergeParams.
  const comments = await commentsService.listByTask(req.params.id);
  res.status(200).json(success(comments));
}

export async function postComment(req: Request, res: Response): Promise<void> {
  const comment = await commentsService.addComment(req.params.id, req.body);
  res.status(201).json(success(comment));
}
