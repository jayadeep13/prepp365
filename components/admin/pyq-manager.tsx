"use client";

import { useEffect, useState } from "react";
import { Plus, X, FileText, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloudinaryUploader } from "@/components/admin/cloudinary-uploader";

type Kind = "paper" | "solution";

type PyqRow = {
  _id: string;
  title: string;
  examTag: string;
  year?: number;
  language?: string;
  pdfUrl?: string;
  videoUrl?: string;
  isFree: boolean;
  isPublished: boolean;
  category?: { name?: string } | null;
};

type CategoryOption = { _id: string; name: string; slug: string };

const emptyForm = {
  title: "",
  examTag: "",
  categorySlug: "",
  year: "" as number | "",
  language: "",
  description: "",
  pdfUrl: "",
  pdfPublicId: "",
  videoUrl: "",
  videoPublicId: "",
  isFree: true,
};

export function PyqManager({ kind }: { kind: Kind }) {
  const isSolution = kind === "solution";
  const [items, setItems] = useState<PyqRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch(`/api/admin/pyqs?kind=${kind}`)
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => setError("Couldn't load items."))
      .finally(() => setLoading(false));
  }
  useEffect(load, [kind]);
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {});
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isSolution && !form.pdfUrl) return setError("Upload the question paper PDF first.");
    if (isSolution && !form.pdfUrl && !form.videoUrl) return setError("Upload a solution PDF, a video, or both.");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pyqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, kind, videoRestricted: true, isPublished: true }),
      });
      const data = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
      if (!res.ok) throw new Error(data.error || "Could not save");
      setForm(emptyForm);
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function patch(id: string, update: Partial<PyqRow>) {
    const res = await fetch(`/api/admin/pyqs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    if (res.ok) setItems((prev) => prev.map((it) => (it._id === id ? { ...it, ...update } : it)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this item and its uploaded files?")) return;
    const res = await fetch(`/api/admin/pyqs/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((it) => it._id !== id));
    else setError("Could not delete.");
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{isSolution ? "PYQs with Solution" : "PYQ Papers"}</h1>
          <p className="mt-1 text-sm text-white/50">
            {isSolution
              ? "Solved previous-year papers — solution PDF and/or video explanation."
              : "Previous-year question papers. These PDFs are free for everyone."}
          </p>
        </div>
        <Button variant="accent" size="sm" onClick={() => setFormOpen((v) => !v)} className="gap-1.5 shrink-0">
          {formOpen ? <X size={15} /> : <Plus size={15} />} {formOpen ? "Cancel" : isSolution ? "New solution" : "New paper"}
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={handleCreate} className="mt-6 rounded-card border border-white/10 bg-white/5 p-6 grid sm:grid-cols-2 gap-4">
          {error && <p className="sm:col-span-2 text-xs text-red-400">{error}</p>}
          <Field label="Title">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="SSC CGL 2024 Tier-1 (Shift 1)" />
          </Field>
          <Field label="Exam">
            <input required value={form.examTag} onChange={(e) => setForm({ ...form, examTag: e.target.value })} className={inputClass} placeholder="SSC CGL" />
          </Field>
          <Field label="Category (optional)">
            <select value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value })} className={inputClass}>
              <option value="" className="text-black">— None —</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug} className="text-black">{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Year">
            <input type="number" min={1950} max={2100} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value === "" ? "" : Number(e.target.value) })} className={inputClass} placeholder="2024" />
          </Field>
          <Field label="Language">
            <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={inputClass} placeholder="English / Hindi / Bilingual" />
          </Field>
          {isSolution && (
            <label className="flex items-center gap-2 text-sm text-white/70 self-end pb-2.5">
              <input type="checkbox" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} className="h-4 w-4" />
              Free for everyone (untick = only students with a mock-test plan)
            </label>
          )}
          <Field label="Description (optional)" full>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} rows={2} />
          </Field>

          <Field label={isSolution ? "Solution PDF (optional)" : "Question paper PDF"}>
            <div className="flex items-center gap-3">
              <CloudinaryUploader
                resourceType="raw"
                folder="pyqs"
                allowedFormats={["pdf"]}
                label={form.pdfUrl ? "Replace PDF" : "Upload PDF"}
                onUploaded={(r) => setForm((f) => ({ ...f, pdfUrl: r.secureUrl, pdfPublicId: r.publicId }))}
              />
              {form.pdfUrl && <span className="text-xs text-green-400">PDF ready</span>}
            </div>
          </Field>
          {isSolution && (
            <Field label="Solution video (optional, up to 2 GB)">
              <div className="flex items-center gap-3">
                <CloudinaryUploader
                  resourceType="video"
                  folder="pyqs"
                  restricted
                  label={form.videoUrl ? "Replace video" : "Upload video"}
                  onUploaded={(r) => setForm((f) => ({ ...f, videoUrl: r.secureUrl, videoPublicId: r.publicId }))}
                />
                {form.videoUrl && <span className="text-xs text-green-400">Video ready</span>}
              </div>
            </Field>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save & publish"}</Button>
          </div>
        </form>
      )}

      {!formOpen && error && <p className="mt-6 text-xs text-red-400">{error}</p>}

      <div className="mt-8 overflow-x-auto rounded-card border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-white/40 uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">Title</th>
              <th className="px-5 py-3 font-semibold">Exam / Year</th>
              <th className="px-5 py-3 font-semibold">Files</th>
              {isSolution && <th className="px-5 py-3 font-semibold">Access</th>}
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {items.map((it) => (
              <tr key={it._id}>
                <td className="px-5 py-3.5 text-white/80">{it.title}</td>
                <td className="px-5 py-3.5 text-white/50 text-xs">
                  {it.examTag}
                  {it.year ? ` · ${it.year}` : ""}
                </td>
                <td className="px-5 py-3.5 text-white/60">
                  <span className="flex items-center gap-2">
                    {it.pdfUrl && <FileText size={15} aria-label="PDF" />}
                    {it.videoUrl && <PlayCircle size={15} aria-label="Video" />}
                  </span>
                </td>
                {isSolution && (
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => patch(it._id, { isFree: !it.isFree })}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${it.isFree ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/50"}`}
                    >
                      {it.isFree ? "Free" : "Plan only"}
                    </button>
                  </td>
                )}
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => patch(it._id, { isPublished: !it.isPublished })}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${it.isPublished ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/50"}`}
                  >
                    {it.isPublished ? "Published" : "Hidden"}
                  </button>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <a
                    href={isSolution ? `/pyq-solutions/${it._id}` : `/pyqs/${it._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 mr-4"
                  >
                    View
                  </a>
                  <button onClick={() => remove(it._id)} className="text-xs font-semibold text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={isSolution ? 6 : 5} className="px-5 py-10 text-center text-white/40">
                  Nothing here yet. Click “{isSolution ? "New solution" : "New paper"}” to add one.
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

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label className="text-xs font-semibold text-white/50 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
