"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CardProps } from "../types";
import { Stage } from "../kit/Stage";
import { Confetti } from "../kit/Confetti";
import { Gifts } from "../kit/Gifts";

const theme = { ink: "text-amber-900", button: "bg-amber-500 text-white", box: "fill-sky-200", ribbon: "fill-amber-400", font: "font-display" };

export default function BirthdayCandles(card: CardProps) {
  const { data, photos } = card;
  const [blown, setBlown] = useState(false);

  return (
    <Stage className="bg-gradient-to-b from-[#fff8e7] to-[#ffe8c7] text-amber-900" music={data.music}>
      <AnimatePresence mode="wait">
        {!blown ? (
          <motion.div key="cake" exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center gap-8 text-center">
            <h1 className="font-display text-4xl font-black sm:text-5xl">
              Happy Birthday{data.toName ? `, ${data.toName}` : ""}!
            </h1>
            <Cake lit />
            <button onClick={() => setBlown(true)} className="rounded-full bg-amber-500 px-8 py-3 text-lg font-bold text-white shadow-lg shadow-amber-300">
              Blow the candles 🌬️
            </button>
          </motion.div>
        ) : (
          <motion.div key="wish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex max-w-md flex-col items-center gap-6 text-center">
            <Confetti colors={["#f59e0b", "#38bdf8", "#f472b6", "#a3e635"]} />
            {photos.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos.photo} alt="" className="h-56 w-56 rounded-full object-cover shadow-xl ring-8 ring-white" />
            ) : (
              <Cake />
            )}
            <h2 className="font-display text-3xl font-black">Make a wish ✨</h2>
            {data.message && <p className="whitespace-pre-line text-lg">{data.message}</p>}
            {data.fromName && <p className="font-semibold">— {data.fromName}</p>}
            <Gifts card={card} theme={theme} />
          </motion.div>
        )}
      </AnimatePresence>
      {blown && <Balloons />}
    </Stage>
  );
}

function Cake({ lit }: { lit?: boolean }) {
  return (
    <svg viewBox="0 0 160 150" className="h-48 w-52">
      {[50, 80, 110].map((x, i) => (
        <g key={x}>
          <rect x={x - 4} y="30" width="8" height="34" rx="2" fill={["#f9a8d4", "#93c5fd", "#fcd34d"][i]} />
          {lit && (
            <motion.ellipse
              cx={x}
              cy="22"
              rx="5"
              ry="9"
              fill="#fb923c"
              animate={{ scaleY: [1, 1.25, 0.9, 1], rotate: [-4, 4, -2, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 + i * 0.1 }}
            />
          )}
        </g>
      ))}
      <rect x="20" y="64" width="120" height="36" rx="8" fill="#fbcfe8" />
      <path d="M20 76 q 10 10 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0" fill="none" stroke="#fff" strokeWidth="5" />
      <rect x="10" y="100" width="140" height="40" rx="8" fill="#f9a8d4" />
      <ellipse cx="80" cy="142" rx="78" ry="6" fill="#fde68a" />
    </svg>
  );
}

function Balloons() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-5xl"
          style={{ left: `${(i * 37) % 95}%` }}
          initial={{ y: "110vh" }}
          animate={{ y: "-25vh", x: [0, 12, -8, 0] }}
          transition={{ duration: 7 + (i % 4), repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
        >
          🎈
        </motion.span>
      ))}
    </div>
  );
}
