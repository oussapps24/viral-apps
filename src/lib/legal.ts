/**
 * Facts the legal pages (/terms, /privacy, /refunds) depend on.
 * SUPPORT_EMAIL (env) is shown as the contact address on these pages.
 */
export const legal = {
  siteName: "pixi.love",
  /** The LLC's legal name. */
  company: "Quorvel Digital LLC",
  /** US state the LLC is registered in. Its law governs the terms. */
  state: "Wyoming",
  country: "United States",
  /** Refund window for any reason, in days. */
  refundDays: 14,
  /** Unpaid drafts are deleted after this many days (see /api/cron/cleanup). */
  draftDays: 7,
  updated: "September 28, 2026",
};

export const companyName = () => legal.company || "[Company LLC]";
export const stateName = () => legal.state || "[State]";
