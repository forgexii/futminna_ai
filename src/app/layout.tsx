import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import { ChatLauncher } from "@/components/chat/chat-launcher";

export const metadata: Metadata = {
  title: {
    default: "FUTMINNA AI — Buy, sell & learn on campus",
    template: "%s · FUTMINNA AI",
  },
  description:
    "The all-in-one student platform for FUTMINNA: a trusted marketplace, peer tutoring, AI recommendations, and a campus assistant — built for low-bandwidth, mobile-first Nigerian campus life.",
  keywords: [
    "FUTMINNA",
    "student marketplace",
    "peer tutoring",
    "campus AI",
    "Minna",
    "Nigeria student app",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#5B21B6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <QueryProvider>
            {children}
            <ChatLauncher />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "white",
                  border: "1px solid var(--color-warmgray-200)",
                  color: "var(--color-ink)",
                },
              }}
            />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
