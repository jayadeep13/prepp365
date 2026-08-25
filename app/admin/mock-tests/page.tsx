"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

type TestRow = {
  _id: string;
  title: string;
  examTag: string;
  type: string;
  questionCount: number;
  isPublished: boolean;
  category: { name?: string } | null;
};

type CategoryOption = { _id: string; name: string; slug: string };

const emptyForm = {
  title: "",
  examTag: "",
  categorySlug: "",
  type: "chapter-wise" as "full-length" | "chapter-wise" | "previous-paper",
  durationMinutes: 30,
  negativeMarking: 0.25,
};

export default function AdminMockTestsPage() {
  const [tests, setTests] = useState<TestRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/mock-tests")
      .then((res) => res.json())
      .then((data) => setTests(data.tests ?? []))
      .finally(() => setLoading(false));
  }

  function loadCategories() {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        const cats: CategoryOption[] = data.categories ?? [];
        setCategories(cats);
        setForm((f) => (f.categorySlug ? f : { ...f, categorySlug: cats[0]?.slug ?? "" }));
      });
  }

  useEffect(load, []);
  useEffect(loadCategories, []);

  async function deleteTest(id: string) {
    if (!confirm("Delete this mock test?")) return;
    await fetch(`/api/admin/mock-tests/${id}`, { method: "DELETE" });
    setTests((prev) => prev.filter((t) => t._id !== id));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/mock-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create mock test");
      setFormOpen(false);
      setForm({ ...emptyForm, categorySlug: categories[0]?.slug ?? "" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create mock test");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Mock Tests</h1>
          <p className="mt-1 text-sm text-white/50">{tests.length} tests.</p>
        </div>
        <Button variant="accent" size="sm" onClick={() => setFormOpen((v) => !v)} className="gap-1.5">
          {formOpen ? <X size={15} /> : <Plus size={15} />} {formOpen ? "Cancel" : "New test"}
        </Button>
      </div>

      {formOpen && categories.length === 0 && (
        <div className="mt-6 rounded-card border border-dashed border-white/10 p-6 text-sm text-white/50">
          No categories yet. <a href="/admin/categories" className="text-purple-400 hover:text-purple-300 font-semibold">Create one first</a> — every test needs a category.
        </div>
      )}

      {formOpen && categories.length > 0 && (
        <form onSubmit={handleCreate} className="mt-6 rounded-card border border-white/10 bg-white/5 p-6 grid sm:grid-cols-2 gap-4">
          {error && <p className="sm:col-span-2 text-xs text-red-400">{error}</p>}
          <Field label="Title">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="UGC NET Paper 1 — Full Mock 1" />
          </Field>
          <Field label="Exam tag">
            <input required value={form.examTag} onChange={(e) => setForm({ ...form, examTag: e.target.value })} className={inputClass} placeholder="UGC-NET-P1" />
          </Field>
          <Field label="Category">
            <select value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value })} className={inputClass}>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Type">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })} className={inputClass}>
              <option value="chapter-wise">Chapter-wise</option>
              <option value="full-length">Full-length</option>
              <option value="previous-paper">Previous paper</option>
            </select>
          </Field>
          <Field label="Duration (minutes)">
            <input required type="number" min={1} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="Negative marking (per wrong answer)">
            <input required type="number" min={0} max={1} step={0.05} value={form.negativeMarking} onChange={(e) => setForm({ ...form, negativeMarking: Number(e.target.value) })} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create test (unpublished)"}</Button>
            <p className="mt-2 text-xs text-white/40">You'll add questions (via PDF upload or manually) on the next screen.</p>
          </div>
        </form>
      )}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs text-white/40 uppercase tracking-wide">
              <th className="px-5 py-3.5 font-semibold">Title</th>
              <th className="px-5 py-3.5 font-semibold">Category</th>
              <th className="px-5 py-3.5 font-semibold">Type</th>
              <th className="px-5 py-3.5 font-semibold">Questions</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tests.map((t) => (
              <tr key={t._id} className="transition-colors hover:bg-white/[0.03]">
                <td className="px-5 py-3.5 text-white/80">{t.title}</td>
                <td className="px-5 py-3.5 text-white/50 text-xs">{t.category?.name ?? "—"}</td>
                <td className="px-5 py-3.5 text-white/50 text-xs font-mono">{t.type}</td>
                <td className="px-5 py-3.5 text-white/50 font-mono text-xs">{t.questionCount}</td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${t.isPublished ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/50"}`}>
                    {t.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/admin/mock-tests/${t._id}`} className="text-xs font-semibold text-purple-400 hover:text-purple-300 mr-4">
                    Manage
                  </Link>
                  <button onClick={() => deleteTest(t._id)} className="text-xs font-semibold text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && tests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <ClipboardList className="mx-auto text-white/20" size={28} />
                  <p className="mt-3 text-sm text-white/40">No mock tests yet.</p>
                  <p className="mt-1 text-xs text-white/25">Create one, then add questions from the manage screen.</p>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-white/50 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
