"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center py-4">
        <p className="text-stone-500 text-sm mb-4">
          This reset link is invalid. Please request a new one.
        </p>
        <Link href="/forgot-password" className="text-stone-900 font-medium hover:underline text-sm">
          Request a new link →
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setDone(true);
      // Redirect to login after 2.5 seconds
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-6 w-6 text-green-500" />
        </div>
        <h2 className="font-serif text-xl font-semibold text-stone-900 mb-2">
          Password updated
        </h2>
        <p className="text-stone-500 text-sm">
          Redirecting you to sign in…
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-serif text-2xl font-semibold text-stone-900 mb-1">
        Choose a new password
      </h1>
      <p className="text-stone-500 text-sm mb-8">
        Must be at least 8 characters.
      </p>

      {error && (
        <div className="mb-5 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
          {error.includes("expired") && (
            <span>
              {" "}
              <Link href="/forgot-password" className="font-medium underline underline-offset-2">
                Request a new link
              </Link>
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-stone-700 text-sm font-medium">
            New password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="h-11 bg-stone-50 border-stone-200 focus:border-stone-400 focus:ring-0"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm" className="text-stone-700 text-sm font-medium">
            Confirm password
          </Label>
          <Input
            id="confirm"
            type="password"
            placeholder="Repeat password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            className="h-11 bg-stone-50 border-stone-200 focus:border-stone-400 focus:ring-0"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-stone-900 text-white hover:bg-stone-800 rounded-xl"
        >
          {loading ? "Updating…" : "Update password"}
          {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="text-center text-stone-500 text-sm mt-6">
          <Link href="/login" className="text-stone-600 hover:text-stone-900 transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
