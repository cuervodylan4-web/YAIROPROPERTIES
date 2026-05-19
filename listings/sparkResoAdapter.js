import { normalizeListing } from "./normalizers.js";

const DEFAULT_BASE_URL = "https://replication.sparkapi.com/Version/3/Reso/OData";
const TARGET_CITIES = [
  "Miami",
  "Miami Beach",
  "Bal Harbour",
  "Sunny Isles Beach",
  "Surfside",
  "Coral Gables",
  "Coconut Grove",
  "Key Biscayne",
  "Aventura",
  "Fort Lauderdale",
  "Parkland",
  "Plantation",
  "Weston",
  "Boca Raton",
];

export async function fetchSparkResoListings({ limit = 60, minPrice = 600000, expand = "Media" } = {}) {
  const token = process.env.SPARK_ACCESS_TOKEN;
  if (!token) return [];

  const params = new URLSearchParams();
  params.set("$top", String(Math.min(Number(limit) || 60, 100)));
  params.set("$orderby", "ModificationTimestamp desc");
  params.set("$filter", buildLuxuryFilter(minPrice));
  params.set(
    "$select",
    [
      "ListingKey",
      "ListingId",
      "StandardStatus",
      "MlsStatus",
      "ListPrice",
      "UnparsedAddress",
      "City",
      "StateOrProvince",
      "PostalCode",
      "SubdivisionName",
      "MLSAreaMajor",
      "BedroomsTotal",
      "BathroomsTotalInteger",
      "BathroomsTotalDecimal",
      "LivingArea",
      "YearBuilt",
      "AssociationFee",
      "AssociationFeeFrequency",
      "WaterfrontYN",
      "PropertyType",
      "PropertySubType",
      "ArchitecturalStyle",
      "Latitude",
      "Longitude",
      "PublicRemarks",
      "ModificationTimestamp",
    ].join(",")
  );
  if (expand) params.set("$expand", expand);

  const payload = await requestReso(`Property?${params.toString()}`);
  const records = Array.isArray(payload?.value) ? payload.value : [];

  return records.map((record) =>
    normalizeListing(record, {
      source: "spark-reso",
      sourceId: process.env.SPARK_SOURCE_API_ID || null,
    })
  );
}

export async function fetchSparkResoListingBySlug(slug) {
  const listings = await fetchSparkResoListings({ limit: 100 });
  return listings.find((listing) => listing.slug === slug || listing.listingKey === slug || listing.mlsId === slug) || null;
}

async function requestReso(path) {
  const baseUrl = String(process.env.SPARK_RESO_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.SPARK_ACCESS_TOKEN}`,
    },
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Spark RESO request failed: ${response.status} ${detail.slice(0, 160)}`);
  }

  return response.json();
}

function buildLuxuryFilter(minPrice) {
  const cityFilter = TARGET_CITIES.map((city) => `City eq '${city.replace(/'/g, "''")}'`).join(" or ");
  return `StandardStatus eq 'Active' and ListPrice ge ${Number(minPrice) || 600000} and (${cityFilter})`;
}
