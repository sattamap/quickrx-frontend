import { useState, type SyntheticEvent } from "react";

import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";

interface LoginLocationState {
  from?: {
    pathname: string;
    search?: string;
    hash?: string;
  };
}

const Login = () => {
  const { login, user, isAuthenticated, isLoading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  const registrationSuccess = location.state?.registrationSuccess as
    | string
    | undefined;

  /**
   * If the user is already authenticated,
   * don't show the login page.
   */
  if (!isLoading && isAuthenticated) {
    return (
      <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />
    );
  }

  const locationState = location.state as LoginLocationState | null;

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const authenticatedUser = await login({
        email: email.trim(),
        password,
      });

      const from = locationState?.from;

      if (from?.pathname) {
        const requestedAdminPage = from.pathname.startsWith("/admin");

        if (
          (authenticatedUser.role === "admin" && requestedAdminPage) ||
          (authenticatedUser.role === "doctor" && !requestedAdminPage)
        ) {
          navigate(`${from.pathname}${from.search ?? ""}${from.hash ?? ""}`, {
            replace: true,
          });
        } else {
          navigate(
            authenticatedUser.role === "admin" ? "/admin" : "/dashboard",
            { replace: true },
          );
        }
      } else {
        navigate(authenticatedUser.role === "admin" ? "/admin" : "/dashboard", {
          replace: true,
        });
      }
    } catch (loginError) {
      console.error("Login failed:", loginError);

      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to login. Please check your email and password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white">
              QR
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              QuickRx
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Secure prescription and patient management
            </p>
          </div>

          {/* Login card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {registrationSuccess && (
              <div
                role="status"
                className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                {registrationSuccess}
              </div>
            )}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>

              <p className="mt-1 text-sm text-slate-500">
                Sign in to continue to your QuickRx workspace.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="doctor@example.com"
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !email.trim() || !password}
                className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
          <div className="mt-6 border-t border-gray-100 pt-5 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Create an account
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            QuickRx • Secure clinical workflow
          </p>

          <p className="mt-2 text-center text-sm text-slate-500">
            Developed by{" "}
            <a
              href="https://sattam-portfolio.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-700  decoration-slate-300 underline-offset-4 transition hover:text-blue-600 hover:decoration-blue-600"
            >
              Sattam
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
