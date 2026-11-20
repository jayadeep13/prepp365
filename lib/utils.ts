import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Slugs to try when looking up a record from a URL segment. Covers URL-encoded
 * segments ("UGC%20NET") and legacy slugs saved with spaces/capitals, so an
 * old or hand-typed slug never 404s.
 */
export function slugCandidates(raw: string): string[] {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    // malformed escape sequence: use as-is
  }
  return Array.from(new Set([raw, decoded, slugify(decoded)].filter(Boolean)));
}

/**
 * Link that makes the browser save a Cloudinary file instead of opening it.
 * Browsers ignore the `download` attribute on cross-origin links, so ask
 * Cloudinary to send it as an attachment via `fl_attachment`.
 * Lives here (not in a "use client" file) so server components can call it too.
 */
export function downloadUrl(src: string): string {
  if (src.includes("res.cloudinary.com") && src.includes("/upload/") && !src.includes("fl_attachment")) {
    return src.replace("/upload/", "/upload/fl_attachment/");
  }
  return src;
}
