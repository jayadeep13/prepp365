"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { openRazorpayCheckout } from "@/lib/razorpay-client";
import { submitToAirpay } from "@/lib/airpay-client";
import { useSession } from "@/lib/auth/use-session";

export function useCheckout({
  productType,
  courseSlug,
  loginNext,
  redirectOnSuccess = "/dashboard/courses",
}: {
  productType: "course" | "mocktest";
  courseSlug?: string;
  loginNext: string;
  redirectOnSuccess?: string;
}) {
  const router = useRouter();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function buy(months: number, couponCode?: string) {
    setError(null);

    if (!session) {
      router.push(`/login?next=${encodeURIComponent(loginNext)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType, courseSlug, months, couponCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "PROFILE_INCOMPLETE") {
          router.push(`/dashboard/profile?next=${encodeURIComponent(loginNext)}`);
          return;
        }
        throw new Error(data.error);
      }

      if (data.gateway === "airpay") {
        // Full-page redirect to Airpay's hosted checkout; the browser navigates away here.
        submitToAirpay(data.actionUrl, data.fields);
        return;
      }

      await openRazorpayCheckout({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Prepp365",
        description: data.courseTitle,
        order_id: data.razorpayOrderId,
        prefill: { name: data.userName, email: data.userEmail },
        theme: { color: "#9333EA" },
        handler: async (response) => {
          const verifyRes = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderId, ...response }),
          });
          if (verifyRes.ok) {
            setSuccess(true);
            router.push(redirectOnSuccess);
          } else {
            setError("Payment received but verification failed. Contact support with your payment ID.");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
    } finally {
      setLoading(false);
    }
  }

  return { buy, loading, error, success };
}
