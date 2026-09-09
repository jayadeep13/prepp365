"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChatPanel } from "@/components/chat/chat-panel";
import { useSession } from "@/lib/auth/use-session";

type PurchasedCourse = { _id: string; title: string };

export default function DashboardChatPage() {
  const { session } = useSession();
  const [courses, setCourses] = useState<PurchasedCourse[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<"class" | "support">("class");

  useEffect(() => {
    fetch("/api/dashboard/my-courses")
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => setCourses(data.purchasedCourses ?? []))
      .catch(() => setLoadError(true));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Chat</h1>
      <p className="mt-1 text-sm text-ink-soft">Talk with classmates or ask Firdaus a question directly.</p>

      {loadError ? (
        <div className="mt-8 rounded-card border border-dashed border-red-200 bg-red-50 p-10 text-center">
          <p className="text-sm text-red-700">Couldn't load your courses. Check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block mt-3 text-sm font-semibold text-purple-600"
          >
            Retry
          </button>
        </div>
      ) : courses === null || !session ? (
        <p className="mt-8 text-sm text-ink-faint">Loading…</p>
      ) : courses.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-surface-line p-10 text-center">
          <p className="text-sm text-ink-faint">Enroll in the course to unlock chat.</p>
          <Link href="/courses" className="inline-block mt-3 text-sm font-semibold text-purple-600">
            View course →
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 flex gap-1 border-b border-surface-line">
            {(["class", "support"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-4 py-3 text-sm font-semibold border-b-2 transition-colors",
                  tab === t ? "border-purple-500 text-purple-600" : "border-transparent text-ink-soft hover:text-ink"
                )}
              >
                {t === "class" ? "Class chat" : "Support (private)"}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {tab === "class" ? (
              <ChatPanel
                endpoint="/api/chat/class"
                params={{ courseId: courses[0]._id }}
                currentUserId={session.uid}
                emptyText="No messages yet — say hello to your batchmates!"
              />
            ) : (
              <ChatPanel
                endpoint="/api/chat/support"
                params={{ courseId: courses[0]._id }}
                currentUserId={session.uid}
                emptyText="Ask Firdaus a doubt — she'll reply here."
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
