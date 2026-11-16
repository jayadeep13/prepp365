"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, Captions } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: { event: string; info?: { secure_url: string; public_id: string } }) => void
      ) => { open: () => void };
    };
  }
}

let widgetScriptPromise: Promise<void> | null = null;
function loadWidgetScript(): Promise<void> {
  if (typeof window !== "undefined" && window.cloudinary) return Promise.resolve();
  if (!widgetScriptPromise) {
    widgetScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/latest/global/all.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load Cloudinary widget"));
      document.body.appendChild(script);
    });
  }
  return widgetScriptPromise;
}

type UploadResult = { secureUrl: string; publicId: string };

const GB = 1024 * 1024 * 1024;
const MB = 1024 * 1024;
// Client-side ceiling per resource type. Videos up to 3 GB are sent in 20 MB
// chunks by the widget. NOTE: the Cloudinary *account plan* also enforces its
// own max file size (Free plan = 100 MB for video) — the upload is rejected by
// Cloudinary if the plan limit is lower than this.
const MAX_FILE_SIZE: Record<"video" | "image" | "raw", number> = {
  video: 3 * GB,
  image: 20 * MB,
  raw: 100 * MB,
};

export function CloudinaryUploader({
  resourceType,
  folder,
  label = "Upload file",
  restricted = false,
  autoSubtitles,
  allowedFormats,
  onUploaded,
}: {
  resourceType: "video" | "image" | "raw";
  folder: "lessons" | "materials" | "banners" | "mocktest-pdfs" | "thumbnails" | "pyqs";
  label?: string;
  /** Uploads with Cloudinary delivery type "authenticated" instead of "upload" — the resulting
   * secure_url is not publicly fetchable; a signed URL must be generated server-side to play it.
   * Used for lesson videos so students can't grab a permanent direct download link. */
  restricted?: boolean;
  /** Video only: after upload, ask Cloudinary to auto-generate English + Hindi subtitles.
   * Defaults to true for videos. */
  autoSubtitles?: boolean;
  /** Restrict selectable file extensions, e.g. ["pdf", "docx"]. */
  allowedFormats?: string[];
  onUploaded: (result: UploadResult) => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [spokenLanguage, setSpokenLanguage] = useState<"hi" | "en">("hi");
  const [subtitleNote, setSubtitleNote] = useState<string | null>(null);
  const wantsSubtitles = resourceType === "video" && autoSubtitles !== false;

  async function requestSubtitles(publicId: string) {
    setSubtitleNote("Generating English & Hindi subtitles in the background…");
    try {
      const res = await fetch("/api/admin/cloudinary/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, restricted, spokenLanguage }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Subtitle request failed");
      setSubtitleNote("Subtitles requested — they appear in the player in a few minutes (after Cloudinary finishes processing).");
    } catch (err) {
      setSubtitleNote(`Video uploaded, but subtitles could not be requested: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  async function open() {
    setError(null);
    setSubtitleNote(null);
    setStatus("loading");
    try {
      const cfgRes = await fetch("/api/admin/cloudinary/sign");
      const cfg = await cfgRes.json();
      if (!cfgRes.ok) throw new Error(cfg.error || "Cloudinary is not configured.");

      await loadWidgetScript();
      if (!window.cloudinary) throw new Error("Cloudinary widget failed to load.");

      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: cfg.cloudName,
          apiKey: cfg.apiKey,
          uploadSignature: async (callback: (signature: string) => void, paramsToSign: Record<string, unknown>) => {
            const res = await fetch("/api/admin/cloudinary/sign", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paramsToSign }),
            });
            const data = await res.json();
            callback(data.signature);
          },
          folder: `prepp365/${folder}`,
          resourceType,
          type: restricted ? "authenticated" : "upload",
          sources: ["local"],
          multiple: false,
          maxFiles: 1,
          maxFileSize: MAX_FILE_SIZE[resourceType],
          // Large files are uploaded in chunks so a 3 GB video doesn't need one giant request.
          chunkSize: 20 * MB,
          ...(allowedFormats ? { clientAllowedFormats: allowedFormats } : {}),
        },
        (err, result) => {
          if (err) {
            setError(err instanceof Error ? err.message : typeof err === "object" && err && "statusText" in err ? String((err as { statusText: unknown }).statusText) : "Upload failed");
            setStatus("error");
            return;
          }
          if (result?.event === "success" && result.info) {
            onUploaded({ secureUrl: result.info.secure_url, publicId: result.info.public_id });
            setStatus("done");
            if (wantsSubtitles) requestSubtitles(result.info.public_id);
          }
        }
      );
      widget.open();
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open uploader");
      setStatus("error");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={open} disabled={status === "loading"}>
          {status === "done" ? <CheckCircle2 size={14} className="text-green-600" /> : <UploadCloud size={14} />}
          {status === "loading" ? "Opening…" : status === "done" ? "Uploaded — replace" : label}
        </Button>
        {wantsSubtitles && (
          <label className="flex items-center gap-1.5 text-[11px] text-white/50">
            <Captions size={13} /> Spoken language:
            <select
              value={spokenLanguage}
              onChange={(e) => setSpokenLanguage(e.target.value as "hi" | "en")}
              className="rounded-md border border-white/10 bg-white/5 px-1.5 py-1 text-[11px] text-white outline-none"
            >
              <option value="hi" className="text-black">Hindi</option>
              <option value="en" className="text-black">English</option>
            </select>
          </label>
        )}
      </div>
      {resourceType === "video" && <p className="mt-1 text-[11px] text-white/30">Max 3 GB per video.</p>}
      {subtitleNote && <p className="mt-1.5 text-[11px] text-white/50">{subtitleNote}</p>}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
