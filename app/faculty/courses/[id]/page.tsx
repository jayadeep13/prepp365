"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Plus, Trash2, PlayCircle, FileText, ClipboardList, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
type CourseData = { _id: string; title: string; slug: string; curriculum: Chapter[] };

const typeIcon = { video: PlayCircle, pdf: FileText, test: ClipboardList };

const emptyLesson = {
  chapterId: "",
  title: "",
  type: "video" as "video" | "pdf" | "test",
  duration: "",
  isFreePreview: false,
  url: "",
};

export default function FacultyCourseCurriculumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [lessonFormChapter, setLessonFormChapter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch(`/api/faculty/courses/${id}`)
      .then((res) => res.json())
      .then((data) => setCourse(data.course ?? null));
  }
  useEffect(load, [id]);

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
      const res = await fetch(`/api/faculty/courses/${id}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId,
          title: lessonForm.title,
          type: lessonForm.type,
          duration: lessonForm.duration || undefined,
          isFreePreview: lessonForm.isFreePreview,
          videoUrl: lessonForm.type === "video" ? lessonForm.url : undefined,
          pdfUrl: lessonForm.type === "pdf" ? lessonForm.url : undefined,
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
    if (!confirm("Remove this lesson?")) return;
    await fetch(`/api/faculty/courses/${id}/lessons/${lessonId}`, { method: "DELETE" });
    load();
  }

  if (!course) return <div className="container-page py-16 text-center text-ink-faint">Loading…</div>;

  return (
    <div className="container-page py-10">
      <Link href="/faculty" className="text-sm font-semibold text-purple-600">← All courses</Link>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink">{course.title}</h1>
      <p className="text-sm text-ink-soft">Manage chapters and lessons for this course.</p>

      {error && <p className="mt-4 text-xs text-red-600">{error}</p>}

      <div className="mt-8 space-y-5">
        {course.curriculum.map((ch) => (
          <div key={ch._id} className="rounded-card border border-surface-line bg-white overflow-hidden">
            <div className="bg-surface-tint px-5 py-3 flex items-center justify-between">
              <p className="font-display text-sm font-semibold text-ink">{ch.title}</p>
              <button
                onClick={() => setLessonFormChapter(lessonFormChapter === ch._id ? null : ch._id)}
                className="flex items-center gap-1 text-xs font-semibold text-purple-600"
              >
                <Plus size={13} /> Add lesson
              </button>
            </div>

            <ul className="divide-y divide-surface-line">
              {ch.lessons.map((l) => {
                const Icon = typeIcon[l.type];
                return (
                  <li key={l._id} className="flex items-center gap-3 px-5 py-3">
                    <Icon size={16} className="text-purple-500 shrink-0" />
                    <span className="flex-1 text-sm text-ink">{l.title}</span>
                    {l.isFreePreview && <CheckCircle2 size={14} className="text-green-500" />}
                    <span className="text-xs text-ink-faint">{l.duration}</span>
                    <button onClick={() => deleteLesson(l._id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </li>
                );
              })}
              {ch.lessons.length === 0 && (
                <li className="px-5 py-4 text-xs text-ink-faint">No lessons in this chapter yet.</li>
              )}
            </ul>

            {lessonFormChapter === ch._id && (
              <form onSubmit={(e) => addLesson(e, ch._id)} className="border-t border-surface-line p-5 grid sm:grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Lesson title"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className={inputClass}
                />
                <select
                  value={lessonForm.type}
                  onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value as "video" | "pdf" | "test" })}
                  className={inputClass}
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="test">Test</option>
                </select>
                {lessonForm.type !== "test" && (
                  <input
                    required
                    type="url"
                    placeholder={lessonForm.type === "video" ? "Video URL (mp4/HLS)" : "PDF URL"}
                    value={lessonForm.url}
                    onChange={(e) => setLessonForm({ ...lessonForm, url: e.target.value })}
                    className={`${inputClass} sm:col-span-2`}
                  />
                )}
                <input
                  placeholder="Duration (e.g. 12 min)"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  className={inputClass}
                />
                <label className="flex items-center gap-2 text-sm text-ink-soft">
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
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-surface-line px-3.5 py-2.5 text-sm outline-none focus:border-purple-400";
