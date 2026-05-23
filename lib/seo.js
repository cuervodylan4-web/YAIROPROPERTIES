export const SITE_URL = "https://www.yairoproperties.com";
export const SITE_NAME = "Yairo Properties";
export const CONTACT_PHONE = "+1 954 842 0980";
export const OFFICE_ADDRESS = {
  streetAddress: "201 N University Dr #105",
  addressLocality: "Plantation",
  addressRegion: "FL",
  postalCode: "33324",
  addressCountry: "US",
};

export const SEO_CITY_PAGES = [
  "miami",
  "brickell",
  "coconut-grove",
  "bal-harbour",
  "fort-lauderdale",
  "boca-raton",
  "boynton-beach",
  "parkland",
  "weston",
  "coral-springs",
  "plantation",
  "davie",
  "palm-beach",
];

export function titleCaseFromSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function slugifySeo(value, fallback = "property") {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/#/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || fallback;
}

export function listingIdentifier(listing = {}) {
  const key = String(listing.listingKey || "");
  if (/^\d{12,}$/.test(key)) return key;
  return String(listing.mlsId || listing.ListingId || listing.id || key || "listing");
}

export function seoPropertySlug(listing = {}) {
  const id = listingIdentifier(listing);
  const address = listing.streetAddress || listing.title || listing.address || "property";
  const city = listing.city || "";
  const state = listing.state || listing.StateOrProvince || extractState(listing.address) || "FL";
  const base = slugifySeo([address, city, state].filter(Boolean).join(" "));
  return `${base}-${slugifySeo(id, "listing")}`;
}

export function seoPropertyPath(listing = {}) {
  return `/property/${seoPropertySlug(listing)}`;
}

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function propertyMetaTitle(listing = {}) {
  const address = listing.streetAddress || listing.title || listing.address || "South Florida Residence";
  const city = listing.city || "South Florida";
  const state = listing.state || extractState(listing.address) || "FL";
  const type = normalizePropertyType(listing.propertyType || listing.architecturalStyle || "Residence");
  const intent = listing.status === "Closed" || listing.status === "Sold" ? "Property Record" : "for Sale";
  return `${address}, ${city} ${state} | ${type} ${intent} | ${SITE_NAME}`;
}

export function propertyMetaDescription(listing = {}) {
  const type = normalizePropertyType(listing.propertyType || "Residence");
  const city = listing.city || "South Florida";
  const state = listing.state || extractState(listing.address) || "FL";
  const beds = Number(listing.beds || 0) || "available";
  const baths = Number(listing.baths || 0) || "available";
  const sqft = listing.displaySqft || (listing.sqft ? `${Number(listing.sqft).toLocaleString("en-US")} SF` : "available square footage");
  const price = listing.displayPrice || listing.price || "available by request";
  const saleText = listing.status === "Closed" || listing.status === "Sold" ? "property record" : "for sale";
  return `${type} ${saleText} in ${city}, ${state}. ${beds} bedrooms, ${baths} bathrooms, ${sqft}, listed at ${price}. Request a private showing with ${SITE_NAME}.`;
}

export function propertyJsonLd(listing = {}) {
  const path = seoPropertyPath(listing);
  const image = listing.heroImage || listing.image || listing.gallery?.[0] || listing.media?.[0] || "/yairo-logo.png";
  const type = /single family/i.test(listing.propertyType || "") ? "SingleFamilyResidence" : /condo|apartment/i.test(listing.propertyType || "") ? "Apartment" : "Residence";

  return {
    "@context": "https://schema.org",
    "@type": type,
    name: listing.streetAddress || listing.title || listing.address,
    description: listing.description || propertyMetaDescription(listing),
    image: absoluteUrl(image),
    url: absoluteUrl(path),
    identifier: listing.mlsId || listing.listingKey || listing.id,
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.streetAddress || listing.address,
      addressLocality: listing.city,
      addressRegion: listing.state || extractState(listing.address) || "FL",
      postalCode: extractPostalCode(listing.address),
      addressCountry: "US",
    },
    numberOfBedrooms: Number(listing.beds || 0) || undefined,
    numberOfBathroomsTotal: Number(listing.baths || 0) || undefined,
    floorSize: listing.sqft
      ? {
          "@type": "QuantitativeValue",
          value: Number(listing.sqft),
          unitCode: "FTK",
        }
      : undefined,
    offers: listing.price
      ? {
          "@type": "Offer",
          price: Number(listing.price),
          priceCurrency: "USD",
          availability: listing.status === "Active" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
          url: absoluteUrl(path),
        }
      : undefined,
  };
}

export function realEstateAgentJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: SITE_NAME,
    url: SITE_URL,
    telephone: CONTACT_PHONE,
    address: {
      "@type": "PostalAddress",
      ...OFFICE_ADDRESS,
    },
    areaServed: ["South Florida", "Miami", "Broward County", "Palm Beach County"],
  };
}

function normalizePropertyType(value) {
  const text = String(value || "Residence").trim();
  if (/condominium/i.test(text)) return "Condo";
  return text || "Residence";
}

function extractState(address = "") {
  return String(address).match(/,\s*([A-Z]{2})\s+\d{5}/)?.[1] || "";
}

function extractPostalCode(address = "") {
  return String(address).match(/\b\d{5}(?:-\d{4})?\b/)?.[0] || undefined;
}
