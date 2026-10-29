import type { MetadataRoute } from "next";
import { APP_NAME, CITY } from "@/lib/config";

/** Colours mirror the page/blue tokens in design.md §3 — the manifest spec needs hex, not CSS vars. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} — tuition teachers in ${CITY}`,
    short_name: APP_NAME,
    start_url: "/",
    display: "standalone",
    background_color: "#EEF1F5",
    theme_color: "#1F3C88",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
