"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import type { MusicSpec } from "../types";
import { AudioLoop, MusicBox, TRACK_IDS, type Player, type TrackId } from "./synth";

type MusicCtl = { pause: () => void; resume: () => void };
const MusicContext = createContext<MusicCtl>({ pause: () => {}, resume: () => {} });
export const useMusic = () => useContext(MusicContext);

/** The template's own song (set in /admin). Provided by CardRenderer. */
export const TemplateMusicContext = createContext<MusicSpec>(null);

/**
 * Full-screen card wrapper: background, floating music toggle, and music that
 * starts on the recipient's first tap (browsers block autoplay before that).
 *
 * `music` is the buyer's choice: "template" (or empty) = the template's song,
 * a built-in track key, or "none".
 */
export function Stage({
  children,
  className = "",
  music,
  pattern,
}: {
  children: ReactNode;
  className?: string;
  music?: string;
  pattern?: "gingham" | "dots" | "none";
}) {
  const templateMusic = useContext(TemplateMusicContext);
  const spec: MusicSpec =
    !music || music === "template"
      ? templateMusic
      : music === "none"
        ? null
        : TRACK_IDS.includes(music as TrackId)
          ? { kind: "builtin", track: music as TrackId }
          : null;
  const specKey = spec ? (spec.kind === "url" ? spec.url : spec.track) : "";
  const track = spec ? specKey : null;
  const box = useRef<Player | null>(null);
  const [on, setOn] = useState(false);
  const userMuted = useRef(false);
  const paused = useRef(false);

  useEffect(() => {
    if (!spec) return;
    box.current = spec.kind === "url" ? new AudioLoop(spec.url) : new MusicBox(spec.track);
    return () => box.current?.dispose();
    // specKey captures every change that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specKey]);

  const firstTap = useCallback(() => {
    if (!box.current || box.current.playing || userMuted.current || paused.current) return;
    box.current.start();
    setOn(true);
  }, []);

  const ctl: MusicCtl = {
    pause: () => {
      paused.current = true;
      box.current?.stop();
      setOn(false);
    },
    resume: () => {
      paused.current = false;
      if (!userMuted.current && box.current) {
        box.current.start();
        setOn(true);
      }
    },
  };

  function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!box.current) return;
    if (box.current.playing) {
      box.current.stop();
      userMuted.current = true;
      setOn(false);
    } else {
      userMuted.current = false;
      box.current.start();
      setOn(true);
    }
  }

  const patternStyle =
    pattern === "gingham"
      ? {
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(236,72,153,.08) 0 18px, transparent 18px 36px), repeating-linear-gradient(90deg, rgba(236,72,153,.08) 0 18px, transparent 18px 36px)",
        }
      : pattern === "dots"
        ? { backgroundImage: "radial-gradient(rgba(190,24,93,.12) 1.5px, transparent 1.5px)", backgroundSize: "22px 22px" }
        : undefined;

  return (
    <MusicContext.Provider value={ctl}>
      <div
        data-stage
        onPointerDown={firstTap}
        className={`relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden px-5 pb-28 pt-16 ${className}`}
        style={patternStyle}
      >
        {children}
        {track && (
          <button
            onClick={toggle}
            aria-label={on ? "Mute music" : "Play music"}
            className="fixed right-4 top-4 z-30 grid h-11 w-11 place-items-center rounded-full bg-white/80 text-lg shadow-md backdrop-blur"
          >
            <motion.span animate={on ? { scale: [1, 1.2, 1] } : { scale: 1 }} transition={on ? { repeat: Infinity, duration: 1.2 } : {}}>
              {on ? "♫" : "🔇"}
            </motion.span>
          </button>
        )}
      </div>
    </MusicContext.Provider>
  );
}
