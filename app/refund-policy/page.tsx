import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal-page-layout";
import { connectDB } from "@/lib/db/connect";
import { getSiteSettings } from "@/lib/db/site-settings";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Prepp365",
  description: "Prepp365's refund and cancellation policy for the NTA UGC NET Paper 1 course.",
};

async function loadSettings() {
  try {
    await connectDB();
  } catch {
    return { contactEmail: "365prepp@gmail.com" };
  }
  const s = await getSiteSettings();
  return { contactEmail: s.contactEmail };
}

export default async function RefundPolicyPage() {
  const { contactEmail } = await loadSettings();
  const contactLine = contactEmail || "the email listed on our Contact Us page";

  return (
    <LegalPageLayout title="Refund & Cancellation Policy" updated="4 August 2026">
      <p>
        We want you to be confident before committing to the course. This policy explains when a refund is
        available and how to request one.
      </p>

      <h2>1. 7-day refund window</h2>
      <p>
        You can request a full refund within <strong className="text-ink">7 days</strong> of your purchase
        date, provided you have consumed less than <strong className="text-ink">10% of the course</strong>{" "}
        (based on lessons watched). This lets you try the full course risk-free beyond the free preview
        lessons.
      </p>

      <h2>2. After the 7-day window, or over 10% consumed</h2>
      <p>
        Once the 7-day window has passed, or once more than 10% of the course has been consumed (whichever
        comes first), the purchase is final and non-refundable — the same standard used by most recorded video
        courses, since a meaningful portion of the content has already been made available to you.
      </p>

      <h2>3. How to request a refund</h2>
      <p>
        Email {contactLine} with your registered email address and order details. Refund requests are
        reviewed against your account's lesson-progress records.
      </p>

      <h2>4. Processing time</h2>
      <p>
        Approved refunds are processed to your original payment method. Depending on your bank or payment
        provider, it may take a few business days for the refund to reflect in your account after it is
        initiated on our end.
      </p>

      <h2>5. Cancellation</h2>
      <p>
        Since Prepp365 sells one-time access to a course rather than a recurring subscription, there is no
        ongoing subscription to cancel — the refund window above is the applicable process if you change your
        mind after purchase.
      </p>

      <h2>6. Contact</h2>
      <p>
        Questions about a refund can be sent to {contactLine}, or via our{" "}
        <a href="/contact" className="text-purple-600 font-semibold">Contact Us</a> page.
      </p>
    </LegalPageLayout>
  );
}
