import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal-page-layout";
import { connectDB } from "@/lib/db/connect";
import { getSiteSettings } from "@/lib/db/site-settings";

export const metadata: Metadata = {
  title: "Terms of Service | Prepp365",
  description: "Terms and conditions for using Prepp365 and purchasing the NTA UGC NET Paper 1 course.",
};

async function loadSettings() {
  try {
    await connectDB();
  } catch {
    return { contactEmail: "preppfirdaus@gmail.com" };
  }
  const s = await getSiteSettings();
  return { contactEmail: s.contactEmail };
}

export default async function TermsPage() {
  const { contactEmail } = await loadSettings();
  const contactLine = contactEmail || "the email listed on our Contact Us page";

  return (
    <LegalPageLayout title="Terms of Service" updated="4 August 2026">
      <p>
        These Terms of Service ("Terms") govern your access to and use of Prepp365 (the "Service"), including
        the NTA UGC NET Paper 1 video course, notes and materials, and any related features such as live chat.
        By creating an account, enrolling in the course, or otherwise using the Service, you agree to these
        Terms. If you do not agree, please do not use the Service.
      </p>

      <h2>1. The course and access</h2>
      <p>
        Prepp365 currently offers one paid course — NTA UGC NET Paper 1 — consisting of recorded video
        lessons, downloadable PDF notes and materials, and doubt-support chat. A limited number of
        introductory lessons are available as a free preview before purchase. Full access is granted only
        after successful payment.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You must provide accurate information (including your name, email, phone number and address) when
        creating an account, and keep it up to date. You are responsible for maintaining the confidentiality
        of your login credentials and for all activity under your account.
      </p>

      <h2>3. Payments and pricing</h2>
      <p>
        Course prices are listed in Indian Rupees (INR) on the course page and are inclusive of applicable
        taxes unless stated otherwise. Payments are processed by a third-party payment gateway; Prepp365 does
        not store your card, UPI or bank credentials. Access to paid content is granted once your payment is
        successfully verified.
      </p>

      <h2>4. Refunds and cancellation</h2>
      <p>
        Refund and cancellation terms are described in our{" "}
        <a href="/refund-policy" className="text-purple-600 font-semibold">Refund &amp; Cancellation Policy</a>,
        which forms part of these Terms.
      </p>

      <h2>5. Use of content</h2>
      <p>
        All video lessons, notes, and materials are licensed to you for personal, non-commercial use only.
        You may not download and redistribute, resell, publicly share, screen-record for redistribution, or
        otherwise make course content available to anyone who has not purchased it. Accounts found sharing
        access or content may be suspended without refund.
      </p>

      <h2>6. Doubt support and chat</h2>
      <p>
        Class chat and private doubt-support chat are available to enrolled students as a study aid. These
        channels are for course-related questions and reasonable use; abusive or off-topic use may result in
        restricted access.
      </p>

      <h2>7. Availability</h2>
      <p>
        We aim to keep the Service available at all times but do not guarantee uninterrupted access. Scheduled
        maintenance, technical issues, or circumstances outside our control may occasionally affect access to
        video playback, chat, or the website itself.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        The course is provided for educational and exam-preparation purposes. Prepp365 makes no guarantee of
        exam results or outcomes. To the fullest extent permitted by law, Prepp365 and Firdaus are not liable
        for indirect or consequential losses arising from use of the Service.
      </p>

      <h2>9. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Service after changes are posted
        constitutes acceptance of the revised Terms. Material changes will be reflected by updating the "Last
        updated" date above.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of the
        courts of India.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms can be sent to {contactLine}, or via our{" "}
        <a href="/contact" className="text-purple-600 font-semibold">Contact Us</a> page.
      </p>
    </LegalPageLayout>
  );
}
