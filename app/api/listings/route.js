import { getListings } from "../../../lib/listings.js";

export const dynamic = "force-dynamic";
export const revalidate = 900;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || 60);
  const minPrice = Number(searchParams.get("minPrice") || 600000);

  try {
    const listings = await getListings({ limit, minPrice });
    return Response.json({
      source: listings.some((listing) => listing.source === "spark-reso") ? "spark-reso" : "curated-fallback",
      count: listings.length,
      listings,
    });
  } catch (error) {
    return Response.json({ error: error.message, listings: [] }, { status: 500 });
  }
}
