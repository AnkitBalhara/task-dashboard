import type { Request, Response } from "express";
import { success } from "../../utils/ApiResponse";
import * as usersService from "./users.service";

export async function getUsers(_req: Request, res: Response): Promise<void> {
  const users = await usersService.listUsers();
  res.status(200).json(success(users));
}

export async function postUser(req: Request, res: Response): Promise<void> {
  const user = await usersService.createUser(req.body);
  res.status(201).json(success(user));
}
