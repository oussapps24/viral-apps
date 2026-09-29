import type { Metadata } from "next";
import AuthForm, { AuthShell } from "@/components/AuthForm";
import { requireUser } from "@/lib/user";
import { setNewPassword } from "../../account-actions";

export const metadata: Metadata = { title: "Set a new password", robots: { index: false } };

/** Where the reset email lands (via /auth/callback, which signs them in). */
export default async function NewPasswordPage() {
  const user = await requireUser("/account/new-password");
  return (
    <AuthShell title="Set a new password" sub={`For ${user.email}`}>
      <AuthForm
        action={setNewPassword}
        submit="Save password"
        pendingLabel="Saving…"
        fields={[{ name: "password", label: "New password", type: "password", autoComplete: "new-password" }]}
      />
    </AuthShell>
  );
}
