import type { Request, Response } from "express";
import { buildMeta, success, successWithMeta } from "../../utils/ApiResponse";
import * as tasksService from "./tasks.service";
import type { ListTasksQuerySchemaInput } from "./tasks.schema";

export async function getTasks(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ListTasksQuerySchemaInput;
  const { items, total, page, limit } = await tasksService.listTasks(query);
  res.status(200).json(successWithMeta(items, buildMeta(total, page, limit)));
}

export async function getTask(req: Request, res: Response): Promise<void> {
  const task = await tasksService.getTaskById(req.params.id);
  res.status(200).json(success(task));
}

export async function postTask(req: Request, res: Response): Promise<void> {
  const task = await tasksService.createTask(req.body);
  res.status(201).json(success(task));
}

export async function putTask(req: Request, res: Response): Promise<void> {
  const task = await tasksService.updateTask(req.params.id, req.body);
  res.status(200).json(success(task));
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  await tasksService.deleteTask(req.params.id);
  res.status(204).send();
}
