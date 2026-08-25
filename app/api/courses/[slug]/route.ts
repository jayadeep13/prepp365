import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { CourseModel } from "@/models/Course";
import "@/models/Category";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    await connectDB();
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    return NextResponse.json(
      { error: "Database not connected yet. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }

  const course = await CourseModel.findOne({ slug, isPublished: true })
    .populate("category", "slug name")
    .lean();

  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  return NextResponse.json({ course });
}
