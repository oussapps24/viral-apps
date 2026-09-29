import Link from "next/link";
import { env } from "@/lib/env";
import { Logo } from "./Logo";

export function SiteFooter() {
  const support = env.supportEmail();
  return (
    <footer className="mt-24 border-t border-petal bg-cream">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-[2fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm text-plum-soft">Little cards for big feelings. Made with a lot of heart.</p>
        </div>
        <div>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-plum-soft/70">Product</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/cards" className="hover:text-rose">All cards</Link></li>
            <li><Link href="/prompts" className="hover:text-rose">Prompt gallery</Link></li>
            {support && <li><a href={`mailto:${support}`} className="hover:text-rose">Contact us</a></li>}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-plum-soft/70">Legal</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="hover:text-rose">Terms</Link></li>
            <li><Link href="/privacy" className="hover:text-rose">Privacy</Link></li>
            <li><Link href="/refunds" className="hover:text-rose">Refund policy</Link></li>
          </ul>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-plum-soft/70">© {new Date().getFullYear()} pixi.love</p>
    </footer>
  );
}
