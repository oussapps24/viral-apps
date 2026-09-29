/** Background hearts drifting up through the hero. Pure CSS; positions are fixed so SSR and client match. */
const HEARTS = [
  { left: 6, size: 14, delay: 0, dur: 11, color: "#f28aa9" },
  { left: 13, size: 10, delay: 4, dur: 9, color: "#b99be8" },
  { left: 21, size: 18, delay: 7, dur: 13, color: "#e0527a" },
  { left: 29, size: 9, delay: 2, dur: 10, color: "#f6b3c6" },
  { left: 71, size: 12, delay: 5, dur: 12, color: "#b99be8" },
  { left: 78, size: 16, delay: 1, dur: 10, color: "#f28aa9" },
  { left: 86, size: 10, delay: 8, dur: 11, color: "#e0527a" },
  { left: 93, size: 13, delay: 3, dur: 14, color: "#f6b3c6" },
  { left: 45, size: 8, delay: 9, dur: 12, color: "#f6b3c6" },
  { left: 57, size: 11, delay: 6, dur: 13, color: "#b99be8" },
];

export function FloatingHearts() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {HEARTS.map((h, i) => (
        <svg
          key={i}
          viewBox="0 0 32 32"
          className="float-heart absolute bottom-0"
          style={{
            left: `${h.left}%`,
            width: h.size,
            height: h.size,
            animationDelay: `-${h.delay}s`,
            animationDuration: `${h.dur}s`,
          }}
        >
          <path d="M16 28 C 4 20, 1 12, 7 7 C 11 4, 15 6, 16 9 C 17 6, 21 4, 25 7 C 31 12, 28 20, 16 28Z" fill={h.color} />
        </svg>
      ))}
    </div>
  );
}
