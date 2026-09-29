"use client";

import { useEffect } from "react";

export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-6xl">⚠️</p>
      <h1 className="font-display text-3xl font-black">This page hit an error</h1>
      <p className="max-w-sm text-plum-soft">It has been logged. Try again, and if it keeps happening check the Vercel logs for the error digest.</p>
      <button type="button" onClick={() => retry()} className="btn btn-primary mt-2">Try again</button>
    </main>
  );
}
