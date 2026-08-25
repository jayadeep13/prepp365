"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Phone, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Profile = { name: string; email?: string; phone?: string; address?: string; referralCode?: string };

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user);
          setName(data.user.name ?? "");
          setPhone(data.user.phone ?? "");
          setAddress(data.user.address ?? "");
        } else {
          setError(data.error ?? "Could not load your profile.");
        }
      })
      .catch(() => setError("Could not load your profile."));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true);
      if (next) router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="font-display text-2xl font-bold text-ink">Profile</h1>
      <p className="mt-1 text-sm text-ink-soft">Update your name and phone number.</p>

      {next && (
        <div className="mt-5 flex items-start gap-2 rounded-xl bg-purple-50 border border-purple-100 px-3.5 py-2.5 text-xs text-purple-700">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>Add your phone number and address to continue with your purchase.</span>
        </div>
      )}

      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-xs text-red-700">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {profile && (
        <form className="mt-6 space-y-4" onSubmit={handleSave}>
          <div>
            <label className="text-xs font-semibold text-ink-soft mb-1.5 block">Full name</label>
            <div className="flex items-center gap-2 rounded-xl border border-surface-line px-3.5 py-2.5 focus-within:border-purple-400">
              <User size={16} className="text-ink-faint" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft mb-1.5 block">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-surface-line bg-surface-tint px-3.5 py-2.5">
              <span className="text-sm text-ink-faint">{profile.email ?? "Not set"}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft mb-1.5 block">Phone</label>
            <div className="flex items-center gap-2 rounded-xl border border-surface-line px-3.5 py-2.5 focus-within:border-purple-400">
              <Phone size={16} className="text-ink-faint" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Add a phone number"
                className="flex-1 bg-transparent text-sm outline-none"
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
                placeholder="Add your address (needed before purchasing a course)"
                rows={2}
                className="flex-1 bg-transparent text-sm outline-none resize-none"
              />
            </div>
          </div>

          {profile.referralCode && (
            <div>
              <label className="text-xs font-semibold text-ink-soft mb-1.5 block">Your referral code</label>
              <div className="rounded-xl border border-surface-line bg-surface-tint px-3.5 py-2.5 font-mono text-sm text-purple-700">
                {profile.referralCode}
              </div>
            </div>
          )}

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
          </Button>
          {saved && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
              <CheckCircle2 size={13} /> Profile updated
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  );
}
