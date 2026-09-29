"use client";

import { useState } from "react";

export default function CopyShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (some in-app browsers): open the card so they can copy from the address bar.
      window.open(url, "_blank", "noopener");
    }
  }
  return (
    <button onClick={copy} className="btn btn-primary px-4 py-2 text-sm">
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
