import { getListings } from "../../../lib/listings.js";

export const dynamic = "force-dynamic";
export const revalidate = 900;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || 48);
  const minPrice = Number(searchParams.get("minPrice") || 600000);
  const maxPrice = Number(searchParams.get("maxPrice") || 0);
  const options = {
    limit,
    minPrice,
    maxPrice,
    city: searchParams.get("city") || undefined,
    neighborhood: searchParams.get("neighborhood") || undefined,
    propertyType: searchParams.get("propertyType") || undefined,
    beds: Number(searchParams.get("beds") || 0),
    baths: Number(searchParams.get("baths") || 0),
    sqft: Number(searchParams.get("sqft") || 0),
    waterfront: searchParams.get("waterfront") === "true",
    newConstruction: searchParams.get("newConstruction") === "true",
    mode: searchParams.get("mode") || "buy",
  };

  try {
    const listings = await getListings(options);
    return Response.json({
      source: listings.some((listing) => listing.source === "spark-reso") ? "spark-reso" : "curated-fallback",
      count: listings.length,
      listings,
    });
  } catch (error) {
    return Response.json({ error: error.message, listings: [] }, { status: 500 });
  }
}
