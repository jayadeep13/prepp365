import { Pin } from "lucide-react";
import { connectDB } from "@/lib/db/connect";
import { AnnouncementModel } from "@/models/Announcement";

async function loadAnnouncements() {
  try {
    await connectDB();
  } catch {
    return [];
  }
  const docs = await AnnouncementModel.find().sort({ pinned: -1, createdAt: -1 }).limit(8).lean();
  return docs.map((a) => ({
    _id: String(a._id),
    title: a.title,
    body: a.body,
    pinned: a.pinned ?? false,
  }));
}

export async function AnnouncementTicker() {
  const announcements = await loadAnnouncements();
  if (announcements.length === 0) return null;

  // Repeat the list so short sets (even a single announcement) still read as
  // a dense, continuous flow instead of one item followed by a long gap.
  const repeats = Math.max(1, Math.ceil(6 / announcements.length));
  const set = Array.from({ length: repeats }, () => announcements).flat();
  const track = [...set, ...set];
  // Keep a steady reading speed per item regardless of how many times we repeated the set.
  const durationSeconds = Math.max(set.length * 4.5, 10);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-100 via-purple-50 to-blue-100">
      <div
        className="flex w-max animate-marquee py-2 hover:[animation-play-state:paused]"
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        {track.map((a, i) => (
          <span key={`${a._id}-${i}`} className="flex shrink-0 items-center gap-1.5 px-2 text-xs sm:text-sm whitespace-nowrap">
            {a.pinned && <Pin size={12} className="shrink-0 text-purple-600" />}
            <span className="font-bold text-orange-600">{a.title}</span>
            {a.body && <span className="font-medium text-ink-faint">— {a.body}</span>}
            <span className="ml-1.5 text-purple-300">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
