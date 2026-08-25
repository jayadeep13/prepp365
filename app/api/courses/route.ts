import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { CourseModel } from "@/models/Course";
import { CategoryModel } from "@/models/Category";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");

  try {
    await connectDB();
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    return NextResponse.json(
      { error: "Database not connected yet. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }

  const filter: Record<string, unknown> = { isPublished: true };
  if (category) {
    const cat = await CategoryModel.findOne({ slug: category });
    if (!cat) return NextResponse.json({ courses: [] });
    filter.category = cat._id;
  }

  const courses = await CourseModel.find(filter).populate("category", "slug name").lean();
  return NextResponse.json({ courses });
}
