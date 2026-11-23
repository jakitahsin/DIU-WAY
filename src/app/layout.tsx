import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SetupNotice } from "@/components/SetupNotice";
import { themeScript } from "@/components/ThemeToggle";
import { getSupabaseEnv } from "@/lib/supabase/env";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "DIU WAY — Together on the Way.", template: "%s · DIU WAY" },
  description:
    "Know who's heading to Daffodil International University, when they're going, and when they're coming back. Coordinate your commute with your friends.",
  applicationName: "DIU WAY",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F9F6" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1624" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const configured = Boolean(getSupabaseEnv());

  return (
    <html lang="en" className={`${jakarta.variable} ${bricolage.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <Navbar />
        <main id="main" className="min-h-[60vh]">
          {configured ? children : <SetupNotice />}
        </main>
        <Footer />
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{ className: "!rounded-2xl !font-sans" }}
        />
      </body>
    </html>
  );
}
