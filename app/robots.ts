import type { MetadataRoute } from "next";

/** Public pages are indexable; admin and API routes never are (tech_spec.md §9). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
  };
}
