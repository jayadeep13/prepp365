"use client";

import { useEffect, useState } from "react";
import { MessagesSquare } from "lucide-react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { useSession } from "@/lib/auth/use-session";
import { cn } from "@/lib/utils";

type CourseOption = { _id: string; title: string };
type Thread = { studentId: string; studentName: string; studentEmail: string; lastBody: string; lastAt: string };

export default function AdminChatPage() {
  const { session } = useSession();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<{ type: "class" } | { type: "support"; studentId: string; studentName: string }>({ type: "class" });

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => {
        const list: CourseOption[] = data.courses ?? [];
        setCourses(list);
        setCourseId((prev) => prev ?? list[0]?._id ?? null);
      })
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    if (!courseId) return;
    function loadThreads() {
      fetch(`/api/admin/chat/threads?courseId=${courseId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Request failed");
          return res.json();
        })
        .then((data) => setThreads(data.threads ?? []))
        .catch(() => setLoadError(true));
    }
    loadThreads();
    const interval = setInterval(loadThreads, 8000);
    return () => clearInterval(interval);
  }, [courseId]);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-white">Chat</h1>
        {courses.length > 1 && (
          <select
            value={courseId ?? ""}
            onChange={(e) => setCourseId(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white outline-none"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        )}
      </div>

      {loadError ? (
        <div className="mt-8 rounded-card border border-red-500/20 bg-red-500/10 p-8 text-center">
          <p className="text-sm text-red-300">Couldn't load chat. Check your connection and try again.</p>
          <button onClick={() => window.location.reload()} className="mt-3 text-sm font-semibold text-purple-400">
            Retry
          </button>
        </div>
      ) : !courseId || !session ? (
        <p className="mt-8 text-sm text-white/40">Loading…</p>
      ) : (
        <div className="mt-6 grid lg:grid-cols-[280px_1fr] gap-5">
          <div className="rounded-card border border-white/10 bg-white/5 overflow-hidden h-fit">
            <button
              onClick={() => setSelected({ type: "class" })}
              className={cn(
                "w-full flex items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold border-b border-white/10",
                selected.type === "class" ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5"
              )}
            >
              <MessagesSquare size={15} /> Class chat
            </button>
            <div className="max-h-[50vh] overflow-y-auto">
              {threads.map((t) => (
                <button
                  key={t.studentId}
                  onClick={() => setSelected({ type: "support", studentId: t.studentId, studentName: t.studentName })}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-white/5",
                    selected.type === "support" && selected.studentId === t.studentId ? "bg-white/10" : "hover:bg-white/5"
                  )}
                >
                  <p className="text-sm font-semibold text-white truncate">{t.studentName}</p>
                  <p className="text-xs text-white/40 truncate">{t.lastBody}</p>
                </button>
              ))}
              {threads.length === 0 && (
                <p className="px-4 py-6 text-xs text-white/30">No support conversations yet.</p>
              )}
            </div>
          </div>

          <div>
            {selected.type === "class" ? (
              <ChatPanel
                endpoint="/api/chat/class"
                params={{ courseId }}
                currentUserId={session.uid}
                dark
                emptyText="No messages in the class chat yet."
              />
            ) : (
              <ChatPanel
                key={selected.studentId}
                endpoint="/api/chat/support"
                params={{ courseId, studentId: selected.studentId }}
                currentUserId={session.uid}
                dark
                emptyText={`No messages with ${selected.studentName} yet.`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
