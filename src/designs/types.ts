import type { ComponentType } from "react";
import type { TrackId } from "./kit/synth";

export type FieldType = "text" | "textarea" | "photo" | "youtube" | "date" | "select";

/** A field the buyer fills in the editor. Defined per design, in code. */
export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  hint?: string;
  /** Editor groups fields under this heading. */
  section?: string;
  /** For `select`. */
  options?: { value: string; label: string }[];
  /** Pre-filled value in the editor. */
  defaultValue?: string;
};

/** What every card component receives. */
export type CardProps = {
  data: Record<string, string>;
  /** Photo URLs keyed by photo field name. Missing key = no photo uploaded. */
  photos: Record<string, string>;
};

/** The template's own song, resolved for the browser. */
export type MusicSpec = { kind: "builtin"; track: TrackId } | { kind: "url"; url: string } | null;

export type CoverFont = "display" | "type" | "round";

/**
 * An animated card layout. Designs live in code (the interactions are code);
 * templates in the database pick a design and fill in everything else.
 */
export type DesignDef = {
  key: string;
  label: string;
  /** Shown in the admin when picking a design. */
  description: string;
  fields: FieldDef[];
  /** CSS cover used in the gallery when the template has no cover image. */
  cover: { bg: string; ink: string; font: CoverFont };
  /** Animated sticker on the gallery cover, unless the template has its own first-screen photo. */
  sticker: string;
  /**
   * Built-in images for photo slots the buyer leaves empty (e.g. the question screen).
   * A template's demo photo for the same slot wins over these. Buyers can replace either.
   */
  photoDefaults?: Record<string, string>;
  Component: ComponentType<CardProps>;
};
