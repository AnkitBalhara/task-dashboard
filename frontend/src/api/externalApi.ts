import apiClient from "./client";
import type { ExternalUser } from "@types";

export const externalApi = {
  async getUsers(): Promise<ExternalUser[]> {
    const response = await apiClient.get<{ data: ExternalUser[] }>("/external/users");
    return response.data.data;
  },
};

export default externalApi;
