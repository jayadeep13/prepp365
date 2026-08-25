import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { CategoryModel } from "@/models/Category";
import { CourseModel } from "@/models/Course";
import { requireRole } from "@/lib/auth/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const allowed = ["name", "group"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const category = await CategoryModel.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  return NextResponse.json({ category });
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

  const courseCount = await CourseModel.countDocuments({ category: id });
  if (courseCount > 0) {
    return NextResponse.json(
      { error: `${courseCount} course${courseCount === 1 ? "" : "s"} still use this category. Move or delete them first.` },
      { status: 409 }
    );
  }

  await CategoryModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
