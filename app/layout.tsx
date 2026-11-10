import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import "./globals.css";

// design.md §4: one self-hosted web font, Inter, via next/font/google with display swap.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  icons: {
    icon: "/icon.svg",
  },
};

function MortarboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5 2 9.5 12 14l10-4.5L12 5Z" />
      <path d="M6 11.5V16c0 1.5 2.7 2.5 6 2.5s6-1 6-2.5v-4.5" />
    </svg>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [wordmarkFirst, ...wordmarkRest] = APP_NAME.split(" ");

  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-[100dvh] flex-col">
        <header className="sticky top-0 z-10 flex h-[58px] items-center justify-between border-b border-line bg-white px-4 md:h-16 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-blue-600 to-blue-800">
              <MortarboardIcon />
            </span>
            <span className="text-[18px] font-extrabold tracking-[-0.025em] md:text-[20px]">
              <span className="text-blue-700">{wordmarkFirst}</span>
              <span className="text-sky">{wordmarkRest.join(" ")}</span>
            </span>
          </Link>
          <Link
            href="/join"
            className="inline-flex h-10 items-center rounded-full bg-tint px-4 text-[14px] font-bold text-blue-700"
          >
            Join as a teacher
          </Link>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="px-4 pb-6 pt-6 text-[13px] text-ink-3">
          {/* TODO: make "Message us on WhatsApp" a real wa.me link once the owner's
              contact number has an env var (not yet in tech_spec.md §6) */}
          Are you a teacher in Dhuri? Get listed for free. Message us on
          WhatsApp.
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
