import Link from "next/link";
import { notFound } from "next/navigation";
import { Timer, ListChecks, AlertTriangle, Trophy, Lock } from "lucide-react";
import { connectDB } from "@/lib/db/connect";
import { MockTestModel } from "@/models/MockTest";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { hasMockTestAccess } from "@/lib/auth/has-mocktest-access";

async function getTest(slug: string) {
  try {
    await connectDB();
  } catch {
    return null;
  }
  return MockTestModel.findOne({ slug, isPublished: true })
    .select("title examTag type durationMinutes negativeMarking questions")
    .lean();
}

export default async function MockTestInstructionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const test = await getTest(slug);
  if (!test) notFound();

  const session = await getSession();
  const hasAccess = await hasMockTestAccess(session);
  const totalMarks = test.questions.reduce((sum, q) => sum + (q.marks ?? 1), 0);

  return (
    <div className="container-page py-14 max-w-2xl">
      <Badge tone="orange">{test.examTag}</Badge>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink">{test.title}</h1>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <div className="rounded-card border border-surface-line p-4 text-center">
          <Timer size={18} className="mx-auto text-purple-500" />
          <p className="mt-2 font-display text-xl font-bold text-ink">{test.durationMinutes}</p>
          <p className="text-xs text-ink-faint">minutes</p>
        </div>
        <div className="rounded-card border border-surface-line p-4 text-center">
          <ListChecks size={18} className="mx-auto text-purple-500" />
          <p className="mt-2 font-display text-xl font-bold text-ink">{test.questions.length}</p>
          <p className="text-xs text-ink-faint">questions · {totalMarks} marks</p>
        </div>
        <div className="rounded-card border border-surface-line p-4 text-center">
          <AlertTriangle size={18} className="mx-auto text-orange-500" />
          <p className="mt-2 font-display text-xl font-bold text-ink">-{test.negativeMarking}</p>
          <p className="text-xs text-ink-faint">per wrong answer</p>
        </div>
      </div>

      <div className="mt-8 rounded-card border border-surface-line bg-surface-tint p-5">
        <p className="font-display font-semibold text-ink text-sm mb-3">Instructions</p>
        <ul className="space-y-1.5 text-sm text-ink-soft list-disc list-inside">
          <li>The test auto-submits when the timer reaches zero.</li>
          <li>Each wrong answer deducts {test.negativeMarking} marks; unattempted questions score zero.</li>
          <li>You can navigate between questions freely and change answers before submitting.</li>
          <li>Once submitted, you'll see your score, accuracy, and a full answer review.</li>
        </ul>
      </div>

      {!hasAccess && (
        <div className="mt-8 flex items-start gap-2.5 rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 text-sm text-orange-800">
          <Lock size={16} className="shrink-0 mt-0.5" />
          <span>You need mock test access to attempt this. Get a plan below and it applies to every mock test.</span>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        {hasAccess ? (
          <Link href={`/mock-tests/${slug}/attempt`} className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-14 px-10">Start test</Button>
          </Link>
        ) : (
          <Link href="/#mock-test-pricing" className="w-full sm:w-auto">
            <Button variant="accent" size="lg" className="w-full sm:w-auto h-14 px-10">Get mock test access</Button>
          </Link>
        )}
        <Link href={`/mock-tests/${slug}/leaderboard`} className="w-full sm:w-auto">
          <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-10 gap-1.5">
            <Trophy size={15} /> Leaderboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
