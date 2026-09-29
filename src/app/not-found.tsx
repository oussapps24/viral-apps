import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <Logo />
      <p className="text-7xl">💌</p>
      <h1 className="font-display text-4xl font-black">This card isn&apos;t here</h1>
      <p className="max-w-sm text-plum-soft">
        The link might be mistyped, or the card is no longer available. If someone sent it to you, ask them for a fresh link.
      </p>
      <Link href="/" className="btn btn-primary mt-2">Make your own card</Link>
    </main>
  );
}
