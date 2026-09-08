import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { OrderModel } from "@/models/Order";
import { verifyAirpayResponseHash } from "@/lib/airpay";
import { grantOrderAccess } from "@/lib/orders/grant-access";

/**
 * Airpay's fixed callback URL (configured once in the Airpay merchant dashboard,
 * not per-request). It sends TRANSACTIONID (= the orderid we submitted),
 * APTRANSACTIONID, AMOUNT, TRANSACTIONSTATUS, MESSAGE and ap_SecureHash.
 *
 * ap_SecureHash is the only proof this callback actually came from Airpay —
 * there's no separate server-to-server status API for this credential set — so
 * it's verified before anything else runs.
 */
async function handleReturn(req: NextRequest) {
  await connectDB();

  const params =
    req.method === "POST" ? Object.fromEntries((await req.formData()).entries()) : Object.fromEntries(req.nextUrl.searchParams);

  const transactionId = params.TRANSACTIONID as string; // our order's Mongo _id
  const apTransactionId = params.APTRANSACTIONID as string;
  const amount = params.AMOUNT as string;
  const transactionStatus = params.TRANSACTIONSTATUS as string;
  const message = (params.MESSAGE as string) ?? "";
  const receivedHash = params.ap_SecureHash as string;

  const dashboardUrl = new URL("/dashboard/courses", req.nextUrl.origin);
  if (!transactionId || !receivedHash) {
    dashboardUrl.searchParams.set("payment", "unknown");
    return NextResponse.redirect(dashboardUrl);
  }

  const order = await OrderModel.findById(transactionId);
  if (!order || order.gateway !== "airpay") {
    dashboardUrl.searchParams.set("payment", "unknown");
    return NextResponse.redirect(dashboardUrl);
  }

  if (order.status === "paid") {
    dashboardUrl.searchParams.set("payment", "success");
    return NextResponse.redirect(dashboardUrl);
  }

  const validHash = verifyAirpayResponseHash({
    transactionId,
    apTransactionId,
    amount,
    transactionStatus,
    message,
    receivedHash,
  });

  if (!validHash) {
    console.error("Airpay callback hash mismatch for order", transactionId);
    dashboardUrl.searchParams.set("payment", "unknown");
    return NextResponse.redirect(dashboardUrl);
  }

  const status = transactionStatus.toLowerCase();
  if (status === "200") {
    order.status = "paid";
    order.airpayTransactionId = apTransactionId;
    await order.save();
    await grantOrderAccess(order);
    dashboardUrl.searchParams.set("payment", "success");
  } else if (status === "pending") {
    dashboardUrl.searchParams.set("payment", "pending");
  } else {
    order.status = "failed";
    await order.save();
    dashboardUrl.searchParams.set("payment", "failed");
  }

  return NextResponse.redirect(dashboardUrl);
}

export async function GET(req: NextRequest) {
  return handleReturn(req);
}

export async function POST(req: NextRequest) {
  return handleReturn(req);
}
