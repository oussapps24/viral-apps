import type { DesignDef, FieldDef } from "./types";
import DoYouLoveMe from "./do-you-love-me/Card";
import BeMyValentine from "./be-my-valentine/Card";
import LoveLetter from "./love-letter/Card";
import BirthdayCandles from "./birthday-candles/Card";
import BirthdayPlaid from "./birthday-plaid/Card";
import Anniversary from "./anniversary/Card";
import ForgiveMe from "./forgive-me/Card";
import MothersDay from "./mothers-day/Card";

/**
 * The animated layouts. A new design = a new Card.tsx + an entry here, then it
 * shows up in the admin's "Design" dropdown. Everything else about a card for
 * sale (name, category, price, cover, music, demo) is a template row in the DB.
 */

/** Google's animated Noto emoji (CC BY 4.0), served by Google Fonts. */
export const noto = (code: string) => `https://fonts.gstatic.com/s/e/notoemoji/latest/${code}/512.webp`;

// ---- Reusable buyer fields ------------------------------------------------------

const F = {
  toName: (label = "Their name"): FieldDef => ({ name: "toName", label, type: "text", required: true, maxLength: 40, section: "The basics" }),
  fromName: (label = "Your name"): FieldDef => ({ name: "fromName", label, type: "text", maxLength: 40, section: "The basics" }),
  message: (label: string, placeholder?: string): FieldDef => ({
    name: "message", label, type: "textarea", required: true, maxLength: 600, placeholder, section: "The basics",
  }),
  photo: (name: string, label: string, hint?: string): FieldDef => ({ name, label, type: "photo", hint, section: "Photos" }),
  gifts: (): FieldDef[] => [
    { name: "memory1", label: "Memory photo 1", type: "photo", section: "Gifts (optional)", hint: "Up to 3 photos show in the “memories” gift" },
    { name: "memory2", label: "Memory photo 2", type: "photo", section: "Gifts (optional)" },
    { name: "memory3", label: "Memory photo 3", type: "photo", section: "Gifts (optional)" },
    { name: "song", label: "Your song (YouTube link)", type: "youtube", placeholder: "https://youtu.be/…", section: "Gifts (optional)" },
    { name: "letter", label: "A longer letter", type: "textarea", maxLength: 2000, section: "Gifts (optional)" },
  ],
  /** Options are filled per template at render time (see lib/templates.ts). */
  music: (): FieldDef => ({ name: "music", label: "Background music", type: "select", section: "Music" }),
};

export const DESIGNS: DesignDef[] = [
  {
    key: "do-you-love-me",
    label: "Do You Love Me?",
    description: "Yes / No question. Every No makes Yes bigger until it fills the screen. Then gifts.",
    cover: { bg: "bg-[#f1ebfb]", ink: "text-violet-800", font: "round" },
    sticker: noto("1f97a"),
    photoDefaults: { photo: noto("1f97a"), sadPhoto: noto("1f62d"), happyPhoto: noto("1f970") },
    fields: [
      F.toName(),
      F.fromName(),
      { name: "question", label: "The question", type: "text", maxLength: 80, placeholder: "do you love me? 🥺", section: "The basics" },
      F.message("Message after they say yes", "I knew it. I love you more."),
      { name: "noLines", label: "What “No” says (one per line)", type: "textarea", maxLength: 600, hint: "Leave empty for our pleading lines", section: "The basics" },
      F.photo("photo", "Question photo", "A cute or pleading pic"),
      F.photo("sadPhoto", "Photo after they press No", "Optional: your saddest face"),
      F.photo("happyPhoto", "Photo after they say Yes"),
      ...F.gifts(),
      F.music(),
    ],
    Component: DoYouLoveMe,
  },
  {
    key: "be-my-valentine",
    label: "Be My Valentine",
    description: "Question card where the No button runs away from their finger.",
    cover: { bg: "bg-[#fbe6eb]", ink: "text-rose-600", font: "type" },
    sticker: noto("1f498"),
    photoDefaults: { photo: noto("1f498"), happyPhoto: noto("1f60d") },
    fields: [
      F.toName(),
      F.fromName(),
      F.message("Message after they say yes", "Dinner's on me. Wear something cute."),
      F.photo("photo", "Photo for the question"),
      F.photo("happyPhoto", "Photo after they say Yes"),
      ...F.gifts(),
      F.music(),
    ],
    Component: BeMyValentine,
  },
  {
    key: "love-letter",
    label: "Envelope",
    description: "Big title and an envelope they tap to open. Note, photo, then gifts.",
    cover: { bg: "bg-gradient-to-b from-[#ffe9ef] to-[#fff4f6]", ink: "text-rose-400", font: "display" },
    sticker: noto("1f48c"),
    fields: [
      F.toName(),
      F.fromName(),
      { name: "title", label: "Big title", type: "text", maxLength: 30, placeholder: "Happy Valentine's", section: "The basics" },
      F.message("Your note", "Every moment with you feels like a beautiful dream…"),
      F.photo("photo", "Photo inside the envelope"),
      ...F.gifts(),
      F.music(),
    ],
    Component: LoveLetter,
  },
  {
    key: "birthday-candles",
    label: "Birthday Candles",
    description: "Cake with lit candles. They blow them out, then the message and gifts.",
    cover: { bg: "bg-gradient-to-b from-[#fff8e7] to-[#ffe8c7]", ink: "text-amber-900", font: "display" },
    sticker: noto("1f382"),
    fields: [
      F.toName("Birthday person"),
      F.fromName(),
      F.message("Your wish for them", "Another year of being unreasonably cool."),
      F.photo("photo", "Their photo"),
      ...F.gifts(),
      F.music(),
    ],
    Component: BirthdayCandles,
  },
  {
    key: "birthday-balloons",
    label: "Pop the Balloons",
    description: "Gingham card. They pop balloons to reveal hidden words, then the message.",
    cover: { bg: "bg-[#fff7f9]", ink: "text-pink-600", font: "type" },
    sticker: noto("1f388"),
    fields: [
      F.toName("What you call them"),
      F.fromName(),
      { name: "popWords", label: "Hidden words (up to 5)", type: "text", maxLength: 60, placeholder: "you are loved", section: "The basics" },
      F.message("Your birthday message"),
      F.photo("photo", "Their photo"),
      ...F.gifts(),
      F.music(),
    ],
    Component: BirthdayPlaid,
  },
  {
    key: "anniversary",
    label: "Days Together",
    description: "Counts up the days since a date, then the story, photo and gifts.",
    cover: { bg: "bg-gradient-to-b from-[#fdf2f4] to-[#f8dde3]", ink: "text-rose-900", font: "display" },
    sticker: noto("1f339"),
    fields: [
      F.toName(),
      F.fromName(),
      { name: "since", label: "Together since", type: "date", required: true, section: "The basics" },
      F.message("Your message", "Three years, and I'd do every day again."),
      F.photo("photo", "A photo of you two"),
      ...F.gifts(),
      F.music(),
    ],
    Component: Anniversary,
  },
  {
    key: "forgive-me",
    label: "Forgive Me?",
    description: "Apology card that starts with only a No button, which shrinks away.",
    cover: { bg: "bg-[radial-gradient(ellipse_at_center,#ffe4ec_0%,#f9b8cb_100%)]", ink: "text-pink-700", font: "type" },
    sticker: noto("1f979"),
    photoDefaults: { photo: noto("1f979"), happyPhoto: noto("1f970") },
    fields: [
      F.toName(),
      F.fromName(),
      F.message("Your apology", "I'm sorry. You matter more to me than being right."),
      F.photo("photo", "Your sorry face"),
      F.photo("happyPhoto", "Photo after they forgive you"),
      ...F.gifts(),
      F.music(),
    ],
    Component: ForgiveMe,
  },
  {
    key: "mothers-day",
    label: "Blooming Flower",
    description: "A flower that blooms when tapped, then the message and gifts.",
    cover: { bg: "bg-gradient-to-b from-[#f4f8ef] to-[#fdf1f3]", ink: "text-emerald-900", font: "display" },
    sticker: noto("1f337"),
    fields: [
      F.toName("What you call her"),
      F.fromName(),
      F.message("Your message", "Thank you for everything you never asked credit for."),
      F.photo("photo", "A photo of her (or you two)"),
      ...F.gifts(),
      F.music(),
    ],
    Component: MothersDay,
  },
];

export function getDesign(key: string): DesignDef | undefined {
  return DESIGNS.find((d) => d.key === key);
}

export function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
