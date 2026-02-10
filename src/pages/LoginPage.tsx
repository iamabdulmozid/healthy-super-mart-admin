import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { LoginRequest } from "@/types/auth";
import type { ApiError } from "@/lib/api-client";
import { Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await login(formData);
      // Navigation will be handled by useAuth context
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.errors) {
        // Convert string[] to string for each field
        const formattedErrors: Record<string, string> = {};
        Object.entries(apiError.errors).forEach(([key, messages]) => {
          formattedErrors[key] = Array.isArray(messages)
            ? messages[0]
            : messages;
        });
        setErrors(formattedErrors);
      } else {
        setErrors({
          general: apiError.message || "Login failed. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div
        className="max-w-md w-full space-y-8"
        style={{ maxWidth: "28rem", width: "100%" }}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 sm:p-8 lg:p-10">
          {/* Welcome Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Sign in to your admin account
            </p>
          </div>

          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
            style={{ width: "100%" }}
          >
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-900 mb-1">
                      Authentication Failed
                    </h4>
                    <p className="text-sm text-red-700">{errors.general}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4" style={{ width: "100%" }}>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      minWidth: "100%",
                    }}
                    className={`mt-1 appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-neutral-200 bg-white"
                    } placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base transition-all duration-200`}
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      minWidth: "100%",
                    }}
                    className={`mt-1 appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                      errors.password
                        ? "border-red-300 bg-red-50"
                        : "border-neutral-200 bg-white"
                    } placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base transition-all duration-200`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.password && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ width: "100%", maxWidth: "100%" }}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm sm:text-base font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in to Dashboard"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            © 2026 Healthy Super Mart. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
