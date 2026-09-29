"use client";

import { useEffect } from "react";

export default function SiteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-6xl">🥀</p>
      <h1 className="font-display text-3xl font-black">Something went wrong</h1>
      <p className="max-w-sm text-plum-soft">A hiccup on our side. Your card is safe, so give it another go in a moment.</p>
      <button type="button" onClick={() => retry()} className="btn btn-primary mt-2">Try again</button>
    </main>
  );
}
