"use client";

import { startTransition, useActionState } from "react";
import { login, type LoginState } from "../auth-actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form
      onSubmit={(e) => {
        // Not <form action>, so a wrong password doesn't clear the email field.
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-extrabold">Email</span>
        <input name="email" type="email" autoComplete="username" required className="field" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-extrabold">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="field" />
      </label>
      {state.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{state.error}</p>}
      <button disabled={pending} className="btn btn-primary mt-2">{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
