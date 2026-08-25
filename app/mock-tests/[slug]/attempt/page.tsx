"use client";

import { useCallback, useEffect, useMemo, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Timer, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/use-session";
import { cn } from "@/lib/utils";

type Question = { _id: string; text: string; options: string[]; marks: number };
type TestData = { title: string; durationMinutes: number; questions: Question[] };

export default function MockTestAttemptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();

  const [test, setTest] = useState<TestData | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noAccess, setNoAccess] = useState(false);
  const startedAt = useRef<number>(Date.now());
  const submittedRef = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      router.push(`/login?next=/mock-tests/${slug}/attempt`);
      return;
    }
    fetch(`/api/mock-tests/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.test) {
          setTest(data.test);
          setSecondsLeft(data.test.durationMinutes * 60);
          startedAt.current = Date.now();
        } else {
          setError(data.error ?? "Could not load this test.");
          setNoAccess(data.code === "NO_ACCESS");
        }
      });
  }, [slug, session, sessionLoading, router]);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    const timeTakenSeconds = Math.round((Date.now() - startedAt.current) / 1000);
    const payload = Object.entries(answersRef.current).map(([questionId, selectedIndex]) => ({
      questionId,
      selectedIndex,
    }));
    try {
      const res = await fetch(`/api/mock-tests/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload, timeTakenSeconds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/mock-tests/${slug}/result/${data.attemptId}`);
    } catch (err) {
      submittedRef.current = false;
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Could not submit the test.");
    }
  }, [slug, router]);

  // Countdown timer.
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, handleSubmit]);

  const attemptedCount = useMemo(
    () => Object.values(answers).filter((v) => v !== null && v !== undefined).length,
    [answers]
  );

  if (error) {
    return (
      <div className="container-page py-16 max-w-md text-center">
        <AlertCircle className="mx-auto text-red-500" size={28} />
        <p className="mt-3 text-sm text-ink-soft">{error}</p>
        {noAccess && (
          <Link href="/#mock-test-pricing">
            <Button variant="accent" size="lg" className="mt-5">
              View mock test plans
            </Button>
          </Link>
        )}
      </div>
    );
  }

  if (!test || secondsLeft === null) {
    return <div className="container-page py-16 text-center text-ink-faint">Loading test…</div>;
  }

  const q = test.questions[current];
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-semibold text-ink">{test.title}</h1>
        <div
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-mono font-bold",
            secondsLeft < 60 ? "bg-red-50 text-red-600" : "bg-purple-50 text-purple-700"
          )}
        >
          <Timer size={15} />
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_240px] gap-6">
        <div className="rounded-card border border-surface-line bg-white p-6">
          <p className="text-xs font-mono text-ink-faint">
            Question {current + 1} of {test.questions.length} · {q.marks} mark{q.marks !== 1 ? "s" : ""}
          </p>
          <p className="mt-3 font-display text-lg text-ink leading-relaxed">{q.text}</p>

          <div className="mt-6 space-y-2.5">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setAnswers((a) => ({ ...a, [q._id]: i }))}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                  answers[q._id] === i
                    ? "border-purple-400 bg-purple-50 text-purple-800 font-medium"
                    : "border-surface-line hover:bg-surface-tint"
                )}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] font-bold",
                    answers[q._id] === i ? "border-purple-500 bg-purple-500 text-white" : "border-surface-line text-ink-faint"
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              disabled={current === 0}
              onClick={() => setCurrent((c) => c - 1)}
            >
              Previous
            </Button>
            {current < test.questions.length - 1 ? (
              <Button size="sm" onClick={() => setCurrent((c) => c + 1)}>
                Save & Next
              </Button>
            ) : (
              <Button size="sm" variant="accent" disabled={submitting} onClick={handleSubmit}>
                {submitting ? "Submitting…" : "Submit test"}
              </Button>
            )}
          </div>
        </div>

        {/* Question palette */}
        <aside className="rounded-card border border-surface-line bg-white p-4 h-fit">
          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-3">
            {attemptedCount} of {test.questions.length} attempted
          </p>
          <div className="grid grid-cols-5 gap-2">
            {test.questions.map((question, i) => (
              <button
                key={question._id}
                onClick={() => setCurrent(i)}
                className={cn(
                  "aspect-square rounded-lg text-xs font-bold flex items-center justify-center",
                  i === current
                    ? "bg-brand-gradient text-white"
                    : answers[question._id] !== undefined && answers[question._id] !== null
                      ? "bg-green-100 text-green-700"
                      : "bg-surface-tint text-ink-faint"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <Button variant="accent" size="sm" className="w-full mt-4" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Submitting…" : "Submit test"}
          </Button>
        </aside>
      </div>
    </div>
  );
}
