"use client";

import { useState } from "react";

/** design.md §7: "Secondary" button style. Copies the public listing link to the clipboard. */
export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard access can fail (permissions, insecure context); the link text is still visible to copy by hand.
        }
      }}
      className="h-11 rounded-md border border-rule bg-paper px-4 text-[15px] font-medium text-blue"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
