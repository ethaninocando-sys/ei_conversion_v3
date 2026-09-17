"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { VideoSlotKey } from "@/content/types";
import { videos, mediaUrl } from "@/content/videos";
import { track } from "@/lib/analytics";

interface Props {
  slot: VideoSlotKey;
  /** Only the home hero poster should be priority-loaded. */
  priority?: boolean;
}

function formatDuration(seconds?: number): string | null {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Native player. Before intent: poster + a real button. No <video> element,
 * not even metadata, loads before the click. When the slot is not ready or
 * the media base URL is unset, a neutral "coming soon" card renders instead.
 */
export function VideoPlayer({ slot, priority = false }: Props) {
  const meta = videos[slot];
  const media = mediaUrl(slot);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const quartiles = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!playing) return;
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      // Autoplay policies can reject; the controls remain usable.
    });
  }, [playing]);

  if (!media) {
    return (
      <div
        className="flex aspect-video w-full items-center justify-center rounded-lg border border-line bg-white"
        role="img"
        aria-label={`${meta.title}. Video coming soon.`}
      >
        <div className="px-6 text-center">
          <p className="h3 text-navy">{meta.title}</p>
          <p className="mt-2 text-muted">Video coming soon</p>
        </div>
      </div>
    );
  }

  const duration = formatDuration(meta.durationSeconds);

  if (playing) {
    return (
      <video
        ref={videoRef}
        className="aspect-video w-full rounded-lg bg-black"
        controls
        playsInline
        preload="none"
        poster={media.poster}
        src={media.src}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (!el.duration) return;
          const pct = Math.floor((el.currentTime / el.duration) * 100);
          for (const q of [25, 50, 75, 100]) {
            if (pct >= q && !quartiles.current.has(q)) {
              quartiles.current.add(q);
              track("video_progress", { slot, pct: q });
            }
          }
        }}
        onEnded={() => {
          if (!quartiles.current.has(100)) {
            quartiles.current.add(100);
            track("video_progress", { slot, pct: 100 });
          }
        }}
      >
        <track kind="captions" />
      </video>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-navy">
      <Image
        src={media.poster}
        alt=""
        fill
        sizes="(min-width: 1152px) 1152px, 100vw"
        priority={priority}
        className="object-cover"
      />
      <button
        type="button"
        className="absolute inset-0 flex items-center justify-center bg-navy/20 transition-colors hover:bg-navy/30"
        onClick={() => {
          track("video_play", { slot });
          setPlaying(true);
        }}
      >
        <span className="inline-flex items-center gap-3 rounded-md bg-amber px-5 py-3 font-semibold text-navy">
          <span aria-hidden="true">&#9654;</span>
          <span>Play video: {meta.title}</span>
        </span>
      </button>
      {duration && (
        <span className="absolute bottom-3 right-3 rounded-sm bg-navy/80 px-2 py-1 text-xs text-offwhite">
          {duration}
        </span>
      )}
    </div>
  );
}
