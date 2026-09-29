"use client";

import { useActionState, useState } from "react";
import { createResetLink, type ResetLinkState } from "./actions";

export function ResetLinkButton({ customerId }: { customerId: string }) {
  const [state, action, pending] = useActionState<ResetLinkState, FormData>(createResetLink, {});
  const [copied, setCopied] = useState(false);

  if (state.link) {
    const link = state.link;
    return (
      <div className="flex min-w-[16rem] flex-col items-end gap-1">
        <div className="flex w-full gap-1">
          <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="field py-1 text-xs font-normal" aria-label="Reset link" />
          <button
            type="button"
            className="btn btn-primary px-3 py-1 text-xs"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
                setCopied(true);
              } catch {
                /* the field is selectable as a fallback */
              }
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <span className="text-[11px] font-normal text-plum-soft">Works once, expires in 1 hour.</span>
      </div>
    );
  }

  return (
    <form action={action} className="inline-flex flex-col items-end gap-1">
      <input type="hidden" name="customerId" value={customerId} />
      <button className="text-plum-soft hover:text-rose" disabled={pending}>
        {pending ? "Making link…" : "Reset link"}
      </button>
      {state.error && <span className="max-w-[16rem] text-right text-[11px] font-normal text-rose">{state.error}</span>}
    </form>
  );
}
