import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Cinzel } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { PostHogProvider } from "@/components/PostHogProvider";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kindred Stars | Find Your Cosmic Counterpart",
  description: "An astrology-based compatibility platform. Discover meaningful connections through celestial alignment.",
  openGraph: {
    title: "Kindred Stars | Find Your Cosmic Counterpart",
    description: "Discover meaningful connections through celestial alignment.",
    url: "https://www.kindredstars.org",
    siteName: "Kindred Stars",
    images: [
      {
        url: "https://www.kindredstars.org/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kindred Stars — Find Your Cosmic Counterpart",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kindred Stars | Find Your Cosmic Counterpart",
    description: "Discover meaningful connections through celestial alignment.",
    images: ["https://www.kindredstars.org/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${cinzel.variable} font-sans min-h-screen bg-[#080B18] text-stone-100 antialiased`}>
        <SessionProvider>
          <PostHogProvider>
            <div className="relative">
              {children}
            </div>
            <Toaster />
          </PostHogProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
