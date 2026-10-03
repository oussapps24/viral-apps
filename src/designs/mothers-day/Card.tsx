"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CardProps } from "../types";
import { Stage } from "../kit/Stage";
import { Confetti } from "../kit/Confetti";
import { Gifts } from "../kit/Gifts";

const theme = { ink: "text-emerald-900", button: "bg-emerald-700 text-white", box: "fill-rose-100", ribbon: "fill-emerald-600", font: "font-display" };

export default function MothersDay(card: CardProps) {
  const { data, photos } = card;
  const [bloomed, setBloomed] = useState(false);

  return (
    <Stage className="bg-gradient-to-b from-[#f4f8ef] to-[#fdf1f3] text-emerald-900" music={data.music}>
      <AnimatePresence mode="wait">
        {!bloomed ? (
          <motion.div key="bud" exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 text-center">
            <p className="font-round text-sm font-bold uppercase tracking-[0.3em] text-emerald-700/70">for {data.toName || "Mom"}</p>
            <h1 className="font-display text-5xl font-black italic">Happy Mother&apos;s Day</h1>
            <Flower open={false} />
            <button onClick={() => setBloomed(true)} className="rounded-full bg-emerald-700 px-8 py-3 font-bold text-white shadow-lg">
              tap to bloom 🌷
            </button>
          </motion.div>
        ) : (
          <motion.div key="bloom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex max-w-md flex-col items-center gap-6 text-center">
            <Confetti colors={["#f9a8d4", "#fda4af", "#bbf7d0", "#fde68a"]} />
            {photos.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos.photo} alt="" className="h-56 w-56 rounded-full object-cover drop-shadow-xl" />
            ) : (
              <Flower open />
            )}
            <div className="rounded-3xl bg-white/80 p-6 shadow">
              <p className="whitespace-pre-line font-display text-lg leading-relaxed">{data.message}</p>
              {data.fromName && <p className="mt-4 font-round font-bold">With love, {data.fromName}</p>}
            </div>
            <Gifts card={card} theme={theme} />
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
}

function Flower({ open }: { open: boolean }) {
  const petals = Array.from({ length: 8 });
  return (
    <svg viewBox="0 0 200 240" className="h-60 w-52">
      <path d="M100 120 C 96 170, 104 200, 100 238" stroke="#4d7c0f" strokeWidth="6" fill="none" />
      <path d="M100 190 C 70 170, 55 180, 50 195 C 70 200, 88 198, 100 190Z" fill="#65a30d" />
      <path d="M100 170 C 130 150, 145 160, 150 175 C 130 180, 112 178, 100 170Z" fill="#84cc16" />
      {petals.map((_, i) => (
        <g key={i} transform={`rotate(${i * 45} 100 114)`}>
          <motion.ellipse
            cx="100"
            cy="80"
            rx="16"
            ry="34"
            fill={i % 2 ? "#f9a8d4" : "#fb7185"}
            style={{ transformBox: "view-box", transformOrigin: "100px 114px" }}
            initial={false}
            animate={{ scale: open ? 1 : 0.4 }}
            transition={{ duration: 1.1, delay: open ? i * 0.06 : 0, type: "spring", bounce: 0.35 }}
          />
        </g>
      ))}
      <circle cx="100" cy="114" r="16" fill="#fde047" />
    </svg>
  );
}
