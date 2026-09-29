import Image from "next/image";
import Link from "next/link";

export function HeartMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M16 28 C 4 20, 1 12, 7 7 C 11 4, 15 6, 16 9 C 17 6, 21 4, 25 7 C 31 12, 28 20, 16 28Z" fill="#e0527a" />
      <path d="M9 11 q 2 -3 5 -2" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="pixi.love home">
      <Image src="/logo.png" alt="" width={716} height={514} priority className="h-8 w-auto" />
      <span className="font-display text-2xl font-bold italic tracking-tight text-plum">pixi.love</span>
    </Link>
  );
}
