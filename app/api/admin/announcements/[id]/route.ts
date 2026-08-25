import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { AnnouncementModel } from "@/models/Announcement";
import { requireRole } from "@/lib/auth/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const announcement = await AnnouncementModel.findByIdAndUpdate(
    id,
    { $set: { pinned: Boolean(body.pinned) } },
    { new: true }
  );
  if (!announcement) return NextResponse.json({ error: "Announcement not found" }, { status: 404 });

  return NextResponse.json({ announcement });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  await AnnouncementModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
