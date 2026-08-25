import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { ChatMessageModel } from "@/models/ChatMessage";
import { getSession } from "@/lib/auth/session";
import { hasPurchased } from "@/lib/auth/has-purchased";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const courseId = req.nextUrl.searchParams.get("courseId");
  const after = req.nextUrl.searchParams.get("after");
  if (!courseId) return NextResponse.json({ error: "courseId is required" }, { status: 400 });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  if (!(await hasPurchased(session, courseId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const query: Record<string, unknown> = { course: courseId, channel: "class" };
  if (after) query._id = { $gt: after };

  const messages = await ChatMessageModel.find(query).sort({ _id: 1 }).limit(200).lean();
  return NextResponse.json({ messages });
}

const bodySchema = z.object({
  courseId: z.string().min(1),
  body: z.string().min(1).max(4000),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  if (!(await hasPurchased(session, parsed.courseId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const senderRole = session.role === "admin" || session.role === "faculty" ? "admin" : "student";
  const message = await ChatMessageModel.create({
    course: parsed.courseId,
    channel: "class",
    sender: session.uid,
    senderRole,
    senderName: session.name ?? (senderRole === "admin" ? "Faculty" : "Student"),
    body: parsed.body,
  });

  return NextResponse.json({ message });
}
