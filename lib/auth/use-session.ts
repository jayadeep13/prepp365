"use client";

import { useEffect, useState, useCallback } from "react";
import type { SessionPayload } from "./jwt";

const SESSION_EVENT = "prepp365:session-changed";

/** Call after login / logout so every mounted useSession() (e.g. the header) re-fetches. */
export function notifySessionChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_EVENT));
}

export function useSession() {
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setSession(data.user ?? null);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(SESSION_EVENT, refresh);
    return () => window.removeEventListener(SESSION_EVENT, refresh);
  }, [refresh]);

  return { session, loading, refresh };
}
