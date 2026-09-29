import { env } from "@/lib/env";

/**
 * Facts the legal pages (/terms, /privacy, /refunds) depend on.
 * Fill in `company` and `state`, and set SUPPORT_EMAIL, before launch.
 * Until all three are set, the pages show a yellow "not ready" banner.
 */
export const legal = {
  siteName: "pixi.love",
  /** The client's LLC legal name, e.g. "Example Ventures LLC". */
  company: "",
  /** US state the LLC is registered in, e.g. "Wyoming". Its law governs the terms. */
  state: "",
  /** Refund window for any reason, in days. */
  refundDays: 14,
  /** Unpaid drafts are deleted after this many days (see /api/cron/cleanup). */
  draftDays: 7,
  updated: "September 28, 2026",
};

export const companyName = () => legal.company || "[Company LLC]";
export const stateName = () => legal.state || "[State]";
export const legalReady = () => Boolean(legal.company && legal.state && env.supportEmail());
