import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { AnnouncementModel } from "@/models/Announcement";
import { requireRole } from "@/lib/auth/session";

export async function GET() {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ announcements: [] });
  }

  const announcements = await AnnouncementModel.find().sort({ pinned: -1, createdAt: -1 }).lean();
  return NextResponse.json({ announcements });
}

const bodySchema = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  pinned: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid announcement data" }, { status: 400 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const announcement = await AnnouncementModel.create({
    title: parsed.title,
    body: parsed.body,
    pinned: parsed.pinned ?? false,
  });
  return NextResponse.json({ announcement });
}
