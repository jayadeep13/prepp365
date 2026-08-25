import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { MockTestModel } from "@/models/MockTest";
import { CategoryModel } from "@/models/Category";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ tests: [] });
  }

  const filter: Record<string, unknown> = { isPublished: true };
  if (category) {
    const cat = await CategoryModel.findOne({ slug: category });
    if (!cat) return NextResponse.json({ tests: [] });
    filter.category = cat._id;
  }

  const tests = await MockTestModel.find(filter)
    .select("-questions.correctIndex -questions.explanation")
    .populate("category", "name slug")
    .lean();

  const withCounts = tests.map((t) => ({ ...t, questionCount: t.questions?.length ?? 0, questions: undefined }));

  return NextResponse.json({ tests: withCounts });
}
