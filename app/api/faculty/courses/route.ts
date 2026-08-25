import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { CourseModel } from "@/models/Course";
import { requireRole } from "@/lib/auth/session";

export async function GET() {
  const check = await requireRole(["faculty", "admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ courses: [] });
  }

  const courses = await CourseModel.find()
    .select("title slug examTag isPublished curriculum")
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .lean();

  const withCounts = courses.map((c) => ({
    _id: c._id,
    title: c.title,
    slug: c.slug,
    examTag: c.examTag,
    isPublished: c.isPublished,
    lessonCount: (c.curriculum ?? []).reduce((sum, ch) => sum + ch.lessons.length, 0),
  }));

  return NextResponse.json({ courses: withCounts });
}
