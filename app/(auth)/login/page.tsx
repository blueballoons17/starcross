"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        // Check if they have a profile
        const profileRes = await fetch("/api/profile");
        const profileData = await profileRes.json();
        if (profileData?.profile) {
          router.push("/discover");
        } else {
          router.push("/onboarding");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-10 group">
          <Star className="h-4 w-4 text-stone-700 fill-stone-700/30" />
          <span
            className="text-base font-medium text-stone-900 uppercase tracking-[0.18em]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            StarCross
          </span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <h1 className="font-serif text-2xl font-semibold text-stone-900 mb-1">Welcome back</h1>
          <p className="text-stone-500 text-sm mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-5 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-stone-700 text-sm font-medium">Email</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-stone-700 text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-11 bg-stone-50 border-stone-200 focus:border-stone-400 focus:ring-0"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-stone-900 text-white hover:bg-stone-800 rounded-xl"
            >
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </form>
        </div>

        <p className="text-center text-stone-500 text-sm mt-6">
          New to StarCross?{" "}
          <Link href="/signup" className="text-stone-900 font-medium hover:underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
