import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { MockTestAttemptModel } from "@/models/MockTestAttempt";
import { MockTestModel } from "@/models/MockTest";
import { getSession } from "@/lib/auth/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const attempt = await MockTestAttemptModel.findById(id).lean();
  if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

  const isOwner = attempt.user.toString() === session.uid;
  if (!isOwner && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const test = await MockTestModel.findById(attempt.test)
    .select("title slug examTag durationMinutes negativeMarking questions")
    .lean();

  return NextResponse.json({ attempt, test });
}
