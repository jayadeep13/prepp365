"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";
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

export function CloudinaryUploader({
  resourceType,
  folder,
  label = "Upload file",
  restricted = false,
  onUploaded,
}: {
  resourceType: "video" | "image" | "raw";
  folder: "lessons" | "materials" | "banners" | "mocktest-pdfs" | "thumbnails";
  label?: string;
  /** Uploads with Cloudinary delivery type "authenticated" instead of "upload" — the resulting
   * secure_url is not publicly fetchable; a signed URL must be generated server-side to play it.
   * Used for lesson videos so students can't grab a permanent direct download link. */
  restricted?: boolean;
  onUploaded: (result: UploadResult) => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setError(null);
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
        },
        (err, result) => {
          if (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
            setStatus("error");
            return;
          }
          if (result?.event === "success" && result.info) {
            onUploaded({ secureUrl: result.info.secure_url, publicId: result.info.public_id });
            setStatus("done");
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
      <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={open} disabled={status === "loading"}>
        {status === "done" ? <CheckCircle2 size={14} className="text-green-600" /> : <UploadCloud size={14} />}
        {status === "loading" ? "Opening…" : status === "done" ? "Uploaded — replace" : label}
      </Button>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
