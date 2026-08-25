import type { Metadata } from "next";
import { Sora, Inter, IBM_Plex_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/site-chrome";
import { connectDB } from "@/lib/db/connect";
import { getCategoriesWithCourseCounts } from "@/lib/db/category-counts";
import { getSiteSettings, type PublicSiteSettings } from "@/lib/db/site-settings";
import type { PublicCategory } from "@/lib/types";

async function loadCategories(): Promise<PublicCategory[]> {
  try {
    await connectDB();
  } catch {
    return [];
  }
  return getCategoriesWithCourseCounts();
}

async function loadSettings(): Promise<PublicSiteSettings> {
  try {
    await connectDB();
  } catch {
    return {
      contactEmail: "365prepp@gmail.com",
      whatsappNumber: "919441343880",
      phoneNumber: "+91 88006 20321",
      officeAddress: "MC.015.0075, Munger, Bihar - 811201, India",
      mockTestTiers: [],
    };
  }
  return getSiteSettings();
}

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500", "600"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Prepp365 — NTA UGC NET Paper 1",
  description:
    "NTA UGC NET Paper 1 video course by Firdaus — recorded classes, PDF notes and materials, live class chat and doubt support.",
  keywords: [
    "UGC NET Paper 1 online course",
    "NTA NET coaching",
    "UGC NET video classes",
    "Prepp365",
  ],
  openGraph: {
    title: "Prepp365 — NTA UGC NET Paper 1",
    description: "Recorded video classes, PDF notes and doubt support for NTA UGC NET Paper 1, taught by Firdaus.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [categories, settings] = await Promise.all([loadCategories(), loadSettings()]);

  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${plexMono.variable} ${playfair.variable}`}>
      <body>
        <SiteChrome categories={categories} settings={settings}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
