export function LegalPageLayout({
  eyebrow = "Legal",
  title,
  updated,
  children,
}: {
  eyebrow?: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-16">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-purple-500 mb-2">{eyebrow}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-ink-faint">Last updated: {updated}</p>

        <div
          className="mt-8 text-ink-soft leading-relaxed
            [&>h2]:font-display [&>h2]:font-bold [&>h2]:text-ink [&>h2]:text-xl [&>h2]:mt-9 [&>h2]:mb-2 [&>h2]:first:mt-0
            [&>p]:mt-2.5 [&>ul]:mt-2.5 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
