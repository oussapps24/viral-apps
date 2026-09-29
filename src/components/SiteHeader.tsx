import Link from "next/link";
import { getCurrentUser } from "@/lib/user";
import { Logo } from "./Logo";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-30 border-b border-petal/70 bg-blush/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-1 text-sm font-bold text-plum-soft">
          <Link href="/cards" className="rounded-full px-3 py-2 hover:bg-petal/60">Cards</Link>
          <Link href="/prompts" className="hidden rounded-full px-3 py-2 hover:bg-petal/60 sm:block">Prompts</Link>
          {user ? (
            <Link href="/account/cards" className="btn btn-ghost ml-1 px-4 py-2">My cards</Link>
          ) : (
            <Link href="/login" className="btn btn-ghost ml-1 px-4 py-2">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
