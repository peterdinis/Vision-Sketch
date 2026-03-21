import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VisionSketch AI",
    template: "%s | VisionSketch AI",
  },
  description:
    "Transform your hand-drawn sketches into production-ready React components with generative AI.",
  keywords: [
    "AI",
    "React",
    "Next.js",
    "Design",
    "Code Generation",
    "Tailwind CSS",
    "Developer Tools",
  ],
  authors: [{ name: "VisionSketch AI Team" }],
  creator: "VisionSketch AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://visionsketch.ai",
    title: "VisionSketch AI",
    description: "Turn your sketches into high-quality React components powered by AI.",
    siteName: "VisionSketch AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VisionSketch AI - Sketch to Code",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VisionSketch AI",
    description: "Turn your sketches into high-quality React components powered by AI.",
    images: ["/og-image.png"],
    creator: "@visionsketchai",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
