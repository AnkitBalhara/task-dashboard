import apiClient from "./client";
import type { DashboardStats } from "../types";

export const dashboardApi = {
  async getStats(userId?: string): Promise<DashboardStats> {
    const response = await apiClient.get<{ data: DashboardStats }>("/dashboard", {
      params: userId ? { userId } : undefined,
    });
    return response.data.data;
  },
};

export default dashboardApi;
