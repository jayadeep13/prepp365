import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayCircle, FileText, ClipboardList, Lock, CheckCircle2 } from "lucide-react";
import { connectDB } from "@/lib/db/connect";
import { CourseModel } from "@/models/Course";
import { ProgressModel } from "@/models/Progress";
import { getSession } from "@/lib/auth/session";
import { hasPurchased } from "@/lib/auth/has-purchased";
import { signedVideoUrl } from "@/lib/cloudinary";
import { VideoPlayer } from "@/components/learn/video-player";
import { PdfViewer } from "@/components/learn/pdf-viewer";
import { cn } from "@/lib/utils";

type LessonLean = {
  _id: string;
  title: string;
  type: "video" | "pdf" | "test";
  duration?: string;
  isFreePreview?: boolean;
  videoUrl?: string;
  videoPublicId?: string;
  pdfUrl?: string;
};
type ChapterLean = { _id: string; title: string; lessons: LessonLean[] };
type CourseLean = { _id: string; title: string; slug: string; curriculum: ChapterLean[] };

async function loadData(courseSlug: string, lessonId: string) {
  await connectDB();
  const session = await getSession();

  const course = (await CourseModel.findOne({ slug: courseSlug }).lean()) as unknown as CourseLean | null;
  if (!course) return null;

  let lesson: LessonLean | null = null;
  let chapter: ChapterLean | null = null;
  for (const ch of course.curriculum ?? []) {
    const found = ch.lessons.find((l) => l._id.toString() === lessonId);
    if (found) {
      lesson = found;
      chapter = ch;
      break;
    }
  }
  if (!lesson) return null;

  let hasAccess = Boolean(lesson.isFreePreview);
  let progress: { positionSeconds: number } | null = null;

  if (session) {
    if (!hasAccess) hasAccess = await hasPurchased(session, course._id.toString());
    if (hasAccess && lesson.type === "video") {
      progress = await ProgressModel.findOne({ user: session.uid, lessonId }).lean();
    }
  }

  return { course, lesson, chapter, hasAccess, progress };
}

export default async function LearnPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;

  let data;
  try {
    data = await loadData(slug, lessonId);
  } catch {
    data = null;
  }

  if (!data) notFound();
  const { course, lesson, chapter, hasAccess, progress } = data;

  // Flatten for prev/next navigation.
  const flat = (course.curriculum ?? []).flatMap((ch) => ch.lessons.map((l) => ({ ...l, chapterTitle: ch.title })));
  const currentIndex = flat.findIndex((l) => l._id.toString() === lessonId);
  const prevLesson = currentIndex > 0 ? flat[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null;

  return (
    <div className="container-page py-8">
      <div className="mb-5">
        <Link href={`/courses/${course.slug}`} className="text-sm font-semibold text-purple-600">
          ← {course.title}
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <p className="text-xs font-mono text-purple-600 uppercase tracking-wide">{chapter?.title}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">{lesson.title}</h1>

          <div className="mt-5">
            {!hasAccess ? (
              <div className="rounded-card border border-surface-line bg-surface-tint aspect-video flex flex-col items-center justify-center text-center p-8">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-ink-faint shadow-glass">
                  <Lock size={22} />
                </span>
                <p className="mt-4 font-display font-semibold text-ink">This lesson is locked</p>
                <p className="mt-1 text-sm text-ink-faint max-w-xs">
                  Enroll in {course.title} to unlock this and every other lesson in the batch.
                </p>
                <Link href={`/courses/${course.slug}`} className="mt-4 text-sm font-semibold text-purple-600">
                  View course →
                </Link>
              </div>
            ) : lesson.type === "video" ? (
              lesson.videoUrl ? (
                <VideoPlayer
                  src={(lesson.videoPublicId && signedVideoUrl(lesson.videoPublicId)) || lesson.videoUrl}
                  courseId={course._id.toString()}
                  lessonId={lesson._id.toString()}
                  initialPositionSeconds={progress?.positionSeconds ?? 0}
                />
              ) : (
                <EmptyState text="No video URL has been added to this lesson yet." />
              )
            ) : lesson.type === "pdf" ? (
              lesson.pdfUrl ? (
                <PdfViewer src={lesson.pdfUrl} title={lesson.title} unlocked watermark="Prepp365" />
              ) : (
                <EmptyState text="No PDF has been added to this lesson yet." />
              )
            ) : (
              <EmptyState text="This is a test lesson — attempt it from Mock Tests." />
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            {prevLesson ? (
              <Link
                href={`/courses/${course.slug}/learn/${prevLesson._id}`}
                className="text-sm font-semibold text-ink-soft hover:text-ink"
              >
                ← {prevLesson.title}
              </Link>
            ) : (
              <span />
            )}
            {nextLesson && (
              <Link
                href={`/courses/${course.slug}/learn/${nextLesson._id}`}
                className="text-sm font-semibold text-purple-600"
              >
                {nextLesson.title} →
              </Link>
            )}
          </div>
        </div>

        {/* Lesson list sidebar */}
        <aside className="rounded-card border border-surface-line bg-white p-4 h-fit lg:sticky lg:top-24">
          <p className="font-display font-semibold text-ink text-sm mb-3 px-1">Course content</p>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {(course.curriculum ?? []).map((ch) => (
              <div key={ch._id.toString()}>
                <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide px-1 mb-1.5">{ch.title}</p>
                <ul className="space-y-0.5">
                  {ch.lessons.map((l) => {
                    const Icon = l.type === "video" ? PlayCircle : l.type === "pdf" ? FileText : ClipboardList;
                    const active = l._id.toString() === lessonId;
                    return (
                      <li key={l._id.toString()}>
                        <Link
                          href={`/courses/${course.slug}/learn/${l._id}`}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
                            active ? "bg-purple-50 text-purple-700 font-semibold" : "text-ink-soft hover:bg-surface-tint"
                          )}
                        >
                          <Icon size={15} className="shrink-0" />
                          <span className="flex-1 truncate">{l.title}</span>
                          {l.isFreePreview && !active && <CheckCircle2 size={13} className="text-green-500 shrink-0" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-card border border-dashed border-surface-line aspect-video flex items-center justify-center text-center p-8">
      <p className="text-sm text-ink-faint max-w-xs">{text}</p>
    </div>
  );
}
