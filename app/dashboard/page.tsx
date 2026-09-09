import Link from "next/link";
import { BookOpen, Heart, Receipt, ArrowRight } from "lucide-react";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/models/User";
import "@/models/Course";
import { OrderModel } from "@/models/Order";
import { getSession } from "@/lib/auth/session";
import { formatINR } from "@/lib/utils";

type PurchasedCourse = { slug: string; title: string; examTag: string };

async function getOverview(uid: string) {
  try {
    await connectDB();
  } catch {
    return null;
  }
  const [user, orderCount, totalSpentAgg] = await Promise.all([
    UserModel.findById(uid)
      .populate("purchasedCourses", "title slug thumbnail examTag")
      .lean(),
    OrderModel.countDocuments({ user: uid, status: "paid" }),
    OrderModel.aggregate([
      { $match: { user: new Types.ObjectId(uid), status: "paid" } },
      { $group: { _id: null, sum: { $sum: "$amount" } } },
    ]),
  ]);
  return {
    purchasedCourses: (user?.purchasedCourses ?? []) as unknown as PurchasedCourse[],
    wishlistCount: user?.wishlist?.length ?? 0,
    orderCount,
    totalSpent: totalSpentAgg[0]?.sum ?? 0,
  };
}

export default async function DashboardOverviewPage() {
  const session = await getSession();
  const data = session ? await getOverview(session.uid) : null;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">
        Welcome back, {session?.name?.split(" ")[0] ?? "there"}.
      </h1>
      <p className="mt-1 text-sm text-ink-soft">Here's where your prep stands today.</p>

      {!data ? (
        <div className="mt-8 rounded-card border border-dashed border-surface-line p-8 text-center">
          <p className="text-sm text-ink-soft">
            Database isn't connected yet — set <code className="font-mono">MONGODB_URI</code> in{" "}
            <code className="font-mono">.env.local</code> to see real data here.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <div className="rounded-card border border-surface-line bg-white p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600">
                <BookOpen size={18} />
              </span>
              <p className="mt-3 font-display text-2xl font-bold text-ink">{data.purchasedCourses.length}</p>
              <p className="text-xs text-ink-faint">Courses enrolled</p>
            </div>
            <div className="rounded-card border border-surface-line bg-white p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
                <Heart size={18} />
              </span>
              <p className="mt-3 font-display text-2xl font-bold text-ink">{data.wishlistCount}</p>
              <p className="text-xs text-ink-faint">Wishlisted courses</p>
            </div>
            <div className="rounded-card border border-surface-line bg-white p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Receipt size={18} />
              </span>
              <p className="mt-3 font-display text-2xl font-bold text-ink">{formatINR(data.totalSpent)}</p>
              <p className="text-xs text-ink-faint">Total spent · {data.orderCount} orders</p>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-ink">Continue learning</h2>
              <Link href="/dashboard/courses" className="text-sm font-semibold text-purple-600 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {data.purchasedCourses.length === 0 ? (
              <div className="rounded-card border border-dashed border-surface-line p-10 text-center">
                <p className="font-display font-semibold text-ink">No courses yet</p>
                <p className="text-sm text-ink-faint mt-1">Enroll in a batch to see it here.</p>
                <Link href="/courses" className="inline-block mt-4 text-sm font-semibold text-purple-600">
                  Browse courses →
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {data.purchasedCourses.slice(0, 4).map((c: PurchasedCourse) => (
                  <Link
                    key={c.slug}
                    href={`/courses/${c.slug}`}
                    className="rounded-card border border-surface-line bg-white p-4 hover:shadow-glass transition-shadow"
                  >
                    <p className="text-xs font-mono text-purple-600">{c.examTag}</p>
                    <p className="mt-1 font-display font-semibold text-ink text-sm">{c.title}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
