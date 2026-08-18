"use client";

/**
 * LOGIN PAGE — View (MVC)
 * Pure UI layer. All business logic is delegated to authController.js.
 * State shape is defined in authModel.js.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import logoImg from "@/assets/logo.jpg";

import { initialLoginState } from "../../../models/authModel";
import {
  handleAdminIdChange,
  handlePasswordChange,
  handleTogglePassword,
  handleLogin,
  handleForgotPassword,
  verifyAdminSession,
} from "../../../controllers/authController";

export default function LoginPage() {
  const router = useRouter();

  // ── Local state ──────────────────────────────────────────────────────────
  const [adminId, setAdminId] = useState(initialLoginState.adminId);
  const [password, setPassword] = useState(initialLoginState.password);
  const [showPassword, setShowPassword] = useState(
    initialLoginState.showPassword,
  );
  const [isLoading, setIsLoading] = useState(initialLoginState.isLoading);
  const [error, setError] = useState(initialLoginState.error);

  // If already logged in, automatically redirect to /dashboard
  useEffect(() => {
    async function checkExistingAuth() {
      const valid = await verifyAdminSession();
      if (valid) {
        router.push("/dashboard");
      }
    }
    checkExistingAuth();
  }, [router]);

  // ── Form submit ──────────────────────────────────────────────────────────
  function onSubmit(e) {
    e.preventDefault();
    handleLogin({
      adminId,
      password,
      setError,
      setIsLoading,
      setAdminId,
      setPassword,
      onSuccess: () => router.push("/dashboard"),
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#e2e8f0] flex items-center justify-between px-10 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0 shadow-sm border border-[#e2e8f0]/80">
            <Image
              src={logoImg}
              alt="HallSync Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <span className="text-[#0f172a] font-bold text-[18px] tracking-tight">
            HallSync
          </span>
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="bg-white border border-[#e2e8f0] rounded-3xl shadow-[0_20px_25px_-5px_rgba(226,232,240,0.5),0_8px_10px_-6px_rgba(226,232,240,0.5)] w-full max-w-[440px] overflow-hidden">
          {/* Card header */}
          <div className="flex flex-col items-center px-8 pt-8 pb-4">
            {/* Icon badge */}
            <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center mb-6 shadow-md border border-[#e2e8f0]/80">
              <Image
                src={logoImg}
                alt="HallSync Logo"
                width={64}
                height={64}
                className="w-full h-full object-cover"
                priority
              />
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
            autoComplete="off"
            className="flex flex-col gap-5 px-8 pt-4 pb-12"
          >
            {/* Invisible honeypot fields to trick browser password managers */}
            <input
              type="text"
              name="username"
              style={{
                position: "absolute",
                opacity: 0,
                top: "-9999px",
                left: "-9999px",
              }}
              tabIndex={-1}
              autoComplete="off"
            />
            <input
              type="password"
              name="password"
              style={{
                position: "absolute",
                opacity: 0,
                top: "-9999px",
                left: "-9999px",
              }}
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Admin ID field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="input-admin-id"
                className="text-[#334155] font-semibold text-sm"
              >
                Admin ID
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                  <User size={16} />
                </span>
                <input
                  id="input-admin-id"
                  name="hs_usr_field_x"
                  type="text"
                  autoComplete="off"
                  placeholder="admin"
                  value={adminId}
                  onChange={(e) => handleAdminIdChange(e, setAdminId, setError)}
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
                  name="hs_pwd_field_y"
                  type="text"
                  autoComplete="off"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    handlePasswordChange(e, setPassword, setError)
                  }
                  className={`w-full bg-white border border-[#e2e8f0] rounded-2xl pl-10 pr-11 py-3.5 text-[#0f172a] text-base placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition ${
                    showPassword ? "" : "input-masked"
                  }`}
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

            {/* Submit button */}
            <div className="pt-2">
              <button
                id="btn-login"
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1e3b8a] text-white font-bold text-base rounded-2xl py-3.5 flex items-center justify-center gap-2 shadow-[0_10px_15px_-3px_rgba(30,59,138,0.2),0_4px_6px_-4px_rgba(30,59,138,0.2)] hover:bg-[#162d6b] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
