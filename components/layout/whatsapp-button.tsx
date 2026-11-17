"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-glass-lg hover:scale-105 transition-transform"
    >
      <MessageCircle size={22} fill="white" className="text-[#25D366] sm:h-[26px] sm:w-[26px]" />
    </a>
  );
}
