import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { CategoryModel } from "@/models/Category";
import { requireRole } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";

export async function GET() {
  const check = await requireRole(["admin", "faculty"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ categories: [] });
  }

  const categories = await CategoryModel.find().sort({ name: 1 }).lean();
  return NextResponse.json({ categories });
}

const bodySchema = z.object({
  name: z.string().min(1),
  group: z.string().min(1),
  slug: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid category data" }, { status: 400 });
  }

  const slug = slugify(parsed.slug || parsed.name);
  if (!slug) return NextResponse.json({ error: "Could not derive a slug from that name" }, { status: 400 });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  try {
    const category = await CategoryModel.create({ name: parsed.name, group: parsed.group, slug });
    return NextResponse.json({ category });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === 11000) {
      return NextResponse.json({ error: "A category with that slug already exists" }, { status: 409 });
    }
    throw err;
  }
}
