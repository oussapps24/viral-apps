import type { Metadata } from "next";
import Link from "next/link";
import AuthForm, { AuthShell } from "@/components/AuthForm";
import { env } from "@/lib/env";
import { requestPasswordReset } from "../account-actions";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPage() {
  const support = env.supportEmail();
  return (
    <AuthShell title="Forgot your password?" sub="We'll email you a link to set a new one.">
      <AuthForm
        action={requestPasswordReset}
        submit="Send reset link"
        pendingLabel="Sending…"
        fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }]}
        footer={
          <>
            {support && (
              <p className="text-center text-xs text-plum-soft">
                No email after a few minutes? Check spam, or write to{" "}
                <a href={`mailto:${support}`} className="font-bold text-rose">{support}</a> and we&apos;ll send you a link.
              </p>
            )}
            <Link href="/login" className="text-center text-sm font-bold text-plum-soft hover:text-rose">← Back to log in</Link>
          </>
        }
      />
    </AuthShell>
  );
}
