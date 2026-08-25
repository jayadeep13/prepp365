import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { getCategoriesWithCourseCounts } from "@/lib/db/category-counts";

export async function GET() {
  try {
    await connectDB();
  } catch {
    return NextResponse.json({ categories: [] });
  }

  const categories = await getCategoriesWithCourseCounts();
  return NextResponse.json({ categories });
}
