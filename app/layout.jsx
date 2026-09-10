import "../styles/globals.css";
import { SmoothScrollProvider } from "../components/platform/SmoothScrollProvider.jsx";
import { realEstateAgentJsonLd, SITE_URL } from "../lib/seo.js";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Yairo Properties | Homes for Sale in South Florida",
    template: "%s | Yairo Properties",
  },
  description:
    "Homes and condos for sale across Miami, Fort Lauderdale, and Palm Beach. Browse active MLS listings and request a private showing with Yairo Properties.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Yairo Properties",
    url: SITE_URL,
    title: "Yairo Properties | Homes for Sale in South Florida",
    description:
      "Browse homes and condos for sale in Miami, Fort Lauderdale, and Palm Beach with Yairo Properties.",
    images: ["/yairo-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yairo Properties | Homes for Sale in South Florida",
    description:
      "Browse homes and condos for sale in Miami, Fort Lauderdale, and Palm Beach with Yairo Properties.",
    images: ["/yairo-logo.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({ children }) {
  const agentSchema = realEstateAgentJsonLd();

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(agentSchema) }}
        />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
