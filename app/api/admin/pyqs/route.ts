import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { PyqItemModel } from "@/models/PyqItem";
import { CategoryModel } from "@/models/Category";
import { requireRole } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const kind = req.nextUrl.searchParams.get("kind") === "solution" ? "solution" : "paper";
  try {
    await connectDB();
  } catch {
    return NextResponse.json({ items: [] });
  }
  const items = await PyqItemModel.find({ kind }).populate("category", "name slug").sort({ year: -1, createdAt: -1 }).lean();
  return NextResponse.json({ items });
}

const pyqBodySchema = z.object({
  kind: z.enum(["paper", "solution"]),
  title: z.string().trim().min(1, "Title is required"),
  examTag: z.string().trim().min(1, "Exam is required"),
  categorySlug: z.string().optional(),
  year: z.coerce.number().int().min(1950).max(2100).optional().or(z.literal("").transform(() => undefined)),
  language: z.string().optional(),
  description: z.string().optional(),
  pdfUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  pdfPublicId: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  videoPublicId: z.string().optional(),
  videoRestricted: z.boolean().optional(),
  isFree: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const result = pyqBodySchema.safeParse(await req.json().catch(() => ({})));
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues.map((i) => i.message).join(" · ") }, { status: 400 });
  }
  const { categorySlug, ...data } = result.data;

  if (data.kind === "paper" && !data.pdfUrl) {
    return NextResponse.json({ error: "Upload the question paper PDF first." }, { status: 400 });
  }
  if (data.kind === "solution" && !data.pdfUrl && !data.videoUrl) {
    return NextResponse.json({ error: "Upload a solution PDF, a solution video, or both." }, { status: 400 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  let category;
  if (categorySlug) {
    category = await CategoryModel.findOne({ slug: categorySlug });
    if (!category) return NextResponse.json({ error: "Unknown category" }, { status: 400 });
  }

  const item = await PyqItemModel.create({
    ...data,
    category: category?._id,
    isFree: data.kind === "paper" ? true : (data.isFree ?? true),
  });
  return NextResponse.json({ item });
}
