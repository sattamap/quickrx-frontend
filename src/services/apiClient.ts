import { refreshAccessToken } from "./authApi";

const API_BASE_URL = "http://localhost:5000/api";

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getAccessToken = (): string | null => {
  return accessToken;
};

export const clearAccessToken = (): void => {
  accessToken = null;
};

const getFreshAccessToken = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .then((result) => {
        setAccessToken(result.accessToken);
        return result.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export const apiRequest = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const { requiresAuth = true, ...fetchOptions } = options;

  const makeRequest = async (token: string | null): Promise<Response> => {
    const headers = new Headers(fetchOptions.headers);

    if (fetchOptions.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (requiresAuth && token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: "include",
    });
  };

  let response = await makeRequest(accessToken);

  // Access token expired → refresh → retry once
  if (requiresAuth && response.status === 401) {
    try {
      const newToken = await getFreshAccessToken();
      response = await makeRequest(newToken);
    } catch {
      clearAccessToken();
      throw new Error("Authentication session expired.");
    }
  }

  if (!response.ok) {
    let message = "API request failed.";

    try {
      const errorData = (await response.json()) as ApiResponse<unknown>;
      message = errorData.message || message;
    } catch {
      // Keep default message
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const result = (await response.json()) as ApiResponse<T>;

  if (!result.success) {
    throw new Error(result.message || "API request failed.");
  }

  return result.data as T;
};