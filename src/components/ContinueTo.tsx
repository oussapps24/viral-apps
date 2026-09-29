"use client";

import { useEffect } from "react";

/**
 * After signup/login, continue to a route that leaves the site (the checkout
 * route redirects to Stripe). A client-side redirect can't follow that, so do
 * exactly one full page load.
 */
export default function ContinueTo({ href, label }: { href: string; label: string }) {
  useEffect(() => {
    window.location.assign(href);
  }, [href]);
  return (
    <main className="flex flex-col items-center gap-3 px-4 py-20 text-center">
      <p className="font-display text-2xl font-black">{label}</p>
      <a href={href} className="text-sm font-extrabold text-rose">Not moving? Tap here</a>
    </main>
  );
}
