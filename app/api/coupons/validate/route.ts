import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { CouponModel } from "@/models/Coupon";
import { getSession } from "@/lib/auth/session";

const bodySchema = z.object({
  code: z.string().min(1),
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json(
      { error: "Database not connected yet. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }

  const coupon = await CouponModel.findOne({ code: parsed.code.toUpperCase(), isActive: true });
  if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
  }

  const discount =
    coupon.discountType === "percent"
      ? Math.round((parsed.amount * coupon.value) / 100)
      : Math.min(coupon.value, parsed.amount);

  const finalAmount = Math.max(parsed.amount - discount, 1);

  return NextResponse.json({
    code: coupon.code,
    discountType: coupon.discountType,
    value: coupon.value,
    discount,
    finalAmount,
  });
}
