import { normalizeListing } from "./normalizers.js";

const DEFAULT_BASE_URL = "https://replication.sparkapi.com/Version/3/Reso/OData";

export async function fetchSparkResoListings({
  limit = 48,
  minPrice = 100000,
  maxPrice,
  city,
  address,
  status,
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
      address,
      status,
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
      "ClosePrice",
      "CloseDate",
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

  const listings = records.map((record) =>
    normalizeListing(record, {
      source: "spark-reso",
      sourceId: process.env.SPARK_SOURCE_API_ID || null,
    })
  );

  return dedupeListings(listings).slice(0, Number(limit) || 48);
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
  address,
  status,
  neighborhood,
  propertyType,
  beds,
  baths,
  sqft,
  waterfront,
  newConstruction,
  mode,
}) {
  const filters = ["(StateOrProvince eq 'FL' or StateOrProvince eq 'Florida')"];
  const hasAddressSearch = Boolean(address && String(address).trim().length >= 3);
  const statusFilter = hasAddressSearch ? "all" : normalizeStatusFilter(status);
  const priceField = statusFilter === "sold" ? "ClosePrice" : "ListPrice";

  if (statusFilter === "active") {
    filters.push("StandardStatus eq 'Active'");
  } else if (statusFilter === "sold") {
    filters.push("(StandardStatus eq 'Closed' or StandardStatus eq 'Sold' or MlsStatus eq 'Sold' or MlsStatus eq 'Closed')");
  }

  if (!hasAddressSearch) {
    if (statusFilter === "all") {
      filters.push(`(ListPrice ge ${Number(minPrice) || 100000} or ClosePrice ge ${Number(minPrice) || 100000})`);
      if (Number(maxPrice)) filters.push(`(ListPrice le ${Number(maxPrice)} or ClosePrice le ${Number(maxPrice)})`);
    } else {
      filters.push(`${priceField} ge ${Number(minPrice) || 100000}`);
      if (Number(maxPrice)) filters.push(`${priceField} le ${Number(maxPrice)}`);
    }
  }

  if (city && city !== "All Florida" && city !== "All South Florida") {
    filters.push(`City eq '${escapeODataString(city)}'`);
  }

  if (address && String(address).trim().length >= 3) {
    filters.push(`contains(tolower(UnparsedAddress), '${escapeODataString(String(address).trim().toLowerCase())}')`);
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

function normalizeStatusFilter(status) {
  const value = String(status || "Active").toLowerCase();
  if (value === "sold" || value === "closed") return "sold";
  if (value === "all status" || value === "all" || value === "any") return "all";
  return "active";
}

function dedupeListings(listings) {
  const seen = new Set();

  return listings.filter((listing) => {
    const keys = [
      listing.listingKey ? `key:${listing.listingKey}` : "",
      listing.mlsId ? `mls:${listing.mlsId}` : "",
      listing.address
        ? `address:${normalizeDedupeValue(listing.address)}|${listing.price || ""}|${listing.beds || ""}|${
            listing.baths || ""
          }|${listing.sqft || ""}`
        : "",
    ].filter(Boolean);

    if (!keys.length) return true;
    if (keys.some((key) => seen.has(key))) return false;

    keys.forEach((key) => seen.add(key));
    return true;
  });
}

function normalizeDedupeValue(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b(street|st)\b/g, "st")
    .replace(/\b(avenue|ave)\b/g, "ave")
    .replace(/\b(court|ct)\b/g, "ct")
    .replace(/\b(road|rd)\b/g, "rd")
    .replace(/\b(drive|dr)\b/g, "dr")
    .replace(/\b(northeast|ne)\b/g, "ne")
    .replace(/\b(northwest|nw)\b/g, "nw")
    .replace(/\b(southeast|se)\b/g, "se")
    .replace(/\b(southwest|sw)\b/g, "sw")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function extractListingKey(value) {
  const text = String(value || "");
  const match = text.match(/(\d{20,})$/);
  return match ? match[1] : "";
}
