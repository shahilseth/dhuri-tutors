"use client";

import type { Channel } from "@/lib/types";

/** Fire-and-forget tap log. The button's own href does the real navigation, so this never blocks contact. */
function logTap(slug: string, channel: Channel) {
  try {
    const body = JSON.stringify({ slug, channel });
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/tap", new Blob([body], { type: "text/plain" }));
    } else {
      fetch("/api/tap", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  } catch {
    // Logging must never break the WhatsApp/Call link.
  }
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.4 21 3 13.6 3 4.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z" />
    </svg>
  );
}

export default function ContactButtons({
  slug,
  whatsappUrl,
  callUrl,
}: {
  slug: string;
  whatsappUrl: string;
  callUrl: string;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <a
        href={whatsappUrl}
        onClick={() => logTap(slug, "whatsapp")}
        className="flex h-12 items-center justify-center rounded-md bg-wa text-[16px] font-semibold text-white"
      >
        WhatsApp
      </a>
      <a
        href={callUrl}
        onClick={() => logTap(slug, "call")}
        className="flex h-12 items-center justify-center gap-1.5 rounded-md bg-blue text-[16px] font-semibold text-white"
      >
        <PhoneIcon />
        Call
      </a>
    </div>
  );
}
