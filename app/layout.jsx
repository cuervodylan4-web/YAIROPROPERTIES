import "../styles/globals.css";
import { SmoothScrollProvider } from "../components/platform/SmoothScrollProvider.jsx";
import { realEstateAgentJsonLd, SITE_URL } from "../lib/seo.js";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Yairo Properties | South Florida Real Estate Advisory",
    template: "%s | Yairo Properties",
  },
  description:
    "South Florida real estate advisory for homes, condos, private listings, and residential opportunities across Miami, Broward, and Palm Beach.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Yairo Properties",
    url: SITE_URL,
    title: "Yairo Properties | South Florida Real Estate Advisory",
    description:
      "Browse curated South Florida residences and request private real estate guidance with Yairo Properties.",
    images: ["/yairo-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yairo Properties | South Florida Real Estate Advisory",
    description:
      "Browse curated South Florida residences and request private real estate guidance with Yairo Properties.",
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
