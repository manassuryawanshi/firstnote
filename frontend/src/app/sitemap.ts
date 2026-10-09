import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://chordyn.vercel.app";

  return [
    {
      url: `${baseUrl}`,
    },
    {
      url: `${baseUrl}/piano`,
    },
    {
      url: `${baseUrl}/guitar`,
    },
    {
      url: `${baseUrl}/library`,
    },
    {
      url: `${baseUrl}/privacy`,
    },
    {
      url: `${baseUrl}/terms`,
    },
    {
      url: `${baseUrl}/cookies`,
    },
  ];
}
