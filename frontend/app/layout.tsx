import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sniplink — Distributed URL Shortener",
  description: "A blazing-fast, production-grade URL shortener powered by PostgreSQL, Redis, and RabbitMQ. Shorten links, track clicks, and view rich analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
