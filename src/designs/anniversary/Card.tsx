"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion } from "motion/react";
import type { CardProps } from "../types";
import { Stage } from "../kit/Stage";
import { Confetti, Floaters } from "../kit/Confetti";
import { Gifts } from "../kit/Gifts";

const theme = { ink: "text-rose-900", button: "bg-rose-800 text-white", box: "fill-rose-50", ribbon: "fill-rose-700", font: "font-display" };

function daysSince(date?: string) {
  if (!date) return null;
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86_400_000));
}

export default function Anniversary(card: CardProps) {
  const { data, photos } = card;
  const [open, setOpen] = useState(false);
  const days = daysSince(data.since);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (days == null) return;
    const c = animate(0, days, { duration: 2.2, ease: "easeOut", onUpdate: (v) => setShown(Math.round(v)) });
    return () => c.stop();
  }, [days]);

  return (
    <Stage className="bg-gradient-to-b from-[#fdf2f4] to-[#f8dde3] text-rose-900" music={data.music}>
      <Floaters emoji="🌹" count={8} />
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div key="count" exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 text-center">
            <p className="font-round text-sm font-bold uppercase tracking-[0.3em] text-rose-700/70">
              {data.toName ? `${data.toName} & ${data.fromName || "me"}` : "us"}
            </p>
            <h1 className="font-display text-5xl font-black italic sm:text-6xl">Happy Anniversary</h1>
            {days != null && (
              <div className="flex flex-col items-center">
                <span className="font-display text-7xl font-black tabular-nums text-rose-700">{shown.toLocaleString()}</span>
                <span className="font-round font-semibold">days of loving you</span>
              </div>
            )}
            <button onClick={() => setOpen(true)} className="mt-4 rounded-full bg-rose-800 px-8 py-3 font-bold text-white shadow-lg">
              our story ♥
            </button>
          </motion.div>
        ) : (
          <motion.div key="story" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex max-w-md flex-col items-center gap-6 text-center">
            <Confetti colors={["#be123c", "#fb7185", "#fecdd3", "#fde68a"]} />
            {photos.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos.photo} alt="" className="h-64 w-52 rounded-t-full object-cover shadow-xl" />
            )}
            <p className="whitespace-pre-line font-display text-xl">{data.message}</p>
            <Gifts card={card} theme={theme} />
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
}
