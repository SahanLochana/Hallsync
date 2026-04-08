"use client";

/**
 * LOGIN PAGE — View (MVC)
 * Pure UI layer. All business logic is delegated to authController.js.
 * State shape is defined in authModel.js.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, Landmark } from "lucide-react";

import { initialLoginState } from "../../../models/authModel";
import {
  handleEmailChange,
  handlePasswordChange,
  handleTogglePassword,
  handleLogin,
  handleForgotPassword,
} from "../../../controllers/authController";

export default function LoginPage() {
  const router = useRouter();

  // ── Local state (shape from model) ──────────────────────────────────────
  const [email, setEmail] = useState(initialLoginState.email);
  const [password, setPassword] = useState(initialLoginState.password);
  const [showPassword, setShowPassword] = useState(initialLoginState.showPassword);
  const [isLoading, setIsLoading] = useState(initialLoginState.isLoading);
  const [error, setError] = useState(initialLoginState.error);

  // ── Form submit ──────────────────────────────────────────────────────────
  function onSubmit(e) {
    e.preventDefault();
    // Calls: handleLogin (authController) → validateLoginForm (authModel) → loginService (TODO)
    handleLogin({
      email,
      password,
      setError,
      setIsLoading,
      onSuccess: () => router.push("/dashboard"), // navigate after successful login
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#e2e8f0] flex items-center justify-between px-10 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-[#1e3b8a] w-10 h-10 rounded-2xl flex items-center justify-center shrink-0">
            <Landmark size={20} color="white" strokeWidth={2} />
          </div>
          <span className="text-[#0f172a] font-bold text-[18px] tracking-tight">HallSync</span>
        </div>

        {/* Support button */}
        <button
          id="btn-support"
          className="bg-[#f1f5f9] text-[#334155] font-semibold text-sm px-4 h-10 rounded-2xl hover:bg-[#e2e8f0] transition-colors"
          onClick={() => {/* TODO: handleSupportClick — navigate to support page */}}
        >
          Support
        </button>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="bg-white border border-[#e2e8f0] rounded-3xl shadow-[0_20px_25px_-5px_rgba(226,232,240,0.5),0_8px_10px_-6px_rgba(226,232,240,0.5)] w-full max-w-[440px] overflow-hidden">

          {/* Card header */}
          <div className="flex flex-col items-center px-8 pt-8 pb-4">
            {/* Icon badge */}
            <div className="bg-[rgba(30,59,138,0.1)] w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Landmark size={30} color="#1e3b8a" strokeWidth={1.75} />
            </div>

            {/* Title */}
            <h1 className="text-[#0f172a] font-bold text-2xl tracking-tight mb-2">
              Admin Login
            </h1>

            {/* Subtitle */}
            <p className="text-[#64748b] text-sm text-center leading-5">
              Faculty Lecture Hall Management and Smart Scheduling System
            </p>
          </div>

          {/* ── FORM ──────────────────────────────────────────────────── */}
          <form
            id="login-form"
            onSubmit={onSubmit}
            className="flex flex-col gap-5 px-8 pt-4 pb-12"
          >

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="input-email"
                className="text-[#334155] font-semibold text-sm"
              >
                University Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                  <Mail size={16} />
                </span>
                <input
                  id="input-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@university.edu"
                  value={email}
                  onChange={(e) => handleEmailChange(e, setEmail, setError)}
                  className="w-full bg-white border border-[#e2e8f0] rounded-2xl pl-10 pr-4 py-3.5 text-[#0f172a] text-base placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="input-password"
                  className="text-[#334155] font-semibold text-sm"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                  <Lock size={16} />
                </span>
                <input
                  id="input-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e, setPassword, setError)}
                  className="w-full bg-white border border-[#e2e8f0] rounded-2xl pl-10 pr-11 py-3.5 text-[#0f172a] text-base placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition"
                />
                {/* Toggle password visibility */}
                <button
                  id="btn-toggle-password"
                  type="button"
                  onClick={() => handleTogglePassword(setShowPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b] transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end -mt-2">
              <button
                id="btn-forgot-password"
                type="button"
                onClick={() =>
                  handleForgotPassword(() => router.push("/forgot-password"))
                  // TODO: handleForgotPassword — navigate to forgot-password page
                }
                className="text-[#1e3b8a] font-semibold text-xs hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                id="btn-login"
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1e3b8a] text-white font-bold text-base rounded-2xl py-3.5 flex items-center justify-center gap-2 shadow-[0_10px_15px_-3px_rgba(30,59,138,0.2),0_4px_6px_-4px_rgba(30,59,138,0.2)] hover:bg-[#162d6b] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  /* Loading spinner */
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                ) : (
                  <>
                    Sign In to Dashboard
                    <LogIn size={16} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-[#e2e8f0] flex items-center justify-between px-10 py-6">
        <p className="text-[#64748b] text-xs">
          © 2026 HallSync. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
