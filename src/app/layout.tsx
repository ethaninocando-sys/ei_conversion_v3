import type { Metadata } from "next";
import { Archivo, Fraunces } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import "./globals.css";
import { site } from "@/config/site";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@/components/analytics/Analytics";
import { AttributionCapture } from "@/components/analytics/AttributionCapture";
import { JsonLd } from "@/components/ui/JsonLd";
import { organizationJsonLd } from "@/lib/seo";

/** Display: a high-contrast Scotch roman, set large and tight. */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

/** Text and interface: a sturdy grotesk that holds up at caption size. */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description:
    "Which marketing channel actually fits your trade, and which one will waste your money. Written down, for free.",
  openGraph: { siteName: site.name, locale: "en_US", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${archivo.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <JsonLd data={organizationJsonLd()} />
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <AttributionCapture />
      </body>
    </html>
  );
}
