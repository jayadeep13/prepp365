"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloudinaryUploader } from "@/components/admin/cloudinary-uploader";
import { formatINR } from "@/lib/utils";

type CourseRow = {
  _id: string;
  title: string;
  slug: string;
  examTag: string;
  price: number;
  mrp: number;
  isPublished: boolean;
  category: { name?: string } | null;
};

type CategoryOption = { _id: string; name: string; slug: string };

const emptyForm = {
  title: "",
  slug: "",
  examTag: "",
  categorySlug: "",
  thumbnail: "",
  description: "",
  instructor: "",
  price: 0,
  mrp: 0,
  duration: "",
  language: "",
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/courses")
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => setCourses(data.courses ?? []))
      .catch(() => setLoadError(true))
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

  async function togglePublish(id: string, isPublished: boolean) {
    setError(null);
    const res = await fetch(`/api/admin/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not update this course.");
      return;
    }
    setCourses((prev) => prev.map((c) => (c._id === id ? { ...c, isPublished: !isPublished } : c)));
  }

  async function deleteCourse(id: string) {
    if (!confirm("Delete this course?")) return;
    setError(null);
    const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not delete this course.");
      return;
    }
    setCourses((prev) => prev.filter((c) => c._id !== id));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create course");
      setFormOpen(false);
      setForm({ ...emptyForm, categorySlug: categories[0]?.slug ?? "" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create course");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Courses</h1>
          <p className="mt-1 text-sm text-white/50">{courses.length} courses in the catalogue.</p>
        </div>
        <Button variant="accent" size="sm" onClick={() => setFormOpen((v) => !v)} className="gap-1.5">
          {formOpen ? <X size={15} /> : <Plus size={15} />} {formOpen ? "Cancel" : "New course"}
        </Button>
      </div>

      {formOpen && categories.length === 0 && (
        <div className="mt-6 rounded-card border border-dashed border-white/10 p-6 text-sm text-white/50">
          No categories yet. <a href="/admin/categories" className="text-purple-400 hover:text-purple-300 font-semibold">Create one first</a> — every course needs a category.
        </div>
      )}

      {formOpen && categories.length > 0 && (
        <form onSubmit={handleCreate} className="mt-6 rounded-card border border-white/10 bg-white/5 p-6 grid sm:grid-cols-2 gap-4">
          {error && <p className="sm:col-span-2 text-xs text-red-400">{error}</p>}
          <Field label="Title">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Slug">
            <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} placeholder="ssc-cgl-2027" />
          </Field>
          <Field label="Exam tag">
            <input required value={form.examTag} onChange={(e) => setForm({ ...form, examTag: e.target.value })} className={inputClass} placeholder="SSC-CGL-27" />
          </Field>
          <Field label="Category">
            <select value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value })} className={inputClass}>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Instructor">
            <input required value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Thumbnail">
            <div className="flex items-center gap-3">
              <CloudinaryUploader
                resourceType="image"
                folder="thumbnails"
                label={form.thumbnail ? "Replace thumbnail" : "Upload thumbnail"}
                onUploaded={(r) => setForm({ ...form, thumbnail: r.secureUrl })}
              />
              {form.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.thumbnail} alt="" className="h-14 w-24 rounded-lg object-cover border border-white/10" />
              )}
            </div>
          </Field>
          <Field label="Price (₹)">
            <input required type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="MRP (₹)">
            <input required type="number" min={0} value={form.mrp} onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="Duration">
            <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputClass} placeholder="4 months" />
          </Field>
          <Field label="Language">
            <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={inputClass} placeholder="English + Telugu" />
          </Field>
          <Field label="Description" full>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} rows={3} />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create course (unpublished)"}</Button>
          </div>
        </form>
      )}

      {!formOpen && error && <p className="mt-6 text-xs text-red-400">{error}</p>}
      {loadError && <p className="mt-6 text-xs text-red-400">Couldn't load courses. Check your connection and try again.</p>}

      <div className="mt-8 overflow-x-auto rounded-card border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-white/40 uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">Title</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {courses.map((c) => (
              <tr key={c._id}>
                <td className="px-5 py-3.5 text-white/80">{c.title}</td>
                <td className="px-5 py-3.5 text-white/50 text-xs">{c.category?.name ?? "—"}</td>
                <td className="px-5 py-3.5 font-mono text-white/80">{formatINR(c.price)}</td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => togglePublish(c._id, c.isPublished)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${c.isPublished ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/50"}`}
                  >
                    {c.isPublished ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/admin/courses/${c._id}`} className="text-xs font-semibold text-purple-400 hover:text-purple-300 mr-4">
                    Manage
                  </Link>
                  <button onClick={() => deleteCourse(c._id)} className="text-xs font-semibold text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && courses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-white/40">
                  No courses yet. Run <code className="font-mono">npm run seed</code> or create one above.
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
