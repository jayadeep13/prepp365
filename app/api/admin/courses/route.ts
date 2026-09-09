import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { CourseModel } from "@/models/Course";
import { CategoryModel } from "@/models/Category";
import { requireRole } from "@/lib/auth/session";

export async function GET() {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ courses: [] });
  }

  const courses = await CourseModel.find().populate("category", "name slug").sort({ createdAt: -1 }).lean();
  return NextResponse.json({ courses });
}

const bodySchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().min(1),
    examTag: z.string().min(1),
    categorySlug: z.string().min(1),
    thumbnail: z.string().url(),
    description: z.string().min(1),
    instructor: z.string().min(1),
    price: z.number().nonnegative(),
    mrp: z.number().nonnegative(),
    duration: z.string().optional(),
    language: z.string().optional(),
  })
  .refine((data) => data.mrp === 0 || data.mrp >= data.price, {
    message: "MRP can't be lower than the price.",
    path: ["mrp"],
  });

export async function POST(req: NextRequest) {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: "Invalid course data", details: String(err) }, { status: 400 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const category = await CategoryModel.findOne({ slug: parsed.categorySlug });
  if (!category) return NextResponse.json({ error: "Unknown category" }, { status: 400 });

  const course = await CourseModel.create({
    title: parsed.title,
    slug: parsed.slug,
    examTag: parsed.examTag,
    category: category._id,
    thumbnail: parsed.thumbnail,
    description: parsed.description,
    instructor: parsed.instructor,
    price: parsed.price,
    mrp: parsed.mrp,
    duration: parsed.duration,
    language: parsed.language,
    isPublished: false,
  });

  return NextResponse.json({ course });
}
