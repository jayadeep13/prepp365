import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { ProgressModel } from "@/models/Progress";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const lessonId = req.nextUrl.searchParams.get("lessonId");
  if (!lessonId) return NextResponse.json({ error: "lessonId is required" }, { status: 400 });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ progress: null });
  }

  const progress = await ProgressModel.findOne({ user: session.uid, lessonId }).lean();
  return NextResponse.json({ progress });
}

const bodySchema = z.object({
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  positionSeconds: z.number().nonnegative(),
  durationSeconds: z.number().nonnegative(),
  completed: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

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

  await ProgressModel.findOneAndUpdate(
    { user: session.uid, lessonId: parsed.lessonId },
    {
      $set: {
        course: parsed.courseId,
        positionSeconds: parsed.positionSeconds,
        durationSeconds: parsed.durationSeconds,
        ...(parsed.completed !== undefined ? { completed: parsed.completed } : {}),
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
