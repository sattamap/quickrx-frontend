/*
 * Central place for backend configuration.
 *
 * While the app runs on localStorage this file is barely used. Once the
 * Express API exists, every service will call `request()` instead of the
 * storage helpers, and this is the only file that needs to know the base
 * URL, auth headers, or error shape.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

/*
 * Simulates network latency so loading states are actually exercised
 * during development. Set to 0 to disable.
 */
const FAKE_LATENCY_MS = 120;

export function delay(ms: number = FAKE_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
 * Not used yet — kept here so the eventual swap is obvious.
 *
 * export async function request<T>(
 *   path: string,
 *   options: RequestInit = {},
 * ): Promise<T> {
 *   const response = await fetch(`${API_BASE_URL}${path}`, {
 *     ...options,
 *     headers: {
 *       "Content-Type": "application/json",
 *       ...options.headers,
 *     },
 *   });
 *
 *   if (!response.ok) {
 *     throw new Error(`Request failed: ${response.status}`);
 *   }
 *
 *   return response.json() as Promise<T>;
 * }
 */