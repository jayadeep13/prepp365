"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type CategoryRow = {
  _id: string;
  name: string;
  slug: string;
  group: "Government Exams" | "Teaching" | "Medical & Engineering";
};

const groups = ["Government Exams", "Teaching", "Medical & Engineering"] as const;

const emptyForm = { name: "", group: groups[0] as (typeof groups)[number] };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || "Could not delete category");
      return;
    }
    setCategories((prev) => prev.filter((c) => c._id !== id));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, group: form.group }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create category");
      setFormOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Categories</h1>
          <p className="mt-1 text-sm text-white/50">
            {categories.length} exam categories. These power the header menu, homepage, and footer.
          </p>
        </div>
        <Button variant="accent" size="sm" onClick={() => setFormOpen((v) => !v)} className="gap-1.5">
          {formOpen ? <X size={15} /> : <Plus size={15} />} {formOpen ? "Cancel" : "New category"}
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={handleCreate} className="mt-6 rounded-card border border-white/10 bg-white/5 p-6 grid sm:grid-cols-2 gap-4">
          {error && <p className="sm:col-span-2 text-xs text-red-400">{error}</p>}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="SSC"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Group</label>
            <select
              value={form.group}
              onChange={(e) => setForm({ ...form, group: e.target.value as (typeof groups)[number] })}
              className={inputClass}
            >
              {groups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create category"}</Button>
          </div>
        </form>
      )}

      {loadError && <p className="mt-6 text-xs text-red-400">Couldn't load categories. Check your connection and try again.</p>}

      <div className="mt-8 overflow-x-auto rounded-card border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-white/40 uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Slug</th>
              <th className="px-5 py-3 font-semibold">Group</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {categories.map((c) => (
              <tr key={c._id}>
                <td className="px-5 py-3.5 text-white/80">{c.name}</td>
                <td className="px-5 py-3.5 font-mono text-white/50 text-xs">{c.slug}</td>
                <td className="px-5 py-3.5 text-white/50 text-xs">{c.group}</td>
                <td className="px-5 py-3.5 text-right">
                  <button onClick={() => remove(c._id)} className="text-xs font-semibold text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-white/40">
                  No categories yet. Create one above — it'll show up on the site immediately.
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
