import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../auth-actions";
import AdminNav from "./AdminNav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-petal bg-cream lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:py-6">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <div className="shrink-0"><Logo /></div>
            <span className="shrink-0 rounded-full bg-plum px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">admin</span>
          </div>
        </div>
        <AdminNav />
        <div className="hidden px-5 pt-8 text-xs text-plum-soft lg:block">
          <p className="truncate font-bold">{admin.email}</p>
          <div className="mt-3 flex gap-3">
            <Link href="/" target="_blank" className="font-bold hover:text-rose">View site ↗</Link>
            <form action={logout}>
              <button className="font-bold hover:text-rose">Log out</button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="flex items-center justify-end gap-4 px-5 pt-4 text-xs lg:hidden">
          <Link href="/" target="_blank" className="font-bold text-plum-soft">View site ↗</Link>
          <form action={logout}>
            <button className="font-bold text-plum-soft">Log out</button>
          </form>
        </div>
        <main className="mx-auto max-w-6xl px-5 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
