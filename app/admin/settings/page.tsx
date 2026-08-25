"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const TIER_MONTHS = [3, 6, 12];
type Tier = { months: number; price: number; mrp: number };

const emptyForm = {
  contactEmail: "preppfirdaus@gmail.com",
  whatsappNumber: "918800620321",
  phoneNumber: "+91 88006 20321",
  officeAddress: "MC.015.0075, Lalu Kirana Gali, Munger, Bihar 811201, India",
  mockTestTiers: [] as Tier[],
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setForm({
            contactEmail: data.settings.contactEmail ?? "",
            whatsappNumber: data.settings.whatsappNumber ?? "",
            phoneNumber: data.settings.phoneNumber ?? "",
            officeAddress: data.settings.officeAddress ?? "",
            mockTestTiers: data.settings.mockTestTiers ?? [],
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function tierValue(months: number, field: "price" | "mrp"): number {
    return form.mockTestTiers.find((t) => t.months === months)?.[field] ?? 0;
  }

  function setTierValue(months: number, field: "price" | "mrp", value: number) {
    const others = form.mockTestTiers.filter((t) => t.months !== months);
    const current = form.mockTestTiers.find((t) => t.months === months) ?? { months, price: 0, mrp: 0 };
    setForm({ ...form, mockTestTiers: [...others, { ...current, [field]: value }].sort((a, b) => a.months - b.months) });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, mockTestTiers: form.mockTestTiers.filter((t) => t.price > 0) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save settings");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-white/50 py-16 text-center">Loading…</div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Contact settings</h1>
      <p className="mt-1 text-sm text-white/50">
        Shown in the footer, the homepage "Get in touch" section, the floating WhatsApp button, and the
        Contact Us page (needed for payment gateway approval).
      </p>

      <form onSubmit={save} className="mt-6 max-w-xl rounded-card border border-white/10 bg-white/5 p-6 grid gap-4">
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div>
          <label className="text-xs font-semibold text-white/50 mb-1.5 block">Contact email</label>
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            className={inputClass}
            placeholder="firdaus@example.com"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-white/50 mb-1.5 block">WhatsApp number</label>
          <input
            value={form.whatsappNumber}
            onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
            className={inputClass}
            placeholder="919000012345 (country code, digits only, no + or spaces)"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-white/50 mb-1.5 block">Phone number (displayed)</label>
          <input
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            className={inputClass}
            placeholder="+91 90000 12345"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-white/50 mb-1.5 block">Operational office address</label>
          <textarea
            value={form.officeAddress}
            onChange={(e) => setForm({ ...form, officeAddress: e.target.value })}
            className={inputClass}
            rows={3}
            placeholder="Full address shown on the Contact Us page"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          {saved && <span className="text-xs text-green-400">Saved</span>}
        </div>
      </form>

      <h2 className="mt-10 font-display text-xl font-bold text-white">Mock test pricing</h2>
      <p className="mt-1 text-sm text-white/50">
        Site-wide access pass to attempt any mock test — shown on the homepage. Leave a row's price at 0 to not offer that plan.
      </p>

      <form onSubmit={save} className="mt-6 max-w-xl rounded-card border border-white/10 bg-white/5 p-6">
        <div className="grid grid-cols-3 gap-3">
          {TIER_MONTHS.map((months) => (
            <div key={months} className="rounded-xl border border-white/10 p-3">
              <p className="text-xs font-semibold text-white/60 mb-2">{months} months</p>
              <label className="text-[11px] text-white/40">Price (₹)</label>
              <input
                type="number"
                min={0}
                value={tierValue(months, "price")}
                onChange={(e) => setTierValue(months, "price", Number(e.target.value))}
                className={`${inputClass} mt-1`}
              />
              <label className="text-[11px] text-white/40 mt-2 block">MRP (₹)</label>
              <input
                type="number"
                min={0}
                value={tierValue(months, "mrp")}
                onChange={(e) => setTierValue(months, "mrp", Number(e.target.value))}
                className={`${inputClass} mt-1`}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save pricing"}</Button>
          {saved && <span className="text-xs text-green-400">Saved</span>}
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-400 placeholder:text-white/30";
