import { cityInventoryCount, getListings } from "../lib/listings.js";
import { SEO_CITY_PAGES, absoluteUrl, seoPropertyPath, titleCaseFromSlug } from "../lib/seo.js";
import { localizedPath } from "../lib/i18n.js";

export const dynamic = "force-dynamic";
export const revalidate = 900;

export default async function sitemap() {
  const now = new Date();
  let activeListings = [];

  try {
    activeListings = await getListings({ limit: 80, status: "Active", minPrice: 1 });
  } catch (error) {
    console.warn("[SEO] Unable to fetch Spark listings for sitemap:", error.message);
  }

  const propertyUrls = activeListings
    .filter((listing) => {
      // heroImage/gallery always fall back to generic stock art, so only real MLS
      // media proves the listing renders a usable page.
      const image = Array.isArray(listing.media) && listing.media.length > 0;
      const description = listing.description || listing.summary || listing.narrative;
      const status = String(listing.status || "").toLowerCase();
      return (
        listing.address &&
        image &&
        description &&
        !["expired", "withdrawn", "deleted", "duplicate"].includes(status)
      );
    })
    .map((listing) => ({
      url: absoluteUrl(seoPropertyPath(listing)),
      lastModified: listing.modifiedAt ? new Date(listing.modifiedAt) : now,
      changeFrequency: "daily",
      priority: 0.8,
    }));

  // Drop city pages confirmed to have no inventory; keep the rest when the
  // feed cannot answer.
  const cityUrls = (
    await Promise.all(
      SEO_CITY_PAGES.map(async (city) => {
        const inventory = await cityInventoryCount(titleCaseFromSlug(city));
        if (inventory === 0) return null;
        return [
          {
            url: absoluteUrl(`/listings/${city}`),
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.76,
          },
          {
            url: absoluteUrl(localizedPath(`/listings/${city}`, "es")),
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.7,
          },
        ];
      })
    )
  ).filter(Boolean).flat();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/listings"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/es"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/es/listings"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/journal"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    ...cityUrls,
    ...propertyUrls,
  ];
}
