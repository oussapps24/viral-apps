"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Marketing pages only. The card viewer, editor, auth and admin keep the normal cursor. */
const ENABLED = (path: string) => path === "/" || path === "/cards" || path === "/prompts";

const COLORS = ["#e0527a", "#f28aa9", "#f6b3c6", "#b99be8"];
const HEART_D = "M16 28 C 4 20, 1 12, 7 7 C 11 4, 15 6, 16 9 C 17 6, 21 4, 25 7 C 31 12, 28 20, 16 28Z";

type Particle = { x: number; y: number; vx: number; vy: number; size: number; rot: number; color: string; born: number };
const LIFE = 900;
const MAX = 70;
const SPACING = 16; // px of mouse travel between hearts

/**
 * Heart cursor plus a trail of small hearts that drift and fade.
 * Mouse and trackpad only (pointer: fine), and off entirely when the OS asks for reduced motion.
 */
export function HeartCursor() {
  const pathname = usePathname();
  const on = ENABLED(pathname);

  useEffect(() => {
    if (!on) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;

    const root = document.documentElement;
    root.classList.add("heart-cursor");

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:60";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;
    const HEART = new Path2D(HEART_D);

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();

    const parts: Particle[] = [];
    let last: { x: number; y: number } | null = null;
    let raf = 0;

    const tick = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        const t = (now - p.born) / LIFE;
        if (t >= 1) {
          parts.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.035; // soft gravity, hearts sink as they fade
        const s = (p.size / 32) * (1 - t * 0.5);
        ctx.save();
        ctx.globalAlpha = 1 - t;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(s, s);
        ctx.translate(-16, -16);
        ctx.fillStyle = p.color;
        ctx.fill(HEART);
        ctx.restore();
      }
      raf = parts.length ? requestAnimationFrame(tick) : 0;
    };

    const spawn = (x: number, y: number) => {
      if (parts.length >= MAX) parts.shift();
      parts.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.4 - Math.random() * 0.4,
        size: 8 + Math.random() * 8,
        rot: (Math.random() - 0.5) * 0.7,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        born: performance.now(),
      });
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const { clientX: x, clientY: y } = e;
      if (!last) {
        last = { x, y };
        return;
      }
      const dist = Math.hypot(x - last.x, y - last.y);
      if (dist < SPACING) return;
      spawn(x, y);
      last = { x, y };
    };
    const onLeave = () => (last = null);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", fit);
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", fit);
      document.removeEventListener("pointerleave", onLeave);
      canvas.remove();
      root.classList.remove("heart-cursor");
    };
  }, [on]);

  return null;
}
