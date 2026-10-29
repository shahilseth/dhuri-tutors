import { createHash } from "node:crypto";
import { getListingBySlug, logTap } from "@/lib/data";
import type { Channel } from "@/lib/types";

// Link-preview bots/crawlers never contact anyone; their taps would inflate counts.
const BOT_UA = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|curl|wget|python|headless/i;

function isChannel(value: unknown): value is Channel {
  return value === "whatsapp" || value === "call";
}

/** Records a Call or WhatsApp tap. Always fire-and-forget from the client (tech_spec.md §3.1): never blocks contact. */
export async function POST(request: Request): Promise<Response> {
  const raw = await request.text();

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return new Response(null, { status: 400 });
  }
  const { slug, channel } = body as { slug?: unknown; channel?: unknown };
  if (typeof slug !== "string" || !slug || !isChannel(channel)) {
    return new Response(null, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (BOT_UA.test(userAgent)) {
    return new Response(null, { status: 204 });
  }

  const listing = await getListingBySlug(slug);
  if (!listing) return new Response(null, { status: 404 });

  const salt = process.env.TAP_SALT;
  if (!salt) throw new Error("TAP_SALT must be set");

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const visitor = createHash("sha256").update(`${salt}|${ip}|${userAgent}`).digest("hex").slice(0, 24);

  await logTap(listing.id, channel, visitor);

  return new Response(null, { status: 204 });
}
