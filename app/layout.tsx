import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME, CITY } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-[100dvh] flex flex-col">
        <header className="h-14 flex items-center justify-between px-4 border-b border-rule bg-paper">
          <Link href="/" className="text-blue font-bold text-lg">
            {APP_NAME}
          </Link>
          <span className="text-ink-2 text-[15px]">{CITY}</span>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="px-4 pt-6 pb-6 text-ink-3 text-[13px]">
          {/* TODO: make "Message us on WhatsApp" a real wa.me link once the owner's
              contact number has an env var (not yet in tech_spec.md §6) */}
          Are you a teacher in Dhuri? Get listed for free. Message us on
          WhatsApp.
        </footer>
      </body>
    </html>
  );
}
