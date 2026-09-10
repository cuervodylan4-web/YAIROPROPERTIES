import { normalizeListing } from "./normalizers.js";

const DEFAULT_BASE_URL = "https://replication.sparkapi.com/Version/3/Reso/OData";
const MEDIA_EXPAND = "Media($select=MediaURL,MediaCategory,Order;$orderby=Order)";

export async function fetchSparkResoListings({
  limit = 48,
  minPrice = 100000,
  maxPrice,
  city,
  address,
  status,
  daysOnMarket,
  neighborhood,
  propertyType,
  beds,
  baths,
  sqft,
  waterfront,
  newConstruction,
  mode = "buy",
  expand = MEDIA_EXPAND,
} = {}) {
  const token = process.env.SPARK_ACCESS_TOKEN;
  if (!token) return [];
  const requestedLimit = Number(limit) || 48;
  const hasAddressSearch = Boolean(address && String(address).trim().length >= 3);

  const params = new URLSearchParams();
  params.set("$top", String(hasAddressSearch ? 200 : Math.min(requestedLimit, 60)));
  params.set("$orderby", "ModificationTimestamp desc");
  params.set(
    "$filter",
    buildLuxuryFilter({
      minPrice,
      maxPrice,
      city,
      address,
      status,
      daysOnMarket,
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
      "DaysOnMarket",
      "OnMarketDate",
      "UnparsedAddress",
      "StreetNumber",
      "StreetDirPrefix",
      "StreetName",
      "StreetSuffix",
      "UnitNumber",
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
      // Spark truncates $expand=Media unless Media is also projected in $select.
      "Media",
    ].join(",")
  );
  if (expand) params.set("$expand", expand);

  let payload;
  try {
    payload = await requestReso(`Property?${params.toString()}`);
  } catch (error) {
    // Some Spark deployments reject the nested Media projection. Retry with a plain expand
    // rather than dropping through to the curated fallback.
    if (!expand || expand === "Media") throw error;
    params.set("$expand", "Media");
    payload = await requestReso(`Property?${params.toString()}`);
  }
  const records = Array.isArray(payload?.value) ? payload.value : [];

  const listings = records.map((record) =>
    normalizeListing(record, {
      source: "spark-reso",
      sourceId: process.env.SPARK_SOURCE_API_ID || null,
    })
  );

  const dedupedListings = dedupeListings(listings);
  const rankedListings = address ? rankListingsByAddress(dedupedListings, address) : dedupedListings;

  return rankedListings.slice(0, requestedLimit);
}

export async function fetchSparkResoListingBySlug(slug) {
  const listingKey = extractListingKey(slug);
  if (listingKey) {
    try {
      const payload = await requestReso(`Property('${encodeURIComponent(listingKey)}')?$expand=${MEDIA_EXPAND}`);
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
  daysOnMarket,
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
  const priceField = statusFilter === "closed" ? "ClosePrice" : "ListPrice";

  if (statusFilter === "active") {
    filters.push("StandardStatus eq 'Active'");
  } else if (statusFilter === "closed") {
    filters.push("(StandardStatus eq 'Closed' or StandardStatus eq 'Sold' or MlsStatus eq 'Sold' or MlsStatus eq 'Closed')");
  } else if (statusFilter !== "all") {
    const label = formatStatusFilterLabel(statusFilter);
    filters.push(`(StandardStatus eq '${escapeODataString(label)}' or MlsStatus eq '${escapeODataString(label)}')`);
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

  if (city && !hasAddressSearch && city !== "All Florida" && city !== "All South Florida") {
    filters.push(`City eq '${escapeODataString(city)}'`);
  }

  const addressFilter = buildAddressFilter(address);
  if (addressFilter) filters.push(addressFilter);

  if (!hasAddressSearch) {
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
    const daysFilter = buildDaysOnMarketFilter(daysOnMarket);
    if (daysFilter) filters.push(daysFilter);
    if (waterfront === true || waterfront === "true") filters.push("WaterfrontYN eq true");
    if (newConstruction === true || newConstruction === "true") filters.push(`YearBuilt ge ${new Date().getFullYear() - 3}`);
  }

  return filters.join(" and ");
}

function buildAddressFilter(address) {
  const raw = String(address || "").trim();
  if (raw.length < 3) return "";
  const mlsId = normalizeMlsLookup(raw);
  if (mlsId) {
    return `(tolower(ListingId) eq '${escapeODataString(mlsId.toLowerCase())}' or contains(tolower(ListingId), '${escapeODataString(mlsId.toLowerCase())}'))`;
  }

  const normalized = raw
    .toLowerCase()
    .replace(/[#,.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const number = normalized.match(/^(\d{2,})\b/)?.[1] || "";
  const streetWords = normalized
    .replace(/^(\d{2,})\b/, "")
    .split(" ")
    .map((word) => word.trim())
    .filter((word) => word.length >= 3 && !ADDRESS_STOP_WORDS.has(word))
    .slice(0, 4);

  if (number && streetWords.length) {
    const primaryWord = escapeODataString(streetWords[0]);
    const numericWord = escapeODataString(number);
    return `((StreetNumber eq '${numericWord}' or UnitNumber eq '${numericWord}' or contains(tolower(UnparsedAddress), '${numericWord}')) and (contains(tolower(StreetName), '${primaryWord}') or contains(tolower(UnparsedAddress), '${primaryWord}')))`;
  }
  if (number) {
    const numericWord = escapeODataString(number);
    return `(StreetNumber eq '${numericWord}' or UnitNumber eq '${numericWord}' or contains(tolower(UnparsedAddress), '${numericWord}'))`;
  }
  if (streetWords.length) {
    const primaryWord = escapeODataString(streetWords[0]);
    return `(contains(tolower(StreetName), '${primaryWord}') or contains(tolower(UnparsedAddress), '${primaryWord}'))`;
  }

  return `contains(tolower(UnparsedAddress), '${escapeODataString(normalized)}')`;
}

function normalizeMlsLookup(value) {
  const compact = String(value || "")
    .trim()
    .replace(/[^a-z0-9]/gi, "");
  if (/^[a-z]{1,4}\d{5,}$/i.test(compact)) return compact;
  if (/^\d{5,}$/.test(compact)) return compact;
  return "";
}

function rankListingsByAddress(listings, address) {
  const query = normalizeAddressSearch(address);
  const number = query.match(/^(\d{2,})\b/)?.[1] || "";
  const terms = query
    .replace(/^(\d{2,})\b/, "")
    .split(" ")
    .filter((term) => term.length >= 3 && !ADDRESS_STOP_WORDS.has(term));

  return listings
    .map((listing, index) => {
      const searchableAddress = normalizeAddressSearch([listing.address, listing.streetAddress, listing.city, listing.neighborhood].join(" "));
      let score = 0;

      if (query && searchableAddress.includes(query)) score += 1000;
      if (number && searchableAddress.startsWith(number)) score += 250;
      if (number && searchableAddress.includes(number)) score += 100;
      terms.forEach((term) => {
        if (searchableAddress.includes(term)) score += 120;
      });

      return { listing, index, score };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.listing);
}

function normalizeAddressSearch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[#,.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ADDRESS_STOP_WORDS = new Set([
  "street",
  "st",
  "avenue",
  "ave",
  "road",
  "rd",
  "drive",
  "dr",
  "court",
  "ct",
  "circle",
  "cir",
  "way",
  "lane",
  "ln",
  "place",
  "pl",
  "boulevard",
  "blvd",
  "terrace",
  "ter",
  "north",
  "south",
  "east",
  "west",
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw",
  "unit",
  "apt",
  "suite",
]);

function escapeODataString(value) {
  return String(value).replace(/'/g, "''");
}

function normalizeStatusFilter(status) {
  const value = String(status || "Active").toLowerCase();
  if (value === "sold" || value === "closed") return "closed";
  if (value === "active under contract") return "active-under-contract";
  if (value === "pending") return "pending";
  if (value === "expired") return "expired";
  if (value === "all status" || value === "all" || value === "any") return "all";
  return "active";
}

function formatStatusFilterLabel(status) {
  if (status === "active-under-contract") return "Active Under Contract";
  if (status === "pending") return "Pending";
  if (status === "expired") return "Expired";
  return "Active";
}

function buildDaysOnMarketFilter(value) {
  const normalized = String(value || "").trim();
  if (!normalized || normalized === "Any") return "";
  if (normalized === "90+" || normalized.toLowerCase().includes("90+")) return "DaysOnMarket ge 90";
  const days = Number(normalized.replace(/[^\d.]/g, ""));
  if (!days) return "";
  return `DaysOnMarket le ${days}`;
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
