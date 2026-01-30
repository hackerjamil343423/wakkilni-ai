import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/provider";
import { LanguageProvider } from "@/context/LanguageContext";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic"], variable: "--font-cairo" });
export const metadata: Metadata = {
  title: "Next.js Starter Kit - Launch Your SAAS",
  description:
    "A modern, full-stack Next.js starter kit with authentication, payments, and dashboard. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
  openGraph: {
    title: "Next.js Starter Kit",
    description:
      "A modern, full-stack Next.js starter kit with authentication, payments, and dashboard. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
    url: "nextstarter.xyz",
    siteName: "Next.js Starter Kit",
    images: [
      {
        url: "https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/nsk-w9fFwBBmLDLxrB896I4xqngTUEEovS.png",
        width: 1200,
        height: 630,
        alt: "Next.js Starter Kit",
      },
    ],
    locale: "en-US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${cairo.variable} font-sans antialiased`}>
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            forcedTheme="light"
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
