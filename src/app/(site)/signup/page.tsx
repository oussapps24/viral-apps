import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm, { AuthShell } from "@/components/AuthForm";
import ContinueTo from "@/components/ContinueTo";
import { getCurrentUser, safeNext } from "@/lib/user";
import { signUp } from "../account-actions";

export const metadata: Metadata = { title: "Create your account", robots: { index: false } };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const next = safeNext((await searchParams).next);
  // Also runs right after a successful signup/login (the action sets the session
  // cookie, so Next re-renders this page with the user signed in).
  if (await getCurrentUser()) {
    if (next.endsWith("/checkout")) return <ContinueTo href={next} label="Taking you to checkout…" />;
    redirect(next);
  }
  const buying = next.includes("/checkout");
  const making = next.startsWith("/editor/");
  return (
    <AuthShell
      title={making ? "Let's make your card" : buying ? "Almost there" : "Create your account"}
      sub={
        making
          ? "Create a free account first so your card is saved while you work on it. You only pay after you preview it."
          : buying
            ? "Create an account to unlock your card. It keeps every card you make in one place."
            : "Keep every card you make in one place."
      }
    >
      <AuthForm
        action={signUp}
        next={next}
        submit={buying || making ? "Create account & continue" : "Create account"}
        pendingLabel="Creating…"
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
        ]}
        footer={
          <p className="text-center text-sm text-plum-soft">
            Have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-extrabold text-rose">Log in</Link>
          </p>
        }
      />
    </AuthShell>
  );
}
