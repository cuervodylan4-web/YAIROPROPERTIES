import { ListingsPage } from "../../../src/YairoHero.jsx";
import { SEO_CITY_PAGES, SITE_NAME, absoluteUrl, titleCaseFromSlug } from "../../../lib/seo.js";
import { notFound } from "next/navigation";
import { cityInventoryCount } from "../../../lib/listings.js";
import { alternatesFor } from "../../../lib/i18n.js";

export const revalidate = 900;

export function generateStaticParams() {
  return SEO_CITY_PAGES.map((city) => ({ city }));
}

export async function generateMetadata({ params }) {
  const { city } = await params;
  if (!SEO_CITY_PAGES.includes(city)) {
    return {};
  }

  const cityName = titleCaseFromSlug(city);
  const inventory = await cityInventoryCount(cityName);
  const title = `${cityName} Homes for Sale`;
  const description = `Explore curated homes and condos for sale in ${cityName}, Florida. Browse active listings and request a private showing with ${SITE_NAME}.`;

  return {
    title,
    description,
    // A city page with confirmed zero inventory is thin content. Keep it
    // crawlable for the links, but out of the index until it has listings.
    ...(inventory === 0 ? { robots: { index: false, follow: true } } : {}),
    alternates: alternatesFor(`/listings/${city}`, "en"),
    openGraph: {
      type: "website",
      title: `${title} | ${SITE_NAME}`,
      description,
      url: absoluteUrl(`/listings/${city}`),
      images: ["/videos/optimized/miami-hero-02-poster.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: ["/videos/optimized/miami-hero-02-poster.jpg"],
    },
  };
}

export default async function CityListingsRoute({ params }) {
  const { city } = await params;
  if (!SEO_CITY_PAGES.includes(city)) {
    notFound();
  }

  const cityName = titleCaseFromSlug(city);

  return (
    <ListingsPage
      initialCity={cityName}
      cityTitle={`${cityName} Homes for Sale`}
      cityIntro={`Explore homes and condos for sale in ${cityName}, Florida. Review active inventory, compare market context, and request private guidance with Yairo Properties.`}
    />
  );
}
