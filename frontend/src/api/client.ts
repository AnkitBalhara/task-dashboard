import axios, { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Normalizes every failure into a plain Error whose `message` is the
 * server-provided message when available, so calling code never has to
 * reach into `error.response.data.error.message` itself.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const serverMessage = error.response?.data?.error?.message;
    const normalized = new Error(serverMessage ?? error.message ?? "Unexpected network error");
    (normalized as Error & { details?: unknown }).details = error.response?.data?.error?.details;
    (normalized as Error & { status?: number }).status = error.response?.status;
    return Promise.reject(normalized);
  }
);

export default apiClient;
