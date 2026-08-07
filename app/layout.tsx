import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://port.robertjeremiah.com"),
  title: {
    default: "Português · the family hub",
    template: "%s · Português",
  },
  description:
    "Our European Portuguese learning hub — a shared phrasebook, workbook lessons, homework, quizzes and Luna the AI tutor.",
  robots: { index: false, follow: false },
  applicationName: "Português",
  appleWebApp: {
    capable: true,
    title: "Português",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Português · the family hub",
    description:
      "A shared European Portuguese phrasebook, workbook, quizzes and an AI tutor — for the family in Santa Cruz.",
    type: "website",
    locale: "pt_PT",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the bottom tab bar sit flush and use env(safe-area-inset-*).
  viewportFit: "cover",
  themeColor: "#faf7f0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${inter.variable}`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
