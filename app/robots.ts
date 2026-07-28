import type { MetadataRoute } from "next";

const BASE_URL = "https://quikequotes.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/settings",
        "/templates",
        "/quotes",
        "/sign-in",
        "/sign-up",
        "/q/",
        "/api/",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
