"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CardProps } from "../types";
import { useMusic } from "./Stage";
import { youtubeId } from "./youtube";

type Theme = {
  /** Heading / text color class. */
  ink: string;
  /** Pill button classes. */
  button: string;
  box: string;
  ribbon: string;
  font?: string;
};

type Gift = { key: "memories" | "song" | "letter"; label: string };

export function giftsFor({ data, photos }: CardProps): Gift[] {
  const out: Gift[] = [];
  if (["memory1", "memory2", "memory3"].some((k) => photos[k])) out.push({ key: "memories", label: "Our memories" });
  if (youtubeId(data.song)) out.push({ key: "song", label: "A song for you" });
  if (data.letter) out.push({ key: "letter", label: "A letter for you" });
  return out;
}

/** Row of gift boxes. Each opens a memory wall, a song, or a letter. */
export function Gifts({ card, theme }: { card: CardProps; theme: Theme }) {
  const gifts = giftsFor(card);
  const [open, setOpen] = useState<Gift["key"] | null>(null);
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const music = useMusic();

  if (gifts.length === 0) return null;

  function show(key: Gift["key"]) {
    setOpen(key);
    setOpened((s) => new Set(s).add(key));
    if (key === "song") music.pause();
  }
  function close() {
    if (open === "song") music.resume();
    setOpen(null);
  }

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-5">
          {gifts.map((g, i) => (
            <motion.button
              key={g.key}
              onClick={() => show(g.key)}
              aria-label={`Open gift: ${g.label}`}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1, rotate: opened.has(g.key) ? 0 : [0, -6, 6, -3, 0] }}
              transition={{ delay: 0.3 + i * 0.15, rotate: { repeat: Infinity, repeatDelay: 2 + i, duration: 0.6 } }}
              whileTap={{ scale: 0.9 }}
            >
              <GiftBox box={theme.box} ribbon={theme.ribbon} open={opened.has(g.key)} />
            </motion.button>
          ))}
        </div>
        <p className={`text-sm opacity-70 ${theme.ink}`}>tap a gift to open ✨</p>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key={open}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex overflow-y-auto px-5 py-10 backdrop-blur-md"
            style={{ backgroundColor: "rgba(255,250,252,.94)" }}
          >
            <motion.div initial={{ y: 24, scale: 0.96 }} animate={{ y: 0, scale: 1 }} className="m-auto flex w-full max-w-xl flex-col items-center gap-6">
              {open === "memories" && <Memories photos={card.photos} theme={theme} />}
              {open === "song" && <Song id={youtubeId(card.data.song)!} theme={theme} />}
              {open === "letter" && <LetterView text={card.data.letter} from={card.data.fromName} theme={theme} />}
              <button onClick={close} className={`rounded-full px-7 py-2.5 font-semibold shadow ${theme.button}`}>
                go back
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Memories({ photos, theme }: { photos: Record<string, string>; theme: Theme }) {
  const list = ["memory1", "memory2", "memory3"].map((k) => photos[k]).filter(Boolean);
  return (
    <>
      <h2 className={`text-2xl font-bold ${theme.ink} ${theme.font ?? ""}`}>Our Memories</h2>
      <div className="grid grid-cols-2 place-items-center gap-4 sm:grid-cols-3">
        {list.map((src, i) => (
          <motion.figure
            key={src}
            initial={{ opacity: 0, y: 20, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: [-4, 3, -2][i] }}
            transition={{ delay: i * 0.15 }}
            className="last:odd:col-span-2 sm:last:odd:col-span-1"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="aspect-square w-[38vw] max-w-52 object-cover drop-shadow-lg" />
          </motion.figure>
        ))}
      </div>
    </>
  );
}

function Song({ id, theme }: { id: string; theme: Theme }) {
  return (
    <>
      <h2 className={`text-2xl font-bold ${theme.ink} ${theme.font ?? ""}`}>The song that reminds me of you</h2>
      <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-lg">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`}
          title="Song"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </>
  );
}

export function LetterView({ text, from, theme }: { text: string; from?: string; theme: Theme }) {
  return (
    <>
      <h2 className={`text-2xl font-bold ${theme.ink} ${theme.font ?? ""}`}>Letter for You</h2>
      <div
        className="w-full rounded-2xl bg-[#fffdf7] p-6 text-left font-type leading-relaxed text-stone-800 shadow-lg sm:p-8"
        style={{ backgroundImage: "repeating-linear-gradient(transparent 0 27px, rgba(244,114,182,.18) 27px 28px)" }}
      >
        <p className="whitespace-pre-line">{text}</p>
        {from && <p className="mt-6 text-right">— {from} 💜</p>}
      </div>
    </>
  );
}

export function GiftBox({ box, ribbon, open }: { box: string; ribbon: string; open?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="h-20 w-20 drop-shadow-md sm:h-24 sm:w-24">
      <motion.g animate={open ? { y: -8, rotate: -12 } : { y: 0, rotate: 0 }} style={{ originX: "20%", originY: "100%" }}>
        <rect x="6" y="18" width="52" height="12" rx="3" className={box} />
        <rect x="28" y="18" width="8" height="12" className={ribbon} />
        <path d="M32 18 C 22 4, 12 12, 32 18 C 52 12, 42 4, 32 18Z" className={ribbon} />
      </motion.g>
      <rect x="10" y="30" width="44" height="28" rx="3" className={box} />
      <rect x="28" y="30" width="8" height="28" className={ribbon} />
    </svg>
  );
}
