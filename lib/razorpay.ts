import { createHmac, timingSafeEqual } from "crypto";

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay isn't configured yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local — see .env.example."
    );
  }
  return { keyId, keySecret };
}

/** Creates a Razorpay order for the given amount (in paise) and returns the order object. */
export async function createRazorpayOrder(amountPaise: number, receipt: string) {
  const { keyId, keySecret } = getCredentials();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      payment_capture: 1,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order creation failed: ${text}`);
  }

  return res.json() as Promise<{ id: string; amount: number; currency: string }>;
}

/** Verifies the signature Razorpay sends back after a successful checkout. */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const { keySecret } = getCredentials();
  const expected = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

export function getRazorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID ?? "";
}
