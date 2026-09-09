import { connectDB } from "@/lib/db/connect";
import { OrderModel } from "@/models/Order";
import "@/models/User";
import "@/models/Course";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/stat-card";
import { Receipt, Clock, IndianRupee, PackageOpen } from "lucide-react";

type OrderRow = {
  _id: string;
  amount: number;
  status: string;
  couponCode?: string;
  createdAt: string;
  user: { name?: string; email?: string } | null;
  course: { title?: string } | null;
};

async function getOrders(): Promise<OrderRow[]> {
  try {
    await connectDB();
  } catch {
    return [];
  }
  const orders = await OrderModel.find()
    .populate("user", "name email")
    .populate("course", "title")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  return orders as unknown as OrderRow[];
}

const statusTone: Record<string, "purple" | "blue" | "orange" | "ink"> = {
  paid: "blue",
  created: "ink",
  failed: "orange",
  refunded: "purple",
};

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  const paid = orders.filter((o) => o.status === "paid");
  const pending = orders.filter((o) => o.status === "created");
  const revenue = paid.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Orders</h1>
      <p className="mt-1 text-sm text-white/50">{paid.length} orders placed.</p>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <StatCard icon={Receipt} label="Total orders" value={paid.length.toLocaleString("en-IN")} tone="purple" />
        <StatCard icon={Clock} label="Unpaid checkouts" value={pending.length.toLocaleString("en-IN")} tone="orange" />
        <StatCard icon={IndianRupee} label="Revenue collected" value={formatINR(revenue)} tone="green" />
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs text-white/40 uppercase tracking-wide">
              <th className="px-5 py-3.5 font-semibold">Student</th>
              <th className="px-5 py-3.5 font-semibold">Course</th>
              <th className="px-5 py-3.5 font-semibold">Amount</th>
              <th className="px-5 py-3.5 font-semibold">Coupon</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paid.map((o) => (
              <tr key={o._id} className="transition-colors hover:bg-white/[0.03]">
                <td className="px-5 py-3.5 text-white/80">{o.user?.name ?? "—"}</td>
                <td className="px-5 py-3.5 text-white/80">{o.course?.title ?? "—"}</td>
                <td className="px-5 py-3.5 font-mono text-white/80">{formatINR(o.amount)}</td>
                <td className="px-5 py-3.5 text-white/40 font-mono text-xs">{o.couponCode ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <Badge tone={statusTone[o.status] ?? "ink"}>{o.status}</Badge>
                </td>
                <td className="px-5 py-3.5 text-white/40 text-xs">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
            {paid.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <PackageOpen className="mx-auto text-white/20" size={28} />
                  <p className="mt-3 text-sm text-white/40">No successful orders yet.</p>
                  <p className="mt-1 text-xs text-white/25">Paid enrollments will show up here as students check out.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
