import { listingIndex, listings } from "../data/listings.js";
import { fetchSparkResoListingBySlug, fetchSparkResoListings } from "../listings/sparkResoAdapter.js";

export async function getListings(options = {}) {
  try {
    const sparkListings = await fetchSparkResoListings(options);
    if (sparkListings.length) return sparkListings;
  } catch (error) {
    console.warn("[Spark RESO] Falling back to curated listings:", error.message);
  }

  return listings;
}

export function getListingSlugs() {
  return listings.map((listing) => listing.slug);
}

export async function getListingBySlug(slug) {
  try {
    const sparkListing = await fetchSparkResoListingBySlug(slug);
    if (sparkListing) return sparkListing;
  } catch (error) {
    console.warn("[Spark RESO] Falling back to curated listing:", error.message);
  }

  return listingIndex.get(slug) || listings[0];
}

export function formatPrice(value) {
  if (typeof value === "string") return value;
  if (value >= 1000000) return `$${Number((value / 1000000).toFixed(value >= 10000000 ? 0 : 1))}M`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}
