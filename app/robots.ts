import type { MetadataRoute } from "next";

/**
 * Public pages are indexable; admin and API routes never are (tech_spec.md §9). `/edit` is
 * disallowed too (Phase 8): the token in its URL is a bearer credential — a crawler
 * following and indexing it would leak a teacher's private edit link.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/edit"],
    },
  };
}
