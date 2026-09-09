import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { OrderModel } from "@/models/Order";
import "@/models/Course";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ orders: [] });
  }

  const orders = await OrderModel.find({ user: session.uid })
    .populate("course", "title slug thumbnail examTag")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ orders });
}
