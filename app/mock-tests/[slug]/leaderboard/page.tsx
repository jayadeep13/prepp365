import { Trophy } from "lucide-react";
import { connectDB } from "@/lib/db/connect";
import { MockTestModel } from "@/models/MockTest";
import { MockTestAttemptModel } from "@/models/MockTestAttempt";
import "@/models/User";

type Row = {
  _id: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  timeTakenSeconds: number;
  user: { name?: string } | null;
};

async function getLeaderboard(slug: string): Promise<{ title: string; rows: Row[] } | null> {
  try {
    await connectDB();
  } catch {
    return null;
  }
  const test = await MockTestModel.findOne({ slug }).select("title").lean();
  if (!test) return null;

  const rows = await MockTestAttemptModel.find({ test: test._id })
    .populate("user", "name")
    .sort({ score: -1, timeTakenSeconds: 1 })
    .limit(50)
    .lean();

  return { title: test.title, rows: rows as unknown as Row[] };
}

export default async function LeaderboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getLeaderboard(slug);

  return (
    <div className="container-page py-10 max-w-2xl">
      <div className="flex items-center gap-2.5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
          <Trophy size={18} />
        </span>
        <div>
          <p className="text-xs text-ink-faint">Leaderboard</p>
          <h1 className="font-display text-xl font-bold text-ink">{data?.title ?? "Mock test"}</h1>
        </div>
      </div>

      <div className="mt-8 rounded-card border border-surface-line bg-white overflow-hidden">
        {!data || data.rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-faint">
            No attempts yet — be the first to take this test.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-line text-left text-xs text-ink-faint uppercase tracking-wide">
                <th className="px-5 py-3 font-semibold">Rank</th>
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Score</th>
                <th className="px-5 py-3 font-semibold">Correct</th>
                <th className="px-5 py-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-line">
              {data.rows.map((r, i) => (
                <tr key={r._id}>
                  <td className="px-5 py-3 font-mono font-semibold text-ink">#{i + 1}</td>
                  <td className="px-5 py-3 text-ink">{r.user?.name ?? "Student"}</td>
                  <td className="px-5 py-3 font-mono text-ink">{r.score}</td>
                  <td className="px-5 py-3 text-ink-faint">{r.correctCount}</td>
                  <td className="px-5 py-3 text-ink-faint font-mono text-xs">
                    {Math.floor(r.timeTakenSeconds / 60)}m {r.timeTakenSeconds % 60}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
