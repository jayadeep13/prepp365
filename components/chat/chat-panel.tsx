"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatMessage = {
  _id: string;
  body: string;
  sender: string;
  senderRole: "student" | "admin";
  senderName: string;
  createdAt: string;
};

export function ChatPanel({
  endpoint,
  params,
  currentUserId,
  emptyText = "No messages yet. Say hello!",
  dark = false,
}: {
  endpoint: "/api/chat/class" | "/api/chat/support";
  /** Extra query/body params always sent, e.g. { courseId } or { courseId, studentId }. */
  params: Record<string, string>;
  currentUserId: string;
  emptyText?: string;
  /** Use dark-theme styling to match the admin panel. */
  dark?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastIdRef = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const paramsKey = JSON.stringify(params);

  const poll = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    const qs = new URLSearchParams(params);
    if (lastIdRef.current) qs.set("after", lastIdRef.current);
    try {
      const res = await fetch(`${endpoint}?${qs.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load messages");
        return;
      }
      setError(null);
      const incoming: ChatMessage[] = data.messages ?? [];
      if (incoming.length > 0) {
        lastIdRef.current = incoming[incoming.length - 1]._id;
        setMessages((prev) => [...prev, ...incoming]);
      }
    } catch {
      setError("Could not load messages");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, paramsKey]);

  useEffect(() => {
    setMessages([]);
    lastIdRef.current = null;
    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, body: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send message");
      setInput("");
      await poll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col h-[60vh] rounded-card border overflow-hidden",
        dark ? "border-white/10 bg-white/5" : "border-surface-line bg-white"
      )}
    >
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className={cn("text-sm text-center py-10", dark ? "text-white/40" : "text-ink-faint")}>{emptyText}</p>
        )}
        {messages.map((m) => {
          const mine = m.sender === currentUserId;
          return (
            <div key={m._id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                  mine ? "bg-brand-gradient text-white" : dark ? "bg-white/10 text-white/90" : "bg-surface-tint text-ink"
                )}
              >
                {!mine && <p className="text-xs font-semibold opacity-70 mb-0.5">{m.senderName}</p>}
                <p className="leading-relaxed">{m.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="px-4 text-xs text-red-400">{error}</p>}
      <form onSubmit={send} className={cn("border-t p-3 flex items-center gap-2", dark ? "border-white/10" : "border-surface-line")}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className={cn(
            "flex-1 rounded-full border px-4 py-2.5 text-sm outline-none",
            dark
              ? "border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-purple-400"
              : "border-surface-line focus:border-purple-400"
          )}
        />
        <Button type="submit" size="sm" disabled={sending || !input.trim()} className="shrink-0 gap-1.5">
          <Send size={14} /> Send
        </Button>
      </form>
    </div>
  );
}
