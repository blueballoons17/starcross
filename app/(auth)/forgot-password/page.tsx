"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      // Always show success — we never reveal whether an account exists
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <Star className="h-4 w-4 text-stone-700 fill-stone-700/30" />
          <span
            className="text-base font-medium text-stone-900 uppercase tracking-[0.18em]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Kindred Stars
          </span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <Star className="h-5 w-5 text-indigo-500 fill-indigo-200" />
              </div>
              <h1 className="font-serif text-xl font-semibold text-stone-900 mb-2">
                Check your inbox
              </h1>
              <p className="text-stone-500 text-sm leading-relaxed">
                If an account exists for <strong>{email.trim().toLowerCase()}</strong>,
                you&apos;ll receive a reset link within a minute.
              </p>
              <p className="text-stone-400 text-xs mt-4">
                The link expires in 1 hour.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-serif text-2xl font-semibold text-stone-900 mb-1">
                Forgot password?
              </h1>
              <p className="text-stone-500 text-sm mb-8">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {error && (
                <div className="mb-5 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-stone-700 text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="h-11 bg-stone-50 border-stone-200 focus:border-stone-400 focus:ring-0"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-stone-900 text-white hover:bg-stone-800 rounded-xl"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-stone-500 text-sm mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
