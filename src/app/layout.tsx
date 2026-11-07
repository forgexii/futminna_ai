import type { Metadata } from "next";
import { AppProvider } from "@/lib/context/app-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "FUTMINNA AI - Centralized Digital Campus Platform",
  description:
    "A structured, trust-scored digital campus ecosystem for students and faculty of the Federal University of Technology, Minna. Marketplace, tutoring, and campus assistant.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-warmgray-50 text-ink antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
