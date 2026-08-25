import { connectDB } from "@/lib/db/connect";
import { OrderModel } from "@/models/Order";
import { UserModel } from "@/models/User";
import { CourseModel } from "@/models/Course";
import { formatINR } from "@/lib/utils";
import { IndianRupee, Users, ShoppingBag, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";

type PopularCourse = { title: string; students: number };
type RecentOrder = { _id: string; amount: number; user: { name?: string } | null; course: { title?: string } | null };

async function getStats() {
  try {
    await connectDB();
  } catch {
    return null;
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
      CourseModel.find({ isPublished: true }).sort({ students: -1 }).limit(5).select("title students").lean(),
      OrderModel.find({ status: "paid" })
        .populate("user", "name email")
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

  return {
    totalRevenue: totalRevenueAgg[0]?.sum ?? 0,
    todayRevenue: todayRevenueAgg[0]?.sum ?? 0,
    monthRevenue: monthRevenueAgg[0]?.sum ?? 0,
    totalStudents,
    totalOrders,
    popularCourses: popularCourses as unknown as PopularCourse[],
    recentOrders: recentOrders as unknown as RecentOrder[],
  };
}

export default async function AdminAnalyticsPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Analytics</h1>
      <p className="mt-1 text-sm text-white/50">Revenue and platform health at a glance.</p>

      {!stats ? (
        <div className="mt-8 rounded-card border border-dashed border-white/15 p-10 text-center">
          <p className="text-sm text-white/50">
            Database isn't connected yet — set <code className="font-mono">MONGODB_URI</code> in{" "}
            <code className="font-mono">.env.local</code>.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={IndianRupee} label="Total revenue" value={formatINR(stats.totalRevenue)} tone="green" />
            <StatCard icon={TrendingUp} label="Today's revenue" value={formatINR(stats.todayRevenue)} tone="orange" />
            <StatCard icon={TrendingUp} label="This month" value={formatINR(stats.monthRevenue)} tone="purple" />
            <StatCard icon={Users} label="Students" value={stats.totalStudents.toLocaleString("en-IN")} tone="blue" />
          </div>

          <div className="mt-10 grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="font-display font-semibold text-white text-sm mb-4">Popular courses</p>
              {stats.popularCourses.length === 0 ? (
                <p className="text-xs text-white/40">No published courses yet.</p>
              ) : (
                <ul className="space-y-3">
                  {stats.popularCourses.map((c: PopularCourse) => (
                    <li key={c.title} className="flex items-center justify-between text-sm">
                      <span className="text-white/80">{c.title}</span>
                      <span className="font-mono text-xs text-white/50">{c.students} students</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2">
                <ShoppingBag size={15} /> Recent orders
              </p>
              {stats.recentOrders.length === 0 ? (
                <p className="text-xs text-white/40">No orders yet.</p>
              ) : (
                <ul className="space-y-3">
                  {stats.recentOrders.map((o: RecentOrder) => (
                    <li key={o._id} className="flex items-center justify-between text-sm">
                      <span className="text-white/80 truncate pr-3">
                        {o.user?.name ?? "Student"} → {o.course?.title ?? "Course"}
                      </span>
                      <span className="font-mono text-xs text-white/50 shrink-0">{formatINR(o.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
