"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

const COPY: Record<string, { icon: typeof CheckCircle2; className: string; text: string }> = {
  success: {
    icon: CheckCircle2,
    className: "bg-green-50 border-green-100 text-green-700",
    text: "Payment successful! Your access has been activated.",
  },
  failed: {
    icon: AlertCircle,
    className: "bg-red-50 border-red-100 text-red-700",
    text: "Payment failed. No amount will be captured — please try again.",
  },
  pending: {
    icon: Clock,
    className: "bg-amber-50 border-amber-100 text-amber-700",
    text: "We're still confirming your payment with Airpay. This page will update shortly — refresh in a minute if it doesn't.",
  },
  unknown: {
    icon: AlertCircle,
    className: "bg-amber-50 border-amber-100 text-amber-700",
    text: "We couldn't identify that payment. If you were charged, contact support with your order details.",
  },
};

export function PaymentStatusBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const status = searchParams.get("payment");
  const copy = status ? COPY[status] : undefined;
  if (!copy) return null;

  const Icon = copy.icon;

  return (
    <div className={`mb-6 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${copy.className}`}>
      <Icon size={16} className="shrink-0 mt-0.5" />
      <span className="flex-1">{copy.text}</span>
      <button
        onClick={() => router.replace(pathname)}
        className="text-xs font-semibold underline underline-offset-2 shrink-0"
      >
        Dismiss
      </button>
    </div>
  );
}
