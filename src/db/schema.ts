import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const cardStatus = pgEnum("card_status", ["draft", "paid", "refunded"]);
export const orderStatus = pgEnum("order_status", ["pending", "paid", "failed", "refunded"]);
export const promptKind = pgEnum("prompt_kind", ["image", "video"]);

// ---- Admin ------------------------------------------------------------------

export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  /** scrypt$<salt>$<hash>, see src/lib/auth.ts */
  passwordHash: text("password_hash").notNull(),
  createdAt: createdAt(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

// ---- Customers ----------------------------------------------------------------

/**
 * One row per customer account. Login itself is handled by Supabase Auth;
 * `id` is the Supabase user id. Kept here so the admin can list customers and
 * so cards can be joined to an email without calling Supabase.
 */
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  createdAt: createdAt(),
  lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }),
});

// ---- Catalog (managed in /admin) ---------------------------------------------

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  emoji: text("emoji").notNull().default("💌"),
  sort: integer("sort").notNull().default(0),
  createdAt: createdAt(),
});

/**
 * A card for sale. Built on a `design` (an animated layout that lives in code,
 * see src/designs/registry.ts); everything else here is editable in /admin.
 */
export const templates = pgTable(
  "templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull().default(""),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    /** Key of a design in src/designs/registry.ts */
    design: text("design").notNull(),
    priceCents: integer("price_cents").notNull().default(199),
    published: boolean("published").notNull().default(false),
    sort: integer("sort").notNull().default(0),

    /** Gallery cover: an uploaded image, or a CSS cover drawn from these texts. */
    coverPath: text("cover_path"),
    coverTitle: text("cover_title"),
    coverSubtitle: text("cover_subtitle"),
    coverEmoji: text("cover_emoji"),

    /** Built-in track key, "none", or "upload" (then musicPath is the file). */
    music: text("music").notNull().default("sweet"),
    musicPath: text("music_path"),

    /** What the free demo (/t/[slug]) shows. Keys = the design's field names. */
    demoData: jsonb("demo_data").$type<Record<string, string>>().notNull().default({}),
    /** Photo field → asset path (or a /public URL). */
    demoPhotos: jsonb("demo_photos").$type<Record<string, string>>().notNull().default({}),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("templates_published_sort_idx").on(t.published, t.sort)],
);

// ---- Sales --------------------------------------------------------------------

/** One customized card. Created as a draft in the editor, unlocked by payment. */
export const cards = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "restrict" }),
    /** Owner. Null for a draft made before signing up; set when they sign up to pay. */
    userId: uuid("user_id").references(() => customers.id, { onDelete: "set null" }),
    /** Unguessable public id used in /c/[shareSlug]. */
    shareSlug: text("share_slug").notNull().unique(),
    status: cardStatus("status").notNull().default("draft"),
    /** What the buyer typed in the editor. Keys = the design's field names. */
    data: jsonb("data").$type<Record<string, string>>().notNull(),
    /** Photo field → object path in the private photos bucket. */
    photos: jsonb("photos").$type<Record<string, string>>().notNull().default({}),
    buyerEmail: text("buyer_email"),
    createdAt: createdAt(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    /** Null means the link never expires. */
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (t) => [
    index("cards_status_created_idx").on(t.status, t.createdAt),
    index("cards_template_idx").on(t.templateId),
    index("cards_user_idx").on(t.userId, t.createdAt),
  ],
);

/** One Stripe Checkout attempt for a card. */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cardId: uuid("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    /** cs_... Unique, so unlocking a card is idempotent. */
    stripeSessionId: text("stripe_session_id").notNull().unique(),
    /** pi_... Refund events reference this. */
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("usd"),
    status: orderStatus("status").notNull().default("pending"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("orders_card_id_idx").on(t.cardId),
    index("orders_payment_intent_idx").on(t.stripePaymentIntentId),
    index("orders_status_created_idx").on(t.status, t.createdAt),
  ],
);

/** Every Stripe event id we've processed. Stripe delivers webhooks at least once. */
export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
});

/** The AI prompt gallery (image/video prompts with a "Try" link). */
export const prompts = pgTable("prompts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  kind: promptKind("kind").notNull(),
  prompt: text("prompt").notNull(),
  mediaUrl: text("media_url"),
  /** Credit link to the original creator (e.g. the X post). */
  sourceUrl: text("source_url"),
  /** Outbound "Try" link, affiliate/UTM params included. */
  tryUrl: text("try_url"),
  sort: integer("sort").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: createdAt(),
});

export type Admin = typeof admins.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Prompt = typeof prompts.$inferSelect;
