import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-[1.75rem] bg-white p-7 shadow-[0_10px_30px_-12px_rgba(59,21,48,.25)] ring-1 ring-petal">
          <h1 className="font-display text-2xl font-black">Admin</h1>
          <p className="mb-6 mt-1 text-sm text-plum-soft">Sign in to manage cards and orders.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
