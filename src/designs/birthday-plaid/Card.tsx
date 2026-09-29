"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CardProps } from "../types";
import { Stage } from "../kit/Stage";
import { Confetti } from "../kit/Confetti";
import { Gifts } from "../kit/Gifts";

const theme = { ink: "text-pink-700", button: "bg-pink-400 text-white", box: "fill-white", ribbon: "fill-pink-400", font: "font-type" };
const COLORS = ["#f9a8d4", "#a5b4fc", "#fcd34d", "#86efac", "#fdba74"];

export default function BirthdayPlaid(card: CardProps) {
  const { data, photos } = card;
  const [step, setStep] = useState(0);
  const words = (data.popWords || "you are loved").split(/\s+/).slice(0, 5);
  const [popped, setPopped] = useState<boolean[]>(() => words.map(() => false));
  const allPopped = popped.every(Boolean);

  return (
    <Stage className="bg-[#fff7f9] font-type text-pink-700" music={data.music} pattern="gingham">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="hi" exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center gap-4 rounded-3xl bg-white/80 px-8 py-10 text-center shadow-lg backdrop-blur">
            <p className="text-4xl">(o◕‿◕o)</p>
            <h1 className="text-4xl font-bold">Happy Birthday</h1>
            <p className="text-2xl">my {data.toName || "favorite person"}</p>
            <button onClick={() => setStep(1)} className="mt-4 rounded-full bg-pink-300 px-7 py-2.5 font-bold text-white shadow">
              Next!! ♪
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="pop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-8 text-center">
            <p className="text-xl font-bold">pop the balloons!</p>
            <div className="flex flex-wrap justify-center gap-4">
              {words.map((w, i) => (
                <button key={i} onClick={() => setPopped((p) => p.map((v, j) => (j === i ? true : v)))} className="h-28 w-20">
                  <AnimatePresence mode="wait">
                    {!popped[i] ? (
                      <motion.svg key="b" viewBox="0 0 40 60" className="h-28 w-20" exit={{ scale: 1.6, opacity: 0 }} animate={{ y: [0, -6, 0] }} transition={{ y: { repeat: Infinity, duration: 1.6 + i * 0.2 } }}>
                        <ellipse cx="20" cy="20" rx="16" ry="19" fill={COLORS[i % COLORS.length]} />
                        <path d="M20 39 l -3 4 h 6z M20 43 q 4 8 -2 16" stroke="#9ca3af" fill={COLORS[i % COLORS.length]} />
                        <ellipse cx="14" cy="13" rx="4" ry="6" fill="#fff" opacity=".5" />
                      </motion.svg>
                    ) : (
                      <motion.span key="w" initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid h-28 place-items-center text-2xl font-bold">
                        {w}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </div>
            {allPopped && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setStep(2)} className="rounded-full bg-pink-300 px-7 py-2.5 font-bold text-white shadow">
                Next!! ♪
              </motion.button>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="end" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex max-w-md flex-col items-center gap-6 text-center">
            <Confetti colors={COLORS} />
            {photos.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos.photo} alt="" className="h-56 w-56 rotate-2 bg-white object-cover p-2 pb-8 shadow-xl" />
            )}
            <div className="rounded-3xl bg-white/85 p-6 shadow backdrop-blur">
              <p className="whitespace-pre-line text-lg">{data.message}</p>
              {data.fromName && <p className="mt-3 font-bold">— {data.fromName} ♡</p>}
            </div>
            <Gifts card={card} theme={theme} />
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
}
