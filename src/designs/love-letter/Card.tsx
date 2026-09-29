"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CardProps } from "../types";
import { Stage } from "../kit/Stage";
import { Confetti, Floaters } from "../kit/Confetti";
import { Gifts } from "../kit/Gifts";

const theme = { ink: "text-rose-500", button: "bg-rose-400 text-white", box: "fill-rose-100", ribbon: "fill-rose-400", font: "font-display" };

export default function LoveLetter(card: CardProps) {
  const { data, photos } = card;
  const [open, setOpen] = useState(false);

  return (
    <Stage className="bg-gradient-to-b from-[#ffe9ef] to-[#fff4f6] text-rose-500" music={data.music}>
      <Floaters emoji="♡" count={10} />
      <h1 className="mb-8 text-center font-display text-6xl font-black leading-[0.95] tracking-tight text-rose-400 sm:text-7xl">
        {data.title || "Happy Valentine's"}
      </h1>

      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button key="env" onClick={() => setOpen(true)} exit={{ y: 40, opacity: 0 }} className="flex flex-col items-center gap-3">
            <Envelope />
            <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} className="font-round text-sm font-bold">
              click me!!!
            </motion.span>
          </motion.button>
        ) : (
          <motion.div key="letter" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex w-full max-w-md flex-col items-center gap-6">
            <Confetti colors={["#fb7185", "#fda4af", "#fecdd3", "#fde68a"]} />
            <div className="w-full rounded-3xl bg-white p-6 text-center shadow-xl shadow-rose-200/60">
              {photos.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos.photo} alt="" className="mx-auto mb-5 h-56 w-full rounded-2xl object-cover" />
              )}
              <p className="font-display text-2xl text-rose-500">Dear {data.toName || "you"}…</p>
              <p className="mt-3 whitespace-pre-line font-round text-stone-600">{data.message}</p>
              {data.fromName && <p className="mt-4 font-display italic text-rose-400">Forever yours, {data.fromName}</p>}
            </div>
            <Gifts card={card} theme={theme} />
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
}

function Envelope() {
  return (
    <motion.svg viewBox="0 0 200 140" className="h-40 w-56 drop-shadow-xl" animate={{ rotate: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 2.4 }}>
      <rect x="4" y="10" width="192" height="126" rx="10" fill="#f9c6d3" />
      <path d="M4 20 L100 90 L196 20" fill="#f7b3c5" />
      <path d="M4 136 L80 72 M196 136 L120 72" stroke="#f3a3b8" strokeWidth="3" />
      <circle cx="100" cy="86" r="16" fill="#e11d48" />
      <path d="M100 95 c -10 -7 -12 -13 -7 -16 c 3 -2 6 0 7 3 c 1 -3 4 -5 7 -3 c 5 3 3 9 -7 16z" fill="#fff" />
    </motion.svg>
  );
}
