import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { MockTestModel } from "@/models/MockTest";
import { CategoryModel } from "@/models/Category";
import { requireRole } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";

export async function GET() {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ tests: [] });
  }

  const tests = await MockTestModel.find()
    .select("title slug examTag type durationMinutes negativeMarking questions isPublished category")
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    tests: tests.map((t) => ({ ...t, questionCount: t.questions?.length ?? 0, questions: undefined })),
  });
}

const bodySchema = z.object({
  title: z.string().min(1),
  examTag: z.string().min(1),
  categorySlug: z.string().min(1),
  type: z.enum(["full-length", "chapter-wise", "previous-paper"]),
  durationMinutes: z.number().positive(),
  negativeMarking: z.number().min(0).max(1),
});

export async function POST(req: NextRequest) {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: "Invalid mock test data", details: String(err) }, { status: 400 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const category = await CategoryModel.findOne({ slug: parsed.categorySlug });
  if (!category) return NextResponse.json({ error: "Unknown category" }, { status: 400 });

  let slug = slugify(parsed.title);
  let suffix = 1;
  while (await MockTestModel.exists({ slug })) {
    suffix++;
    slug = `${slugify(parsed.title)}-${suffix}`;
  }

  const test = await MockTestModel.create({
    title: parsed.title,
    slug,
    examTag: parsed.examTag,
    category: category._id,
    type: parsed.type,
    durationMinutes: parsed.durationMinutes,
    negativeMarking: parsed.negativeMarking,
    questions: [],
    isPublished: false,
  });

  return NextResponse.json({ test });
}
