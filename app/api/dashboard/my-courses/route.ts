import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/models/User";
import "@/models/Course";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ purchasedCourses: [], wishlist: [] });
  }

  const user = await UserModel.findById(session.uid)
    .populate("purchasedCourses", "title slug thumbnail examTag instructor duration")
    .populate("wishlist", "title slug thumbnail examTag price mrp rating")
    .lean();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    purchasedCourses: user.purchasedCourses ?? [],
    wishlist: user.wishlist ?? [],
  });
}
