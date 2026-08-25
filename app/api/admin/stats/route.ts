import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { OrderModel } from "@/models/Order";
import { UserModel } from "@/models/User";
import { CourseModel } from "@/models/Course";
import { requireRole } from "@/lib/auth/session";

export async function GET() {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalRevenueAgg, todayRevenueAgg, monthRevenueAgg, totalStudents, totalOrders, popularCourses, recentOrders] =
    await Promise.all([
      OrderModel.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, sum: { $sum: "$amount" } } }]),
      OrderModel.aggregate([
        { $match: { status: "paid", createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, sum: { $sum: "$amount" } } },
      ]),
      OrderModel.aggregate([
        { $match: { status: "paid", createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, sum: { $sum: "$amount" } } },
      ]),
      UserModel.countDocuments({ role: "student" }),
      OrderModel.countDocuments({ status: "paid" }),
      CourseModel.find({ isPublished: true }).sort({ students: -1 }).limit(5).select("title students slug"),
      OrderModel.find({ status: "paid" })
        .populate("user", "name email")
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

  return NextResponse.json({
    totalRevenue: totalRevenueAgg[0]?.sum ?? 0,
    todayRevenue: todayRevenueAgg[0]?.sum ?? 0,
    monthRevenue: monthRevenueAgg[0]?.sum ?? 0,
    totalStudents,
    totalOrders,
    popularCourses,
    recentOrders,
  });
}
