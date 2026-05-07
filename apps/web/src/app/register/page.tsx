"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRegister } from "@/lib/queries/useAuth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const { mutate: register, isPending, error, isSuccess } = useRegister();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorMsg = (error as any)?.response?.data?.error?.message ?? (error ? "Registration failed" : null);
  const confirmError = confirm && confirm !== password ? "Passwords do not match" : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (confirm !== password) return;
    register({ email, password });
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Top bar */}
      <div className="border-b border-[#2A2A2A] px-6 h-14 flex items-center">
        <Link href="/" className="font-mono text-sm text-[#FF5C00] font-bold tracking-widest uppercase hover:text-[#CC4A00] transition-colors">
          ← DUS
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-10">
            <p className="font-mono text-xs text-[#FF5C00] uppercase tracking-widest mb-2">
              New account
            </p>
            <h1 className="font-sans font-black text-4xl text-[#F0EBE1] tracking-tight">
              Register.
            </h1>
          </div>

          {/* Success */}
          {isSuccess && (
            <div className="mb-6 border border-[#22c55e] px-4 py-3 bg-[#22c55e11]">
              <p className="font-mono text-xs text-[#22c55e]">
                ✓ Account created. Redirecting to login…
              </p>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="mb-6 border border-[#ef4444] px-4 py-3 bg-[#ef444411]">
              <p className="font-mono text-xs text-[#ef4444]">✗ {errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email"
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="min. 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <Input
              label="Confirm password"
              id="reg-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              error={confirmError}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isPending}
              disabled={!!confirmError || isPending}
              className="mt-2 w-full"
            >
              {isPending ? "Creating account..." : "Create account →"}
            </Button>
          </form>

          <p className="mt-8 font-mono text-xs text-[#555555] text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-[#FF5C00] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="border-t border-[#2A2A2A] px-6 py-4">
        <div className="font-mono text-xs text-[#333333]">
          Free plan · 30 req/min · Unlimited links
        </div>
      </div>
    </main>
  );
}
