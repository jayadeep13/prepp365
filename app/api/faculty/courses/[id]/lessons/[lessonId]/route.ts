import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "@/lib/db/connect";
import { CourseModel } from "@/models/Course";
import { requireRole } from "@/lib/auth/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  const check = await requireRole(["faculty", "admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id, lessonId } = await params;
  const body = await req.json().catch(() => ({}));

  const allowed = ["title", "duration", "isFreePreview", "videoUrl", "pdfUrl"];
  const set: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) set[`curriculum.$[].lessons.$[les].${key}`] = body[key];
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const course = await CourseModel.findByIdAndUpdate(
    id,
    { $set: set },
    { new: true, arrayFilters: [{ "les._id": lessonId }] }
  ).lean();

  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  return NextResponse.json({ course });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  const check = await requireRole(["faculty", "admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id, lessonId } = await params;

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const before = await CourseModel.findById(id).lean();
  const lesson = before?.curriculum
    ?.flatMap((ch) => ch.lessons)
    .find((l) => l._id.toString() === lessonId);

  if (lesson && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    if (lesson.videoPublicId) {
      await cloudinary.uploader.destroy(lesson.videoPublicId, { resource_type: "video" }).catch(() => {});
    }
    if (lesson.pdfPublicId) {
      await cloudinary.uploader.destroy(lesson.pdfPublicId, { resource_type: "raw" }).catch(() => {});
    }
  }

  const course = await CourseModel.findByIdAndUpdate(
    id,
    { $pull: { "curriculum.$[].lessons": { _id: lessonId } } },
    { new: true }
  ).lean();

  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  return NextResponse.json({ course });
}
