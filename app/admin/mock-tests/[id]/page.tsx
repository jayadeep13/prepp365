"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Plus, Trash2, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloudinaryUploader } from "@/components/admin/cloudinary-uploader";
import { MOCK_TEST_TEMPLATE } from "@/lib/mocktest-pdf-parser";

type Question = { text: string; options: string[]; correctIndex: number; marks: number };
type TestData = {
  _id: string;
  title: string;
  examTag: string;
  type: "full-length" | "chapter-wise" | "previous-paper";
  durationMinutes: number;
  negativeMarking: number;
  isPublished: boolean;
  questions: Question[];
};

const emptyQuestion = (): Question => ({ text: "", options: ["", ""], correctIndex: 0, marks: 1 });

export default function AdminMockTestManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [test, setTest] = useState<TestData | null>(null);
  const [detailsForm, setDetailsForm] = useState<Partial<TestData> | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);

  function load() {
    fetch(`/api/admin/mock-tests/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.test) {
          setTest(data.test);
          setDetailsForm(data.test);
          setQuestions(data.test.questions ?? []);
        }
      });
  }
  useEffect(load, [id]);

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!detailsForm) return;
    setSavingDetails(true);
    try {
      await fetch(`/api/admin/mock-tests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: detailsForm.title,
          examTag: detailsForm.examTag,
          type: detailsForm.type,
          durationMinutes: Number(detailsForm.durationMinutes),
          negativeMarking: Number(detailsForm.negativeMarking),
        }),
      });
      load();
    } finally {
      setSavingDetails(false);
    }
  }

  async function togglePublish() {
    if (!test) return;
    if (!test.isPublished && questions.length === 0) {
      setError("Add and save at least one question before publishing.");
      return;
    }
    await fetch(`/api/admin/mock-tests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !test.isPublished }),
    });
    load();
  }

  async function handlePdfUploaded(pdfUrl: string) {
    setParsing(true);
    setParseErrors([]);
    setError(null);
    try {
      const res = await fetch(`/api/admin/mock-tests/${id}/parse-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not parse that PDF");
      setQuestions((prev) => [...prev, ...data.questions]);
      setParseErrors(data.errors ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not parse that PDF");
    } finally {
      setParsing(false);
    }
  }

  function updateQuestion(index: number, patch: Partial<Question>) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }
  function updateOption(qIndex: number, optIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, options: q.options.map((o, oi) => (oi === optIndex ? value : o)) } : q))
    );
  }
  function addOption(qIndex: number) {
    setQuestions((prev) => prev.map((q, i) => (i === qIndex ? { ...q, options: [...q.options, ""] } : q)));
  }
  function removeOption(qIndex: number, optIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = q.options.filter((_, oi) => oi !== optIndex);
        const correctIndex = q.correctIndex >= options.length ? 0 : q.correctIndex > optIndex ? q.correctIndex - 1 : q.correctIndex;
        return { ...q, options, correctIndex };
      })
    );
  }
  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }
  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  async function saveQuestions() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`/api/admin/mock-tests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save questions");
      setSaved(true);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save questions");
    } finally {
      setSaving(false);
    }
  }

  if (!test || !detailsForm) return <div className="text-white/50 py-16 text-center">Loading…</div>;

  return (
    <div>
      <Link href="/admin/mock-tests" className="text-sm font-semibold text-purple-400">← All mock tests</Link>
      <div className="mt-2 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-white">{test.title}</h1>
        <button
          onClick={togglePublish}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            test.isPublished ? "bg-green-500/15 text-green-400 hover:bg-green-500/25" : "bg-white/10 text-white/60 hover:bg-white/20"
          }`}
        >
          {test.isPublished ? "Published — click to unpublish" : "Draft — click to publish"}
        </button>
      </div>
      <p className="text-sm text-white/50">Manage test details and questions.</p>

      {/* Details */}
      <form onSubmit={saveDetails} className="mt-6 rounded-card border border-white/10 bg-white/5 p-6 grid sm:grid-cols-2 gap-4">
        <Field label="Title">
          <input value={detailsForm.title ?? ""} onChange={(e) => setDetailsForm({ ...detailsForm, title: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Exam tag">
          <input value={detailsForm.examTag ?? ""} onChange={(e) => setDetailsForm({ ...detailsForm, examTag: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Type">
          <select
            value={detailsForm.type ?? "chapter-wise"}
            onChange={(e) => setDetailsForm({ ...detailsForm, type: e.target.value as TestData["type"] })}
            className={inputClass}
          >
            <option value="chapter-wise">Chapter-wise</option>
            <option value="full-length">Full-length</option>
            <option value="previous-paper">Previous paper</option>
          </select>
        </Field>
        <Field label="Duration (minutes)">
          <input
            type="number"
            min={1}
            value={detailsForm.durationMinutes ?? 30}
            onChange={(e) => setDetailsForm({ ...detailsForm, durationMinutes: Number(e.target.value) })}
            className={inputClass}
          />
        </Field>
        <Field label="Negative marking (per wrong answer)">
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={detailsForm.negativeMarking ?? 0.25}
            onChange={(e) => setDetailsForm({ ...detailsForm, negativeMarking: Number(e.target.value) })}
            className={inputClass}
          />
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" size="sm" disabled={savingDetails}>{savingDetails ? "Saving…" : "Save details"}</Button>
        </div>
      </form>

      {/* PDF upload */}
      <div className="mt-8 rounded-card border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="font-display text-sm font-semibold text-white">Upload questions from a PDF</p>
          <button type="button" onClick={() => setShowTemplate((v) => !v)} className="text-xs font-semibold text-purple-400">
            {showTemplate ? "Hide required format" : "Show required format"}
          </button>
        </div>
        {showTemplate && (
          <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-black/30 p-4 text-xs text-white/70 font-mono">
            {MOCK_TEST_TEMPLATE}
          </pre>
        )}
        <p className="mt-3 text-xs text-white/40">
          The PDF must follow that format exactly — each question starts with "Q1.", lettered options, then an "Answer: X" line.
        </p>
        <div className="mt-4">
          <CloudinaryUploader
            resourceType="raw"
            folder="mocktest-pdfs"
            label={parsing ? "Parsing…" : "Upload PDF"}
            onUploaded={(r) => handlePdfUploaded(r.secureUrl)}
          />
        </div>
        {parseErrors.length > 0 && (
          <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-orange-300">
              <AlertTriangle size={13} /> {parseErrors.length} question{parseErrors.length === 1 ? "" : "s"} couldn't be parsed:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-orange-200/80 list-disc list-inside">
              {parseErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-xs text-red-400">{error}</p>}

      {/* Questions */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="font-display text-sm font-semibold text-white">Questions ({questions.length})</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={addQuestion} className="flex items-center gap-1 text-xs font-semibold text-purple-400">
              <Plus size={13} /> Add question
            </button>
            <Button size="sm" onClick={saveQuestions} disabled={saving}>
              {saving ? "Saving…" : "Save questions"}
            </Button>
            {saved && <span className="text-xs text-green-400">Saved</span>}
          </div>
        </div>

        {questions.map((q, qi) => (
          <div key={qi} className="rounded-card border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="mt-2.5 shrink-0 text-xs font-mono text-white/30">Q{qi + 1}</span>
              <textarea
                value={q.text}
                onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                rows={2}
                placeholder="Question text"
                className={`${inputClass} flex-1`}
              />
              <button onClick={() => removeQuestion(qi)} className="mt-2 shrink-0 text-red-400 hover:text-red-300">
                <Trash2 size={15} />
              </button>
            </div>

            <div className="mt-3 ml-8 space-y-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correctIndex === oi}
                    onChange={() => updateQuestion(qi, { correctIndex: oi })}
                    className="h-4 w-4 shrink-0 text-purple-600"
                  />
                  <input
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    className={`${inputClass} flex-1`}
                  />
                  {q.options.length > 2 && (
                    <button onClick={() => removeOption(qi, oi)} className="shrink-0 text-white/30 hover:text-red-400">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-4 pt-1">
                <button type="button" onClick={() => addOption(qi)} className="text-xs font-semibold text-purple-400">
                  + Add option
                </button>
                <label className="flex items-center gap-1.5 text-xs text-white/50">
                  Marks:
                  <input
                    type="number"
                    min={0.25}
                    step={0.25}
                    value={q.marks}
                    onChange={(e) => updateQuestion(qi, { marks: Number(e.target.value) })}
                    className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white outline-none"
                  />
                </label>
              </div>
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <div className="rounded-card border border-dashed border-white/10 py-10 text-center text-sm text-white/40">
            No questions yet. Upload a PDF above or add one manually.
          </div>
        )}
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
