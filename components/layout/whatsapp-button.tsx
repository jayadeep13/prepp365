"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Floating WhatsApp button.
 *  - Desktop/tablet (sm+): always visible, bottom-left.
 *  - Phones: bottom-right, and only after scrolling past the first screen, so it
 *    never covers the hero's "View course" / "Register now" buttons.
 */
export function WhatsAppButton({ whatsappNumber }: { whatsappNumber: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        "fixed z-40 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-glass-lg transition-all duration-300 hover:scale-105",
        "bottom-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:h-14 sm:w-14",
        "sm:pointer-events-auto sm:translate-y-0 sm:opacity-100",
        scrolled ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      <MessageCircle size={22} fill="white" className="text-[#25D366] sm:h-[26px] sm:w-[26px]" />
    </a>
  );
}
