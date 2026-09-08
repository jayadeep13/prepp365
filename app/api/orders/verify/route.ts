import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { OrderModel } from "@/models/Order";
import { getSession } from "@/lib/auth/session";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { grantOrderAccess } from "@/lib/orders/grant-access";

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

  await grantOrderAccess(order);

  return NextResponse.json({ ok: true });
}
