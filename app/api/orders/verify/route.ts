import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { OrderModel } from "@/models/Order";
import { CourseModel } from "@/models/Course";
import { CouponModel } from "@/models/Coupon";
import { UserModel } from "@/models/User";
import { getSession } from "@/lib/auth/session";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { addMonths } from "@/lib/pricing";

const bodySchema = z.object({
  orderId: z.string().min(1), // our Mongo Order _id
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
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

  const validSignature = verifyRazorpaySignature(
    parsed.razorpay_order_id,
    parsed.razorpay_payment_id,
    parsed.razorpay_signature
  );
  if (!validSignature) {
    return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }

  const order = await OrderModel.findOne({ _id: parsed.orderId, user: session.uid });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  order.status = "paid";
  order.razorpayPaymentId = parsed.razorpay_payment_id;
  order.razorpaySignature = parsed.razorpay_signature;
  await order.save();

  const months = order.months ?? 1;

  if (order.productType === "mocktest") {
    const user = await UserModel.findById(session.uid).select("mockTestAccess").lean();
    const base = user?.mockTestAccess?.expiresAt && user.mockTestAccess.expiresAt > new Date()
      ? user.mockTestAccess.expiresAt
      : new Date();
    await UserModel.findByIdAndUpdate(session.uid, { $set: { mockTestAccess: { expiresAt: addMonths(base, months) } } });
  } else if (order.course) {
    const user = await UserModel.findById(session.uid).select("courseAccess purchasedCourses").lean();
    const existing = user?.courseAccess?.find((a) => a.course.toString() === order.course!.toString());
    const base = existing?.expiresAt && existing.expiresAt > new Date() ? existing.expiresAt : new Date();
    const expiresAt = addMonths(base, months);
    const alreadyOwned = user?.purchasedCourses?.some((id) => id.toString() === order.course!.toString());

    if (existing) {
      await UserModel.updateOne(
        { _id: session.uid, "courseAccess.course": order.course },
        { $set: { "courseAccess.$.expiresAt": expiresAt } }
      );
    } else {
      await UserModel.findByIdAndUpdate(session.uid, {
        $push: { courseAccess: { course: order.course, expiresAt } },
      });
    }
    await UserModel.findByIdAndUpdate(session.uid, { $addToSet: { purchasedCourses: order.course } });
    if (!alreadyOwned) {
      await CourseModel.findByIdAndUpdate(order.course, { $inc: { students: 1 } });
    }
  }

  if (order.couponCode) {
    await CouponModel.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
  }

  return NextResponse.json({ ok: true });
}
