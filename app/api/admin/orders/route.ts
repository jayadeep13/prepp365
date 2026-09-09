import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { OrderModel } from "@/models/Order";
import "@/models/User";
import "@/models/Course";
import { requireRole } from "@/lib/auth/session";

export async function GET() {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ orders: [] });
  }

  const orders = await OrderModel.find()
    .populate("user", "name email")
    .populate("course", "title")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return NextResponse.json({ orders });
}
