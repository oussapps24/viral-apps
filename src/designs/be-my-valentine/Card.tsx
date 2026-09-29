"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CardProps } from "../types";
import { Stage } from "../kit/Stage";
import { Confetti, Floaters } from "../kit/Confetti";
import { Gifts } from "../kit/Gifts";

const theme = { ink: "text-rose-700", button: "bg-rose-500 text-white", box: "fill-white", ribbon: "fill-rose-400", font: "font-type" };

export default function BeMyValentine(card: CardProps) {
  const { data, photos } = card;
  const [yes, setYes] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dodges, setDodges] = useState(0);

  // "No" runs away from the finger, and gets a bit smaller each time.
  function dodge() {
    const w = typeof window !== "undefined" ? window.innerWidth : 400;
    const h = typeof window !== "undefined" ? window.innerHeight : 700;
    setPos({ x: (Math.random() - 0.5) * (w * 0.7), y: (Math.random() - 0.5) * (h * 0.5) });
    setDodges((d) => d + 1);
  }

  return (
    <Stage className="bg-[#fbe6eb] font-type text-rose-700" music={data.music} pattern="dots">
      <AnimatePresence mode="wait">
        {!yes ? (
          <motion.div key="ask" exit={{ opacity: 0 }} className="flex max-w-md flex-col items-center gap-8 text-center">
            {photos.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos.photo} alt="" className="h-48 w-48 rotate-[-3deg] rounded-2xl border-8 border-white bg-white object-cover shadow-lg" />
            ) : (
              <HeartDoodle />
            )}
            <h1 className="text-3xl font-bold leading-snug">
              {data.toName ? `${data.toName}, ` : "Dear, "}
              will you be my Valentine?
            </h1>
            <div className="relative flex items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setYes(true)}
                className="rounded-full bg-rose-400 px-8 py-3 text-lg font-bold text-white shadow-lg shadow-rose-300"
              >
                Yes 💕
              </motion.button>
              <motion.button
                onPointerEnter={dodge}
                onClick={dodge}
                animate={{ x: pos.x, y: pos.y, scale: Math.max(1 - dodges * 0.07, 0.45) }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="rounded-full bg-white px-7 py-3 text-lg font-bold text-rose-400 shadow"
              >
                No
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="yes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex max-w-md flex-col items-center gap-6 text-center">
            <Confetti />
            <h1 className="text-3xl font-bold">Yay!! It&apos;s a date 💌</h1>
            {photos.happyPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos.happyPhoto} alt="" className="h-52 w-52 rotate-2 rounded-2xl border-8 border-white bg-white object-cover shadow-lg" />
            )}
            {data.message && <p className="whitespace-pre-line text-lg">{data.message}</p>}
            <Gifts card={card} theme={theme} />
          </motion.div>
        )}
      </AnimatePresence>
      {yes && <Floaters emoji="💗" />}
    </Stage>
  );
}

function HeartDoodle() {
  return (
    <motion.svg viewBox="0 0 120 110" className="h-40 w-40" animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}>
      <path
        d="M60 100 C 10 65, 5 30, 30 18 C 45 10, 57 20, 60 30 C 63 20, 75 10, 90 18 C 115 30, 110 65, 60 100Z"
        fill="#fff"
        stroke="#fb7185"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M38 36 q 6 -8 14 -4" stroke="#fda4af" strokeWidth="4" fill="none" strokeLinecap="round" />
    </motion.svg>
  );
}
