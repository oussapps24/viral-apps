"use client";

import { useEffect } from "react";
import "./globals.css";

// Replaces the root layout when it crashes, so it brings its own <html>/<body> and styles.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans">
        <title>Something went wrong · pixi.love</title>
        <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
          <p className="text-7xl">🥀</p>
          <h1 className="font-display text-4xl font-black">Something went wrong</h1>
          <p className="max-w-sm text-plum-soft">A hiccup on our side. Give it another go in a moment.</p>
          <button type="button" onClick={() => retry()} className="btn btn-primary mt-2">Try again</button>
        </main>
      </body>
    </html>
  );
}
