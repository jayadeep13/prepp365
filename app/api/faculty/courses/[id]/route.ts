import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { CourseModel } from "@/models/Course";
import { requireRole } from "@/lib/auth/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["faculty", "admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const course = await CourseModel.findById(id).lean();
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  return NextResponse.json({ course });
}
