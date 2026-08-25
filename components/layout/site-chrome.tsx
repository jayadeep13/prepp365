"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { BackToTop } from "@/components/layout/back-to-top";
import type { PublicCategory } from "@/lib/types";
import type { PublicSiteSettings } from "@/lib/db/site-settings";

// The admin panel is a separate tool, not a page of the marketing site — it
// gets its own dark sidebar layout (app/admin/layout.tsx) and skips the
// public header/footer/WhatsApp/back-to-top chrome entirely.
export function SiteChrome({
  categories,
  settings,
  children,
}: {
  categories: PublicCategory[];
  settings: PublicSiteSettings;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  const hideFooter = pathname === "/login" || pathname === "/register";

  return (
    <>
      <Header categories={categories} />
      <main>{children}</main>
      {!hideFooter && <Footer categories={categories} settings={settings} />}
      {settings.whatsappNumber && <WhatsAppButton whatsappNumber={settings.whatsappNumber} />}
      <BackToTop />
    </>
  );
}
