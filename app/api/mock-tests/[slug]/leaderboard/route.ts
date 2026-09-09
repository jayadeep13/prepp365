import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { MockTestModel } from "@/models/MockTest";
import { MockTestAttemptModel } from "@/models/MockTestAttempt";
import "@/models/User";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ leaderboard: [] });
  }

  const test = await MockTestModel.findOne({ slug }).select("_id").lean();
  if (!test) return NextResponse.json({ leaderboard: [] });

  const leaderboard = await MockTestAttemptModel.find({ test: test._id })
    .populate("user", "name")
    .sort({ score: -1, timeTakenSeconds: 1 })
    .limit(50)
    .select("score correctCount wrongCount timeTakenSeconds user createdAt")
    .lean();

  return NextResponse.json({ leaderboard });
}
