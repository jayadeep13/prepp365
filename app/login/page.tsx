"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithPassword } from "@/lib/auth/client-actions";
import { friendlyAuthError } from "@/lib/auth/friendly-error";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithPassword(email, password);
      router.push(nextPath);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-brand-gradient p-12 text-white relative overflow-hidden">
        <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <Link href="/" className="flex items-center gap-2 relative">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
            <GraduationCap size={20} />
          </span>
          <span className="font-display text-xl font-bold">Prepp365</span>
        </Link>
        <div className="relative">
          <h2 className="font-display text-3xl font-bold leading-tight max-w-sm">
            Welcome back. Your batch, your streak, your rank — right where you left them.
          </h2>
          <ul className="mt-8 space-y-3 text-sm text-white/85">
            <li>✓ Pick up exactly where you left off</li>
            <li>✓ Doubt support directly from Firdaus</li>
            <li>✓ Watch anytime, on any device</li>
          </ul>
        </div>
        <p className="relative text-xs text-white/50">© {new Date().getFullYear()} Prepp365. Your Prep App.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold text-ink">Log in to Prepp365</h1>
          <p className="mt-1.5 text-sm text-ink-soft">Continue your prep where you left off.</p>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handlePasswordLogin}>
            <div>
              <label className="text-xs font-semibold text-ink-soft mb-1.5 block">Email</label>
              <div className="flex items-center gap-2 rounded-xl border border-surface-line px-3.5 py-2.5 focus-within:border-purple-400">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent text-sm outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft mb-1.5 block">Password</label>
              <div className="flex items-center gap-2 rounded-xl border border-surface-line px-3.5 py-2.5 focus-within:border-purple-400">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-sm outline-none"
                  required
                />
              </div>
              <div className="mt-1.5 text-right">
                <Link href="#" className="text-xs font-semibold text-purple-600">Forgot password?</Link>
              </div>
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full group h-14 text-base" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-ink-soft">
            New here? Creating an account is free —{" "}
            <Link href="/register" className="font-semibold text-purple-600">create your account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
