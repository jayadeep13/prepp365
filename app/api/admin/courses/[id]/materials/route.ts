import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { CourseModel } from "@/models/Course";
import { requireRole } from "@/lib/auth/session";

const bodySchema = z.object({
  title: z.string().min(1),
  fileUrl: z.string().url(),
  filePublicId: z.string().optional(),
  isFreePreview: z.boolean().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: "Invalid material data", details: String(err) }, { status: 400 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const course = await CourseModel.findByIdAndUpdate(
    id,
    {
      $push: {
        materials: {
          title: parsed.title,
          fileUrl: parsed.fileUrl,
          filePublicId: parsed.filePublicId,
          isFreePreview: parsed.isFreePreview ?? false,
        },
      },
    },
    { new: true }
  ).lean();

  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  return NextResponse.json({ course });
}
