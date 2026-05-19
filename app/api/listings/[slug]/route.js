import { getListingBySlug } from "../../../../lib/listings.js";

export const dynamic = "force-dynamic";
export const revalidate = 900;

export async function GET(_request, { params }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  return Response.json({ listing });
}
