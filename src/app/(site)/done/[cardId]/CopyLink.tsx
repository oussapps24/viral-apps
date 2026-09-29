"use client";

import { useState } from "react";

export default function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    // Native share sheet on phones (WhatsApp, iMessage…), clipboard elsewhere.
    if (navigator.share) {
      try {
        await navigator.share({ url, title: "A little something for you 💌" });
        return;
      } catch {
        /* cancelled */
      }
    }
    await copy();
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-2 rounded-2xl bg-white p-2 pl-4 ring-1 ring-petal">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 bg-transparent text-sm font-bold text-plum outline-none"
        />
        <button onClick={copy} className="btn btn-ghost shrink-0 px-4 py-2 text-sm">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <button onClick={share} className="btn btn-primary py-4 text-lg">Share link 💌</button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`I made something for you 💌 ${url}`)}`}
        target="_blank"
        rel="noopener"
        className="btn btn-ghost"
      >
        Send on WhatsApp
      </a>
    </div>
  );
}
