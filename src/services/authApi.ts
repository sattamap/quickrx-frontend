const API_URL = "https://quickrx-backend.onrender.com/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "doctor" | "admin";
  isActive: boolean;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshTokenExpiresAt: string;
  };
  message?: string;
}

interface MeResponse {
  success: boolean;
  data: AuthUser;
}

const getErrorMessage = async (
  response: Response,
): Promise<string> => {
  try {
    const result = await response.json();

    return (
      result.message ||
      "Authentication request failed."
    );
  } catch {
    return "Authentication request failed.";
  }
};

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

/**
 * Login.
 *
 * The refresh token is NOT returned to JavaScript.
 * It is stored by the backend in an HttpOnly cookie.
 */
export const login = async (
  data: LoginInput,
): Promise<AuthResponse["data"]> => {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  const result: AuthResponse =
    await response.json();

  return result.data;
};

/**
 * Register a new doctor account.
 */
export const register = async (
  data: RegisterInput,
): Promise<AuthUser> => {
  const response = await fetch(
    `${API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  const result = await response.json();

  return result.data;
};

/**
 * Read the CSRF token from the browser cookie.
 *
 * The refresh token cannot be read because it is HttpOnly.
 * The CSRF token intentionally can be read by JavaScript.
 */
export const getCsrfToken = (): string | null => {
  const cookies = document.cookie.split(";");

  const csrfCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("quickrx-csrf="),
  );

  if (!csrfCookie) {
    return null;
  }

  return decodeURIComponent(
    csrfCookie
      .trim()
      .substring("quickrx-csrf=".length),
  );
};

/**
 * Refresh the short-lived access token.
 */
export const refreshAccessToken = async (): Promise<
  AuthResponse["data"]
> => {
  const csrfToken = getCsrfToken();

  if (!csrfToken) {
    throw new Error(
      "CSRF token is missing.",
    );
  }

  const response = await fetch(
    `${API_URL}/auth/refresh`,
    {
      method: "POST",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  const result: AuthResponse =
    await response.json();

  return result.data;
};

/**
 * Logout.
 */
export const logout = async (): Promise<void> => {
  const csrfToken = getCsrfToken();

  const response = await fetch(
    `${API_URL}/auth/logout`,
    {
      method: "POST",
      headers: csrfToken
        ? {
            "X-CSRF-Token": csrfToken,
          }
        : undefined,
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }
};

/**
 * Get the currently authenticated user.
 *
 * This endpoint requires a valid access token.
 */
export const getCurrentUser = async (
  accessToken: string,
): Promise<AuthUser> => {
  const response = await fetch(
    `${API_URL}/auth/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  const result: MeResponse =
    await response.json();

  return result.data;
};