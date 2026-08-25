"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Plus, Trash2, PlayCircle, FileText, ClipboardList, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloudinaryUploader } from "@/components/admin/cloudinary-uploader";

type Lesson = {
  _id: string;
  title: string;
  type: "video" | "pdf" | "test";
  duration?: string;
  isFreePreview?: boolean;
  videoUrl?: string;
  pdfUrl?: string;
};
type Chapter = { _id: string; title: string; lessons: Lesson[] };
type Material = { _id: string; title: string; fileUrl: string };
type CourseData = {
  _id: string;
  title: string;
  slug: string;
  examTag: string;
  thumbnail: string;
  banner?: string;
  bannerPublicId?: string;
  tagline?: string;
  heroHighlights?: string[];
  introVideoUrl?: string;
  introVideoPublicId?: string;
  description: string;
  instructor: string;
  price: number;
  mrp: number;
  pricingTiers?: { months: number; price: number; mrp: number }[];
  duration?: string;
  language?: string;
  curriculum: Chapter[];
  materials: Material[];
};

const typeIcon = { video: PlayCircle, pdf: FileText, test: ClipboardList };
const TIER_MONTHS = [3, 6, 12];

const emptyLesson = {
  chapterId: "",
  title: "",
  type: "video" as "video" | "pdf" | "test",
  duration: "",
  isFreePreview: false,
  fileUrl: "",
  filePublicId: "",
};

export default function AdminCourseManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [detailsForm, setDetailsForm] = useState<Partial<CourseData> | null>(null);
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsSaved, setDetailsSaved] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [lessonFormChapter, setLessonFormChapter] = useState<string | null>(null);
  const [materialForm, setMaterialForm] = useState({ title: "", fileUrl: "", filePublicId: "" });
  const [highlightsText, setHighlightsText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch(`/api/faculty/courses/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCourse(data.course ?? null);
        if (data.course) {
          setDetailsForm(data.course);
          setHighlightsText((data.course.heroHighlights ?? []).join(", "));
        }
      });
  }
  useEffect(load, [id]);

  function tierValue(months: number, field: "price" | "mrp"): number {
    return detailsForm?.pricingTiers?.find((t) => t.months === months)?.[field] ?? 0;
  }

  function setTierValue(months: number, field: "price" | "mrp", value: number) {
    if (!detailsForm) return;
    const existing = detailsForm.pricingTiers ?? [];
    const others = existing.filter((t) => t.months !== months);
    const current = existing.find((t) => t.months === months) ?? { months, price: 0, mrp: 0 };
    const updated = { ...current, [field]: value };
    setDetailsForm({ ...detailsForm, pricingTiers: [...others, updated].sort((a, b) => a.months - b.months) });
  }

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!detailsForm) return;
    setSavingDetails(true);
    setDetailsSaved(false);
    try {
      await fetch(`/api/admin/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: detailsForm.title,
          examTag: detailsForm.examTag,
          thumbnail: detailsForm.thumbnail,
          banner: detailsForm.banner,
          bannerPublicId: detailsForm.bannerPublicId,
          introVideoUrl: detailsForm.introVideoUrl,
          introVideoPublicId: detailsForm.introVideoPublicId,
          tagline: detailsForm.tagline,
          heroHighlights: highlightsText
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean)
            .slice(0, 4),
          description: detailsForm.description,
          instructor: detailsForm.instructor,
          price: Number(detailsForm.price),
          mrp: Number(detailsForm.mrp),
          pricingTiers: (detailsForm.pricingTiers ?? []).filter((t) => t.price > 0),
          duration: detailsForm.duration,
          language: detailsForm.language,
        }),
      });
      setDetailsSaved(true);
    } finally {
      setSavingDetails(false);
    }
  }

  async function addChapter(e: React.FormEvent) {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;
    await fetch(`/api/faculty/courses/${id}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newChapterTitle }),
    });
    setNewChapterTitle("");
    load();
  }

  async function addLesson(e: React.FormEvent, chapterId: string) {
    e.preventDefault();
    setError(null);
    try {
      if (lessonForm.type !== "test" && !lessonForm.fileUrl) {
        throw new Error(`Upload a ${lessonForm.type === "video" ? "video" : "PDF"} file first`);
      }
      const res = await fetch(`/api/faculty/courses/${id}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId,
          title: lessonForm.title,
          type: lessonForm.type,
          duration: lessonForm.duration || undefined,
          isFreePreview: lessonForm.isFreePreview,
          videoUrl: lessonForm.type === "video" ? lessonForm.fileUrl : undefined,
          videoPublicId: lessonForm.type === "video" ? lessonForm.filePublicId : undefined,
          pdfUrl: lessonForm.type === "pdf" ? lessonForm.fileUrl : undefined,
          pdfPublicId: lessonForm.type === "pdf" ? lessonForm.filePublicId : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add lesson");
      setLessonForm(emptyLesson);
      setLessonFormChapter(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add lesson");
    }
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm("Remove this lesson? The uploaded file will also be deleted from storage.")) return;
    await fetch(`/api/faculty/courses/${id}/lessons/${lessonId}`, { method: "DELETE" });
    load();
  }

  async function toggleFreePreview(lessonId: string, current: boolean) {
    await fetch(`/api/faculty/courses/${id}/lessons/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFreePreview: !current }),
    });
    load();
  }

  async function addMaterial(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (!materialForm.fileUrl) throw new Error("Upload a file first");
      const res = await fetch(`/api/admin/courses/${id}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(materialForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add material");
      setMaterialForm({ title: "", fileUrl: "", filePublicId: "" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add material");
    }
  }

  async function deleteMaterial(materialId: string) {
    if (!confirm("Remove this material? The uploaded file will also be deleted from storage.")) return;
    await fetch(`/api/admin/courses/${id}/materials/${materialId}`, { method: "DELETE" });
    load();
  }

  if (!course || !detailsForm) return <div className="text-white/50 py-16 text-center">Loading…</div>;

  return (
    <div>
      <Link href="/admin/courses" className="text-sm font-semibold text-purple-400">← All courses</Link>
      <h1 className="mt-2 font-display text-2xl font-bold text-white">{course.title}</h1>
      <p className="text-sm text-white/50">Manage course details, chapters and lessons.</p>

      {/* Course details */}
      <form onSubmit={saveDetails} className="mt-6 rounded-card border border-white/10 bg-white/5 p-6 grid sm:grid-cols-2 gap-4">
        <Field label="Title">
          <input value={detailsForm.title ?? ""} onChange={(e) => setDetailsForm({ ...detailsForm, title: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Exam tag">
          <input value={detailsForm.examTag ?? ""} onChange={(e) => setDetailsForm({ ...detailsForm, examTag: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Instructor">
          <input value={detailsForm.instructor ?? ""} onChange={(e) => setDetailsForm({ ...detailsForm, instructor: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Thumbnail">
          <div className="flex items-center gap-3">
            <CloudinaryUploader
              resourceType="image"
              folder="thumbnails"
              label={detailsForm.thumbnail ? "Replace thumbnail" : "Upload thumbnail"}
              onUploaded={(r) => setDetailsForm({ ...detailsForm, thumbnail: r.secureUrl })}
            />
            {detailsForm.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={detailsForm.thumbnail} alt="" className="h-14 w-24 rounded-lg object-cover border border-white/10" />
            )}
          </div>
        </Field>
        <Field label="Price (₹)">
          <input type="number" min={0} value={detailsForm.price ?? 0} onChange={(e) => setDetailsForm({ ...detailsForm, price: Number(e.target.value) })} className={inputClass} />
        </Field>
        <Field label="MRP (₹)">
          <input type="number" min={0} value={detailsForm.mrp ?? 0} onChange={(e) => setDetailsForm({ ...detailsForm, mrp: Number(e.target.value) })} className={inputClass} />
        </Field>

        <Field label="Pricing plans (optional — leave a row's price at 0 to not offer that plan)" full>
          <p className="text-xs text-white/40 mb-2">
            When any plan below has a price, students pick a duration at checkout instead of paying the flat Price above; access expires after that many months.
          </p>
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
        </Field>

        <Field label="Duration">
          <input value={detailsForm.duration ?? ""} onChange={(e) => setDetailsForm({ ...detailsForm, duration: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Language">
          <input value={detailsForm.language ?? ""} onChange={(e) => setDetailsForm({ ...detailsForm, language: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Description" full>
          <textarea value={detailsForm.description ?? ""} onChange={(e) => setDetailsForm({ ...detailsForm, description: e.target.value })} className={inputClass} rows={3} />
        </Field>

        <Field label="Homepage banner image" full>
          <p className="text-xs text-white/40 mb-2">Wide photo shown in the homepage carousel for this course. Optional — the course won't appear in the carousel without one.</p>
          <div className="flex items-center gap-3">
            <CloudinaryUploader
              resourceType="image"
              folder="banners"
              label={detailsForm.banner ? "Replace banner" : "Upload banner"}
              onUploaded={(r) => setDetailsForm({ ...detailsForm, banner: r.secureUrl, bannerPublicId: r.publicId })}
            />
            {detailsForm.banner && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={detailsForm.banner} alt="" className="h-14 w-24 rounded-lg object-cover border border-white/10" />
            )}
          </div>
        </Field>
        <Field label="Homepage intro video" full>
          <p className="text-xs text-white/40 mb-2">Public promo video shown to everyone on the homepage — separate from lesson videos, not purchase-gated.</p>
          <div className="flex items-center gap-3">
            <CloudinaryUploader
              resourceType="video"
              folder="banners"
              label={detailsForm.introVideoUrl ? "Replace intro video" : "Upload intro video"}
              onUploaded={(r) => setDetailsForm({ ...detailsForm, introVideoUrl: r.secureUrl, introVideoPublicId: r.publicId })}
            />
            {detailsForm.introVideoUrl && <span className="text-xs text-green-400">Video uploaded</span>}
          </div>
        </Field>
        <Field label="Hero tagline" full>
          <input
            value={detailsForm.tagline ?? ""}
            onChange={(e) => setDetailsForm({ ...detailsForm, tagline: e.target.value })}
            className={inputClass}
            placeholder="Smart Preparation. Strong Foundation. Sure Success."
          />
        </Field>
        <Field label="Hero highlights (comma-separated, up to 4)" full>
          <input
            value={highlightsText}
            onChange={(e) => setHighlightsText(e.target.value)}
            className={inputClass}
            placeholder="Expert designed study material, Topic-wise tests, Doubt support, Learn anytime"
          />
        </Field>

        <div className="sm:col-span-2 flex items-center gap-3">
          <Button type="submit" size="sm" disabled={savingDetails}>{savingDetails ? "Saving…" : "Save details"}</Button>
          {detailsSaved && <span className="text-xs text-green-400">Saved</span>}
        </div>
      </form>

      {error && <p className="mt-4 text-xs text-red-400">{error}</p>}

      {/* Curriculum */}
      <div className="mt-8 space-y-5">
        {course.curriculum.map((ch) => (
          <div key={ch._id} className="rounded-card border border-white/10 bg-white/5 overflow-hidden">
            <div className="bg-white/5 px-5 py-3 flex items-center justify-between">
              <p className="font-display text-sm font-semibold text-white">{ch.title}</p>
              <button
                onClick={() => setLessonFormChapter(lessonFormChapter === ch._id ? null : ch._id)}
                className="flex items-center gap-1 text-xs font-semibold text-purple-400"
              >
                <Plus size={13} /> Add lesson
              </button>
            </div>

            <ul className="divide-y divide-white/10">
              {ch.lessons.map((l) => {
                const Icon = typeIcon[l.type];
                return (
                  <li key={l._id} className="flex items-center gap-3 px-5 py-3">
                    <Icon size={16} className="text-purple-400 shrink-0" />
                    <span className="flex-1 text-sm text-white/90">{l.title}</span>
                    <button
                      onClick={() => toggleFreePreview(l._id, Boolean(l.isFreePreview))}
                      title="Click to toggle free preview / paid"
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                        l.isFreePreview
                          ? "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                          : "bg-white/10 text-white/50 hover:bg-white/20"
                      }`}
                    >
                      {l.isFreePreview ? <Unlock size={12} /> : <Lock size={12} />}
                      {l.isFreePreview ? "Free" : "Paid"}
                    </button>
                    <span className="text-xs text-white/40">{l.duration}</span>
                    <button onClick={() => deleteLesson(l._id)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={14} />
                    </button>
                  </li>
                );
              })}
              {ch.lessons.length === 0 && (
                <li className="px-5 py-4 text-xs text-white/40">No lessons in this chapter yet.</li>
              )}
            </ul>

            {lessonFormChapter === ch._id && (
              <form onSubmit={(e) => addLesson(e, ch._id)} className="border-t border-white/10 p-5 grid sm:grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Lesson title"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className={inputClass}
                />
                <select
                  value={lessonForm.type}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, type: e.target.value as "video" | "pdf" | "test", fileUrl: "", filePublicId: "" })
                  }
                  className={inputClass}
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="test">Test</option>
                </select>

                {lessonForm.type !== "test" && (
                  <div className="sm:col-span-2">
                    <CloudinaryUploader
                      resourceType={lessonForm.type === "video" ? "video" : "raw"}
                      folder="lessons"
                      restricted={lessonForm.type === "video"}
                      label={lessonForm.fileUrl ? "Replace file" : `Upload ${lessonForm.type === "video" ? "video" : "PDF"}`}
                      onUploaded={(r) => setLessonForm((f) => ({ ...f, fileUrl: r.secureUrl, filePublicId: r.publicId }))}
                    />
                  </div>
                )}

                <input
                  placeholder="Duration (e.g. 12 min)"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  className={inputClass}
                />
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={lessonForm.isFreePreview}
                    onChange={(e) => setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })}
                  />
                  Free preview
                </label>
                <div className="sm:col-span-2">
                  <Button type="submit" size="sm">Add lesson</Button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={addChapter} className="mt-6 flex gap-2">
        <input
          value={newChapterTitle}
          onChange={(e) => setNewChapterTitle(e.target.value)}
          placeholder="New chapter title"
          className={`${inputClass} flex-1`}
        />
        <Button type="submit" variant="secondary" className="gap-1.5">
          <Plus size={15} /> Add chapter
        </Button>
      </form>

      {/* Materials */}
      <div className="mt-10">
        <p className="font-display text-sm font-semibold text-white mb-1">Course materials</p>
        <p className="text-xs text-white/50 mb-4">PDFs and notes available to enrolled students, not tied to a lesson.</p>

        <div className="rounded-card border border-white/10 bg-white/5 overflow-hidden">
          <ul className="divide-y divide-white/10">
            {course.materials.map((m) => (
              <li key={m._id} className="flex items-center gap-3 px-5 py-3">
                <FileText size={16} className="text-purple-400 shrink-0" />
                <span className="flex-1 text-sm text-white/90">{m.title}</span>
                <button onClick={() => deleteMaterial(m._id)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
            {course.materials.length === 0 && (
              <li className="px-5 py-4 text-xs text-white/40">No materials uploaded yet.</li>
            )}
          </ul>

          <form onSubmit={addMaterial} className="border-t border-white/10 p-5 grid sm:grid-cols-2 gap-3">
            <input
              required
              placeholder="Material title (e.g. Unit 3 notes)"
              value={materialForm.title}
              onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
              className={inputClass}
            />
            <CloudinaryUploader
              resourceType="raw"
              folder="materials"
              label={materialForm.fileUrl ? "Replace file" : "Upload PDF"}
              onUploaded={(r) => setMaterialForm((f) => ({ ...f, fileUrl: r.secureUrl, filePublicId: r.publicId }))}
            />
            <div className="sm:col-span-2">
              <Button type="submit" size="sm">Add material</Button>
            </div>
          </form>
        </div>
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
