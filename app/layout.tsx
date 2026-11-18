import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "Doxa Naturals | Haircare for Real Curls & Coils",
  description:
    "Doxa Naturals. Thoughtful natural-based haircare for curls, coils and textured hair. Made in Mauritius.",
  openGraph: {
    title: "Doxa Naturals | Haircare for Real Curls & Coils",
    description:
      "Thoughtful natural-based haircare for curls, coils and textured hair. Made in Mauritius.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#4e5521",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
