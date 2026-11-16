import { v2 as cloudinary } from "cloudinary";

/**
 * Lesson videos are uploaded with delivery type "authenticated" (see
 * components/admin/cloudinary-uploader.tsx `restricted` prop), so the plain
 * secure_url stored on the lesson 404s without a signature. This generates
 * that signed URL on demand, server-side, only after the caller has already
 * verified the viewer has purchased access.
 */
export function signedVideoUrl(publicId: string): string | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;

  return cloudinary.url(publicId, {
    resource_type: "video",
    type: "authenticated",
    sign_url: true,
    secure: true,
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

function configured() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret };
}

// Language codes used for the translated transcript file name
// (Cloudinary appends the code: "<public_id>.<code>.transcript").
const TRANSLATE_CODE = { en: "en-US", hi: "hi-IN" } as const;
const DEVANAGARI = /[ऀ-ॿ]/;

/**
 * Requests Cloudinary's built-in auto transcription for an existing video,
 * plus a translation into the other language, so both English and Hindi
 * subtitles are available. Translation needs the (free-tier) Google
 * Translation add-on enabled on the Cloudinary account.
 */
export async function requestAutoSubtitles(
  publicId: string,
  type: "authenticated" | "upload",
  spokenLanguage: "hi" | "en"
) {
  const cfg = configured();
  if (!cfg) throw new Error("Cloudinary is not configured.");
  const other = spokenLanguage === "hi" ? "en" : "hi";
  return cloudinary.uploader.explicit(publicId, {
    ...cfg,
    resource_type: "video",
    type,
    auto_transcription: {
      original_language: spokenLanguage,
      translate: [TRANSLATE_CODE[other]],
    },
  } as Record<string, unknown>);
}

type TranscriptWord = { word?: string; start_time?: number; end_time?: number };
type TranscriptExcerpt = {
  transcript?: string;
  start_time?: number;
  end_time?: number;
  words?: TranscriptWord[];
};

async function tryFetchJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Loads the transcript for the requested subtitle language. The original
 * transcript ("<id>.transcript") is in the spoken language; the translation
 * is "<id>.<code>.transcript". Which language the original is in is detected
 * from its script, so nothing extra needs to be stored on the lesson.
 */
export async function fetchTranscript(
  publicId: string,
  lang: "en" | "hi",
  type: "authenticated" | "upload"
): Promise<TranscriptExcerpt[] | null> {
  const cfg = configured();
  if (!cfg) return null;

  const urlFor = (rawId: string, deliveryType: string) =>
    cloudinary.url(rawId, {
      ...cfg,
      resource_type: "raw",
      type: deliveryType,
      sign_url: deliveryType === "authenticated",
      secure: true,
    });

  const deliveryTypes = type === "authenticated" ? ["authenticated", "upload"] : ["upload"];
  const candidates = [`${publicId}.${TRANSLATE_CODE[lang]}.transcript`, `${publicId}.${lang}.transcript`];

  for (const rawId of candidates) {
    for (const dt of deliveryTypes) {
      const data = await tryFetchJson(urlFor(rawId, dt));
      if (Array.isArray(data) && data.length) return data as TranscriptExcerpt[];
    }
  }

  // Fall back to the original transcript, but only if it's actually in the requested language.
  for (const dt of deliveryTypes) {
    const data = await tryFetchJson(urlFor(`${publicId}.transcript`, dt));
    if (Array.isArray(data) && data.length) {
      const text = (data as TranscriptExcerpt[]).map((e) => e.transcript ?? "").join(" ");
      const isHindi = DEVANAGARI.test(text);
      if ((lang === "hi") === isHindi) return data as TranscriptExcerpt[];
      return null;
    }
  }
  return null;
}

function vttTime(seconds: number) {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec.toFixed(3).padStart(6, "0")}`;
}

/** Converts Cloudinary's transcript JSON into WebVTT, splitting long excerpts into short cues. */
export function transcriptToVtt(excerpts: TranscriptExcerpt[]): string {
  const cues: string[] = [];
  const WORDS_PER_CUE = 10;

  for (const ex of excerpts) {
    const words = (ex.words ?? []).filter(
      (w) => w.word && typeof w.start_time === "number" && typeof w.end_time === "number"
    );
    if (words.length) {
      for (let i = 0; i < words.length; i += WORDS_PER_CUE) {
        const chunk = words.slice(i, i + WORDS_PER_CUE);
        cues.push(
          `${vttTime(chunk[0].start_time!)} --> ${vttTime(chunk[chunk.length - 1].end_time!)}\n${chunk.map((w) => w.word).join(" ")}`
        );
      }
    } else if (ex.transcript && typeof ex.start_time === "number" && typeof ex.end_time === "number") {
      cues.push(`${vttTime(ex.start_time)} --> ${vttTime(ex.end_time)}\n${ex.transcript.trim()}`);
    }
  }

  return `WEBVTT\n\n${cues.map((c, i) => `${i + 1}\n${c}`).join("\n\n")}\n`;
}
