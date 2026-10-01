"use client";

import { useRef, useState } from "react";
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

  const noRef = useRef<HTMLButtonElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);

  // "No" runs away from the finger.
  // The range is measured from the card's own frame (not the browser window),
  // so the button always stays fully visible inside it.
  function dodge() {
    const btn = noRef.current;
    const stage = btn?.closest("[data-stage]") as HTMLElement | null;
    if (!btn || !stage) return;
    const pad = 12;
    const topSafe = 64; // music button
    const bottomSafe = 112; // "Customize this card" bar
    const s = stage.getBoundingClientRect();
    const w = btn.offsetWidth;
    const h = btn.offsetHeight;
    // Resting position with no offset applied. offsetLeft/offsetTop ignore transforms,
    // so this stays correct even while the button is mid-animation.
    const parent = btn.offsetParent as HTMLElement;
    const pr = parent.getBoundingClientRect();
    const baseLeft = pr.left + parent.clientLeft + btn.offsetLeft;
    const baseTop = pr.top + parent.clientTop + btn.offsetTop;
    // Visible area: the card frame, clipped to the actual viewport.
    const left = Math.max(s.left, 0) + pad;
    const right = Math.min(s.right, document.documentElement.clientWidth) - pad;
    const top = Math.max(s.top, 0) + topSafe;
    const bottom = Math.min(s.bottom, window.innerHeight) - bottomSafe;
    const minX = left - baseLeft;
    const maxX = right - (baseLeft + w);
    const minY = top - baseTop;
    const maxY = bottom - (baseTop + h);
    const pick = (lo: number, hi: number) => (hi <= lo ? 0 : lo + Math.random() * (hi - lo));

    // Keep clear of the Yes button (with room for its hover grow) and hop far enough to feel like a dodge.
    const yes = yesRef.current?.getBoundingClientRect();
    const gap = 16;
    const hitsYes = (x: number, y: number) =>
      !!yes &&
      baseLeft + x < yes.right + gap &&
      baseLeft + x + w > yes.left - gap &&
      baseTop + y < yes.bottom + gap &&
      baseTop + y + h > yes.top - gap;
    let next = { x: pick(minX, maxX), y: pick(minY, maxY) };
    for (let i = 0; i < 40; i++) {
      const c = { x: pick(minX, maxX), y: pick(minY, maxY) };
      const farEnough = Math.hypot(c.x - pos.x, c.y - pos.y) > 90;
      if (!hitsYes(c.x, c.y) && farEnough) {
        next = c;
        break;
      }
      if (!hitsYes(c.x, c.y)) next = c;
    }
    setPos(next);
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
                ref={yesRef}
                whileHover={{ scale: 1.05 }}
                onClick={() => setYes(true)}
                className="rounded-full bg-rose-400 px-8 py-3 text-lg font-bold text-white shadow-lg shadow-rose-300"
              >
                Yes 💕
              </motion.button>
              <motion.button
                ref={noRef}
                onPointerEnter={dodge}
                onClick={dodge}
                animate={{ x: pos.x, y: pos.y }}
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
