"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 left-6 z-40 grid h-13 w-13 h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-glass-lg hover:scale-105 transition-transform"
    >
      <MessageCircle size={26} fill="white" className="text-[#25D366]" />
    </a>
  );
}
