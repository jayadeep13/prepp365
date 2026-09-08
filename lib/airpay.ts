import { createHash } from "crypto";

/**
 * Airpay Hosted Checkout (v3 — the "MID + Username + Password + API Key" flow,
 * no Client ID/Secret Key or OAuth2 involved).
 *
 * Every formula here is copied verbatim from Airpay's own published WooCommerce
 * plugin (github.com/kdclabs/woocommerce-gateway-airpay/blob/master/woocommerce-gateway-airpay.php),
 * not reconstructed from doc summaries, so this is a high-confidence integration.
 *
 * Two things to know about this flow's design:
 *   1. Airpay does NOT accept a per-request return_url — the callback goes to a
 *      fixed URL configured once in your Airpay merchant dashboard (ask your
 *      Airpay contact where to set this if it's not under a visible tab; point
 *      it at https://<your-domain>/api/orders/airpay/return).
 *   2. There's no separate server-to-server status-check API for this credential
 *      set (that only exists for the v4/OAuth2 flow, which needs Client ID/Secret
 *      this account doesn't have). So the crc32 "ap_SecureHash" check on the
 *      callback IS the authoritative verification here — the same trust model
 *      this codebase already uses for Razorpay's HMAC signature.
 */

function getCredentials() {
  const mid = process.env.AIRPAY_MID;
  const username = process.env.AIRPAY_USERNAME;
  const password = process.env.AIRPAY_PASSWORD;
  const apiKey = process.env.AIRPAY_API_KEY;

  if (!mid || !username || !password || !apiKey) {
    throw new Error(
      "Airpay isn't configured yet. Set AIRPAY_MID, AIRPAY_USERNAME, AIRPAY_PASSWORD and AIRPAY_API_KEY in .env.local."
    );
  }
  return { mid, username, password, apiKey };
}

const CHECKOUT_URL = "https://payments.airpay.co.in/pay/index.php";

/** Airpay's checksum is date-bound to the day of the request, in IST. */
function airpayDate() {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

/** privatekey = sha256(apiKey + "@" + username + ":|:" + password) */
function privateKey({ apiKey, username, password }: { apiKey: string; username: string; password: string }) {
  return createHash("sha256").update(`${apiKey}@${username}:|:${password}`).digest("hex");
}

/** checksum = md5(alldata + today's date + privatekey) */
function checksum(alldata: string, key: string) {
  return createHash("md5").update(alldata + airpayDate() + key).digest("hex");
}

// Standard CRC-32 (IEEE 802.3 / zlib / PHP crc32) — used to verify Airpay's callback hash.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(str: string): number {
  let crc = 0xffffffff;
  for (let i = 0; i < str.length; i++) {
    crc = CRC_TABLE[(crc ^ str.charCodeAt(i)) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** Builds the auto-submit form target + fields for Airpay's hosted checkout page. */
export function createAirpayCheckout(params: {
  orderId: string;
  amountRupees: number;
  buyerEmail: string;
  buyerPhone: string;
  buyerFirstName: string;
  buyerLastName: string;
  buyerAddress?: string;
}) {
  const { mid, username, password, apiKey } = getCredentials();
  const amount = params.amountRupees.toFixed(2);
  const address = (params.buyerAddress ?? "").slice(0, 50);
  // City/state/pincode aren't collected separately in this app, so they're sent blank —
  // Airpay's checksum only needs to match what's actually submitted, which it does here.
  const city = "";
  const state = "";
  const country = "India";
  const pincode = "";

  const alldata =
    params.buyerEmail + params.buyerFirstName + params.buyerLastName + address + city + state + country + amount + params.orderId;
  const key = privateKey({ apiKey, username, password });
  const sum = checksum(alldata, key);

  return {
    actionUrl: CHECKOUT_URL,
    fields: {
      buyerEmail: params.buyerEmail,
      buyerPhone: params.buyerPhone,
      buyerFirstName: params.buyerFirstName,
      buyerLastName: params.buyerLastName,
      buyerAddress: address,
      buyerCity: city,
      buyerState: state,
      buyerCountry: country,
      buyerPinCode: pincode,
      amount,
      orderid: params.orderId,
      privatekey: key,
      mercid: mid,
      checksum: sum,
      currency: "356",
      isocurrency: "INR",
    },
  };
}

/** Verifies the crc32 "ap_SecureHash" Airpay attaches to its callback. This is the authoritative check for this flow. */
export function verifyAirpayResponseHash(fields: {
  transactionId: string; // Airpay echoes back whatever we sent as `orderid` in this field, confusingly named
  apTransactionId: string;
  amount: string;
  transactionStatus: string;
  message: string;
  receivedHash: string;
}): boolean {
  const { mid, username } = getCredentials();
  const parts = [fields.transactionId, fields.apTransactionId, fields.amount, fields.transactionStatus, fields.message, mid, username];
  return crc32(parts.join(":")).toString() === fields.receivedHash;
}
