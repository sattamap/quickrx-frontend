const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "doctor" | "admin" | "receptionist";
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

const isMissingRefreshSession = (message: string): boolean => {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("refresh session is missing") ||
    normalizedMessage.includes("invalid or expired refresh session.")
  );
};

const withAuthLock = async <T>(callback: () => Promise<T>): Promise<T> => {
  if (!navigator.locks) {
    // Fallback for browsers without Web Locks support.
    return callback();
  }

  return navigator.locks.request(
    "quickrx-auth-session",
    { mode: "exclusive" },
    callback,
  );
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
  return withAuthLock(async () => {
    // Retry once if another request has already rotated the session.
    for (let attempt = 0; attempt < 2; attempt++) {
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

      // Retry the complete CSRF + refresh flow once on a race conflict.
      if (response.status === 409 && attempt === 0) {
        continue;
      }

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const result: AuthResponse = await response.json();
      return result.data;
    }

    throw new Error("Refresh request could not be completed. Please retry.");
  });
};

/**
 * Logout.
 */
export const logout = async (): Promise<void> => {
  return withAuthLock(async () => {
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
  });
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
