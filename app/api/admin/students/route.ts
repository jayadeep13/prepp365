import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/models/User";
import { requireRole } from "@/lib/auth/session";

export async function GET() {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ users: [] });
  }

  const users = await UserModel.find({ role: "student" })
    .select("name email phone address purchasedCourses createdAt")
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();

  return NextResponse.json({ users });
}
