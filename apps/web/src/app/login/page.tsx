"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLogin } from "@/lib/queries/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: login, isPending, error } = useLogin();

  const errorMsg =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error as any)?.response?.data?.error?.message ?? (error ? "Login failed" : null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login({ email, password });
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Top bar */}
      <div className="border-b border-[#2A2A2A] px-6 h-14 flex items-center">
        <Link href="/" className="font-mono text-sm text-[#FF5C00] font-bold tracking-widest uppercase hover:text-[#CC4A00] transition-colors">
          ← DUS
        </Link>
      </div>

      {/* Form area */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Header */}
          <div className="mb-10">
            <p className="font-mono text-xs text-[#FF5C00] uppercase tracking-widest mb-2">
              Authentication
            </p>
            <h1 className="font-sans font-black text-4xl text-[#F0EBE1] tracking-tight">
              Sign in.
            </h1>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="mb-6 border border-[#ef4444] px-4 py-3 bg-[#ef444411]">
              <p className="font-mono text-xs text-[#ef4444]">
                ✗ {errorMsg}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isPending}
              className="mt-2 w-full"
            >
              {isPending ? "Authenticating..." : "Sign in →"}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 font-mono text-xs text-[#555555] text-center">
            No account?{" "}
            <Link href="/register" className="text-[#FF5C00] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="border-t border-[#2A2A2A] px-6 py-4 flex items-center gap-2">
        <div className="font-mono text-xs text-[#333333]">
          RS256 · JWT · 15m access · 7d refresh
        </div>
      </div>
    </main>
  );
}
