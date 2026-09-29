import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "pixi.love: little cards for big feelings";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/logo.png"))).toString("base64")}`;
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
          background: "linear-gradient(160deg, #fdf2f5 0%, #f9dbe4 60%, #efe7fb 100%)",
          color: "#3b1530",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 96, fontWeight: 800 }}>
          <img src={logo} width={200} height={144} alt="" />
          pixi.love
        </div>
        <div style={{ fontSize: 44, marginTop: 16, color: "#7a4a6b" }}>Little cards for big feelings</div>
      </div>
    ),
    size,
  );
}
