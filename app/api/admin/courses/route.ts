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

/** "SSC CGL 2027!" -> "ssc-cgl-2027" */
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  slug: "Slug",
  examTag: "Exam tag",
  categorySlug: "Category",
  thumbnail: "Thumbnail",
  description: "Description",
  instructor: "Instructor",
  price: "Price",
  mrp: "MRP",
};

const bodySchema = z
  .object({
    title: z.string().trim().min(1, "is required"),
    slug: z.string().trim().optional().default(""),
    examTag: z.string().trim().min(1, "is required"),
    categorySlug: z.string().min(1, "is required"),
    thumbnail: z.string().url("must be uploaded first"),
    description: z.string().trim().min(1, "is required"),
    instructor: z.string().trim().min(1, "is required"),
    price: z.coerce.number().nonnegative("can't be negative"),
    mrp: z.coerce.number().nonnegative("can't be negative"),
    duration: z.string().optional(),
    language: z.string().optional(),
  })
  .refine((data) => data.mrp === 0 || data.mrp >= data.price, {
    message: "can't be lower than the price",
    path: ["mrp"],
  });

export async function POST(req: NextRequest) {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const raw = await req.json().catch(() => null);
  const result = bodySchema.safeParse(raw ?? {});
  if (!result.success) {
    const messages = result.error.issues.map((i) => `${FIELD_LABELS[String(i.path[0])] ?? i.path.join(".")} ${i.message}`);
    return NextResponse.json({ error: messages.join(" · ") }, { status: 400 });
  }
  const parsed = result.data;

  const slug = slugify(parsed.slug || parsed.title);
  if (!slug) return NextResponse.json({ error: "Slug must contain letters or numbers." }, { status: 400 });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  try {
    const category = await CategoryModel.findOne({ slug: parsed.categorySlug });
    if (!category) return NextResponse.json({ error: "Unknown category — pick one from the list." }, { status: 400 });

    if (await CourseModel.exists({ slug })) {
      return NextResponse.json(
        { error: `A course with the slug "${slug}" already exists. Use a different slug.` },
        { status: 409 }
      );
    }

    const course = await CourseModel.create({
      title: parsed.title,
      slug,
      examTag: parsed.examTag,
      category: category._id,
      thumbnail: parsed.thumbnail,
      description: parsed.description,
      instructor: parsed.instructor,
      price: parsed.price,
      mrp: parsed.mrp || parsed.price,
      duration: parsed.duration,
      language: parsed.language,
      isPublished: false,
    });

    return NextResponse.json({ course });
  } catch (err) {
    console.error("Course creation failed:", err);
    if ((err as { code?: number })?.code === 11000) {
      return NextResponse.json({ error: `A course with the slug "${slug}" already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? `Could not create course: ${err.message}` : "Could not create course" },
      { status: 500 }
    );
  }
}
