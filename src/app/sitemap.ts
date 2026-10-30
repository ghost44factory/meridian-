import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://marevoapp.com";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/owners`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/investors`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/careers`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/map`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];
}
