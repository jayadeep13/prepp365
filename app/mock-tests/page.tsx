import Link from "next/link";
import { Timer, ClipboardList, Layers, ArrowRight } from "lucide-react";
import { connectDB } from "@/lib/db/connect";
import { MockTestModel } from "@/models/MockTest";
import "@/models/Category";
import { Badge } from "@/components/ui/badge";

type TestRow = {
  slug: string;
  title: string;
  examTag: string;
  type: string;
  durationMinutes: number;
  questionCount: number;
  category?: { name?: string };
};

async function getTests(): Promise<TestRow[]> {
  try {
    await connectDB();
  } catch {
    return [];
  }
  const tests = await MockTestModel.find({ isPublished: true })
    .select("title slug examTag type durationMinutes questions category")
    .populate("category", "name")
    .lean();
  return tests.map((t) => ({
    slug: t.slug,
    title: t.title,
    examTag: t.examTag,
    type: t.type ?? "chapter-wise",
    durationMinutes: t.durationMinutes,
    questionCount: t.questions?.length ?? 0,
    category: t.category as unknown as { name?: string },
  }));
}

const typeIcon: Record<string, typeof Timer> = {
  "full-length": Timer,
  "chapter-wise": Layers,
  "previous-paper": ClipboardList,
};

export default async function MockTestsPage() {
  const tests = await getTests();

  return (
    <div className="container-page py-10">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-purple-500 mb-2">
        Mock test engine
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">Mock Tests</h1>
      <p className="mt-2 text-ink-soft max-w-lg">
        Real exam-pattern timing and negative marking, scored instantly with a full answer review
        and an all-India leaderboard.
      </p>

      {tests.length === 0 ? (
        <div className="mt-10 rounded-card border border-dashed border-surface-line p-12 text-center">
          <p className="font-display font-semibold text-ink">No mock tests published yet</p>
          <p className="text-sm text-ink-faint mt-1">
            Connect MongoDB and run <code className="font-mono">npm run seed</code> to load the sample tests.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests.map((t) => {
            const Icon = typeIcon[t.type] ?? Layers;
            return (
              <Link
                key={t.slug}
                href={`/mock-tests/${t.slug}`}
                className="group rounded-card border border-surface-line bg-white p-5 hover:shadow-glass transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <Badge tone="purple">{t.examTag}</Badge>
                  <Icon size={18} className="text-purple-500" />
                </div>
                <h3 className="mt-4 font-display font-semibold text-ink group-hover:text-purple-600 transition-colors">
                  {t.title}
                </h3>
                <div className="mt-3 flex items-center gap-4 text-xs text-ink-faint">
                  <span>{t.questionCount} questions</span>
                  <span>{t.durationMinutes} min</span>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-purple-600">
                  Start test <ArrowRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
