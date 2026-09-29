"use client";

import { TemplateMusicContext } from "./kit/Stage";
import { getDesign } from "./registry";
import type { CardProps, MusicSpec } from "./types";

/**
 * Renders a card by design key. Lives on the client because design components
 * are client components and can't be passed as props from the server.
 */
export default function CardRenderer({ design, data, photos, music }: CardProps & { design: string; music: MusicSpec }) {
  const d = getDesign(design);
  if (!d) return <p className="p-10 text-center">This card design is no longer available.</p>;
  const { Component } = d;
  return (
    <TemplateMusicContext.Provider value={music}>
      <Component data={data} photos={photos} />
    </TemplateMusicContext.Provider>
  );
}
