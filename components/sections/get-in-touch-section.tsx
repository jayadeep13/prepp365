import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { connectDB } from "@/lib/db/connect";
import { getSiteSettings, type PublicSiteSettings } from "@/lib/db/site-settings";

async function loadSettings(): Promise<PublicSiteSettings> {
  try {
    await connectDB();
  } catch {
    return { contactEmail: "preppfirdaus@gmail.com", whatsappNumber: "918800620321", phoneNumber: "+91 88006 20321", officeAddress: "", mockTestTiers: [] };
  }
  return getSiteSettings();
}

export async function GetInTouchSection() {
  const settings = await loadSettings();
  const hasAnyContact = settings.contactEmail || settings.whatsappNumber || settings.phoneNumber;
  if (!hasAnyContact) return null;

  const cards = [
    settings.contactEmail && {
      icon: Mail,
      label: "Email",
      value: settings.contactEmail,
      href: `mailto:${settings.contactEmail}`,
      gradient: "from-purple-600 to-fuchsia-500",
      tint: "bg-purple-50",
    },
    settings.whatsappNumber && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: settings.phoneNumber || `+${settings.whatsappNumber}`,
      href: `https://wa.me/${settings.whatsappNumber}`,
      gradient: "from-emerald-500 to-green-500",
      tint: "bg-emerald-50",
    },
    settings.phoneNumber && {
      icon: Phone,
      label: "Call",
      value: settings.phoneNumber,
      href: `tel:${settings.phoneNumber.replace(/\s/g, "")}`,
      gradient: "from-orange-500 to-amber-500",
      tint: "bg-orange-50",
    },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string; gradient: string; tint: string }[];

  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Get in touch" title="Have a question before enrolling?" align="center" className="mx-auto" />

      <div className="mt-10 grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
        {cards.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.label === "Email" || c.label === "Call" ? undefined : "_blank"}
            rel="noopener noreferrer"
            className={`group relative overflow-hidden rounded-card border border-surface-line ${c.tint} p-7 text-center transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-glass-lg`}
          >
            <ArrowUpRight
              size={16}
              className="absolute right-4 top-4 text-ink-faint opacity-0 transition-all -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 group-hover:text-ink-soft"
            />

            <span
              className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${c.gradient} text-white shadow-button transition-transform group-hover:scale-110`}
            >
              <c.icon size={22} />
            </span>

            <p className="mt-5 text-xs font-bold uppercase tracking-widest text-ink-faint">{c.label}</p>
            <p className="mt-1.5 font-display text-base font-bold text-ink break-words">{c.value}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
