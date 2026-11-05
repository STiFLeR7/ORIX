import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { metadataFor, siteUrl } from "../lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  ...metadataFor("/"),
  applicationName: "ORIX",
  icons: { icon: "/brand/orix-icon.svg" },
};

export const viewport: Viewport = { themeColor: "#111318" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-effects="on">
      <head>
        <noscript>
          <link rel="stylesheet" href="/no-js.css" />
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
