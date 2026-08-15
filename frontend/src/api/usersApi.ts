import apiClient from "./client";
import type { CreateUserInput, User } from "@types";

export const usersApi = {
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<{ data: User[] }>("/users");
    return response.data.data;
  },

  async create(input: CreateUserInput): Promise<User> {
    const response = await apiClient.post<{ data: User }>("/users", input);
    return response.data.data;
  },
};

export default usersApi;
