"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CardProps } from "../types";
import { Stage } from "../kit/Stage";
import { Confetti } from "../kit/Confetti";
import { Gifts } from "../kit/Gifts";

export const DEFAULT_NO_LINES = [
  "No…",
  "wait… are you sure? 🥺",
  "oh come on, don't do this",
  "but I love you… think again 💭",
  "hey, think about it 🥺",
  "you're breaking my heart rn 💔",
  "just a tiny bit of love??",
  "okay now you're being mean 😭",
  "pretty please with a cherry on top 🍒",
  "I'll wait forever if I have to",
];

const SAD_FACES = ["🥺", "🥺", "😢", "😢", "😭", "😭", "💔"];

const theme = {
  ink: "text-violet-800",
  button: "bg-violet-600 text-white",
  box: "fill-amber-50",
  ribbon: "fill-violet-500",
  font: "font-round",
};

export default function DoYouLoveMe(card: CardProps) {
  const { data, photos } = card;
  const [nos, setNos] = useState(0);
  const [yes, setYes] = useState(false);

  const custom = (data.noLines ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  const lines = custom.length ? ["No…", ...custom] : DEFAULT_NO_LINES;
  const noText = lines[Math.min(nos, lines.length - 1)];

  // Yes grows every time they press No, until it swallows the screen.
  const scale = Math.pow(1.38, nos);
  const takeover = nos >= 8;
  const question = data.question || "do you love me? 🥺";

  return (
    <Stage className="bg-[#f1ebfb] font-round text-violet-800" music={data.music}>
      <AnimatePresence mode="wait">
        {!yes ? (
          <motion.div
            key="ask"
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex w-full max-w-md flex-col items-center gap-6 text-center"
          >
            <Face photo={nos === 0 ? photos.photo : photos.sadPhoto ?? photos.photo} emoji={SAD_FACES[Math.min(nos, SAD_FACES.length - 1)]} />
            <h1 className="text-3xl font-bold sm:text-4xl">
              {data.toName ? `Dear ${data.toName}, ` : "Dear, "}
              {question}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.button
                onClick={() => setYes(true)}
                style={{ fontSize: `min(${18 * scale}px, 24vw)` }}
                whileTap={{ scale: 0.95 }}
                className="whitespace-nowrap rounded-full bg-gradient-to-b from-violet-300 to-violet-400 px-[1.2em] py-[0.5em] font-extrabold leading-none text-violet-900 shadow-lg shadow-violet-300/60 transition-[font-size] duration-300 ease-out"
              >
                Yes!! 💕
              </motion.button>
              <motion.button
                key={nos}
                data-no
                onClick={() => setNos((n) => n + 1)}
                initial={{ x: -6 }}
                animate={{ x: [6, -6, 4, 0] }}
                transition={{ duration: 0.3 }}
                className="rounded-full bg-[#faf6ee] px-5 py-3 text-base font-bold text-stone-500 shadow"
              >
                {noText}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="yes"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex w-full max-w-md flex-col items-center gap-6 text-center"
          >
            <Confetti />
            <h1 className="text-3xl font-extrabold sm:text-4xl">I KNEW IT!! 💕💕💕</h1>
            <Face photo={photos.happyPhoto ?? photos.photo} emoji="🥰" />
            {data.message && <p className="whitespace-pre-line text-lg">{data.message}</p>}
            <Gifts card={card} theme={theme} />
            <button onClick={() => { setYes(false); setNos(0); }} className="text-sm font-semibold opacity-60">
              start over ♥
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Past a point, Yes covers everything. There's no escape. */}
      <AnimatePresence>
        {!yes && takeover && (
          <motion.button
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setYes(true)}
            className="fixed inset-0 z-20 grid place-items-center bg-gradient-to-b from-violet-300 to-violet-400 text-[22vw] font-black text-violet-900"
          >
            YES!! 💕
          </motion.button>
        )}
      </AnimatePresence>
    </Stage>
  );
}

function Face({ photo, emoji }: { photo?: string; emoji: string }) {
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt="" className="h-52 w-52 rounded-3xl object-cover drop-shadow-lg sm:h-60 sm:w-60" />
    );
  }
  return (
    <motion.div
      key={emoji}
      initial={{ scale: 0.6 }}
      animate={{ scale: 1, rotate: [0, -6, 6, 0] }}
      className="grid h-52 w-52 place-items-center rounded-3xl bg-white/70 text-[7rem] shadow-lg"
    >
      {emoji}
    </motion.div>
  );
}
