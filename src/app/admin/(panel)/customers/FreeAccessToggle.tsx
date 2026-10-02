"use client";

import { useOptimistic, useTransition } from "react";
import { setFreeAccess } from "./actions";

/** On/off switch for free card creation. Flips instantly, then saves in the background. */
export function FreeAccessToggle({ customerId, enabled }: { customerId: string; enabled: boolean }) {
  const [pending, start] = useTransition();
  const [on, setOn] = useOptimistic(enabled);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={on ? "Turn off free access" : "Turn on free access"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const next = !on;
          setOn(next);
          const form = new FormData();
          form.set("customerId", customerId);
          form.set("enable", next ? "1" : "0");
          await setFreeAccess(form);
        })
      }
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose disabled:opacity-70 ${on ? "bg-rose" : "bg-plum-soft/30"}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-[1.375rem]" : "translate-x-0.5"}`} />
    </button>
  );
}
