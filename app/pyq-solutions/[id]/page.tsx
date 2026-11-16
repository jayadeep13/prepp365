import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { getPyq } from "@/lib/db/pyqs";
import { getSession } from "@/lib/auth/session";
import { hasMockTestAccess } from "@/lib/auth/has-mocktest-access";
import { signedVideoUrl } from "@/lib/cloudinary";
import { VideoPlayer } from "@/components/learn/video-player";
import { PdfViewer } from "@/components/learn/pdf-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function PyqSolutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getPyq(id, "solution");
  if (!item) notFound();

  const session = await getSession();
  const hasAccess = item.isFree || (await hasMockTestAccess(session));

  const videoSrc =
    hasAccess && item.videoUrl
      ? (item.videoRestricted && item.videoPublicId && signedVideoUrl(item.videoPublicId)) || item.videoUrl
      : null;

  return (
    <div className="container-page py-8 max-w-5xl">
      <Link href="/pyq-solutions" className="text-sm font-semibold text-purple-600">
        ← All solved papers
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone="purple">{item.examTag}</Badge>
        {item.year && <Badge tone="orange">{item.year}</Badge>}
        {item.isFree && <Badge tone="purple">Free</Badge>}
      </div>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink">{item.title}</h1>
      {item.description && <p className="mt-2 text-sm text-ink-soft">{item.description}</p>}

      {!hasAccess ? (
        <div className="mt-6 rounded-card border border-surface-line bg-surface-tint aspect-video flex flex-col items-center justify-center text-center p-8">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-ink-faint shadow-glass">
            <Lock size={22} />
          </span>
          <p className="mt-4 font-display font-semibold text-ink">This solution is part of the mock test plan</p>
          <p className="mt-1 text-sm text-ink-faint max-w-xs">
            {session
              ? "Get a mock test plan to unlock every solved paper."
              : "Log in, or get a mock test plan to unlock every solved paper."}
          </p>
          <div className="mt-4 flex gap-3">
            {!session && (
              <Link href={`/login?next=/pyq-solutions/${item._id}`}>
                <Button variant="secondary" size="sm">
                  Log in
                </Button>
              </Link>
            )}
            <Link href="/#mock-test-pricing">
              <Button variant="accent" size="sm">
                View plans
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {videoSrc && (
            <section>
              <h2 className="font-display font-semibold text-ink mb-3">Video solution</h2>
              <VideoPlayer
                src={videoSrc}
                publicId={item.videoPublicId}
                deliveryType={item.videoRestricted ? "authenticated" : "upload"}
              />
            </section>
          )}
          {item.pdfUrl && (
            <section>
              <h2 className="font-display font-semibold text-ink mb-3">Solution PDF</h2>
              <PdfViewer src={item.pdfUrl} title={item.title} unlocked watermark="Prepp365" />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
