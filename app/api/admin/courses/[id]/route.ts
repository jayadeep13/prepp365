import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "@/lib/db/connect";
import { CourseModel } from "@/models/Course";
import { OrderModel } from "@/models/Order";
import { requireRole } from "@/lib/auth/session";

const tierSchema = z
  .object({ months: z.number().positive(), price: z.number().nonnegative(), mrp: z.number().nonnegative() })
  .refine((t) => t.mrp === 0 || t.mrp >= t.price, { message: "MRP can't be lower than the price." });

const pricingFieldsSchema = z
  .object({
    price: z.number().nonnegative().optional(),
    mrp: z.number().nonnegative().optional(),
    pricingTiers: z.array(tierSchema).optional(),
  })
  .refine((data) => data.mrp === undefined || data.price === undefined || data.mrp === 0 || data.mrp >= data.price, {
    message: "MRP can't be lower than the price.",
  });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const pricingCheck = pricingFieldsSchema.safeParse(body);
  if (!pricingCheck.success) {
    return NextResponse.json({ error: pricingCheck.error.issues[0]?.message ?? "Invalid pricing data" }, { status: 400 });
  }

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

  const paidOrderCount = await OrderModel.countDocuments({ course: id, status: "paid" });
  if (paidOrderCount > 0) {
    return NextResponse.json(
      {
        error: `${paidOrderCount} student${paidOrderCount === 1 ? " has" : "s have"} already purchased this course. Unpublish it instead of deleting.`,
      },
      { status: 409 }
    );
  }

  const course = await CourseModel.findById(id).lean();
  if (course && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    if (course.bannerPublicId) await cloudinary.uploader.destroy(course.bannerPublicId, { resource_type: "image" }).catch(() => {});
    if (course.introVideoPublicId) await cloudinary.uploader.destroy(course.introVideoPublicId, { resource_type: "video" }).catch(() => {});
    for (const chapter of course.curriculum ?? []) {
      for (const lesson of chapter.lessons ?? []) {
        if (lesson.videoPublicId) await cloudinary.uploader.destroy(lesson.videoPublicId, { resource_type: "video" }).catch(() => {});
        if (lesson.pdfPublicId) await cloudinary.uploader.destroy(lesson.pdfPublicId, { resource_type: "raw" }).catch(() => {});
      }
    }
    for (const material of course.materials ?? []) {
      if (material.filePublicId) await cloudinary.uploader.destroy(material.filePublicId, { resource_type: "raw" }).catch(() => {});
    }
  }

  await CourseModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
