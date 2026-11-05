import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import pageInventory from "../SEO/page-metadata.json";
import { release } from "./release";

export type SiteRoute = "/" | "/docs/" | "/privacy/";

export const siteUrl = pageInventory.origin;

export function metadataFor(path: SiteRoute): Metadata {
  const page = pageInventory.pages.find((item) => item.path === path);
  if (!page) throw new Error(`Missing SEO metadata for ${path}`);

  const image = {
    url: page.socialImage,
    width: 1200,
    height: 630,
    alt: page.socialImageAlt,
    type: "image/png",
  };

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.canonical },
    robots: page.robots,
    openGraph: {
      type: "website",
      siteName: pageInventory.siteName,
      locale: "en_US",
      title: page.title,
      description: page.description,
      url: page.canonical,
      images: [image],
    },
    twitter: {
      card: page.twitterCard as "summary_large_image",
      title: page.title,
      description: page.description,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}

export function jsonLdFor(path: SiteRoute): string {
  const name = path === "/" ? "home" : path === "/docs/" ? "docs" : "privacy";
  const schema = JSON.parse(
    readFileSync(join(process.cwd(), "SEO", "templates", `${name}.jsonld`), "utf8"),
  ) as { "@graph": Array<Record<string, unknown>> };

  if (path === "/") {
    const app = schema["@graph"].find((node) => node["@type"] === "SoftwareApplication");
    if (app) {
      app.softwareVersion = release.version;
      app.downloadUrl = release.installerUrl;
      app.softwareRequirements = release.requirements;
    }
  }

  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
