"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type CouponRow = {
  _id: string;
  code: string;
  discountType: "percent" | "flat";
  value: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
};

const emptyForm = { code: "", discountType: "percent" as "percent" | "flat", value: 10, maxUses: "", expiresAt: "" };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/coupons")
      .then((res) => res.json())
      .then((data) => setCoupons(data.coupons ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setCoupons((prev) => prev.map((c) => (c._id === id ? { ...c, isActive: !isActive } : c)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    setCoupons((prev) => prev.filter((c) => c._id !== id));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          discountType: form.discountType,
          value: Number(form.value),
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create coupon");
      setFormOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create coupon");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Coupons</h1>
          <p className="mt-1 text-sm text-white/50">{coupons.length} coupons created.</p>
        </div>
        <Button variant="accent" size="sm" onClick={() => setFormOpen((v) => !v)} className="gap-1.5">
          {formOpen ? <X size={15} /> : <Plus size={15} />} {formOpen ? "Cancel" : "New coupon"}
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={handleCreate} className="mt-6 rounded-card border border-white/10 bg-white/5 p-6 grid sm:grid-cols-2 gap-4">
          {error && <p className="sm:col-span-2 text-xs text-red-400">{error}</p>}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Code</label>
            <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className={inputClass} placeholder="PREP365-FEST" />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Type</label>
            <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as "percent" | "flat" })} className={inputClass}>
              <option value="percent">Percent off</option>
              <option value="flat">Flat ₹ off</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Value</label>
            <input required type="number" min={1} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Max uses (optional)</label>
            <input type="number" min={1} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className={inputClass} placeholder="Unlimited" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Expires on (optional)</label>
            <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create coupon"}</Button>
          </div>
        </form>
      )}

      <div className="mt-8 overflow-x-auto rounded-card border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-white/40 uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">Code</th>
              <th className="px-5 py-3 font-semibold">Discount</th>
              <th className="px-5 py-3 font-semibold">Used</th>
              <th className="px-5 py-3 font-semibold">Expires</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {coupons.map((c) => (
              <tr key={c._id}>
                <td className="px-5 py-3.5 font-mono text-white/80">{c.code}</td>
                <td className="px-5 py-3.5 text-white/50 text-xs">
                  {c.discountType === "percent" ? `${c.value}%` : `₹${c.value}`}
                </td>
                <td className="px-5 py-3.5 text-white/50 text-xs">
                  {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}
                </td>
                <td className="px-5 py-3.5 text-white/50 text-xs">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}
                </td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => toggleActive(c._id, c.isActive)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${c.isActive ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/50"}`}
                  >
                    {c.isActive ? "Active" : "Disabled"}
                  </button>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button onClick={() => remove(c._id)} className="text-xs font-semibold text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-white/40">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-400 placeholder:text-white/30";
