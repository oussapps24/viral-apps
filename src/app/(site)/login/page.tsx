import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm, { AuthShell } from "@/components/AuthForm";
import ContinueTo from "@/components/ContinueTo";
import { getCurrentUser, safeNext } from "@/lib/user";
import { logIn } from "../account-actions";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  // Also runs right after a successful signup/login (the action sets the session
  // cookie, so Next re-renders this page with the user signed in).
  if (await getCurrentUser()) {
    if (next.endsWith("/checkout")) return <ContinueTo href={next} label="Taking you to checkout…" />;
    redirect(next);
  }
  return (
    <AuthShell title="Welcome back" sub={next.startsWith("/editor/") ? "Log in to start customizing your card." : "Log in to see your cards."}>
      {sp.error === "link" && (
        <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">That link has expired or was already used. Log in, or request a new one.</p>
      )}
      <AuthForm
        action={logIn}
        next={next}
        submit="Log in"
        pendingLabel="Logging in…"
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
        ]}
        footer={
          <div className="flex justify-between text-sm">
            <Link href="/forgot" className="font-bold text-plum-soft hover:text-rose">Forgot password?</Link>
            <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-extrabold text-rose">Create account</Link>
          </div>
        }
      />
    </AuthShell>
  );
}
