import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { MockTestModel } from "@/models/MockTest";
import { MockTestAttemptModel } from "@/models/MockTestAttempt";
import { getSession } from "@/lib/auth/session";
import { hasMockTestAccess } from "@/lib/auth/has-mocktest-access";

const bodySchema = z.object({
  answers: z.array(z.object({ questionId: z.string(), selectedIndex: z.number().nullable() })),
  timeTakenSeconds: z.number().nonnegative(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { slug } = await params;
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  if (!(await hasMockTestAccess(session))) {
    return NextResponse.json({ error: "You need mock test access to submit this." }, { status: 403 });
  }

  const test = await MockTestModel.findOne({ slug, isPublished: true }).lean();
  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

  const answerMap = new Map(parsed.answers.map((a) => [a.questionId, a.selectedIndex]));

  let score = 0;
  let maxScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;

  for (const q of test.questions) {
    const qId = q._id!.toString();
    maxScore += q.marks ?? 1;
    const selected = answerMap.get(qId);

    if (selected === undefined || selected === null) {
      unattemptedCount++;
      continue;
    }
    if (selected === q.correctIndex) {
      correctCount++;
      score += q.marks ?? 1;
    } else {
      wrongCount++;
      score -= (q.marks ?? 1) * (test.negativeMarking ?? 0);
    }
  }
  score = Math.round(score * 100) / 100;

  const attempt = await MockTestAttemptModel.create({
    user: session.uid,
    test: test._id,
    answers: parsed.answers,
    score,
    maxScore,
    correctCount,
    wrongCount,
    unattemptedCount,
    timeTakenSeconds: parsed.timeTakenSeconds,
  });

  return NextResponse.json({ attemptId: attempt._id.toString() });
}
