import axios, { AxiosError, type AxiosInstance } from "axios";
import { env } from "@/config/env";
import { ApiError } from "@/lib/http-error";

/**
 * Global Axios client for Bearer Token authentication.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${env.apiUrl}/api/v1`,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * Automatically attach Bearer token to every authenticated request.
 */
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

interface ErrorEnvelope {
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    requestId?: string;
  };
}

/**
 * Normalize every API error into ApiError.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorEnvelope>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;

    const normalized = new ApiError({
      code:
        body?.error?.code ??
        (status === 0 ? "NETWORK_ERROR" : "REQUEST_FAILED"),
      message:
        body?.error?.message ??
        (status === 0
          ? "Unable to reach the server. Check your connection and try again."
          : "Something went wrong. Please try again."),
      details: body?.error?.details,
      status,
      requestId: body?.meta?.requestId,
    });

    return Promise.reject(normalized);
  }
);