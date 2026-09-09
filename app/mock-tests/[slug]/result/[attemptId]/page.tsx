"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, MinusCircle, Trophy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Question = { _id: string; text: string; options: string[]; correctIndex: number; explanation?: string; marks: number };
type Attempt = {
  score: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  timeTakenSeconds: number;
  answers: { questionId: string; selectedIndex: number | null }[];
};

export default function MockTestResultPage({
  params,
}: {
  params: Promise<{ slug: string; attemptId: string }>;
}) {
  const { slug, attemptId } = use(params);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testTitle, setTestTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/mock-tests/attempts/${attemptId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.attempt) {
          setAttempt(data.attempt);
          setQuestions(data.test?.questions ?? []);
          setTestTitle(data.test?.title ?? "");
        } else {
          setError(data.error ?? "Could not load your result.");
        }
      })
      .catch(() => setError("Couldn't load your result. Check your connection and try again."));
  }, [attemptId]);

  if (error) {
    return <div className="container-page py-16 text-center text-sm text-ink-soft">{error}</div>;
  }
  if (!attempt) {
    return <div className="container-page py-16 text-center text-ink-faint">Loading result…</div>;
  }

  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a.selectedIndex]));
  const accuracy =
    attempt.correctCount + attempt.wrongCount > 0
      ? Math.round((attempt.correctCount / (attempt.correctCount + attempt.wrongCount)) * 100)
      : 0;
  const minutes = Math.floor(attempt.timeTakenSeconds / 60);
  const seconds = attempt.timeTakenSeconds % 60;

  return (
    <div className="container-page py-10 max-w-3xl">
      <p className="font-mono text-xs font-semibold uppercase tracking-wide text-purple-500">{testTitle}</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink">Your result</h1>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Score" value={`${attempt.score}/${attempt.maxScore}`} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Correct / Wrong" value={`${attempt.correctCount} / ${attempt.wrongCount}`} />
        <Stat label="Time taken" value={`${minutes}m ${seconds}s`} icon={Clock} />
      </div>

      <div className="mt-6">
        <Link
          href={`/mock-tests/${slug}/leaderboard`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600"
        >
          <Trophy size={15} /> View leaderboard
        </Link>
      </div>

      <div className="mt-10">
        <h2 className="font-display font-semibold text-ink mb-4">Answer review</h2>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const selected = answerMap.get(q._id);
            const isCorrect = selected === q.correctIndex;
            const isUnattempted = selected === null || selected === undefined;
            return (
              <div key={q._id} className="rounded-card border border-surface-line p-5">
                <div className="flex items-start gap-2.5">
                  {isUnattempted ? (
                    <MinusCircle size={16} className="text-ink-faint shrink-0 mt-0.5" />
                  ) : isCorrect ? (
                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm text-ink font-medium">
                    {i + 1}. {q.text}
                  </p>
                </div>
                <div className="mt-3 ml-6 space-y-1.5">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={cn(
                        "rounded-lg px-3 py-2 text-xs",
                        oi === q.correctIndex
                          ? "bg-green-50 text-green-700 font-semibold"
                          : oi === selected
                            ? "bg-red-50 text-red-700"
                            : "text-ink-faint"
                      )}
                    >
                      {String.fromCharCode(65 + oi)}. {opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="mt-3 ml-6 text-xs text-ink-faint italic">{q.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof Clock }) {
  return (
    <div className="rounded-card border border-surface-line p-4 text-center">
      {Icon && <Icon size={16} className="mx-auto text-purple-500 mb-1.5" />}
      <p className="font-display text-lg font-bold text-ink">{value}</p>
      <p className="text-xs text-ink-faint">{label}</p>
    </div>
  );
}
