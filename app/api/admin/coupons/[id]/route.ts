import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { CouponModel } from "@/models/Coupon";
import { requireRole } from "@/lib/auth/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const coupon = await CouponModel.findByIdAndUpdate(
    id,
    { $set: { isActive: Boolean(body.isActive) } },
    { new: true }
  );
  if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

  return NextResponse.json({ coupon });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await params;

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  await CouponModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
