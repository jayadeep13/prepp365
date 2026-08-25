let loadPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve();

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load the Razorpay checkout script."));
      document.body.appendChild(script);
    });
  }
  return loadPromise;
}

export type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
};

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions) {
  await loadRazorpayScript();
  const RazorpayCtor = (window as unknown as { Razorpay: new (opts: RazorpayCheckoutOptions) => { open: () => void } })
    .Razorpay;
  const rzp = new RazorpayCtor(options);
  rzp.open();
}
