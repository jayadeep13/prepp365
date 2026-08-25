import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { connectDB } from "@/lib/db/connect";
import { getSiteSettings } from "@/lib/db/site-settings";

export const metadata: Metadata = {
  title: "Contact Us | Prepp365",
  description: "Get in touch with Prepp365 — email, phone and operational office address.",
};

async function loadSettings() {
  try {
    await connectDB();
  } catch {
    return {
      contactEmail: "365prepp@gmail.com",
      whatsappNumber: "919441343880",
      phoneNumber: "+91 88006 20321",
      officeAddress: "MC.015.0075, Munger, Bihar - 811201, India",
    };
  }
  return getSiteSettings();
}

export default async function ContactPage() {
  const settings = await loadSettings();

  return (
    <div className="container-page py-16">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-purple-500 mb-2">Contact us</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">Get in touch</h1>
        <p className="mt-3 text-ink-soft leading-relaxed">
          Questions about the course, your order, or a refund? Reach us through any of the channels below.
        </p>

        <div className="mt-8 grid sm:grid-cols-3 gap-5">
          <div className="rounded-card border border-surface-line bg-white p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-50 text-purple-600">
              <Mail size={19} />
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-faint">Email</p>
            <p className="mt-1 font-display font-semibold text-ink break-words">
              {settings.contactEmail || "Not listed yet"}
            </p>
          </div>
          <div className="rounded-card border border-surface-line bg-white p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-50 text-purple-600">
              <Phone size={19} />
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-faint">Phone</p>
            <p className="mt-1 font-display font-semibold text-ink">{settings.phoneNumber || "Not listed yet"}</p>
          </div>
          <div className="rounded-card border border-surface-line bg-white p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-50 text-purple-600">
              <MapPin size={19} />
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-faint">Operational office</p>
            <p className="mt-1 font-display font-semibold text-ink">{settings.officeAddress || "Not listed yet"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
