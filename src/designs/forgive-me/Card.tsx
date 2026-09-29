"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CardProps } from "../types";
import { Stage } from "../kit/Stage";
import { Confetti } from "../kit/Confetti";
import { Gifts } from "../kit/Gifts";

const theme = { ink: "text-pink-700", button: "bg-pink-500 text-white", box: "fill-white", ribbon: "fill-pink-400", font: "font-type" };

export default function ForgiveMe(card: CardProps) {
  const { data, photos } = card;
  const [tries, setTries] = useState(0);
  const [forgiven, setForgiven] = useState(false);
  const noScale = Math.max(1 - tries * 0.18, 0);

  return (
    <Stage
      className="bg-[radial-gradient(ellipse_at_center,#ffe4ec_0%,#f9b8cb_100%)] font-type text-pink-700"
      music={data.music}
    >
      <p className="absolute top-20 text-2xl tracking-[0.3em]">💕💗💕💗💕</p>
      <AnimatePresence mode="wait">
        {!forgiven ? (
          <motion.div key="ask" exit={{ opacity: 0 }} className="flex max-w-sm flex-col items-center gap-6 rounded-3xl bg-white/60 px-6 py-8 text-center shadow-xl backdrop-blur">
            {photos.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos.photo} alt="" className="h-44 w-44 rounded-2xl bg-white/70 object-cover" />
            ) : (
              <motion.span animate={{ rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 1.6 }} className="text-8xl">
                🥹
              </motion.span>
            )}
            <h1 className="text-3xl font-bold leading-snug">
              {tries === 0 ? `Will you forgive me, ${data.toName || "love"}?` : "Will you forgive me?"}
            </h1>
            <div className="flex items-center gap-4">
              {/* The joke: at first there's only a No button. */}
              {tries > 0 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 + tries * 0.12 }}
                  onClick={() => setForgiven(true)}
                  className="rounded-full bg-pink-400 px-7 py-2.5 font-bold text-white shadow-lg"
                >
                  Yes
                </motion.button>
              )}
              {noScale > 0.1 && (
                <motion.button
                  animate={{ scale: noScale }}
                  onClick={() => setTries((t) => t + 1)}
                  className="rounded-full bg-pink-200 px-6 py-2.5 font-bold text-pink-600"
                >
                  No
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="yay" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex max-w-md flex-col items-center gap-6 text-center">
            <Confetti />
            <h1 className="text-3xl font-bold">I knew you would forgive me! 💗</h1>
            {photos.happyPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos.happyPhoto} alt="" className="h-48 w-48 rounded-2xl bg-white/70 object-cover shadow-lg" />
            )}
            <p className="whitespace-pre-line rounded-3xl bg-white/70 p-6 text-left leading-relaxed shadow backdrop-blur">{data.message}</p>
            <Gifts card={card} theme={theme} />
            <button onClick={() => { setForgiven(false); setTries(0); }} className="text-sm font-bold opacity-60">
              Start Over ♥
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
}
