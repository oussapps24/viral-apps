import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getCardByShareSlug, isLive } from "@/lib/cards";

export const alt = "A card made with pixi.love";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The preview image WhatsApp / iMessage show when the link is pasted. */
export default async function OgImage({ params }: { params: Promise<{ shareSlug: string }> }) {
  const { shareSlug } = await params;
  const card = await getCardByShareSlug(shareSlug);
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/logo.png"))).toString("base64")}`;
  const name = card && isLive(card) ? card.data.toName : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #fdf2f5 0%, #f9dbe4 55%, #efe7fb 100%)",
          color: "#3b1530",
        }}
      >
        <img src={logo} width={240} height={172} alt="" />
        <div style={{ fontSize: 72, fontWeight: 800, marginTop: 24, textAlign: "center", maxWidth: 1000 }}>
          {name ? `A little something for ${name}` : "A little something for you"}
        </div>
        <div style={{ fontSize: 36, marginTop: 18, color: "#7a4a6b" }}>Tap to open</div>
      </div>
    ),
    size,
  );
}
