import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import { requireUser } from "@/lib/user";
import { changePassword } from "../account-actions";
import AccountNav from "./AccountNav";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const user = await requireUser("/account");
  const { password } = await searchParams;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 font-display text-4xl font-black">Account</h1>
      <AccountNav active="account" email={user.email} />
      {password === "changed" && (
        <p className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">Your new password is saved.</p>
      )}

      <section className="mb-6 rounded-[1.5rem] bg-white p-6 ring-1 ring-petal">
        <p className="text-xs font-extrabold uppercase tracking-wider text-plum-soft">Email</p>
        <p className="mt-1 font-extrabold">{user.email}</p>
      </section>

      <section className="max-w-md rounded-[1.5rem] bg-white p-6 ring-1 ring-petal">
        <h2 className="mb-4 font-display text-xl font-black">Change password</h2>
        <AuthForm
          action={changePassword}
          submit="Change password"
          pendingLabel="Saving…"
          fields={[
            { name: "current", label: "Current password", type: "password", autoComplete: "current-password" },
            { name: "password", label: "New password", type: "password", autoComplete: "new-password" },
          ]}
        />
      </section>
    </main>
  );
}
