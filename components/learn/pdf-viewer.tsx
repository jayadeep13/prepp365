"use client";

import { Lock, Download } from "lucide-react";

export function PdfViewer({
  src,
  title,
  unlocked,
  watermark,
}: {
  src: string;
  title: string;
  unlocked: boolean;
  watermark?: string;
}) {
  if (!unlocked) {
    return (
      <div className="rounded-card border border-surface-line bg-surface-tint aspect-[3/4] sm:aspect-video flex flex-col items-center justify-center text-center p-8">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-ink-faint shadow-glass">
          <Lock size={22} />
        </span>
        <p className="mt-4 font-display font-semibold text-ink">This note is locked</p>
        <p className="mt-1 text-sm text-ink-faint max-w-xs">
          Enroll in this course to unlock {title} and every other PDF in the batch.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-surface-line overflow-hidden bg-white">
      <div className="relative">
        <iframe src={src} title={title} className="w-full aspect-[3/4] sm:aspect-video" />
        {watermark && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ opacity: 0.12 }}
          >
            <span className="rotate-[-30deg] text-4xl font-display font-bold text-ink whitespace-nowrap select-none">
              {watermark}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-surface-line">
        <p className="text-sm font-medium text-ink truncate pr-3">{title}</p>
        <a
          href={src}
          download
          className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 shrink-0"
        >
          <Download size={13} /> Download
        </a>
      </div>
    </div>
  );
}
