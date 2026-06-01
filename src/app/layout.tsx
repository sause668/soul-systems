import type { Metadata } from "next";
import "./globals.css";
import { fontMono, fontSans } from "@/app/lib/fonts";

export const metadata: Metadata = {
  title: "Soul Systems",
  description: "Manufacturing workflow visibility, scheduling, and throughput",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
