import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { CourseModel } from "@/models/Course";
import { requireRole } from "@/lib/auth/session";

const bodySchema = z.object({
  chapterId: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(["video", "pdf", "test"]),
  duration: z.string().optional(),
  isFreePreview: z.boolean().optional(),
  videoUrl: z.string().url().optional(),
  videoPublicId: z.string().optional(),
  pdfUrl: z.string().url().optional(),
  pdfPublicId: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["faculty", "admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: "Invalid lesson data", details: String(err) }, { status: 400 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const course = await CourseModel.findOneAndUpdate(
    { _id: id, "curriculum._id": parsed.chapterId },
    {
      $push: {
        "curriculum.$.lessons": {
          title: parsed.title,
          type: parsed.type,
          duration: parsed.duration,
          isFreePreview: parsed.isFreePreview ?? false,
          videoUrl: parsed.videoUrl,
          videoPublicId: parsed.videoPublicId,
          pdfUrl: parsed.pdfUrl,
          pdfPublicId: parsed.pdfPublicId,
        },
      },
    },
    { new: true }
  ).lean();

  if (!course) return NextResponse.json({ error: "Course or chapter not found" }, { status: 404 });
  return NextResponse.json({ course });
}
