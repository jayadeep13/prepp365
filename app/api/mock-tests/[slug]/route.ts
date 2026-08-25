import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { MockTestModel } from "@/models/MockTest";
import { getSession } from "@/lib/auth/session";
import { hasMockTestAccess } from "@/lib/auth/has-mocktest-access";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  if (!(await hasMockTestAccess(session))) {
    return NextResponse.json(
      { error: "You need mock test access to attempt this. Purchase a plan from the homepage.", code: "NO_ACCESS" },
      { status: 403 }
    );
  }

  const test = await MockTestModel.findOne({ slug, isPublished: true })
    .select("-questions.correctIndex -questions.explanation")
    .populate("category", "name slug")
    .lean();

  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });
  return NextResponse.json({ test });
}
