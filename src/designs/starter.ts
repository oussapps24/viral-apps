/**
 * Starter catalog, loaded into the database by `npm run db:seed`.
 * After that, the admin panel is the source of truth. Plain data only (the
 * seed script runs outside Next.js).
 */

export const STARTER_CATEGORIES = [
  { slug: "love", label: "Love", emoji: "💌", sort: 1 },
  { slug: "birthday", label: "Birthday", emoji: "🎂", sort: 2 },
  { slug: "anniversary", label: "Anniversary", emoji: "🌹", sort: 3 },
  { slug: "sorry", label: "Sorry", emoji: "🥹", sort: 4 },
  { slug: "mothers-day", label: "Mother's Day", emoji: "🌷", sort: 5 },
];

const LETTER = `I don't always know how to say it out loud,
so I'm writing it down.

You make ordinary days feel like weekends.
You're my favorite notification.
And I'd pick you again, every single time.`;

const MEMORIES = { memory1: "/demo/memory-1.svg", memory2: "/demo/memory-2.svg", memory3: "/demo/memory-3.svg" };

type StarterTemplate = {
  slug: string;
  name: string;
  category: string;
  design: string;
  tagline: string;
  coverTitle: string;
  coverSubtitle?: string;
  coverEmoji: string;
  music: string;
  demoData: Record<string, string>;
  demoPhotos: Record<string, string>;
};

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    slug: "do-you-love-me", name: "Do You Love Me?", category: "love", design: "do-you-love-me",
    tagline: "Every “No” makes “Yes” bigger. Good luck.", coverTitle: "do you love me?", coverSubtitle: "Yes!!  ·  No…", coverEmoji: "🥺",
    music: "sweet", demoData: { toName: "Sara", fromName: "Ali", message: "Best answer ever. Now open your gifts 🎁", letter: LETTER }, demoPhotos: MEMORIES,
  },
  {
    slug: "be-my-valentine", name: "Be My Valentine", category: "love", design: "be-my-valentine",
    tagline: "The No button runs away from their finger.", coverTitle: "Will you be my Valentine?", coverEmoji: "♡",
    music: "lullaby", demoData: { toName: "Sara", fromName: "Ali", message: "Dinner's on me. Wear something cute 💐", letter: LETTER }, demoPhotos: MEMORIES,
  },
  {
    slug: "love-letter", name: "Sealed With Love", category: "love", design: "love-letter",
    tagline: "An envelope they get to open.", coverTitle: "Happy Valentine's", coverEmoji: "✉︎",
    music: "dreamy", demoData: { toName: "Sara", fromName: "Ali", message: "Every moment with you feels like a beautiful dream I never want to wake up from.", letter: LETTER }, demoPhotos: MEMORIES,
  },
  {
    slug: "birthday-candles", name: "Blow the Candles", category: "birthday", design: "birthday-candles",
    tagline: "They blow out the candles, then the surprise.", coverTitle: "Happy Birthday!", coverEmoji: "🎂",
    music: "birthday", demoData: { toName: "Hamza", fromName: "The crew", message: "Another year of being unreasonably cool. Happy birthday!", letter: LETTER }, demoPhotos: MEMORIES,
  },
  {
    slug: "birthday-balloons", name: "Pop the Balloons", category: "birthday", design: "birthday-balloons",
    tagline: "Pop balloons to reveal a secret message.", coverTitle: "Happy Birthday", coverSubtitle: "(o◕‿◕o)", coverEmoji: "🎈",
    music: "birthday", demoData: { toName: "baby", fromName: "me", popWords: "you are so loved", message: "Happy birthday to the person who makes every day better. Cake is on me 🍰", letter: LETTER }, demoPhotos: MEMORIES,
  },
  {
    slug: "anniversary", name: "Days of Us", category: "anniversary", design: "anniversary",
    tagline: "Counts every day you've been together.", coverTitle: "Happy Anniversary", coverSubtitle: "1,095 days", coverEmoji: "🌹",
    music: "dreamy", demoData: { toName: "Sara", fromName: "Ali", since: "2023-02-14", message: "Every day with you, I'd choose again.", letter: LETTER }, demoPhotos: MEMORIES,
  },
  {
    slug: "forgive-me", name: "Forgive Me?", category: "sorry", design: "forgive-me",
    tagline: "Starts with only a No button. It doesn't last.", coverTitle: "Will you forgive me?", coverEmoji: "🥹",
    music: "lullaby", demoData: { toName: "love", fromName: "Ali", message: "Thank you for forgiving me. I'm sorry for the times I hurt you, even when I didn't mean to. You matter so much more to me than being right." }, demoPhotos: {},
  },
  {
    slug: "mothers-day", name: "Bloom for Mom", category: "mothers-day", design: "mothers-day",
    tagline: "A flower that blooms when she taps it.", coverTitle: "Happy Mother's Day", coverEmoji: "🌷",
    music: "lullaby", demoData: { toName: "Ammi", fromName: "Your favorite child", message: "Thank you for every packed lunch, every late night, and every prayer. I love you.", letter: LETTER }, demoPhotos: MEMORIES,
  },
];
