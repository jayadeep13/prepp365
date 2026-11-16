"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, CheckCircle2, Gauge, Maximize, Minimize, Captions } from "lucide-react";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const speedLabel = (s: number) => (s === 1 ? "Normal" : `${s}x`);

const SUBTITLE_LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी (Hindi)" },
] as const;
type SubtitleLang = "off" | (typeof SUBTITLE_LANGS)[number]["code"];

export function VideoPlayer({
  src,
  courseId,
  lessonId,
  publicId,
  deliveryType = "authenticated",
  initialPositionSeconds = 0,
  onComplete,
}: {
  src: string;
  /** Omit both to disable progress tracking (e.g. PYQ solution videos). */
  courseId?: string;
  lessonId?: string;
  /** Cloudinary public_id — enables the auto-generated English/Hindi subtitles. */
  publicId?: string;
  /** Delivery type the video was uploaded with. */
  deliveryType?: "authenticated" | "upload";
  initialPositionSeconds?: number;
  onComplete?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [subtitle, setSubtitle] = useState<SubtitleLang>("off");
  const [ccMenuOpen, setCcMenuOpen] = useState(false);
  const [ccUnavailable, setCcUnavailable] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0); // 0-100
  const [resumed, setResumed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const lastSavedRef = useRef(0);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Show only the selected subtitle track.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    for (const track of Array.from(video.textTracks)) {
      track.mode = track.language === subtitle ? "showing" : "disabled";
    }
  }, [subtitle]);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  }

  // Resume from saved position once metadata is loaded.
  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    if (initialPositionSeconds > 2 && initialPositionSeconds < video.duration - 5) {
      video.currentTime = initialPositionSeconds;
      setResumed(true);
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    setProgress(pct);

    // Save progress at most once every 5 seconds of playback.
    if (video.currentTime - lastSavedRef.current > 5) {
      lastSavedRef.current = video.currentTime;
      saveProgress(video.currentTime, video.duration, pct > 95);
    }
    if (pct > 95 && !completed) {
      setCompleted(true);
      saveProgress(video.currentTime, video.duration, true);
      onComplete?.();
    }
  }

  async function saveProgress(positionSeconds: number, durationSeconds: number, done: boolean) {
    if (!courseId || !lessonId) return;
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lessonId, positionSeconds, durationSeconds, completed: done }),
      });
    } catch {
      // Best-effort — a failed save shouldn't interrupt playback.
    }
  }

  // Save on unmount/navigation away.
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video && video.currentTime > 2) {
        saveProgress(video.currentTime, video.duration || 0, progress > 95);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    setSpeedMenuOpen(false);
    setCcMenuOpen(false);
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  function setPlaybackSpeed(rate: number) {
    const video = videoRef.current;
    if (video) video.playbackRate = rate;
    setSpeed(rate);
    setSpeedMenuOpen(false);
  }

  function chooseSubtitle(lang: SubtitleLang) {
    setSubtitle(lang);
    setCcMenuOpen(false);
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * video.duration;
  }

  return (
    <div ref={containerRef} className="rounded-card overflow-hidden bg-black">
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={src}
          className="h-full w-full"
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onClick={togglePlay}
        >
          {publicId &&
            SUBTITLE_LANGS.map((l) => (
              <track
                key={l.code}
                kind="subtitles"
                srcLang={l.code}
                label={l.label}
                src={`/api/subtitles?publicId=${encodeURIComponent(publicId)}&lang=${l.code}&type=${deliveryType}`}
                onError={() => setCcUnavailable((u) => ({ ...u, [l.code]: true }))}
              />
            ))}
        </video>

        {resumed && (
          <div className="absolute top-3 right-3 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-semibold text-white flex items-center gap-1.5">
            <RotateCcw size={12} /> Resumed from where you left off
          </div>
        )}

        {completed && (
          <div className="absolute top-3 left-3 rounded-full bg-green-500/90 px-3 py-1.5 text-[11px] font-semibold text-white flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Completed
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-ink px-4 py-3">
        <div onClick={handleSeek} className="h-1.5 w-full cursor-pointer rounded-full bg-white/15 mb-3 overflow-hidden">
          <div className="h-full bg-brand-gradient" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between">
          <button onClick={togglePlay} className="text-white grid h-8 w-8 place-items-center rounded-full hover:bg-white/10">
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <div className="flex items-center gap-1">
            {publicId && (
              <div className="relative">
                <button
                  onClick={() => {
                    setCcMenuOpen((v) => !v);
                    setSpeedMenuOpen(false);
                  }}
                  aria-label="Subtitles"
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold hover:bg-white/10",
                    subtitle === "off" ? "text-white" : "text-purple-300"
                  )}
                >
                  <Captions size={14} /> {subtitle === "off" ? "CC" : subtitle.toUpperCase()}
                </button>
                {ccMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 z-10 rounded-xl bg-white shadow-glass-lg overflow-hidden">
                    <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-ink-faint">Subtitles</p>
                    {(["off", ...SUBTITLE_LANGS.map((l) => l.code)] as SubtitleLang[]).map((code) => {
                      const label = code === "off" ? "Off" : SUBTITLE_LANGS.find((l) => l.code === code)!.label;
                      return (
                        <button
                          key={code}
                          onClick={() => chooseSubtitle(code)}
                          className={cn(
                            "block w-full px-4 py-2 text-left text-xs font-semibold whitespace-nowrap",
                            code === subtitle ? "bg-purple-50 text-purple-700" : "text-ink-soft hover:bg-surface-tint"
                          )}
                        >
                          {label}
                          {code !== "off" && ccUnavailable[code] && (
                            <span className="ml-1.5 font-normal text-ink-faint">(not ready yet)</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => {
                  setSpeedMenuOpen((v) => !v);
                  setCcMenuOpen(false);
                }}
                aria-label="Playback speed"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
              >
                <Gauge size={13} /> {speedLabel(speed)}
              </button>
              {speedMenuOpen && (
                <div className="absolute bottom-full right-0 mb-2 z-10 rounded-xl bg-white shadow-glass-lg overflow-hidden">
                  <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-ink-faint">Speed</p>
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={cn(
                        "block w-full px-4 py-2 text-left text-xs font-semibold whitespace-nowrap",
                        s === speed ? "bg-purple-50 text-purple-700" : "text-ink-soft hover:bg-surface-tint"
                      )}
                    >
                      {speedLabel(s)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              aria-label={fullscreen ? "Exit full screen" : "Full screen"}
              className="grid h-8 w-8 place-items-center rounded-full text-white hover:bg-white/10"
            >
              {fullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
