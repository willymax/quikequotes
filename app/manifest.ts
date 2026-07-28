import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QuikeQuotes",
    short_name: "QuikeQuotes",
    description:
      "Send a professional quote from your phone in 3 minutes, with tiers, tracking, and follow-up that runs itself.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#14171c",
    // PLACEHOLDER: add real 192x192 / 512x512 PNG icons before relying on
    // "Add to Home Screen" install prompts.
    icons: [],
  };
}
