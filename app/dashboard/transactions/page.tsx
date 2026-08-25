import { connectDB } from "@/lib/db/connect";
import { OrderModel } from "@/models/Order";
import { getSession } from "@/lib/auth/session";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type OrderRow = {
  _id: string;
  amount: number;
  status: string;
  couponCode?: string;
  createdAt: string;
  course: { title: string } | null;
};

async function getOrders(uid: string): Promise<OrderRow[]> {
  try {
    await connectDB();
  } catch {
    return [];
  }
  const orders = await OrderModel.find({ user: uid })
    .populate("course", "title")
    .sort({ createdAt: -1 })
    .lean();
  return orders as unknown as OrderRow[];
}

const statusTone: Record<string, "purple" | "blue" | "orange" | "ink"> = {
  paid: "blue",
  created: "ink",
  failed: "orange",
  refunded: "purple",
};

export default async function TransactionsPage() {
  const session = await getSession();
  const orders = session ? await getOrders(session.uid) : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Transactions</h1>
      <p className="mt-1 text-sm text-ink-soft">Every order you've placed on Prepp365.</p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-surface-line p-10 text-center">
          <p className="text-sm text-ink-faint">No transactions yet.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-card border border-surface-line bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-line text-left text-xs text-ink-faint uppercase tracking-wide">
                <th className="px-5 py-3 font-semibold">Course</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Coupon</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-line">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="px-5 py-3.5 font-medium text-ink">{o.course?.title ?? "—"}</td>
                  <td className="px-5 py-3.5 font-mono">{formatINR(o.amount)}</td>
                  <td className="px-5 py-3.5 text-ink-faint font-mono text-xs">{o.couponCode ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={statusTone[o.status] ?? "ink"}>{o.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-ink-faint text-xs">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
