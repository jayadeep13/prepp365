"use client";

import { useEffect, useState } from "react";
import { Plus, X, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";

type AnnouncementRow = {
  _id: string;
  title: string;
  body?: string;
  pinned: boolean;
  createdAt: string;
};

const emptyForm = { title: "", body: "", pinned: false };

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/announcements")
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => setAnnouncements(data.announcements ?? []))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function togglePinned(id: string, pinned: boolean) {
    setError(null);
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !pinned }),
    });
    if (!res.ok) {
      setError("Could not update this announcement.");
      return;
    }
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this announcement?")) return;
    setError(null);
    const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not delete this announcement.");
      return;
    }
    setAnnouncements((prev) => prev.filter((a) => a._id !== id));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not post announcement");
      setFormOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post announcement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Announcements</h1>
          <p className="mt-1 text-sm text-white/50">Shown on the public homepage — everyone can see these.</p>
        </div>
        <Button variant="accent" size="sm" onClick={() => setFormOpen((v) => !v)} className="gap-1.5">
          {formOpen ? <X size={15} /> : <Plus size={15} />} {formOpen ? "Cancel" : "New announcement"}
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={handleCreate} className="mt-6 rounded-card border border-white/10 bg-white/5 p-6 grid gap-4">
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Live doubt session this Sunday" />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Details (optional)</label>
            <textarea
              rows={3}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className={inputClass}
              placeholder="Leave blank if the title says it all"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
            Pin to top
          </label>
          <div>
            <Button type="submit" disabled={saving}>{saving ? "Posting…" : "Post announcement"}</Button>
          </div>
        </form>
      )}

      {!formOpen && error && <p className="mt-6 text-xs text-red-400">{error}</p>}
      {loadError && <p className="mt-6 text-xs text-red-400">Couldn't load announcements. Check your connection and try again.</p>}

      <div className="mt-8 space-y-3">
        {announcements.map((a) => (
          <div key={a._id} className="rounded-card border border-white/10 bg-white/5 p-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {a.pinned && <Pin size={13} className="text-purple-400" />}
                <p className="font-semibold text-sm text-white">{a.title}</p>
              </div>
              {a.body && <p className="mt-1 text-sm text-white/60">{a.body}</p>}
              <p className="mt-2 text-xs text-white/30">{new Date(a.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <button onClick={() => togglePinned(a._id, a.pinned)} className="text-xs font-semibold text-purple-400 hover:text-purple-300">
                {a.pinned ? "Unpin" : "Pin"}
              </button>
              <button onClick={() => remove(a._id)} className="text-xs font-semibold text-red-400 hover:text-red-300">
                Delete
              </button>
            </div>
          </div>
        ))}
        {!loading && announcements.length === 0 && (
          <div className="rounded-card border border-dashed border-white/10 py-10 text-center text-white/40">
            No announcements yet.
          </div>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-400 placeholder:text-white/30";
