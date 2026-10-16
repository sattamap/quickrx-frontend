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

interface CsrfResponse {
  success: boolean;
  data: {
    csrfToken: string;
  };
  message?: string;
}

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const result = await response.json();
    return result.message || "Authentication request failed.";
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
 * Login. The refresh token remains in an HttpOnly cookie.
 */
export const login = async (
  data: LoginInput,
): Promise<AuthResponse["data"]> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: AuthResponse = await response.json();
  return result.data;
};

/**
 * Register a new doctor account.
 */
export const register = async (data: RegisterInput): Promise<AuthUser> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result = await response.json();
  return result.data;
};

/**
 * Obtain a CSRF token from the backend.
 *
 * The backend validates the refresh-session cookie and
 * issues a token matching the session's stored hash.
 * Do not read the backend cookie with document.cookie.
 */
const requestCsrfToken = async (): Promise<string> => {
  const response = await fetch(`${API_URL}/auth/csrf`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: CsrfResponse = await response.json();

  if (!result.data?.csrfToken) {
    throw new Error("The server did not return a CSRF token.");
  }

  return result.data.csrfToken;
};

/**
 * Refresh the short-lived access token.
 * A missing refresh session means the user is unauthenticated.
 */
export const refreshAccessToken = async (): Promise<AuthResponse["data"]> => {
  const csrfResponse = await fetch(`${API_URL}/auth/csrf`, {
    method: "POST",
    credentials: "include",
  });

  if (!csrfResponse.ok) {
    const message = await getErrorMessage(csrfResponse);

    if (isMissingRefreshSession(message)) {
      throw new Error("NO_REFRESH_SESSION");
    }

    throw new Error(message);
  }

  const csrfResult: CsrfResponse = await csrfResponse.json();
  const csrfToken = csrfResult.data?.csrfToken;

  if (!csrfToken) {
    throw new Error("The server did not return a CSRF token.");
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: AuthResponse = await response.json();
  return result.data;
};

/**
 * Logout.
 */
export const logout = async (): Promise<void> => {
  // Obtain a token matching the active refresh session.
  const csrfToken = await requestCsrfToken();

  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
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
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: MeResponse = await response.json();
  return result.data;
};
