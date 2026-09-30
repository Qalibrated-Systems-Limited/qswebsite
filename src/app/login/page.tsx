'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import type { AxiosError } from "axios";
import { authAPI, authStore } from "@/utils/apiFactory";
import sidePhoto from "@/assets/about.jpg";

// Staff-only sign-in for the admin dashboard. Accounts are created by an admin
// (Dashboard → Users); there is no public sign-up.
export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already signed in → straight to the dashboard.
  useEffect(() => {
    if (authStore.get()) router.replace("/dashboard");
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      if (res.data.token) {
        authStore.set(res.data.token, res.data.user, remember);
        router.push("/dashboard");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ error?: string }>;
      setError(
        err.response?.data?.error ||
          (err.response ? "Login failed. Please try again." : "Can't reach the server. Check your connection."),
      );
    } finally {
      setLoading(false);
    }
  };

  const input =
    "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400";

  return (
    <div className="min-h-screen bg-[#f7f1ea] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2 min-h-[600px]">
        {/* Form side */}
        <div className="flex flex-col px-6 py-8 sm:px-12 sm:py-10">
          <div className="flex items-center justify-between">
            <Link href="/" aria-label="Qalibrated Systems home">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo, no optimisation needed */}
              <img src="/logorange.svg" alt="Qalibrated Systems Limited" className="h-9 w-auto" />
            </Link>
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-700">
              <ArrowLeft size={16} /> Back to website
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center py-10">
            <h1 className="text-3xl font-bold text-[#3b2a1a]">Login</h1>
            <p className="mt-1 text-sm text-gray-500">Staff access to the Qalibrated dashboard.</p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 rounded-xl border border-gray-100 shadow-sm p-6 space-y-4"
              noValidate={false}
            >
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder="Type your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={input}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="Type your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className={`${input} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-3.5 w-3.5 accent-amber-500"
                  />
                  Remember me
                </label>
                <button type="button" onClick={() => setShowForgot((v) => !v)} className="text-gray-600 hover:text-amber-700">
                  Forgot password?
                </button>
              </div>

              {showForgot && (
                <p className="text-xs text-gray-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  For security, passwords are reset by an administrator. Ask your dashboard admin to set a new
                  password for you under Dashboard → Users.
                </p>
              )}

              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 rounded-lg shadow-sm transition disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Logging in…
                  </>
                ) : (
                  "Log in"
                )}
              </button>
            </form>
          </div>

          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Qalibrated Systems Limited</p>
        </div>

        {/* Photo side (hidden on small screens) */}
        <div className="relative hidden md:block">
          <Image
            src={sidePhoto}
            alt="Qalibrated Systems technicians at work on a weighbridge"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 0px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
          <p className="absolute bottom-8 left-8 right-8 text-white text-lg font-semibold drop-shadow">
            Precision weighing, calibration &amp; automation.
          </p>
        </div>
      </div>
    </div>
  );
}
