"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Smartphone, Mail, Lock, Gift, ArrowRight, AlertCircle, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerWithPassword } from "@/lib/auth/client-actions";
import { friendlyAuthError } from "@/lib/auth/friendly-error";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await registerWithPassword(name, email, password, `+91${phone}`, address, referralCode || undefined);
      router.push("/dashboard");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 sm:p-12 order-2 lg:order-1">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold text-ink">Create your account</h1>
          <p className="mt-1.5 text-sm text-ink-soft">Start with any free preview lesson — no card required.</p>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-semibold text-ink-soft mb-1.5 block">Full name</label>
              <div className="flex items-center gap-2 rounded-xl border border-surface-line px-3.5 py-2.5 focus-within:border-purple-400">
                <User size={16} className="text-ink-faint" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="flex-1 bg-transparent text-sm outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-soft mb-1.5 block">Mobile number</label>
              <div className="flex items-center gap-2 rounded-xl border border-surface-line px-3.5 py-2.5 focus-within:border-purple-400">
                <Smartphone size={16} className="text-ink-faint" />
                <span className="text-sm text-ink-faint">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98765 43210"
                  className="flex-1 bg-transparent text-sm outline-none"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-soft mb-1.5 block">Address</label>
              <div className="flex items-start gap-2 rounded-xl border border-surface-line px-3.5 py-2.5 focus-within:border-purple-400">
                <MapPin size={16} className="text-ink-faint mt-0.5" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House no., street, city, state, PIN"
                  rows={2}
                  className="flex-1 bg-transparent text-sm outline-none resize-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-soft mb-1.5 block">Email address</label>
              <div className="flex items-center gap-2 rounded-xl border border-surface-line px-3.5 py-2.5 focus-within:border-purple-400">
                <Mail size={16} className="text-ink-faint" />
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
                <Lock size={16} className="text-ink-faint" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="flex-1 bg-transparent text-sm outline-none"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-soft mb-1.5 block">
                Referral code <span className="text-ink-faint font-normal">(optional)</span>
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-surface-line px-3.5 py-2.5 focus-within:border-purple-400">
                <Gift size={16} className="text-ink-faint" />
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="e.g. PREP365-FRIEND"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-ink-soft">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-surface-line text-purple-600"
              />
              I agree to the <Link href="/terms" target="_blank" className="text-purple-600 font-semibold">Terms of Service</Link> and{" "}
              <Link href="/privacy" target="_blank" className="text-purple-600 font-semibold">Privacy Policy</Link>
            </label>

            <Button type="submit" variant="primary" size="lg" className="w-full group h-14 text-base" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-ink-soft">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-purple-600">Log in</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-col justify-between bg-brand-gradient-warm p-12 text-white relative overflow-hidden order-1 lg:order-2">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <Link href="/" className="flex items-center gap-2 relative">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
            <GraduationCap size={20} />
          </span>
          <span className="font-display text-xl font-bold">Prepp365</span>
        </Link>
        <div className="relative">
          <h2 className="font-display text-3xl font-bold leading-tight max-w-sm">
            One account. Every exam you're preparing for, tracked in one place.
          </h2>
          <ul className="mt-8 space-y-3 text-sm text-white/85">
            <li>✓ Free preview lesson on every course</li>
            <li>✓ Daily current affairs, no login needed to skim</li>
            <li>✓ Cancel or switch batches anytime</li>
          </ul>
        </div>
        <p className="relative text-xs text-white/60">© {new Date().getFullYear()} Prepp365. Your Prep App.</p>
      </div>
    </div>
  );
}
