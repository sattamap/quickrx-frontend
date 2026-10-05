import { refreshAccessToken } from "./authApi";

const API_BASE_URL = "http://localhost:5000/api";

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

interface ApiValidationError {
  field: string;
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiValidationError[];
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

/**
 * Get a fresh access token.
 *
 * The shared promise prevents multiple API requests that
 * receive 401 at the same time from creating multiple
 * refresh requests.
 */
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

/**
 * Convert backend validation errors into a useful
 * human-readable message.
 *
 * Example:
 *
 * Validation failed:
 * Name: Patient name must be at least 2 characters long.
 * Age: Age cannot be negative.
 */
const getApiErrorMessage = (
  responseData: ApiResponse<unknown>,
): string => {
  if (
    responseData.errors &&
    responseData.errors.length > 0
  ) {
    const validationMessages =
      responseData.errors
        .map((error) => {
          const fieldName = error.field
            ? error.field
            : "Field";

          return `${fieldName}: ${error.message}`;
        })
        .join("\n");

    return `${
      responseData.message || "Validation failed."
    }\n${validationMessages}`;
  }

  return (
    responseData.message ||
    "API request failed."
  );
};

export interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export const apiRequest = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const {
    requiresAuth = true,
    ...fetchOptions
  } = options;

  const makeRequest = async (
    token: string | null,
  ): Promise<Response> => {
    const headers = new Headers(
      fetchOptions.headers,
    );

    if (
      fetchOptions.body &&
      !headers.has("Content-Type")
    ) {
      headers.set(
        "Content-Type",
        "application/json",
      );
    }

    if (requiresAuth && token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`,
      );
    }

    return fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...fetchOptions,
        headers,
        credentials: "include",
      },
    );
  };

  let response = await makeRequest(accessToken);

  /**
   * If the access token expired, try to refresh it
   * and retry the original request once.
   */
  if (
    requiresAuth &&
    response.status === 401
  ) {
    try {
      const newToken =
        await getFreshAccessToken();

      response = await makeRequest(newToken);
    } catch {
      clearAccessToken();

      throw new Error(
        "Authentication session expired.",
      );
    }
  }

  /**
   * Handle API errors.
   */
  if (!response.ok) {
    let message = "API request failed.";

    try {
      const errorData =
        (await response.json()) as ApiResponse<unknown>;

      message = getApiErrorMessage(errorData);
    } catch {
      // Keep the default message when the response
      // isn't valid JSON.
    }

    throw new Error(message);
  }

  /**
   * DELETE endpoints may return HTTP 204.
   */
  if (response.status === 204) {
    return undefined as T;
  }

  const result =
    (await response.json()) as ApiResponse<T>;

  if (!result.success) {
    throw new Error(
      getApiErrorMessage(result),
    );
  }

  return result.data as T;
};