import { PropertyDetailPage } from "../../../src/YairoHero.jsx";
import { getListingBySlug, getListingSlugs } from "../../../lib/listings.js";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return getListingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  return {
    title: listing ? `${listing.title} | Yairo Rincon Properties` : "Private Residence | Yairo Rincon Properties",
    description: listing?.description || "Luxury Miami waterfront property presentation.",
  };
}

export default async function PropertyRoute({ params }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  return <PropertyDetailPage property={listing} />;
}
