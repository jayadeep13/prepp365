import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { CouponModel } from "@/models/Coupon";
import { requireRole } from "@/lib/auth/session";

export async function GET() {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ coupons: [] });
  }

  const coupons = await CouponModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ coupons });
}

const bodySchema = z.object({
  code: z.string().min(3).max(24),
  discountType: z.enum(["percent", "flat"]),
  value: z.number().positive(),
  maxUses: z.number().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const check = await requireRole(["admin"]);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid coupon data" }, { status: 400 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  try {
    const coupon = await CouponModel.create({
      code: parsed.code.toUpperCase(),
      discountType: parsed.discountType,
      value: parsed.value,
      maxUses: parsed.maxUses ?? null,
      expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
    });
    return NextResponse.json({ coupon });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === 11000) {
      return NextResponse.json({ error: "A coupon with that code already exists" }, { status: 409 });
    }
    throw err;
  }
}
