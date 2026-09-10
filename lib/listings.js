import { listingIndex, listings, supplementalListingIndex, supplementalListings } from "../data/listings.js";
import { fetchSparkResoListingBySlug } from "../listings/sparkResoAdapter.js";
import { seoPropertySlug } from "./seo.js";
import { fetchSparkResoListings } from "../listings/sparkResoAdapter.js";

export async function getListings(options = {}) {
  const shouldUseFallback = !hasExplicitSearchIntent(options);
  const supplementalMatches = findSupplementalMatches(options);

  try {
    const sparkListings = await fetchSparkResoListings(options);
    if (sparkListings.length) return photosFirst(mergeSupplementalListings(supplementalMatches, sparkListings));
    if (supplementalMatches.length) return supplementalMatches;
  } catch (error) {
    console.warn(
      shouldUseFallback ? "[Spark RESO] Falling back to curated listings:" : "[Spark RESO] Search returned no fallback:",
      error.message
    );
  }

  if (supplementalMatches.length) return supplementalMatches;
  if (!shouldUseFallback) return [];

  return listings;
}

function hasExplicitSearchIntent(options = {}) {
  const address = String(options.address || "").trim();
  if (address.length >= 3) return true;
  if (options.city && !["All Florida", "All South Florida"].includes(options.city)) return true;
  if (options.neighborhood && options.neighborhood !== "Any") return true;
  if (options.propertyType && options.propertyType !== "Any") return true;
  if (options.status && options.status !== "Active") return true;
  if (options.daysOnMarket && options.daysOnMarket !== "Any") return true;
  if (Number(options.beds)) return true;
  if (Number(options.baths)) return true;
  if (Number(options.sqft)) return true;
  if (options.waterfront || options.newConstruction) return true;
  return false;
}

export function getListingSlugs() {
  return listings.map((listing) => listing.slug);
}

export async function getListingBySlug(slug) {
  const supplementalListing = supplementalListingIndex.get(slug);
  if (supplementalListing) return supplementalListing;
  const supplementalBySeo = supplementalListings.find((listing) => seoPropertySlug(listing) === slug || listing.mlsId === slug);
  if (supplementalBySeo) return supplementalBySeo;

  try {
    const sparkListing = await fetchSparkResoListingBySlug(slug);
    if (sparkListing) return sparkListing;
  } catch (error) {
    console.warn("[Spark RESO] Falling back to curated listing:", error.message);
  }

  // Returning listings[0] here served an unrelated property under the requested
  // URL with a 200 -- misleading to buyers, and duplicate content for Google.
  // An honest 404 is the correct answer.
  return listingIndex.get(slug) || null;
}

function findSupplementalMatches(options = {}) {
  const address = normalizeSearchText(options.address || "");
  const city = normalizeSearchText(options.city || "");
  const hasAddressSearch = address.length >= 3;

  return supplementalListings.filter((listing) => {
    const haystack = normalizeSearchText([listing.address, listing.streetAddress, listing.title, listing.city, listing.neighborhood, listing.mlsId].join(" "));
    const compactHaystack = haystack.replace(/\s+/g, "");
    const compactNeedle = address.replace(/\s+/g, "");
    if (hasAddressSearch) {
      if (compactNeedle && compactHaystack.includes(compactNeedle)) return true;
      return address
        .split(" ")
        .filter((term) => term.length >= 3 || /^\d+$/.test(term))
        .every((term) => haystack.includes(term));
    }

    if (city && !["all florida", "all south florida"].includes(city) && normalizeSearchText(listing.city) !== city) return false;
    if (options.status && !["All Status", "All", "Any"].includes(options.status) && normalizeSearchText(listing.status) !== normalizeSearchText(options.status)) return false;

    return false;
  });
}

/**
 * Listings whose MLS media is missing render generic stock art, so they are
 * pushed behind the ones that show the actual property. Stable within groups,
 * so the feed's recency order is preserved.
 */
export function photosFirst(items = []) {
  const withPhotos = [];
  const withoutPhotos = [];
  for (const item of items) {
    (Array.isArray(item?.media) && item.media.length > 0 ? withPhotos : withoutPhotos).push(item);
  }
  return [...withPhotos, ...withoutPhotos];
}

function mergeSupplementalListings(supplemental, sparkListings) {
  if (!supplemental.length) return sparkListings;
  const seen = new Set(supplemental.map((listing) => normalizeSearchText(listing.address)));
  return [...supplemental, ...sparkListings.filter((listing) => !seen.has(normalizeSearchText(listing.address)))];
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[#,.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Whether a city currently has MLS inventory.
 * Returns null when that cannot be determined (no token, feed error) so callers
 * can keep the page indexable rather than deindexing it on an infrastructure blip.
 */
export async function cityInventoryCount(cityName) {
  if (!process.env.SPARK_ACCESS_TOKEN) return null;
  try {
    const found = await fetchSparkResoListings({ city: cityName, limit: 6 });
    return found.length;
  } catch (error) {
    console.warn("[SEO] Unable to resolve city inventory:", error.message);
    return null;
  }
}

export function formatPrice(value) {
  if (typeof value === "string") return value;
  if (value >= 1000000) return `$${Number((value / 1000000).toFixed(value >= 10000000 ? 0 : 1))}M`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}
