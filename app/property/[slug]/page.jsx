import { PropertyDetailPage } from "../../../src/YairoHero.jsx";
import { getListingBySlug, getListingSlugs } from "../../../lib/listings.js";
import {
  absoluteUrl,
  propertyJsonLd,
  propertyMetaDescription,
  propertyMetaTitle,
  seoPropertyPath,
  seoPropertySlug,
} from "../../../lib/seo.js";
import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return getListingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  const canonicalPath = listing ? seoPropertyPath(listing) : `/property/${slug}`;
  const title = listing ? propertyMetaTitle(listing) : "Private Residence | Yairo Properties";
  const description = listing ? propertyMetaDescription(listing) : "South Florida property presentation from Yairo Properties.";
  const image = listing?.heroImage || listing?.gallery?.[0] || "/yairo-logo.png";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: absoluteUrl(canonicalPath),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PropertyRoute({ params }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  const canonicalSlug = listing ? seoPropertySlug(listing) : slug;

  if (listing && slug !== canonicalSlug) {
    permanentRedirect(seoPropertyPath(listing));
  }

  return (
    <>
      {listing && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyJsonLd(listing)) }}
        />
      )}
      <PropertyDetailPage property={listing} />
    </>
  );
}
