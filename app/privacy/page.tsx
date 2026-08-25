import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal-page-layout";
import { connectDB } from "@/lib/db/connect";
import { getSiteSettings } from "@/lib/db/site-settings";

export const metadata: Metadata = {
  title: "Privacy Policy | Prepp365",
  description: "How Prepp365 collects, uses and protects your personal information.",
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

export default async function PrivacyPage() {
  const { contactEmail } = await loadSettings();
  const contactLine = contactEmail || "the email listed on our Contact Us page";

  return (
    <LegalPageLayout title="Privacy Policy" updated="4 August 2026">
      <p>
        This Privacy Policy explains what personal information Prepp365 collects, how it is used, and the
        choices you have. By using Prepp365, you agree to the collection and use of information as described
        here.
      </p>

      <h2>1. Information we collect</h2>
      <p>When you create an account or purchase the course, we collect:</p>
      <ul>
        <li>Name, email address, phone number and address, provided at sign-up or in your profile.</li>
        <li>Login identity via Firebase Authentication (Google, email/password, or phone OTP).</li>
        <li>Order and payment records (amount, status, coupon used) — card/UPI/bank details themselves are
          handled directly by our payment gateway and are never stored on our servers.</li>
        <li>Course activity, such as which lessons you've watched and your progress, to support features like
          resume-watching.</li>
        <li>Messages you send through class chat or private doubt-support chat.</li>
      </ul>

      <h2>2. How we use this information</h2>
      <ul>
        <li>To create and manage your account and grant access to purchased content.</li>
        <li>To process payments and verify successful transactions.</li>
        <li>To provide doubt support and respond to your messages.</li>
        <li>To send important account or course-related communication (e.g. order confirmations,
          announcements about the course).</li>
      </ul>

      <h2>3. Third-party services we use</h2>
      <p>
        We rely on the following third-party services to run Prepp365, each of which processes a limited set
        of your data to provide their service:
      </p>
      <ul>
        <li><strong className="text-ink">Firebase (Google)</strong> — authentication/login.</li>
        <li><strong className="text-ink">MongoDB Atlas</strong> — database storage for your account, orders and course data.</li>
        <li><strong className="text-ink">Cloudinary</strong> — hosting for video lessons, PDF notes and images.</li>
        <li><strong className="text-ink">Payment gateway</strong> (e.g. Razorpay/Airpay) — processes your payment; we receive only the
          transaction result, not your card/bank details.</li>
      </ul>

      <h2>4. Cookies</h2>
      <p>
        We use a single essential cookie to keep you signed in (your session). We do not use third-party
        advertising or tracking cookies.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We retain your account and order data for as long as your account is active, or as needed to comply
        with legal, tax and accounting obligations.
      </p>

      <h2>6. Your rights</h2>
      <p>
        You can review and update your name, phone number and address anytime from your dashboard profile. To
        request a copy of your data, or to request deletion of your account, contact us at {contactLine}.
      </p>

      <h2>7. Children's privacy</h2>
      <p>
        Prepp365 is intended for exam candidates and is not directed at children under 13. We do not knowingly
        collect personal information from children under 13.
      </p>

      <h2>8. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes will be reflected by updating
        the "Last updated" date above.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about this Privacy Policy can be sent to {contactLine}, or via our{" "}
        <a href="/contact" className="text-purple-600 font-semibold">Contact Us</a> page.
      </p>
    </LegalPageLayout>
  );
}
