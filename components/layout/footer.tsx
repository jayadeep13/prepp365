import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, Twitter, Mail, Phone, MapPin } from "lucide-react";
import type { PublicCategory } from "@/lib/types";
import type { PublicSiteSettings } from "@/lib/db/site-settings";

const staticColumns = [
  {
    title: "Explore",
    links: [
      { label: "All Courses", href: "/courses" },
      { label: "Mock Tests", href: "/mock-tests" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

export function Footer({ categories, settings }: { categories: PublicCategory[]; settings: PublicSiteSettings }) {
  const columns = categories.length
    ? [
        staticColumns[0],
        {
          title: "Exams",
          links: categories.slice(0, 6).map((c) => ({ label: c.name, href: `/courses?category=${c.slug}` })),
        },
        staticColumns[1],
      ]
    : staticColumns;

  return (
    <footer className="bg-ink text-white">
      <div className="container-page py-14 flex flex-col md:flex-row md:items-start gap-10 md:gap-16">
        <div className="md:max-w-xs shrink-0">
          <div className="mb-4 inline-block rounded-xl bg-white p-2.5">
            <Image src="/logo.png" alt="Prepp365" width={1821} height={864} className="h-10 w-auto" />
          </div>
          <p className="text-sm text-white/60 leading-relaxed mb-5">
            Video classes, PDF notes and doubt support for NTA UGC NET Paper 1,
            taught by Firdaus.
          </p>
          <div className="flex gap-3">
            {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-purple-500 transition-colors"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-10 md:gap-16 md:flex-1 md:justify-end">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-display text-sm font-semibold mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {(settings.phoneNumber || settings.contactEmail || settings.officeAddress) && (
            <div>
              <p className="font-display text-sm font-semibold mb-4">Get in touch</p>
              <ul className="space-y-3 text-sm text-white/60 max-w-[220px]">
                {settings.officeAddress && (
                  <li className="flex items-start gap-2">
                    <MapPin size={16} className="shrink-0 mt-0.5" /> {settings.officeAddress}
                  </li>
                )}
                {settings.phoneNumber && (
                  <li className="flex items-center gap-2">
                    <Phone size={16} className="shrink-0" /> {settings.phoneNumber}
                  </li>
                )}
                {settings.contactEmail && (
                  <li className="flex items-center gap-2">
                    <Mail size={16} className="shrink-0" /> {settings.contactEmail}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Prepp365. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
