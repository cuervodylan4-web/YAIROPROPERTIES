export function normalizeListing(record, context = {}) {
  const price = Number(record.ListPrice || record.CurrentPrice || record.price || record.listPrice || 0);
  const rawMedia = record.Media || record.media || record.images || [];
  const media = normalizeMedia(rawMedia);
  const listingKey = String(record.ListingKey || record.ListingId || record.id || record.mlsId || "");
  const address = record.UnparsedAddress || record.address || record.StreetName || "";
  const streetAddress = buildStreetAddress(record, address);
  const city = record.City || record.city || "";
  const neighborhood = record.SubdivisionName || record.neighborhood || record.MLSAreaMajor || "";
  const slug = slugify(address || record.PropertyName || listingKey);
  const sqft = Number(record.LivingArea || record.BuildingAreaTotal || record.sqft || 0);
  const lat = Number(record.Latitude || record.latitude || 0);
  const lng = Number(record.Longitude || record.longitude || 0);
  const architecture =
    formatListValue(record.ArchitecturalStyle) ||
    formatListValue(record.PropertySubType) ||
    formatListValue(record.PropertyType) ||
    "Residence";
  const propertyType = formatListValue(record.PropertySubType) || formatListValue(record.PropertyType) || "Residential";
  const baths = Number(record.BathroomsTotalDecimal || record.BathroomsTotalInteger || record.baths || 0);

  return {
    id: slug || listingKey,
    slug: slug || listingKey,
    listingKey,
    mlsId: record.ListingId || listingKey || record.mlsId || null,
    source: context.source || "unknown",
    status: formatStatus(record.StandardStatus || record.MlsStatus || record.status || "Active"),
    title: record.PropertyName || record.title || streetAddress || address || "Private Residence",
    address,
    streetAddress,
    city,
    neighborhood,
    location: [city, neighborhood].filter(Boolean).join(" / "),
    price,
    displayPrice: price ? formatDisplayPrice(price) : "Upon Request",
    beds: Number(record.BedroomsTotal || record.beds || 0),
    baths,
    sqft,
    displaySqft: sqft ? `${new Intl.NumberFormat("en-US").format(sqft)} SF` : "Available by request",
    waterfront: Boolean(record.WaterfrontYN || record.waterfront),
    yearBuilt: record.YearBuilt || null,
    hoa: record.AssociationFee ? formatAssociationFee(record.AssociationFee, record.AssociationFeeFrequency) : "Available by request",
    architecturalStyle: architecture,
    propertyType,
    media,
    heroImage: media[0] || "/videos/optimized/miami-hero-02-poster.jpg",
    gallery: media.length ? media.slice(0, 8) : [
      "/videos/optimized/miami-hero-02-poster.jpg",
      "/videos/optimized/miami-hero-04-poster.jpg",
      "/videos/optimized/miami-hero-03-poster.jpg",
      "/videos/optimized/miami-hero-01-poster.jpg",
    ],
    map: lat && lng ? { lat, lng, ...toMapPin(lat, lng) } : { lat: null, lng: null, x: 50, y: 48 },
    pin: lat && lng ? toMapPin(lat, lng) : { x: 50, y: 48 },
    description: record.PublicRemarks || record.description || "A curated South Florida residence with market context available through private advisory.",
    narrative:
      record.PublicRemarks ||
      record.PrivateRemarks ||
      "This residence is presented through Yairo Properties with attention to location, condition, architecture, and long-term market fit.",
    marketPosition: [propertyType, city || "South Florida"].filter(Boolean).join(" / "),
    specs: [
      ["Bedrooms", String(Number(record.BedroomsTotal || record.beds || 0) || "Upon request")],
      ["Bathrooms", baths ? String(baths) : "Upon request"],
      ["Square Footage", sqft ? `${new Intl.NumberFormat("en-US").format(sqft)} SF` : "Upon request"],
      ["Waterfront", record.WaterfrontYN ? "Yes" : "Verify"],
      ["Year Built", record.YearBuilt ? String(record.YearBuilt) : "Upon request"],
      ["Parking", record.GarageSpaces ? `${record.GarageSpaces} Cars` : "Upon request"],
      ["HOA", record.AssociationFee ? formatAssociationFee(record.AssociationFee, record.AssociationFeeFrequency) : "Upon request"],
      ["Architecture", architecture || "Residential"],
    ],
    places: [
      { label: "Miami waterfront", type: "Water", x: 38, y: 48 },
      { label: "Dining corridor", type: "Dining", x: 62, y: 34 },
      { label: "Retail access", type: "Shopping", x: 72, y: 54 },
      { label: "Private advisory area", type: "Market", x: 48, y: 68 },
    ],
    intelligence: [
      ["Market Status", formatStatus(record.StandardStatus || record.MlsStatus || "Active"), "Live MLS positioning through Spark RESO data."],
      ["Property Type", propertyType || "Residential", "Reviewed through location, condition, and long-term fit."],
      ["Waterfront", record.WaterfrontYN ? "Yes" : "Verify", "Water orientation and access should be confirmed during advisory."],
      ["MLS Reference", record.ListingId || listingKey || "Available", "Source record connected through SparkPlatform RESO Web API."],
    ],
  };
}

export function slugify(value) {
  return String(value || "listing")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatDisplayPrice(value) {
  if (value >= 1000000) return `$${Number((value / 1000000).toFixed(value >= 10000000 ? 0 : 1))}M`;
  return `$${Math.round(value / 1000)}K`;
}

function normalizeMedia(media) {
  if (!Array.isArray(media)) return [];

  return media
    .slice()
    .filter((item) => typeof item === "string" || !item.MediaCategory || String(item.MediaCategory).toLowerCase() === "photo")
    .sort((a, b) => Number(a.Order || a.MediaOrder || 0) - Number(b.Order || b.MediaOrder || 0))
    .map((item) => {
      if (typeof item === "string") return item;
      return item.MediaURL || item.MediaURLFull || item.MediaURLPreview || item.url || item.Uri || "";
    })
    .filter((url) => /\.(jpe?g|png|webp|avif)(\?|$)/i.test(url))
    .filter(Boolean);
}

function formatListValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value || "";
}

function buildStreetAddress(record, fallback) {
  if (record.StreetNumber && record.StreetName) {
    return [record.StreetNumber, record.StreetDirPrefix, record.StreetName, record.StreetSuffix, record.UnitNumber && `#${record.UnitNumber}`]
      .filter(Boolean)
      .join(" ");
  }

  return String(fallback || "")
    .split(",")
    .slice(0, 1)
    .join("")
    .trim();
}

function formatStatus(status) {
  return String(status || "Active")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAssociationFee(value, frequency) {
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
  return frequency ? `${amount} / ${String(frequency).toLowerCase()}` : amount;
}

function toMapPin(lat, lng) {
  const southFlorida = {
    north: 26.45,
    south: 25.45,
    east: -79.95,
    west: -80.55,
  };
  const x = ((lng - southFlorida.west) / (southFlorida.east - southFlorida.west)) * 100;
  const y = ((southFlorida.north - lat) / (southFlorida.north - southFlorida.south)) * 100;

  return {
    x: Math.min(88, Math.max(12, x)),
    y: Math.min(84, Math.max(16, y)),
  };
}
