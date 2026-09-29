"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

/** Deterministic "random" in [0,1): keeps render pure and the burst stable across re-renders. */
const rand = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** One-shot burst of petals from the center. Remount (change `key`) to replay. */
export function Confetti({ colors = ["#f472b6", "#fb7185", "#f9a8d4", "#c084fc"], count = 60 }: { colors?: string[]; count?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + rand(i, 1) * 0.5;
        const dist = 120 + rand(i, 2) * 260;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist + 140,
          r: rand(i, 3) * 540,
          c: colors[i % colors.length],
          w: 6 + rand(i, 4) * 6,
          d: 1.4 + rand(i, 5) * 1.2,
        };
      }),
    [colors, count],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center">
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute rounded-sm"
          style={{ width: b.w, height: b.w * 0.5, background: b.c }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: b.x, y: b.y, opacity: 0, rotate: b.r }}
          transition={{ duration: b.d, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/** Slow ambient emoji drifting up the screen. */
export function Floaters({ emoji = "❤️", count = 14 }: { emoji?: string; count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-xl"
          style={{ left: `${(i * 53) % 100}%` }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, 0.9, 0] }}
          transition={{ duration: 7 + (i % 5), repeat: Infinity, delay: i * 0.6, ease: "linear" }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  );
}
