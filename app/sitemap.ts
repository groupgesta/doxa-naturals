import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site";

const pages = [
  { path: "", priority: 1 },
  { path: "/faq", priority: 0.6 },
  { path: "/collection-and-payment", priority: 0.6 },
  { path: "/contact", priority: 0.5 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    changeFrequency: "monthly",
    priority: p.priority,
  }));
}
