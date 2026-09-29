import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/nunito/wght.css";
import "@fontsource/courier-prime/400.css";
import "@fontsource/courier-prime/700.css";
import "./globals.css";

const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "pixi.love — little cards for big feelings", template: "%s · pixi.love" },
  description: "Interactive cards with music, photos and a surprise at the end. Make one in two minutes.",
  openGraph: { siteName: "pixi.love", type: "website" },
};

export const viewport: Viewport = { themeColor: "#fdf2f5" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: extensions like Grammarly inject attributes into <html>/<body>.
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
