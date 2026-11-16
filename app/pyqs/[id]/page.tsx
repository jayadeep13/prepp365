import Link from "next/link";
import { notFound } from "next/navigation";
import { getPyq } from "@/lib/db/pyqs";
import { PdfViewer } from "@/components/learn/pdf-viewer";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function PyqPaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paper = await getPyq(id, "paper");
  if (!paper || !paper.pdfUrl) notFound();

  return (
    <div className="container-page py-8 max-w-5xl">
      <Link href="/pyqs" className="text-sm font-semibold text-purple-600">
        ← All question papers
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone="purple">{paper.examTag}</Badge>
        {paper.year && <Badge tone="orange">{paper.year}</Badge>}
        <Badge tone="purple">Free</Badge>
      </div>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink">{paper.title}</h1>
      {paper.description && <p className="mt-2 text-sm text-ink-soft">{paper.description}</p>}
      <div className="mt-6">
        <PdfViewer src={paper.pdfUrl} title={paper.title} unlocked watermark="Prepp365" />
      </div>
    </div>
  );
}
