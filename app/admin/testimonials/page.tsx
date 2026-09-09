"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type TestimonialRow = {
  _id: string;
  name: string;
  quote: string;
  examResult?: string;
  photoUrl?: string;
  isPublished: boolean;
};

const emptyForm = { name: "", quote: "", examResult: "", photoUrl: "" };

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/testimonials")
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => setTestimonials(data.testimonials ?? []))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function togglePublish(id: string, isPublished: boolean) {
    setError(null);
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    if (!res.ok) {
      setError("Could not update this testimonial.");
      return;
    }
    setTestimonials((prev) => prev.map((t) => (t._id === id ? { ...t, isPublished: !isPublished } : t)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    setError(null);
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not delete this testimonial.");
      return;
    }
    setTestimonials((prev) => prev.filter((t) => t._id !== id));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          quote: form.quote,
          examResult: form.examResult || undefined,
          photoUrl: form.photoUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create testimonial");
      setFormOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create testimonial");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Testimonials & Results</h1>
          <p className="mt-1 text-sm text-white/50">{testimonials.length} entries. Shown on the homepage and course page Reviews tab.</p>
        </div>
        <Button variant="accent" size="sm" onClick={() => setFormOpen((v) => !v)} className="gap-1.5">
          {formOpen ? <X size={15} /> : <Plus size={15} />} {formOpen ? "Cancel" : "New testimonial"}
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={handleCreate} className="mt-6 rounded-card border border-white/10 bg-white/5 p-6 grid sm:grid-cols-2 gap-4">
          {error && <p className="sm:col-span-2 text-xs text-red-400">{error}</p>}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Student name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Result (optional)</label>
            <input value={form.examResult} onChange={(e) => setForm({ ...form, examResult: e.target.value })} className={inputClass} placeholder="Qualified NET Paper 1 — June 2026" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Review / quote</label>
            <textarea required rows={3} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Photo URL (optional)</label>
            <input type="url" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} className={inputClass} placeholder="https://…" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create testimonial"}</Button>
          </div>
        </form>
      )}

      {!formOpen && error && <p className="mt-6 text-xs text-red-400">{error}</p>}
      {loadError && <p className="mt-6 text-xs text-red-400">Couldn't load testimonials. Check your connection and try again.</p>}

      <div className="mt-8 overflow-x-auto rounded-card border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-white/40 uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Result</th>
              <th className="px-5 py-3 font-semibold">Quote</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {testimonials.map((t) => (
              <tr key={t._id}>
                <td className="px-5 py-3.5 text-white/80">{t.name}</td>
                <td className="px-5 py-3.5 text-white/50 text-xs">{t.examResult ?? "—"}</td>
                <td className="px-5 py-3.5 text-white/50 text-xs max-w-xs truncate">{t.quote}</td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => togglePublish(t._id, t.isPublished)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${t.isPublished ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/50"}`}
                  >
                    {t.isPublished ? "Published" : "Hidden"}
                  </button>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button onClick={() => remove(t._id)} className="text-xs font-semibold text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && testimonials.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-white/40">
                  No testimonials yet.
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
