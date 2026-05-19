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

export async function fetchSparkResoListings({
  limit = 48,
  minPrice = 600000,
  maxPrice,
  city,
  neighborhood,
  propertyType,
  beds,
  baths,
  sqft,
  waterfront,
  newConstruction,
  mode = "buy",
  expand = "Media",
} = {}) {
  const token = process.env.SPARK_ACCESS_TOKEN;
  if (!token) return [];

  const params = new URLSearchParams();
  params.set("$top", String(Math.min(Number(limit) || 48, 60)));
  params.set("$orderby", "ModificationTimestamp desc");
  params.set(
    "$filter",
    buildLuxuryFilter({
      minPrice,
      maxPrice,
      city,
      neighborhood,
      propertyType,
      beds,
      baths,
      sqft,
      waterfront,
      newConstruction,
      mode,
    })
  );
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
  const listingKey = extractListingKey(slug);
  if (listingKey) {
    try {
      const payload = await requestReso(`Property('${encodeURIComponent(listingKey)}')?$expand=Media`);
      if (payload?.ListingKey) {
        return normalizeListing(payload, {
          source: "spark-reso",
          sourceId: process.env.SPARK_SOURCE_API_ID || null,
        });
      }
    } catch (_error) {
      // Fall back to the active collection lookup below.
    }
  }

  const listings = await fetchSparkResoListings({ limit: 60 });
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

function buildLuxuryFilter({
  minPrice,
  maxPrice,
  city,
  neighborhood,
  propertyType,
  beds,
  baths,
  sqft,
  waterfront,
  newConstruction,
  mode,
}) {
  const filters = ["StandardStatus eq 'Active'"];
  const cityFilter = TARGET_CITIES.map((city) => `City eq '${city.replace(/'/g, "''")}'`).join(" or ");

  filters.push(`ListPrice ge ${Number(minPrice) || 600000}`);
  if (Number(maxPrice)) filters.push(`ListPrice le ${Number(maxPrice)}`);

  if (city && city !== "All South Florida") {
    filters.push(`City eq '${escapeODataString(city)}'`);
  } else {
    filters.push(`(${cityFilter})`);
  }

  if (neighborhood && neighborhood !== "Any") {
    filters.push(`SubdivisionName eq '${escapeODataString(neighborhood)}'`);
  }

  if (propertyType && propertyType !== "Any") {
    filters.push(`PropertySubType eq '${escapeODataString(propertyType)}'`);
  } else if (mode === "rent") {
    filters.push(`PropertyType eq 'Residential Lease'`);
  } else {
    filters.push(`PropertyType eq 'Residential'`);
  }

  if (Number(beds)) filters.push(`BedroomsTotal ge ${Number(beds)}`);
  if (Number(baths)) filters.push(`BathroomsTotalDecimal ge ${Number(baths)}`);
  if (Number(sqft)) filters.push(`LivingArea ge ${Number(sqft)}`);
  if (waterfront === true || waterfront === "true") filters.push("WaterfrontYN eq true");
  if (newConstruction === true || newConstruction === "true") filters.push(`YearBuilt ge ${new Date().getFullYear() - 3}`);

  return filters.join(" and ");
}

function escapeODataString(value) {
  return String(value).replace(/'/g, "''");
}

function extractListingKey(value) {
  const text = String(value || "");
  const match = text.match(/(\d{20,})$/);
  return match ? match[1] : "";
}
