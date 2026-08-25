"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs } from "@/lib/data";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="FAQs" title="Questions students ask before enrolling" align="center" />
      <div className="mt-10 max-w-2xl mx-auto divide-y divide-surface-line rounded-card border border-surface-line bg-white">
        {faqs.map((f, i) => (
          <div key={f.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-display text-sm font-semibold text-ink">{f.q}</span>
              <ChevronDown
                size={18}
                className={cn("shrink-0 text-ink-faint transition-transform", open === i && "rotate-180 text-purple-600")}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden px-6">
                <p className="pb-5 text-sm text-ink-soft leading-relaxed">{f.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
