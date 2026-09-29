"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { FormState } from "@/app/(site)/account-actions";

type Field = { name: string; label: string; type: "email" | "password"; autoComplete: string };

/** One form component for signup, login, forgot and reset password. */
export default function AuthForm({
  action,
  fields,
  submit,
  pendingLabel,
  next,
  footer,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  fields: Field[];
  submit: string;
  pendingLabel: string;
  next?: string;
  footer?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const form = useRef<HTMLFormElement>(null);
  const [passwordTooShort, setPasswordTooShort] = useState(false);
  // Submitted via onSubmit (not <form action>) so React doesn't clear the fields
  // when the server answers with an error. Cleared on success instead.
  useEffect(() => {
    if (state.ok) form.current?.reset();
  }, [state]);
  const newPasswordField = fields.find((f) => f.type === "password" && f.autoComplete === "new-password");
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (newPasswordField) {
      const password = fd.get(newPasswordField.name);
      if (typeof password === "string" && password.length < 8) {
        setPasswordTooShort(true);
        return;
      }
    }
    startTransition(() => formAction(fd));
  }
  return (
    <form ref={form} onSubmit={onSubmit} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      {fields.map((f) => (
        <label key={f.name} className="flex flex-col gap-1.5">
          <span className="text-sm font-extrabold">{f.label}</span>
          <input
            id={f.name}
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            required
            onChange={f === newPasswordField ? () => setPasswordTooShort(false) : undefined}
            className="field"
          />
          {f === newPasswordField && passwordTooShort && (
            <span className="text-xs font-bold text-red-700">Password must be at least 8 characters</span>
          )}
        </label>
      ))}
      {state.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{state.error}</p>}
      {state.ok && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">{state.ok}</p>}
      <button disabled={pending || passwordTooShort} className="btn btn-primary mt-1">{pending ? pendingLabel : submit}</button>
      {footer}
    </form>
  );
}

export function AuthShell({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <main className="flex justify-center px-4 py-14">
      <div className="w-full max-w-sm">
        <div className="rounded-[1.75rem] bg-white p-7 shadow-[0_10px_30px_-12px_rgba(59,21,48,.25)] ring-1 ring-petal">
          <h1 className="font-display text-3xl font-black">{title}</h1>
          {sub && <p className="mb-6 mt-1.5 text-sm text-plum-soft">{sub}</p>}
          {children}
        </div>
      </div>
    </main>
  );
}
