import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { CourseModel } from "@/models/Course";
import { requireRole } from "@/lib/auth/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const allowed = [
    "title",
    "examTag",
    "thumbnail",
    "banner",
    "bannerPublicId",
    "tagline",
    "heroHighlights",
    "introVideoUrl",
    "introVideoPublicId",
    "description",
    "instructor",
    "price",
    "mrp",
    "pricingTiers",
    "duration",
    "language",
    "isPublished",
    "bestseller",
    "isNew",
  ];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const course = await CourseModel.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  return NextResponse.json({ course });
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

  await CourseModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
