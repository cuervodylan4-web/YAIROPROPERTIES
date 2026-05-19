"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

const VIDEO_DURATION_MS = 6200;
const PHONE_NUMBER = "19548420980";
const DISPLAY_PHONE_NUMBER = "+1 954 842 0980";
const whatsappUrl = (message = "Hi Yairo, I would like to connect.") =>
  `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
const messageUrl = (message = "Hi Yairo, I would like to connect.") =>
  `sms:+${PHONE_NUMBER}&body=${encodeURIComponent(message)}`;
const PRICE_STOPS = [
  { pos: 0, value: 100000 },
  { pos: 35, value: 2000000 },
  { pos: 70, value: 50000000 },
  { pos: 90, value: 250000000 },
  { pos: 100, value: 2000000000 },
];
const RENT_STOPS = [
  { pos: 0, value: 2000 },
  { pos: 45, value: 15000 },
  { pos: 75, value: 50000 },
  { pos: 92, value: 120000 },
  { pos: 100, value: 300000 },
];
const FALLBACK_PROPERTY_IMAGE = "/videos/optimized/miami-hero-02-poster.jpg";

const serviceAreas = [
  "Parkland",
  "Boca Raton",
  "Brickell",
  "Coconut Grove",
  "Fort Lauderdale",
  "Miami",
  "Coral Springs",
  "Weston",
  "Plantation",
  "Davie",
  "Palm Beach",
  "Broward County",
  "Miami-Dade",
];

const videos = [
  {
    src: "/videos/optimized/miami-hero-01-compressed.mp4",
    label: "Miami waterfront atmosphere",
    eager: true,
  },
  {
    src: "/videos/optimized/miami-hero-02-compressed.mp4",
    label: "Architectural luxury residence",
  },
  {
    src: "/videos/optimized/miami-hero-03-compressed.mp4",
    label: "Cinematic Miami lifestyle",
  },
  {
    src: "/videos/optimized/miami-hero-04-compressed.mp4",
    label: "Private luxury interior",
  },
];

const experiences = [
  {
    key: "buy",
    title: "Buy",
    eyebrow: "Acquisition",
    media: "/videos/optimized/miami-hero-02-poster.jpg",
    copy: "Architectural homes, waterfront estates, and well-positioned residences across Miami.",
    detailTitle: "Buy With Clarity",
    detail:
      "Search by neighborhood, architecture, water, and long-term fit.",
    cta: "Search Buy",
  },
  {
    key: "rent",
    title: "Rent",
    eyebrow: "Seasonal Residences",
    media: "/videos/optimized/miami-hero-03-poster.jpg",
    copy: "Seasonal and long-term residences selected for location, service, and privacy.",
    detailTitle: "Lease With Context",
    detail:
      "Review furnished homes, waterfront leases, and building-level considerations.",
    cta: "Search Rent",
  },
  {
    key: "sell",
    title: "Sell",
    eyebrow: "Seller Advisory",
    media: "/videos/optimized/miami-hero-04-poster.jpg",
    copy: "Pricing, preparation, and presentation guided by market context.",
    detailTitle: "Position With Care",
    detail:
      "Start with a private review of your property, timing, and next move.",
    cta: "Request Review",
  },
];

const searchModes = {
  buy: {
    eyebrow: "Acquisition Search",
    title: "Miami Purchase Search",
    description: "Waterfront estates, architectural homes, and established neighborhoods.",
    action: "Search Residences",
    fields: [
      { label: "City / Area", options: ["All South Florida", "Miami", "Miami Beach", "Fort Lauderdale", "Boca Raton", "Coral Gables", "Coconut Grove", "Bal Harbour", "Sunny Isles Beach", "Aventura", "Parkland", "Plantation", "Weston"] },
      { label: "Property Type", options: ["Any", "Single Family Residence", "Condominium", "Townhouse", "Villa"] },
      { label: "Bedrooms", options: ["Any", "2+", "3+", "4+", "5+"] },
      { label: "Bathrooms", options: ["Any", "2+", "3+", "4+", "5+"] },
      { label: "Square Footage", options: ["Any", "1,500+", "2,500+", "4,000+", "6,000+"] },
    ],
    toggles: ["Waterfront", "New Construction"],
  },
  rent: {
    eyebrow: "Seasonal Residence Search",
    title: "Miami Lease Search",
    description: "Furnished residences, waterfront leases, and seasonal homes.",
    action: "Search Leases",
    fields: [
      { label: "City / Area", options: ["All South Florida", "Miami", "Miami Beach", "Fort Lauderdale", "Boca Raton", "Coral Gables", "Coconut Grove", "Bal Harbour", "Sunny Isles Beach", "Aventura", "Parkland", "Plantation", "Weston"] },
      { label: "Property Type", options: ["Any", "Single Family Residence", "Condominium", "Townhouse", "Villa"] },
      { label: "Bedrooms", options: ["Any", "1+", "2+", "3+", "4+"] },
      { label: "Bathrooms", options: ["Any", "1+", "2+", "3+", "4+"] },
      { label: "Square Footage", options: ["Any", "1,000+", "1,500+", "2,500+", "4,000+"] },
    ],
    toggles: ["Waterfront"],
  },
  sell: {
    eyebrow: "Free Home Valuation",
    title: "What Is My Home Worth?",
    description: "Get a clear estimate of your home's value with guidance before you decide what comes next.",
    action: "Request Free Valuation",
    fields: [
      { label: "Property Address", placeholder: "Address or building name" },
      { label: "Preferred Contact", placeholder: "Phone or email" },
    ],
    ctas: ["Request Free Valuation", "Talk With Yairo", "Review My Home"],
  },
};

const featuredProperties = [
  {
    id: "north-bay",
    image: "/videos/optimized/miami-hero-02-poster.jpg",
    status: "For Sale",
    title: "North Bay Road Estate",
    address: "5940 North Bay Road",
    price: "$18.9M",
    neighborhood: "North Bay Road",
    city: "Miami Beach",
    beds: 7,
    baths: 9,
    sqft: "9,420 SF",
    description: "A waterfront estate composed for privacy, evening light, and long horizon views across Biscayne Bay.",
    featured: true,
  },
  {
    id: "fisher-island",
    image: "/videos/optimized/miami-hero-04-poster.jpg",
    status: "Private Listing",
    title: "Fisher Island Residence",
    address: "Palazzo Del Mare",
    price: "$12.5M",
    neighborhood: "Fisher Island",
    city: "Miami",
    beds: 4,
    baths: 5,
    sqft: "5,860 SF",
    description: "A residence with resort-grade discretion, gallery-like interiors, and a rare island rhythm.",
  },
  {
    id: "brickell",
    image: "/videos/optimized/miami-hero-03-poster.jpg",
    status: "For Sale",
    title: "Brickell Penthouse",
    address: "1000 Brickell Plaza",
    price: "$7.8M",
    neighborhood: "Brickell",
    city: "Miami",
    beds: 3,
    baths: 4,
    sqft: "4,210 SF",
    description: "A high-floor sanctuary with architectural lines, cinematic water views, and immediate city access.",
  },
  {
    id: "coconut-grove",
    image: "/videos/optimized/miami-hero-01-poster.jpg",
    status: "Sold",
    title: "Coconut Grove Modern",
    address: "Private Grove Enclave",
    price: "$9.4M",
    neighborhood: "Coconut Grove",
    city: "Miami",
    beds: 5,
    baths: 6,
    sqft: "6,780 SF",
    description: "A lush modern residence balancing tropical privacy with refined architectural restraint.",
  },
];

const listingFilters = [
  { label: "City / Area", param: "city", options: ["All South Florida", "Miami", "Miami Beach", "Fort Lauderdale", "Boca Raton", "Coral Gables", "Coconut Grove", "Bal Harbour", "Sunny Isles Beach", "Aventura", "Parkland", "Plantation", "Weston"] },
  { label: "Property Type", param: "propertyType", options: ["Any", "Single Family Residence", "Condominium", "Townhouse", "Villa"] },
  { label: "Beds", param: "beds", options: ["Any", "2+", "3+", "4+", "5+"] },
  { label: "Baths", param: "baths", options: ["Any", "2+", "3+", "4+", "5+"] },
  { label: "Square Footage", param: "sqft", options: ["Any", "1,500+", "2,500+", "4,000+", "6,000+"] },
];

const listings = [
  {
    id: "north-bay-estate",
    image: "/videos/optimized/miami-hero-02-poster.jpg",
    status: "For Sale",
    title: "North Bay Road Estate",
    location: "Miami Beach / North Bay Road",
    price: "$18.9M",
    beds: 7,
    baths: 9,
    sqft: "9,420 SF",
    description: "Waterfront architecture with long bay views, private arrival, and an evening-light composition.",
    pin: { x: 38, y: 28 },
  },
  {
    id: "fisher-island-residence",
    image: "/videos/optimized/miami-hero-04-poster.jpg",
    status: "Private Listing",
    title: "Fisher Island Residence",
    location: "Miami / Fisher Island",
    price: "$12.5M",
    beds: 4,
    baths: 5,
    sqft: "5,860 SF",
    description: "Resort-level privacy, gallery-scaled interiors, and a rare island address held quietly off-market.",
    pin: { x: 55, y: 52 },
  },
  {
    id: "brickell-penthouse",
    image: "/videos/optimized/miami-hero-03-poster.jpg",
    status: "For Sale",
    title: "Brickell Penthouse",
    location: "Miami / Brickell",
    price: "$7.8M",
    beds: 3,
    baths: 4,
    sqft: "4,210 SF",
    description: "A high-floor residence with cinematic water views, quiet materiality, and immediate city access.",
    pin: { x: 66, y: 66 },
  },
  {
    id: "coconut-grove-modern",
    image: "/videos/optimized/miami-hero-01-poster.jpg",
    status: "New Construction",
    title: "Coconut Grove Modern",
    location: "Miami / Coconut Grove",
    price: "$9.4M",
    beds: 5,
    baths: 6,
    sqft: "6,780 SF",
    description: "Tropical modern privacy shaped by deep shade, warm stone, and a calm indoor-outdoor rhythm.",
    pin: { x: 44, y: 78 },
  },
  {
    id: "surfside-oceanfront",
    image: "/videos/optimized/miami-hero-02-poster.jpg",
    status: "Off-Market",
    title: "Surfside Oceanfront",
    location: "Surfside / Oceanfront",
    price: "$15.2M",
    beds: 4,
    baths: 5,
    sqft: "5,240 SF",
    description: "A quiet oceanfront composition with hotel-grade service and a restrained architectural palette.",
    pin: { x: 72, y: 20 },
  },
];

function formatCardPrice(listing) {
  if (listing.displayPrice) return listing.displayPrice;
  if (typeof listing.price === "string") return listing.price;
  if (Number(listing.price) >= 1000000) {
    return `$${Number((Number(listing.price) / 1000000).toFixed(Number(listing.price) >= 10000000 ? 0 : 1))}M`;
  }
  return listing.price ? `$${Math.round(Number(listing.price) / 1000)}K` : "Upon Request";
}

function normalizeCardListing(listing, index = 0) {
  const gallery = listing.gallery || listing.media || [];
  const heroImage = listing.heroImage || listing.image || gallery[0] || FALLBACK_PROPERTY_IMAGE;
  const price = formatCardPrice(listing);
  const location = listing.location || [listing.city, listing.neighborhood].filter(Boolean).join(" / ") || "South Florida";

  return {
    ...listing,
    id: listing.slug || listing.id || listing.listingKey || `spark-listing-${index}`,
    image: heroImage,
    heroImage,
    gallery: gallery.length ? gallery : [heroImage],
    status: listing.status || "Active",
    title: listing.streetAddress || listing.title || listing.address || "Private Residence",
    address: listing.address || listing.title || "Address available by request",
    location,
    price,
    beds: listing.beds || 0,
    baths: listing.baths || 0,
    sqft: listing.displaySqft || listing.sqft || "Available by request",
    description:
      listing.summary ||
      listing.description ||
      "A curated South Florida residence with private context available through Yairo Properties.",
    pin: listing.pin || listing.map || { x: 50, y: 48 },
  };
}

function normalizeFeaturedListing(listing, index = 0) {
  const card = normalizeCardListing(listing, index);

  return {
    ...card,
    city: listing.city || card.location.split(" / ")[0] || "South Florida",
    neighborhood: listing.neighborhood || card.location.split(" / ")[1] || "Private Market",
    sqft: listing.displaySqft || card.sqft,
  };
}

function normalizeDetailProperty(listing) {
  const card = normalizeCardListing(listing);
  const gallery = listing.gallery?.length ? listing.gallery : card.gallery;

  return {
    ...propertyDetail,
    ...listing,
    ...card,
    gallery,
    price: card.price,
    specs: listing.specs || propertyDetail.specs,
    intelligence: listing.intelligence || propertyDetail.intelligence,
    marketPosition: listing.marketPosition || propertyDetail.marketPosition,
    narrative: listing.narrative || listing.description || propertyDetail.narrative,
  };
}

function parseFilterNumber(value) {
  if (!value || value === "Any") return "";
  return String(value).replace(/[^\d.]/g, "");
}

function listingParamsFromValues(values, modeKey = "buy", limit = 48) {
  const params = new URLSearchParams({
    mode: modeKey,
    limit: String(limit),
  });
  const range = modeKey === "rent" ? values["Monthly Budget"] : values["Price Range"];

  if (Array.isArray(range)) {
    params.set("minPrice", String(Math.round(range[0])));
    params.set("maxPrice", String(Math.round(range[1])));
  } else {
    params.set("minPrice", modeKey === "rent" ? "2500" : "600000");
  }

  const fieldMap = {
    "City / Area": "city",
    "Property Type": "propertyType",
    Bedrooms: "beds",
    Beds: "beds",
    Bathrooms: "baths",
    Baths: "baths",
    "Square Footage": "sqft",
  };

  Object.entries(fieldMap).forEach(([label, param]) => {
    const value = values[label];
    if (!value || value === "Any" || value === "All South Florida") return;
    if (["beds", "baths", "sqft"].includes(param)) {
      params.set(param, parseFilterNumber(value));
      return;
    }
    params.set(param, value);
  });

  if (values.Waterfront) params.set("waterfront", "true");
  if (values["New Construction"]) params.set("newConstruction", "true");

  return params;
}

function buildListingsQuery(filterValues, listingMode, limit = 60) {
  return listingParamsFromValues(filterValues, listingMode, limit).toString();
}

function getInitialListingState() {
  if (typeof window === "undefined") {
    return { mode: "buy", values: { "Price Range": [600000, 25000000] } };
  }

  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") === "rent" ? "rent" : "buy";
  const minPrice = Number(params.get("minPrice") || (mode === "rent" ? 2500 : 600000));
  const maxPrice = Number(params.get("maxPrice") || (mode === "rent" ? 45000 : 25000000));
  const values = {
    "Price Range": [minPrice, maxPrice],
  };

  const city = params.get("city");
  const propertyType = params.get("propertyType");
  const beds = params.get("beds");
  const baths = params.get("baths");
  const sqft = params.get("sqft");

  if (city) values["City / Area"] = city;
  if (propertyType) values["Property Type"] = propertyType;
  if (beds) values.Beds = `${beds}+`;
  if (baths) values.Baths = `${baths}+`;
  if (sqft) values["Square Footage"] = `${Number(sqft).toLocaleString("en-US")}+`;
  if (params.get("waterfront") === "true") values.Waterfront = true;
  if (params.get("newConstruction") === "true") values["New Construction"] = true;

  return { mode, values };
}

function googleMapsEmbedUrl(listing) {
  const lat = listing?.map?.lat;
  const lng = listing?.map?.lng;
  const query = lat && lng ? `${lat},${lng}` : listing?.address || "Miami, Florida";
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&t=k&output=embed`;
}

async function loadPlatformListings({ limit = 60 } = {}) {
  const response = await fetch(`/api/listings?limit=${limit}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error(`Listings request failed: ${response.status}`);
  const payload = await response.json();
  return Array.isArray(payload.listings) ? payload.listings : [];
}

async function loadFilteredPlatformListings(query) {
  const response = await fetch(`/api/listings?${query}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error(`Listings request failed: ${response.status}`);
  const payload = await response.json();
  return Array.isArray(payload.listings) ? payload.listings : [];
}

const neighborhoods = [
  {
    title: "Brickell",
    image: "/brickell.jpg",
    tone: "Waterfront Urban Living",
    description:
      "Contemporary high-rise living positioned between the bay, financial core, and Miami's evolving cultural landscape.",
    icons: ["Waterfront", "High-Rise Living", "Fine Dining", "Marina Access", "Walkability", "Nightlife", "Modern Architecture"],
    data: [
      "Contemporary residential towers",
      "Direct bay proximity",
      "Financial district access",
      "Waterfront condominiums",
      "Rooftop amenities and private clubs",
    ],
    atmosphere: "dark, reflective, metropolitan",
    intelligence: [
      {
        icon: "dining",
        title: "Dining",
        items: ["Casa Tua Cucina", "Est.33 Thai Craft Brewery", "Moxies", "North Italia"],
        note: "Brickell City Centre and Mary Brickell Village anchor daily dining within the core.",
      },
      {
        icon: "shopping",
        title: "Shopping",
        items: ["Brickell City Centre", "Saks Fifth Avenue", "Mary Brickell Village", "CMX Cinema"],
        note: "BCC spans three city blocks with four retail levels and a 107,000 SF Saks anchor.",
      },
      {
        icon: "mobility",
        title: "Mobility",
        items: ["Metromover access", "I-95 proximity", "Downtown connection", "Bayfront routes"],
        note: "The neighborhood supports a car-light daily rhythm for work, dining, and errands.",
      },
      {
        icon: "neighbors",
        title: "Neighbors",
        items: ["High-rise owners", "Finance professionals", "International residents", "Amenity-driven buyers"],
        note: "Best fit for clients who want city energy with bay proximity and building services.",
      },
      {
        icon: "nearby",
        title: "Nearby",
        items: ["Miami River", "Simpson Park", "Bayfront Park", "Downtown Miami"],
        note: "Brickell sits between the waterfront, the river, and Downtown, with quick access to cultural and office corridors.",
      },
      {
        icon: "climate",
        title: "Climate",
        items: ["77°F average temperature", "84°F average high", "67.4 in annual precipitation", "Warm, humid summers"],
        note: "Miami's 1991-2020 climate normals support year-round outdoor living with a defined wet season.",
      },
    ],
  },
  {
    title: "Coconut Grove",
    image: "/coconut-grove.jpg",
    tone: "Lush Residential Rhythm",
    description:
      "A quieter residential environment shaped through tropical landscape, architectural homes, marinas, and long-established Miami character.",
    icons: ["Marina Living", "Green Spaces", "Architectural Homes", "Walkability", "Cafes & Dining", "Waterfront", "Family Residential"],
    data: [
      "Tree-lined residential streets",
      "Contemporary and Mediterranean homes",
      "Marina and sailing culture",
      "Residential privacy",
      "Refined village atmosphere",
    ],
    atmosphere: "warm, tropical, restrained",
    intelligence: [
      {
        icon: "dining",
        title: "Dining",
        items: ["Narbona", "Chop Steakhouse", "Botanico Gin & Cookhouse", "bartaco"],
        note: "CocoWalk and Commodore Plaza concentrate dining without losing the slower village pace.",
      },
      {
        icon: "water",
        title: "Water Access",
        items: ["Regatta Harbour", "Biscayne Bay Yacht Club", "Coconut Grove Sailing Club", "Dinner Key Marina"],
        note: "The Grove is closely tied to sailing, marinas, and bayfront parks.",
      },
      {
        icon: "shopping",
        title: "Shopping",
        items: ["CocoWalk", "Grand Avenue boutiques", "Moscot", "Salt & Straw"],
        note: "CocoWalk sits at 3015 Grand Avenue and functions as a central outdoor retail and dining address.",
      },
      {
        icon: "neighbors",
        title: "Neighbors",
        items: ["Single-family homes", "Architectural estates", "Condo residences", "Family-oriented buyers"],
        note: "Best fit for clients who want landscape, privacy, schools, and marina culture near the city.",
      },
      {
        icon: "nearby",
        title: "Nearby",
        items: ["Peacock Park", "The Kampong", "Vizcaya", "The Barnacle"],
        note: "Coconut Grove connects parks, historic homes, gardens, and bayfront recreation within a compact residential setting.",
      },
      {
        icon: "climate",
        title: "Climate",
        items: ["Leafy shade", "Bay breezes", "Wet-season landscape", "Outdoor dining season"],
        note: "The tree canopy and water proximity shape a softer daily climate than denser urban corridors.",
      },
    ],
  },
  {
    title: "Bal Harbour",
    image: "/bal-harbour.jpg",
    tone: "Discreet Coastal Living",
    description:
      "Oceanfront residential positioning shaped through privacy, coastal architecture, refined retail, and slower coastal rhythms.",
    icons: ["Oceanfront", "Retail", "Private Residential", "Beach Access", "Wellness", "Waterfront Towers", "Fine Dining"],
    data: [
      "Oceanfront residential towers",
      "Refined coastal atmosphere",
      "High privacy environment",
      "Retail proximity",
      "Wellness-oriented lifestyle",
    ],
    atmosphere: "bright, coastal, composed",
    intelligence: [
      {
        icon: "dining",
        title: "Dining",
        items: ["Makoto", "Le Zoo", "Carpaccio", "Hillstone"],
        note: "Bal Harbour Shops places dining, retail, and daily social rhythm in one controlled environment.",
      },
      {
        icon: "shopping",
        title: "Shopping",
        items: ["Bal Harbour Shops", "Neiman Marcus", "Saks Fifth Avenue", "9700 Collins Avenue"],
        note: "The open-air shopping setting is organized around designer boutiques and restaurants.",
      },
      {
        icon: "water",
        title: "Waterfront",
        items: ["Bal Harbour Beach", "Haulover Inlet", "Oceanfront towers", "Coastal walking"],
        note: "The village sits north of Miami Beach with direct beach orientation and quieter coastal access.",
      },
      {
        icon: "neighbors",
        title: "Neighbors",
        items: ["Oceanfront residents", "Private second homes", "Wellness-focused buyers", "Low-noise daily rhythm"],
        note: "Best fit for clients who prioritize ocean, service, privacy, and controlled surroundings.",
      },
      {
        icon: "nearby",
        title: "Nearby",
        items: ["Haulover Park", "Surfside", "Bay Harbor Islands", "Indian Creek"],
        note: "Bal Harbour is positioned between beach access, private residential islands, and the northern Miami Beach corridor.",
      },
      {
        icon: "climate",
        title: "Climate",
        items: ["Ocean breeze", "Warm winters", "Humid summer season", "Beach-oriented routine"],
        note: "Coastal exposure supports outdoor living while requiring attention to wind, salt air, and storm season.",
      },
    ],
  },
];

const propertyDetail = {
  ...listings[0],
  address: "5940 North Bay Road",
  marketPosition: "Waterfront estate / Private Miami Beach advisory",
  gallery: [
    "/videos/optimized/miami-hero-02-poster.jpg",
    "/videos/optimized/miami-hero-04-poster.jpg",
    "/videos/optimized/miami-hero-03-poster.jpg",
    "/videos/optimized/miami-hero-01-poster.jpg",
  ],
  specs: [
    ["Bedrooms", "7"],
    ["Bathrooms", "9"],
    ["Square Footage", "9,420 SF"],
    ["Waterfront", "120 FT"],
    ["Year Built", "2021"],
    ["Parking", "6 Cars"],
    ["HOA", "None"],
    ["Architecture", "Tropical Modern"],
  ],
  narrative:
    "Positioned along one of Miami Beach's most discreet waterfront corridors, this North Bay Road residence is composed around privacy, horizon, and a quiet sequence of indoor-outdoor rooms. Warm stone, deep overhangs, and full-height glazing create a residence that feels cinematic without becoming theatrical.",
  intelligence: [
    ["Median Luxury Sale", "$12.8M", "12-month waterfront benchmark"],
    ["Buyer Demand", "High", "Low inventory along prime bayfront streets"],
    ["Walkability", "Quiet", "Residential privacy with fast access to Sunset Harbour"],
    ["Investment Position", "Defensive", "Scarce land, water frontage, and architectural quality"],
  ],
};

const journalArticles = [
  {
    title: "Waterfront Addresses That Hold Their Value",
    category: "South Florida Waterfront",
    image: "/bal-harbour.jpg",
    description:
      "A measured look at privacy, dockage, elevation, scarcity, and neighborhood rhythm across South Florida's most durable waterfront pockets.",
    body: [
      "Waterfront value in South Florida is rarely defined by view alone. The strongest addresses combine usable water, privacy, elevation, building quality, and a daily rhythm that continues to feel calm after the first impression fades.",
      "For buyers, the conversation should begin with orientation, seawall condition, dockage, bridge access, insurance exposure, and the surrounding residential character. A beautiful home can still be a poor long-term decision if the water access, street pattern, or future maintenance profile does not support the price.",
      "The best waterfront acquisitions tend to feel quiet, practical, and scarce. They offer a clear lifestyle advantage today while protecting optionality for tomorrow.",
    ],
    featured: true,
  },
  {
    title: "Why Fort Lauderdale Keeps Drawing Serious Buyers",
    category: "Fort Lauderdale",
    image: "/brickell.jpg",
    description:
      "Marina access, quieter waterfront living, airport proximity, and a more residential pace continue to shape buyer attention.",
    body: [
      "Fort Lauderdale continues to attract buyers who want South Florida access without the constant pace of Miami. The city offers boating infrastructure, established waterfront neighborhoods, private aviation proximity, and a residential lifestyle that feels easier to live with year-round.",
      "For many clients, the appeal is not only price or square footage. It is the ability to move between marina, airport, beach, dining, and home without losing the sense of privacy that matters at the upper end of the market.",
      "The strongest opportunities are usually found where water access, lot quality, and neighborhood consistency meet. Those details carry more weight than surface-level finishes.",
    ],
  },
  {
    title: "Hidden Lifestyle Layers Between Miami and Broward",
    category: "Lifestyle Intelligence",
    image: "/coconut-grove.jpg",
    description:
      "Private dining, wellness, boating, design, and neighborhood routines that influence how a home actually feels after closing.",
    body: [
      "A residence is shaped by what surrounds it. The best neighborhoods are not only close to restaurants, clubs, marinas, or wellness spaces; they make those routines feel natural rather than forced.",
      "Between Miami and Broward, small differences in traffic flow, restaurant quality, marina access, school patterns, and weekend rhythm can completely change how a property feels after closing. These are not always visible in a listing presentation.",
      "A more useful search considers how the client actually lives: where they dine, where they move, how they host, how much privacy they need, and what kind of daily pace feels right.",
    ],
  },
  {
    title: "Reading Long-Term Property Value in South Florida",
    category: "Market Perspective",
    image: "/bal-harbour.jpg",
    description:
      "A practical framework for evaluating land, water, building quality, insurance exposure, walkability, and future demand.",
    body: [
      "Long-term property value is built through fundamentals. Land quality, location durability, elevation, construction integrity, neighborhood demand, and replacement cost matter more than temporary design trends.",
      "In South Florida, buyers should also look carefully at insurance, building reserves, association health, flood positioning, and future supply. A polished residence can still carry hidden friction if the ownership structure is weak.",
      "The right property should make sense emotionally and financially. When both are aligned, the decision feels calmer and the holding period becomes easier to navigate.",
    ],
  },
  {
    title: "Mortgage Intelligence for High-Value Homeowners",
    category: "Financial Guidance",
    image: "/brickell.jpg",
    description:
      "How liquidity, rate structure, tax exposure, and holding period should shape financing decisions before a purchase or sale.",
    body: [
      "Financing at the high end is not just about obtaining a rate. It is about liquidity, timing, tax strategy, opportunity cost, and the way a client wants to hold capital after closing.",
      "Some buyers benefit from leverage even when they could purchase in cash. Others prefer a cleaner position because privacy, simplicity, or speed matters more than maximizing spread. The correct answer depends on the full picture.",
      "A thoughtful mortgage conversation should happen early, before negotiation begins. It gives the buyer more control, stronger terms, and fewer surprises when the right property appears.",
    ],
  },
  {
    title: "The Residential Calm of Established Neighborhoods",
    category: "Neighborhoods",
    image: "/coconut-grove.jpg",
    description:
      "What separates a polished address from a genuinely livable residential environment over time.",
    body: [
      "Established neighborhoods have a different kind of value. They are shaped by trees, streets, schools, architecture, neighbors, and a rhythm that cannot be recreated quickly by new development.",
      "For many clients, the best address is not the loudest one. It is the place where privacy, convenience, and daily comfort work together quietly. That is often what separates a good purchase from a home that continues to feel right years later.",
      "The search should consider not only what a property shows, but what the neighborhood protects: time, calm, access, and long-term fit.",
    ],
  },
];

export function YairoHero() {
  const reduceMotion = useReducedMotion();
  const videoRefs = useRef([]);
  const activeVideoRef = useRef(0);
  const [activeVideo, setActiveVideo] = useState(0);
  const [readyMap, setReadyMap] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [mobileHero, setMobileHero] = useState(false);
  const [searchMode, setSearchMode] = useState("buy");
  const { scrollYProgress } = useScroll();

  const heroVideos = useMemo(() => (mobileHero || reduceMotion ? [videos[0]] : videos), [mobileHero, reduceMotion]);
  const readyTarget = useMemo(() => 1, []);
  const readyCount = Object.keys(readyMap).length;
  const contentY = useTransform(scrollYProgress, [0, 0.62], [0, -86]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.34, 0.68], [1, 0.88, 0]);
  const mediaY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.58], [0.9, 1]);
  const navY = useTransform(scrollYProgress, [0, 0.35], [0, -20]);
  const navOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");
    const update = () => setMobileHero(mediaQuery.matches);
    update();
    mediaQuery.addEventListener?.("change", update);
    return () => mediaQuery.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (isLoaded) return undefined;

    const fallback = window.setTimeout(() => {
      setReadyMap((current) => {
        const next = { ...current };
        heroVideos.forEach((video) => {
          next[video.src] = true;
        });
        return next;
      });
    }, 900);

    return () => window.clearTimeout(fallback);
  }, [heroVideos, isLoaded]);

  useEffect(() => {
    if (readyCount < readyTarget || isLoaded) return;

    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      video.currentTime = 0;
      video.playbackRate = reduceMotion ? 0.82 : 1;
      if (index !== 0) {
        video.pause();
        return;
      }
      const playAttempt = video.play();
      if (playAttempt) playAttempt.catch(() => {});
    });

    setIsLoaded(true);
  }, [isLoaded, readyCount, readyTarget, reduceMotion]);

  useEffect(() => {
    if (!isLoaded || reduceMotion) return undefined;

    const interval = window.setInterval(() => {
      const currentIndex = activeVideoRef.current;
      if (heroVideos.length < 2) return;
      const nextIndex = (currentIndex + 1) % heroVideos.length;
      const currentVideo = videoRefs.current[currentIndex];
      const nextVideo = videoRefs.current[nextIndex];

      if (currentVideo && nextVideo) {
        nextVideo.currentTime = currentVideo.currentTime;
        const playAttempt = nextVideo.play();
        if (playAttempt) playAttempt.catch(() => {});
      }

      setActiveVideo(nextIndex);

      window.setTimeout(() => {
        const previousVideo = videoRefs.current[currentIndex];
        if (previousVideo && activeVideoRef.current !== currentIndex) {
          previousVideo.pause();
        }
      }, 1700);
    }, VIDEO_DURATION_MS);

    return () => window.clearInterval(interval);
  }, [heroVideos.length, isLoaded, reduceMotion]);

  useEffect(() => {
    activeVideoRef.current = activeVideo;

    const syncVideos = () => {
      const active = videoRefs.current[activeVideo];
      if (!active) return;

      videoRefs.current.forEach((video, index) => {
        if (!video || index === activeVideo) return;
        if (Math.abs(video.currentTime - active.currentTime) > 0.28) {
          video.currentTime = active.currentTime;
        }
      });
    };

    const handleVisibility = () => {
      if (document.hidden) return;
      syncVideos();
      const active = videoRefs.current[activeVideoRef.current];
      const playAttempt = active?.play();
      if (playAttempt) playAttempt.catch(() => {});
    };

    const syncInterval = window.setInterval(syncVideos, 1800);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(syncInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [activeVideo]);

  return (
    <main className="site-shell">
      <CustomCursor />
      <FloatingWhatsApp />
      <PrimaryNav tone="dark" />
      <LeadCapturePopup />

      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }}
          >
            <motion.div
              className="loader-mark"
              animate={{ opacity: [0.32, 1, 0.32], scale: [0.985, 1, 0.985] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src="/yairo-logo.png" alt="" />
            </motion.div>
            <motion.div
              className="loader-rule"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1] }}
            />
            <span>Preparing Private View</span>
          </motion.div>
        )}
      </AnimatePresence>

      <section id="home" className="hero" aria-label="Yairo Rincon luxury real estate hero">
        <motion.div className="video-stack" style={{ y: reduceMotion ? 0 : mediaY }} aria-hidden="true">
          {heroVideos.map((video, index) => (
            <video
              key={video.src}
              ref={(node) => {
                videoRefs.current[index] = node;
              }}
              className={index === activeVideo ? "hero-video is-active" : "hero-video"}
              src={video.src}
              preload={video.eager ? "auto" : "none"}
              muted
              loop
              playsInline
              disablePictureInPicture
              onLoadedMetadata={() =>
                setReadyMap((current) => ({ ...current, [video.src]: true }))
              }
              onError={() =>
                setReadyMap((current) => ({ ...current, [video.src]: true }))
              }
            />
          ))}
        </motion.div>

        <motion.div
          className="hero-scrim"
          style={{ opacity: reduceMotion ? 1 : overlayOpacity }}
        />
        <div className="hero-grain" />

        <motion.div
          className="hero-content"
          style={{
            y: reduceMotion ? 0 : contentY,
            opacity: isLoaded ? (reduceMotion ? 1 : contentOpacity) : 0,
          }}
          initial={{ opacity: 0 }}
          
          transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
        >
          <motion.h1
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.18, delayChildren: 0.48 } },
            }}
          >
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 26 },
                visible: {
                  opacity: 1,
                  y: 0,
                  
                  transition: { duration: 1.05, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              Your Home
            </motion.span>
            <motion.em
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  
                  transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              My Priority
            </motion.em>
          </motion.h1>
          <motion.p
            className="hero-subline"
            initial={{ opacity: 0, y: 18 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.92 }}
          >
            Residential guidance across Miami and South Florida.
          </motion.p>
          <MagneticAnchor
            className="cta"
            href={messageUrl("Hi Yairo, I visited your website and would like to connect.")}
            strength={0.28}
          >
            <span>Let's Connect</span>
          </MagneticAnchor>
        </motion.div>

        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          aria-hidden="true"
        >
          <span>Scroll</span>
          <motion.i
            animate={reduceMotion ? {} : { y: [0, 14, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <div className="video-progress" role="group" aria-label="Hero video scenes">
          {videos.map((video, index) => (
            <button
              key={video.src}
              className={index === activeVideo ? "is-active" : ""}
              type="button"
              aria-label={`Show ${video.label}`}
              onClick={() => setActiveVideo(index)}
            />
          ))}
        </div>
      </section>

      <BuyRentSellSection onModeSelect={setSearchMode} />
      <SearchExperience activeMode={searchMode} onModeChange={setSearchMode} />
      <FeaturedPropertiesSection />
      <MeetYairoSection />
      <AreasWeServeSection />
      <ValuationSection />
      <SiteFooter />
    </main>
  );
}

export function ListingsPage() {
  return (
    <main className="site-shell listings-site">
      <CustomCursor />
      <FloatingWhatsApp />
      <PrimaryNav tone="light" />
      <LeadCapturePopup />
      <ListingsPageSection standalone />
      <SiteFooter />
    </main>
  );
}

export function PropertyDetailPage({ property = propertyDetail }) {
  return (
    <main className="site-shell property-site">
      <CustomCursor />
      <FloatingWhatsApp />
      <PrimaryNav tone="dark" />
      <LeadCapturePopup />
      <PropertyDetailExperience property={normalizeDetailProperty(property)} />
      <SiteFooter />
    </main>
  );
}

export function JournalPage() {
  return (
    <main className="site-shell journal-site">
      <CustomCursor />
      <FloatingWhatsApp />
      <PrimaryNav tone="light" />
      <LeadCapturePopup />
      <JournalExperience />
      <SiteFooter />
    </main>
  );
}

function PrimaryNav({ tone = "light" }) {
  const isScrolled = useScrolledNav();

  return (
    <motion.nav
      className={[
        "navbar",
        "primary-nav",
        `nav-${tone}`,
        isScrolled ? "is-scrolled" : "",
      ].join(" ")}
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Primary navigation"
    >
      <div className="brand-cluster">
        <MagneticAnchor className="brand" href="/" aria-label="Yairo Rincon home" strength={0.12}>
          <img src="/yairo-logo.png" alt="Yairo Properties" />
        </MagneticAnchor>
        <span className="brand-divider" aria-hidden="true" />
        <MagneticAnchor className="brand-partner" href="/" aria-label="Lifestyle International Realty" strength={0.08}>
          <img src="/lifestyle-header-logo.png" alt="Lifestyle International Realty" />
        </MagneticAnchor>
      </div>
      <div className="nav-links">
        <MagneticAnchor href="/" strength={0.16}>Home</MagneticAnchor>
        <MagneticAnchor href="/listings" strength={0.16}>Listings</MagneticAnchor>
        <MagneticAnchor href="/journal" strength={0.16}>Journal</MagneticAnchor>
      </div>
      <MagneticAnchor
        className="nav-action"
        href={messageUrl("Hi Yairo, I would like private access to discuss South Florida real estate.")}
        strength={0.18}
      >
        Private Access
      </MagneticAnchor>
    </motion.nav>
  );
}

function useScrolledNav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return isScrolled;
}

function FloatingWhatsApp() {
  return (
    <motion.a
      className="floating-whatsapp"
      href={whatsappUrl("Hi Yairo, I would like to connect.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Open WhatsApp conversation with Yairo Properties"
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.96 }}
    >
      <img src="/whatsapp-button.png" alt="" loading="eager" decoding="async" />
      <i />
    </motion.a>
  );
}

function LeadCapturePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (window.sessionStorage.getItem("yairoLeadPopupDismissed") === "true") return undefined;

    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, 10000);

    return () => window.clearTimeout(timer);
  }, []);

  const closePopup = () => {
    window.sessionStorage.setItem("yairoLeadPopupDismissed", "true");
    setIsVisible(false);
  };

  const submitLead = (event) => {
    event.preventDefault();
    const message = [
      "Hi Yairo, I am looking for guidance with my home search.",
      name ? `Name: ${name}` : "",
      phone ? `Phone: ${phone}` : "",
      "I would like help finding the right home in South Florida.",
    ].filter(Boolean).join("\n");

    window.sessionStorage.setItem("yairoLeadPopupDismissed", "true");
    window.location.href = messageUrl(message);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="lead-popup-backdrop"
          role="presentation"
          onClick={closePopup}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.aside
            className="lead-popup"
            role="dialog"
            aria-modal="true"
            aria-label="Yairo Rincon personal home search invitation"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
          >
            <button className="lead-popup-close" type="button" onClick={closePopup} aria-label="Close invitation">
              Close
            </button>
            <div className="lead-popup-media">
              <img src="/yairo-portrait-studio.jpeg" alt="Yairo Rincon" loading="lazy" decoding="async" />
            </div>
            <form className="lead-popup-copy" onSubmit={submitLead}>
              <span>Personal Guidance</span>
              <h2>Can I help you find the right home?</h2>
              <p>
                Tell me your name and the best number to reach you. I will personally help you understand
                the best options for your timing, lifestyle, and next move.
              </p>
              <label>
                <span>Name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" required />
              </label>
              <label>
                <span>Phone</span>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+1 954..." required />
              </label>
              <button type="submit">Send a Message</button>
            </form>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Yairo Properties footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <img src="/yairo-logo.png" alt="Yairo Properties" loading="lazy" decoding="async" />
          <div className="footer-affiliate-logos" aria-label="Yairo Properties affiliations">
            <img src="/lifestyle-group-logo.jpeg" alt="Lifestyle Group" loading="lazy" decoding="async" />
            <img src="/lifestyle-international-realty-logo.jpeg" alt="Lifestyle International Realty" loading="lazy" decoding="async" />
          </div>
          <p>
            Residential guidance for buying, leasing, selling, and evaluating property
            across Miami, Broward, and South Florida.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          <span>Navigation</span>
          <MagneticAnchor href="/" strength={0.1}>Home</MagneticAnchor>
          <MagneticAnchor href="/listings" strength={0.1}>Listings</MagneticAnchor>
          <MagneticAnchor href="/journal" strength={0.1}>Journal</MagneticAnchor>
          <MagneticAnchor href="/#meet-yairo" strength={0.1}>About</MagneticAnchor>
          <MagneticAnchor href="/#connect" strength={0.1}>Contact</MagneticAnchor>
        </nav>

        <div className="footer-contact">
          <span>Contact</span>
          <MagneticAnchor href="https://yairoproperties.com" strength={0.1}>
            yairoproperties.com
          </MagneticAnchor>
          <MagneticAnchor href={messageUrl("Hi Yairo, I would like to connect by message.")} strength={0.1}>
            {DISPLAY_PHONE_NUMBER}
          </MagneticAnchor>
          <MagneticAnchor
            href="https://www.google.com/maps/search/?api=1&query=201%20N%20University%20Dr%20%23105%2C%20Plantation%2C%20FL%2033324"
            target="_blank"
            rel="noreferrer"
            strength={0.1}
          >
            201 N University Dr #105,<br />
            Plantation, FL 33324
          </MagneticAnchor>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Yairo Properties. All rights reserved.</span>
          <span>
            Made with love by{" "}
            <MagneticAnchor href="https://wearemarea.co" target="_blank" rel="noreferrer" strength={0.08}>
              wearemarea🌊
            </MagneticAnchor>
          </span>
        </div>
      </div>
    </footer>
  );
}

function BuyRentSellSection({ onModeSelect }) {
  const sectionRef = useRef(null);
  const [selectedExperience, setSelectedExperience] = useState(experiences[0]);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const lightX = useTransform(scrollYProgress, [0, 1], ["12%", "76%"]);
  const scrollToSearchMode = (key) => {
    onModeSelect(key);
    window.setTimeout(() => {
      document.getElementById(`search-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <motion.section
      ref={sectionRef}
      className="experience-section"
      id="portfolio"
      style={{
        "--section-light-x": lightX,
      }}
      aria-labelledby="experience-title"
    >
      <div className="section-transition" aria-hidden="true" />
      <motion.div
        className="experience-intro"
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <span>Yairo Rincon Advisory</span>
        <h2 id="experience-title">Buy, Lease, Position</h2>
        <p>Residential guidance across Miami and South Florida.</p>
      </motion.div>

      <div className="experience-panels" aria-label="Buy, rent, and sell experiences">
        {experiences.map((experience, index) => (
          <ExperiencePanel
            key={experience.key}
            experience={experience}
            index={index}
            isSelected={selectedExperience.key === experience.key}
            onSelect={() => {
              setSelectedExperience(experience);
              scrollToSearchMode(experience.key);
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedExperience.key}
          className="experience-detail"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <span>{selectedExperience.eyebrow}</span>
            <h3>{selectedExperience.detailTitle}</h3>
          </div>
          <p>{selectedExperience.detail}</p>
          <MagneticAnchor
            className="detail-action"
            href={`#search-${selectedExperience.key}`}
            strength={0.2}
            onClick={(event) => {
              event.preventDefault();
              scrollToSearchMode(selectedExperience.key);
            }}
          >
            {selectedExperience.cta}
          </MagneticAnchor>
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}

function ExperiencePanel({ experience, index, isSelected, onSelect }) {
  return (
    <motion.button
      className={`experience-panel experience-${experience.key}${isSelected ? " is-selected" : ""}`}
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 52 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -10 }}
      whileTap={{ scale: 0.992 }}
      aria-pressed={isSelected}
    >
      <img className="panel-media" src={experience.media} alt="" loading="lazy" />
      <span className="panel-overlay" />
      <span className="panel-light" />
      <span className="panel-content">
        <span className="panel-index">0{index + 1}</span>
        <span className="panel-eyebrow">{experience.eyebrow}</span>
        <span className="panel-title">{experience.title}</span>
        <span className="panel-copy">{experience.copy}</span>
        <span className="panel-link">{isSelected ? "View Section" : `Explore ${experience.title}`}</span>
      </span>
    </motion.button>
  );
}

function SearchExperience({ activeMode, onModeChange }) {
  const sectionRef = useRef(null);
  const modeRefs = useRef({});
  const [openField, setOpenField] = useState(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(activeMode);
  const [isNavigating, setIsNavigating] = useState(false);
  const modeKeys = useMemo(() => Object.keys(searchModes), []);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const glowX = useTransform(scrollYProgress, [0, 1], ["76%", "24%"]);

  useEffect(() => {
    setActiveSection(activeMode);
  }, [activeMode]);

  useEffect(() => {
    const sections = modeKeys.map((key) => modeRefs.current[key]).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.dataset?.mode) {
          setActiveSection(visible.target.dataset.mode);
          onModeChange(visible.target.dataset.mode);
        }
      },
      { root: null, threshold: [0.28, 0.44, 0.62], rootMargin: "-28% 0px -42% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [modeKeys, onModeChange]);

  const updateValue = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setOpenField(null);
  };

  const handleModeNavigate = (key) => {
    onModeChange(key);
    setActiveSection(key);
    setOpenField(null);
    setIsNavigating(true);
    modeRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => setIsNavigating(false), 720);
  };

  const handleSubmit = (modeKey) => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1150);
    setActiveSection(modeKey);
    if (modeKey === "sell") {
      window.location.href = messageUrl("Hi Yairo, I would like to request a free home valuation.");
      return;
    }

    const query = listingParamsFromValues(values, modeKey, 48).toString();
    window.location.href = `/listings?${query}#listing-results`;
  };

  return (
    <motion.section
      ref={sectionRef}
      className={isNavigating ? "search-section is-navigating" : "search-section"}
      id="search-experience"
      style={{ "--search-glow-x": glowX }}
      aria-labelledby="search-title"
    >
      <div className="search-transition" aria-hidden="true" />
      <motion.div
        className="search-shell"
        initial={{ opacity: 0, y: 46 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="search-heading">
          <span>Search</span>
          <h2 id="search-title">Miami Real Estate With Clarity</h2>
          <p>Filter by location, property type, price, and the details that shape the decision.</p>
        </div>

        <div className="mode-switch" role="tablist" aria-label="Search mode">
          {modeKeys.map((key) => (
            <motion.button
              key={key}
              className={activeSection === key ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={activeSection === key}
              onClick={() => handleModeNavigate(key)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
            >
              {key}
            </motion.button>
          ))}
        </div>

        <div className="search-sections">
          {modeKeys.map((key) => (
            <SearchModeSection
              key={key}
              modeKey={key}
              mode={searchModes[key]}
              refCallback={(node) => {
                modeRefs.current[key] = node;
              }}
              values={values}
              loading={loading && activeSection === key}
              openField={openField}
              onOpenField={setOpenField}
              onUpdateValue={updateValue}
              onToggle={(toggle) =>
                setValues((current) => ({ ...current, [toggle]: !current[toggle] }))
              }
              onSubmit={() => handleSubmit(key)}
              isActive={activeSection === key}
            />
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}

function SearchModeSection({
  modeKey,
  mode,
  refCallback,
  values,
  loading,
  openField,
  onOpenField,
  onUpdateValue,
  onToggle,
  onSubmit,
  isActive,
}) {
  return (
    <motion.div
      ref={refCallback}
      className={[
        "search-mode-section",
        modeKey === "sell" ? "sell-valuation" : "",
        isActive ? "is-active-section" : "",
      ].filter(Boolean).join(" ")}
      id={`search-${modeKey}`}
      data-mode={modeKey}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mode-heading">
        <span>{mode.eyebrow}</span>
        <h3>{mode.title}</h3>
        <p>{mode.description}</p>
      </div>

      {modeKey === "buy" && (
        <LuxuryRangeSlider
          label="Price Range"
          stops={PRICE_STOPS}
          value={values["Price Range"] || [1000000, 25000000]}
          onChange={(value) => onUpdateValue("Price Range", value)}
        />
      )}

      {modeKey === "rent" && (
        <>
          <LuxuryRangeSlider
            label="Monthly Budget"
            stops={RENT_STOPS}
            value={values["Monthly Budget"] || [8000, 45000]}
            onChange={(value) => onUpdateValue("Monthly Budget", value)}
          />
          <label className="date-field">
            <span>Move-In Date</span>
            <input
              type="date"
              value={values["Move-In Date"] || ""}
              onChange={(event) => onUpdateValue("Move-In Date", event.target.value)}
            />
          </label>
        </>
      )}

      <div className={modeKey === "sell" ? "search-grid seller-grid" : "search-grid"}>
        {mode.fields.map((field) => (
          <LuxuryField
            key={field.label}
            field={field}
            value={values[field.label]}
            isOpen={openField === field.label}
            onOpen={() => onOpenField(openField === field.label ? null : field.label)}
            onChange={(value) => onUpdateValue(field.label, value)}
          />
        ))}
      </div>

      {mode.toggles?.length > 0 && (
        <div className={modeKey === "rent" ? "search-toggles switch-toggles" : "search-toggles"}>
          {mode.toggles.map((toggle) =>
            modeKey === "rent" ? (
              <LuxurySwitch
                key={toggle}
                label={toggle}
                checked={Boolean(values[toggle])}
                onChange={() => onToggle(toggle)}
              />
            ) : (
              <LuxuryCheckbox
                key={toggle}
                label={toggle}
                checked={Boolean(values[toggle])}
                onChange={() => onToggle(toggle)}
              />
            ),
          )}
        </div>
      )}

      {modeKey === "sell" && (
        <div className="valuation-actions" aria-label="Seller consultation options">
          {mode.ctas.map((cta) => (
            <motion.button
              key={cta}
              type="button"
              onClick={onSubmit}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
            >
              {cta}
            </motion.button>
          ))}
        </div>
      )}

      {modeKey !== "sell" && (
        <div className="search-footer">
          <p>Selections are reviewed for fit, context, and next-step relevance.</p>
          <motion.button
            className="search-submit"
            type="button"
            onClick={onSubmit}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.985 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={loading ? "loading" : "ready"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                {loading ? "Curating" : mode.action}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

function LuxuryField({ field, value, isOpen, onOpen, onChange }) {
  const hasOptions = Boolean(field.options);

  if (!hasOptions) {
    return (
      <label className="luxury-field input-field">
        <span>{field.label}</span>
        <input placeholder={field.placeholder} value={value || ""} onChange={(event) => onChange(event.target.value)} />
      </label>
    );
  }

  return (
    <div className={isOpen ? "luxury-field is-open" : "luxury-field"}>
      <button type="button" onClick={onOpen}>
        <span>{field.label}</span>
        <strong>{value || "Select"}</strong>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="field-menu"
            initial={{ opacity: 0, y: -8, scaleY: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.96 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            {field.options.map((option) => (
              <button key={option} type="button" onClick={() => onChange(option)}>
                {option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LuxuryRangeSlider({ label, stops, value, onChange }) {
  const [minValue, maxValue] = value;
  const [isDragging, setIsDragging] = useState(false);
  const minPercent = valueToPosition(minValue, stops);
  const maxPercent = valueToPosition(maxValue, stops);
  const formatValue = formatCurrencyCompact;

  const updateMin = (event) => {
    const next = Math.min(positionToValue(Number(event.target.value), stops), maxValue * 0.985);
    onChange([roundLuxuryValue(next), maxValue]);
  };

  const updateMax = (event) => {
    const next = Math.max(positionToValue(Number(event.target.value), stops), minValue * 1.015);
    onChange([minValue, roundLuxuryValue(next)]);
  };

  return (
    <div className={isDragging ? "range-field is-dragging" : "range-field"}>
      <div className="range-head">
        <span>{label}</span>
        <strong>
          {formatValue(minValue)} - {formatValue(maxValue)}
        </strong>
      </div>
      <div
        className="range-track"
        style={{
          "--range-min": `${minPercent}%`,
          "--range-max": `${maxPercent}%`,
        }}
      >
        <span className="range-value range-value-min">{formatValue(minValue)}</span>
        <span className="range-value range-value-max">{formatValue(maxValue)}</span>
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={minPercent * 10}
          onChange={updateMin}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
        />
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={maxPercent * 10}
          onChange={updateMax}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
        />
      </div>
    </div>
  );
}

function positionToValue(rawPosition, stops) {
  const position = rawPosition / 10;
  const segment = stops.find((stop, index) => {
    const nextStop = stops[index + 1];
    return nextStop && position >= stop.pos && position <= nextStop.pos;
  }) || stops[stops.length - 2];
  const next = stops[stops.indexOf(segment) + 1];
  const progress = (position - segment.pos) / (next.pos - segment.pos);
  const eased = progress ** 1.18;
  return segment.value + (next.value - segment.value) * eased;
}

function valueToPosition(value, stops) {
  const segment = stops.find((stop, index) => {
    const nextStop = stops[index + 1];
    return nextStop && value >= stop.value && value <= nextStop.value;
  }) || (value <= stops[0].value ? stops[0] : stops[stops.length - 2]);
  const next = stops[stops.indexOf(segment) + 1] || stops[stops.length - 1];
  const progress = Math.max(0, Math.min(1, (value - segment.value) / (next.value - segment.value)));
  return segment.pos + progress ** (1 / 1.18) * (next.pos - segment.pos);
}

function roundLuxuryValue(value) {
  if (value < 1000000) return Math.round(value / 25000) * 25000;
  if (value < 10000000) return Math.round(value / 100000) * 100000;
  if (value < 100000000) return Math.round(value / 500000) * 500000;
  return Math.round(value / 5000000) * 5000000;
}

function formatCurrencyCompact(value) {
  if (value >= 1000000000) return `$${Number((value / 1000000000).toFixed(1))}B`;
  if (value >= 1000000) return `$${Number((value / 1000000).toFixed(value >= 10000000 ? 0 : 1))}M`;
  if (value >= 1000) return `$${Number((value / 1000).toFixed(value >= 100000 ? 0 : 1))}K`;
  return `$${value}`;
}

function LuxuryCheckbox({ label, checked, onChange }) {
  return (
    <button className={checked ? "luxury-checkbox is-checked" : "luxury-checkbox"} type="button" onClick={onChange}>
      <span />
      {label}
    </button>
  );
}

function LuxurySwitch({ label, checked, onChange }) {
  return (
    <button className={checked ? "luxury-switch is-checked" : "luxury-switch"} type="button" onClick={onChange}>
      <span />
      {label}
    </button>
  );
}

function FeaturedPropertiesSection() {
  const sectionRef = useRef(null);
  const carouselRef = useRef(null);
  const [properties, setProperties] = useState(featuredProperties);
  const moveCarousel = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({
      left: direction * carousel.clientWidth * 0.66,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let mounted = true;
    const load = () => {
      loadPlatformListings({ limit: 6 })
        .then((incoming) => {
          if (!mounted || !incoming.length) return;
          setProperties(incoming.slice(0, 6).map(normalizeFeaturedListing));
        })
        .catch(() => {});
    };

    const timer = window.setTimeout(load, 1200);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <section ref={sectionRef} id="featured-properties" className="featured-section">
      <div className="featured-transition" aria-hidden="true" />
      <motion.div
        className="featured-header"
        initial={{ opacity: 0, y: 42 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <span>Featured Residences</span>
        <h2>Featured Miami Homes</h2>
        <p>
          Homes selected for location, architecture, and market position.
        </p>
      </motion.div>

      <div className="featured-carousel-wrap">
        <div className="carousel-controls" aria-label="Featured property carousel controls">
          <motion.button type="button" onClick={() => moveCarousel(-1)} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
            Prev
          </motion.button>
          <motion.button type="button" onClick={() => moveCarousel(1)} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
            Next
          </motion.button>
        </div>
        <div ref={carouselRef} className="featured-carousel" aria-label="Featured properties">
          {properties.map((property, index) => (
            <FeaturedPropertyCard
              key={property.id}
              property={property}
              index={index}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="featured-footer"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p>Each property is reviewed for context, condition, and fit.</p>
        <MagneticAnchor className="featured-cta" href="/listings" strength={0.2}>
          View All Listings
        </MagneticAnchor>
      </motion.div>
    </section>
  );
}

function MeetYairoSection() {
  const [isOpen, setIsOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const portraitY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [12, 46]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.documentElement.classList.add("is-profile-open");
    document.body.classList.add("is-profile-open");
    document.body.style.overflow = "hidden";
    document.dispatchEvent(new CustomEvent("yairo:lock-scroll"));
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.classList.remove("is-profile-open");
      document.body.classList.remove("is-profile-open");
      document.dispatchEvent(new CustomEvent("yairo:unlock-scroll"));
    };
  }, [isOpen]);

  return (
    <section ref={sectionRef} id="meet-yairo" className="meet-yairo-section">
      <motion.div
        className="meet-yairo-media"
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src="/yairo-portrait-primary.jpeg"
          alt="Yairo Rincon portrait"
          loading="lazy"
          style={{ y: portraitY }}
        />
      </motion.div>

      <motion.div
        className="meet-yairo-copy"
        initial={{ opacity: 0, y: 42 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        <span>Meet Yairo Rincon</span>
        <h2>Miami residential guidance, handled with care.</h2>
        <p>
          Yairo brings market knowledge, design sensitivity, and steady guidance
          to acquisitions, leasing, and residential positioning.
        </p>

        <div className="meet-yairo-metrics" aria-label="Yairo Rincon advisory metrics">
          {[
            ["7", "Years of Experience"],
            ["100+", "Private Transactions"],
            ["$50M+", "Sales Volume"],
          ].map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <p>
          His approach is direct and relationship led: understand the client first,
          then align timing, property, and long-term perspective.
        </p>

        <motion.button
          className="meet-yairo-cta"
          type="button"
          onClick={() => setIsOpen(true)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.985 }}
        >
          About Yairo Rincon
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen && <YairoProfilePanel onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}

function YairoProfilePanel({ onClose }) {
  const navigateProfile = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <motion.div
      className="yairo-panel-backdrop"
      onClick={onClose}
      onWheel={(event) => event.preventDefault()}
      onTouchMove={(event) => event.preventDefault()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.aside
        className="yairo-profile-panel"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.82, ease: [0.77, 0, 0.175, 1] }}
        aria-label="Yairo Rincon expanded profile"
        onClick={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        <button className="yairo-panel-close" type="button" onClick={onClose} aria-label="Close Yairo profile">
          Close
        </button>

        <nav className="yairo-panel-nav" aria-label="Yairo profile navigation">
          {[
            ["Profile", "yairo-panel-profile"],
            ["Approach", "yairo-panel-approach"],
            ["Lifestyle", "yairo-panel-lifestyle"],
            ["Principles", "yairo-panel-principles"],
          ].map(([label, sectionId]) => (
            <button key={sectionId} type="button" onClick={() => navigateProfile(sectionId)}>
              {label}
            </button>
          ))}
        </nav>

        <div id="yairo-panel-profile" className="yairo-panel-hero">
          <img src="/yairo-portrait-studio.jpeg" alt="Yairo Rincon studio portrait" loading="lazy" />
          <div>
            <span>Private Advisor</span>
            <h2>Yairo Rincon</h2>
            <p>
              South Florida real estate advisor specializing in homes, waterfront estates,
              and investment properties across Broward and Miami-Dade.
            </p>
          </div>
        </div>

        <div id="yairo-panel-approach" className="yairo-panel-story">
          <section className="is-wide">
            <span>Biography</span>
            <p>
              Fluent in English, Spanish, and Portuguese, Yairo Rincon is a South Florida real estate advisor
              specializing in luxury homes, waterfront estates, and investment properties across Broward and Miami-Dade.
            </p>
            <p>
              Known for his cinematic marketing style, strategic negotiation, and white-glove service,
              Yairo combines high-end visual storytelling with data-driven expertise to position every
              property at its maximum potential.
            </p>
            <p>
              From luxury lifestyle campaigns to targeted global exposure, his approach is designed to
              create attention, elevate perception, and deliver results for buyers, sellers, and investors alike.
            </p>
          </section>
          <section className="is-wide">
            <span>South Florida Focus</span>
            <p>
              From exclusive waterfront homes in Lauderdale by the Sea to luxury communities in Parkland,
              Miami Beach, and Coral Gables, Yairo delivers a white glove experience built around discretion,
              communication, and results.
            </p>
            <p>
              His global marketing reach, strong network of attorneys, lenders, and title professionals,
              and multilingual background allow him to connect with both local and international buyers
              seeking South Florida real estate opportunities.
            </p>
          </section>
        </div>

        <div id="yairo-panel-lifestyle" className="yairo-lifestyle-grid">
          <figure>
            <img src="/yairo-lifestyle-tokyo.jpeg" alt="Yairo Rincon travel and architecture" loading="lazy" />
            <figcaption>Travel / Design / Cultural Fluency</figcaption>
          </figure>
          <figure>
            <img src="/yairo-lifestyle-rome.jpeg" alt="Yairo Rincon architectural travel" loading="lazy" />
            <figcaption>Architecture / History / Perspective</figcaption>
          </figure>
        </div>

        <div id="yairo-panel-principles" className="yairo-philosophy">
          {[
            ["Discretion", "Private clients deserve quiet process, careful language, and controlled exposure."],
            ["Long-Term Relationships", "The best advisory extends beyond a transaction and into future decisions."],
            ["Thoughtful Acquisitions", "A residence should fit architecture, lifestyle, timing, and long-range value."],
            ["Living Well", "Miami is read through boating, wellness, dining, design, and neighborhood rhythm."],
          ].map(([title, copy]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>

        <div className="yairo-panel-actions">
          <MagneticAnchor href="/#connect" strength={0.18}>Schedule a Private Consultation</MagneticAnchor>
          <MagneticAnchor href="/listings" strength={0.18}>Begin Your Search</MagneticAnchor>
        </div>
      </motion.aside>
    </motion.div>
  );
}

function AreasWeServeSection() {
  return (
    <section className="areas-we-serve" aria-label="Areas Yairo Rincon serves">
      <motion.span
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      >
        The areas we serve
      </motion.span>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.86, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      >
        {serviceAreas.map((area) => (
          <strong key={area}>{area}</strong>
        ))}
      </motion.div>
    </section>
  );
}

function ValuationSection() {
  const [homePrice, setHomePrice] = useState(1800000);
  const [downPayment, setDownPayment] = useState(360000);
  const [interestRate, setInterestRate] = useState(6.25);
  const [loanTerm, setLoanTerm] = useState(30);
  const downPaymentMax = Math.max(100000, homePrice * 0.6);
  const principal = Math.max(0, homePrice - downPayment);
  const monthlyRate = interestRate / 100 / 12;
  const paymentCount = loanTerm * 12;
  const estimatedPayment = monthlyRate
    ? principal * (monthlyRate * (1 + monthlyRate) ** paymentCount) / ((1 + monthlyRate) ** paymentCount - 1)
    : principal / paymentCount;

  useEffect(() => {
    setDownPayment((current) => Math.min(current, downPaymentMax));
  }, [downPaymentMax]);

  return (
    <section id="valuation" className="valuation-section">
      <motion.div
        className="valuation-heading"
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.86, ease: [0.16, 1, 0.3, 1] }}
      >
        <span>Free Home Valuation</span>
        <h2>What Is Your Home Worth?</h2>
        <p>
          Your home deserves a careful review. Share a few details and Yairo will help you understand its value with clarity and care.
        </p>
      </motion.div>

      <div className="valuation-layout">
        <motion.div
          className="valuation-card home-value-card"
          initial={{ opacity: 0, y: 38 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>Home Value Review</span>
          <h3>Request a free valuation.</h3>
          <p>
            We believe every homeowner deserves honest guidance before making a move.
            Yairo will review your property, recent sales, and the best path forward with you.
          </p>
          <label>
            <span>Property Address</span>
            <input placeholder="Street address or building" />
          </label>
          <label>
            <span>Phone or Email</span>
            <input placeholder="Preferred contact" />
          </label>
          <MagneticAnchor
            className="valuation-submit"
            href={messageUrl("Hi Yairo, I would like to request a free valuation for my home.")}
            strength={0.18}
          >
            Request Free Valuation
          </MagneticAnchor>
        </motion.div>

        <motion.div
          className="valuation-card mortgage-card"
          initial={{ opacity: 0, y: 38 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.78, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mortgage-result">
            <span>Estimated Monthly Payment</span>
            <strong>{formatCurrencyCompact(Math.round(estimatedPayment))}</strong>
            <p>Principal and interest estimate. Taxes, insurance, and HOA vary by property.</p>
          </div>
          <CalculatorRange
            label="Home Price"
            value={homePrice}
            min={600000}
            max={8000000}
            step={50000}
            format={formatCurrencyCompact}
            onChange={setHomePrice}
          />
          <CalculatorRange
            label="Down Payment"
            value={downPayment}
            min={100000}
            max={downPaymentMax}
            step={25000}
            format={formatCurrencyCompact}
            onChange={setDownPayment}
          />
          <CalculatorRange
            label="Interest Rate"
            value={interestRate}
            min={4}
            max={9}
            step={0.05}
            format={(value) => `${Number(value).toFixed(2)}%`}
            onChange={setInterestRate}
          />
          <CalculatorRange
            label="Loan Term"
            value={loanTerm}
            min={10}
            max={30}
            step={5}
            format={(value) => `${value} Years`}
            onChange={setLoanTerm}
          />
        </motion.div>
      </div>
    </section>
  );
}

function CalculatorRange({ label, value, min, max, step, format, onChange }) {
  return (
    <label className="calculator-range">
      <span>{label}</span>
      <strong>{format(value)}</strong>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function ListingsPageSection({ standalone = false }) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const initialListingState = useMemo(getInitialListingState, []);
  const [listingMode, setListingMode] = useState(initialListingState.mode);
  const [openFilter, setOpenFilter] = useState(null);
  const [filterValues, setFilterValues] = useState(initialListingState.values);
  const [visibleListings, setVisibleListings] = useState(listings);
  const [activeListing, setActiveListing] = useState(listings[0]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 0.5], [0, 46]);

  useEffect(() => {
    let mounted = true;
    const query = buildListingsQuery(filterValues, listingMode, 48);

    setIsLoadingListings(true);
    const timer = window.setTimeout(() => {
      loadFilteredPlatformListings(query)
        .then((incoming) => {
          if (!mounted || !incoming.length) return;
          const nextListings = incoming.map(normalizeCardListing);
          setVisibleListings(nextListings);
          setActiveListing(nextListings[0]);
        })
        .catch(() => {})
        .finally(() => {
          if (mounted) setIsLoadingListings(false);
        });
    }, 220);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [filterValues, listingMode]);

  const updateFilter = (label, value) => {
    setFilterValues((current) => ({ ...current, [label]: value }));
    setOpenFilter(null);
  };

  const toggleFilter = (label) => {
    setFilterValues((current) => ({ ...current, [label]: !current[label] }));
  };

  return (
    <section
      ref={sectionRef}
      id="listings"
      className={standalone ? "listings-page is-standalone" : "listings-page"}
      aria-label="Yairo Rincon listings experience"
    >
      <motion.div
        className="listings-hero"
        initial={{ opacity: 0, y: 42 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-14% 0px" }}
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="listings-hero-media"
          initial={{ clipPath: "inset(12% 12% 12% 12%)" }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
        >
          <motion.img
            src="/videos/optimized/miami-hero-02-poster.jpg"
            alt="Miami luxury residence"
            loading="lazy"
            style={{ y: reduceMotion ? 0 : heroImageY }}
          />
        </motion.div>
        <div className="listings-hero-copy">
          <span>Yairo Rincon / Miami Advisory</span>
          <h2>Miami Residences</h2>
          <p>
            Curated access to waterfront estates, architectural homes, penthouses, and private opportunities across Miami.
          </p>
          <div className="listings-hero-meta" aria-label="Market positioning">
            <span>Waterfront</span>
            <span>Private Listings</span>
            <span>Residential Advisory</span>
          </div>
          <div className="listings-hero-actions">
            <MagneticAnchor href="#listing-results" strength={0.18}>View Listings</MagneticAnchor>
            <MagneticAnchor href="#listings-map" strength={0.18}>Explore Map</MagneticAnchor>
            <MagneticAnchor
              href={messageUrl("Hi Yairo, I would like private advisory for Miami and South Florida real estate.")}
              strength={0.18}
            >
              Private Advisory
            </MagneticAnchor>
          </div>
        </div>
      </motion.div>

      <motion.div
        id="listing-filters"
        className="listing-filters"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="listing-mode-toggle" aria-label="Listing mode">
          {["buy", "rent"].map((mode) => (
            <button
              key={mode}
              type="button"
              className={listingMode === mode ? "is-active" : ""}
              onClick={() => {
                setListingMode(mode);
                updateFilter("Price Range", mode === "buy" ? [600000, 25000000] : [2500, 45000]);
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        <LuxuryRangeSlider
          label={listingMode === "buy" ? "Price Range" : "Monthly Budget"}
          stops={listingMode === "buy" ? PRICE_STOPS : RENT_STOPS}
          value={filterValues["Price Range"]}
          onChange={(value) => updateFilter("Price Range", value)}
        />

        <div className="listing-filter-grid">
          {listingFilters.map((field) => (
            <LuxuryField
              key={field.label}
              field={field}
              value={filterValues[field.label]}
              isOpen={openFilter === field.label}
              onOpen={() => setOpenFilter(openFilter === field.label ? null : field.label)}
              onChange={(value) => updateFilter(field.label, value)}
            />
          ))}
        </div>

        <div className="listing-filter-toggles">
          {["Waterfront", "New Construction"].map((label) => (
            <LuxuryCheckbox
              key={label}
              label={label}
              checked={Boolean(filterValues[label])}
              onChange={() => toggleFilter(label)}
            />
          ))}
        </div>
      </motion.div>

      <div className="listings-split">
        <div id="listing-results" className="listings-results">
          <div className="listings-count">
            <span>Curated Inventory</span>
            <strong>{isLoadingListings ? "Updating" : `${String(visibleListings.length).padStart(2, "0")} Residences`}</strong>
          </div>
          {visibleListings.map((listing, index) => (
            <ListingResultCard
              key={listing.id}
              listing={listing}
              index={index}
              isActive={activeListing.id === listing.id}
              onFocus={() => setActiveListing(listing)}
            />
          ))}
        </div>
        <LuxuryMap listings={visibleListings} activeListing={activeListing} onActivate={setActiveListing} />
      </div>

      <MiamiNeighborhoodsSection />
    </section>
  );
}

function MiamiNeighborhoodsSection() {
  const [openPanel, setOpenPanel] = useState(`${neighborhoods[0].title}-Dining`);

  return (
    <section className="neighborhoods-section" aria-label="Explore Miami neighborhoods">
      <motion.div
        className="neighborhoods-header"
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.86, ease: [0.16, 1, 0.3, 1] }}
      >
        <span>Residential Intelligence</span>
        <h2>Explore Miami Neighborhoods</h2>
        <p>
          A closer read on residential character, daily rhythm, and long-term fit across Miami's most established areas.
        </p>
      </motion.div>

      <div className="neighborhoods-stack">
        {neighborhoods.map((neighborhood, index) => (
          <motion.article
            key={neighborhood.title}
            className="neighborhood-block"
            initial={{ opacity: 0, y: 46 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.92, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="neighborhood-media">
              <img src={neighborhood.image} alt={`${neighborhood.title} residential atmosphere`} loading="lazy" />
            </div>

            <div className="neighborhood-copy">
              <span>{neighborhood.tone}</span>
              <h3>{neighborhood.title}</h3>
              <p>{neighborhood.description}</p>

              <div className="neighborhood-icons" aria-label={`${neighborhood.title} residential characteristics`}>
                {neighborhood.icons.map((icon) => (
                  <span key={icon}>
                    <i aria-hidden="true" />
                    {icon}
                  </span>
                ))}
              </div>

              <div className="neighborhood-data">
                {neighborhood.data.map((item) => (
                  <div key={item}>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="neighborhood-accordion" aria-label={`${neighborhood.title} detailed intelligence`}>
                {neighborhood.intelligence.map((panel) => {
                  const panelId = `${neighborhood.title}-${panel.title}`;
                  const isOpen = openPanel === panelId;

                  return (
                    <div className={isOpen ? "neighborhood-panel is-open" : "neighborhood-panel"} key={panelId}>
                      <button type="button" onClick={() => setOpenPanel(isOpen ? "" : panelId)}>
                        <NeighborhoodIcon type={panel.icon} />
                        <span>{panel.title}</span>
                        <em>{isOpen ? "Close" : "Open"}</em>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            className="neighborhood-panel-body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <p>{panel.note}</p>
                            <div>
                              {panel.items.map((item) => (
                                <span key={item}>{item}</span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <strong>{neighborhood.atmosphere}</strong>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function NeighborhoodIcon({ type }) {
  const paths = {
    dining: (
      <>
        <path d="M8 4v16" />
        <path d="M6 4v6c0 2 4 2 4 0V4" />
        <path d="M17 4v16" />
        <path d="M14 8c0-2 1-4 3-4v8" />
      </>
    ),
    shopping: (
      <>
        <path d="M7 9h10l-1 11H8L7 9Z" />
        <path d="M9 9a3 3 0 0 1 6 0" />
      </>
    ),
    mobility: (
      <>
        <path d="M6 7h12v8H6V7Z" />
        <path d="M8 17h8" />
        <path d="M9 20l2-3" />
        <path d="M15 20l-2-3" />
        <path d="M9 11h6" />
      </>
    ),
    neighbors: (
      <>
        <path d="M5 11l7-6 7 6" />
        <path d="M7 10v9h10v-9" />
        <path d="M10 19v-5h4v5" />
      </>
    ),
    nearby: (
      <>
        <path d="M12 21s6-5.5 6-11a6 6 0 0 0-12 0c0 5.5 6 11 6 11Z" />
        <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </>
    ),
    climate: (
      <>
        <path d="M12 7V3" />
        <path d="M12 21v-4" />
        <path d="M5.6 5.6l2.8 2.8" />
        <path d="M15.6 15.6l2.8 2.8" />
        <path d="M3 12h4" />
        <path d="M17 12h4" />
        <circle cx="12" cy="12" r="3.5" />
      </>
    ),
    water: (
      <>
        <path d="M4 13c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
        <path d="M4 18c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
      </>
    ),
  };

  return (
    <i className="neighborhood-line-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {paths[type] || paths.nearby}
      </svg>
    </i>
  );
}

function JournalExperience() {
  const featuredArticle = journalArticles.find((article) => article.featured) || journalArticles[0];
  const feedArticles = journalArticles.filter((article) => article !== featuredArticle);
  const [expandedArticles, setExpandedArticles] = useState({});
  const toggleArticle = (title) => {
    setExpandedArticles((current) => ({
      ...current,
      [title]: !current[title],
    }));
  };

  return (
    <section className="journal-page" aria-label="Yairo Rincon editorial journal">
      <motion.article
        className={expandedArticles[featuredArticle.title] ? "journal-feature is-expanded" : "journal-feature"}
        initial={{ opacity: 0, y: 44 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <JournalArticleImage article={featuredArticle} large />
        <div className="journal-feature-copy">
          <span>{featuredArticle.category}</span>
          <h1>{featuredArticle.title}</h1>
          <p>{featuredArticle.description}</p>
          <button
            className="journal-read-more"
            type="button"
            onClick={() => toggleArticle(featuredArticle.title)}
          >
            {expandedArticles[featuredArticle.title] ? "Close Article" : "Read More"}
          </button>
          <AnimatePresence initial={false}>
            {expandedArticles[featuredArticle.title] && (
              <motion.div
                className="journal-expanded-copy"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
              >
                {featuredArticle.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.article>

      <div className="journal-feed-header">
        <span>Yairo Rincon Journal</span>
        <p>Residential perspective, lifestyle context, and market intelligence for South Florida decisions.</p>
      </div>

      <div className="journal-feed">
        {feedArticles.map((article, index) => (
          <motion.article
            key={article.title}
            className={expandedArticles[article.title] ? "journal-feed-item is-expanded" : "journal-feed-item"}
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.78, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <JournalArticleImage article={article} />
            <div>
              <span>{article.category}</span>
              <h2>{article.title}</h2>
              <p>{article.description}</p>
              <button
                className="journal-read-more"
                type="button"
                onClick={() => toggleArticle(article.title)}
              >
                {expandedArticles[article.title] ? "Close Article" : "Read More"}
              </button>
              <AnimatePresence initial={false}>
                {expandedArticles[article.title] && (
                  <motion.div
                    className="journal-expanded-copy"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {article.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function JournalArticleImage({ article, large = false }) {
  return (
    <div className={large ? "editorial-art is-large" : "editorial-art"}>
      <img src={article.image} alt={article.title} loading={large ? "eager" : "lazy"} decoding="async" />
      <span>{article.category}</span>
    </div>
  );
}

function ListingResultCard({ listing, index, isActive, onFocus }) {
  return (
    <motion.article
      className={isActive ? "listing-card is-active" : "listing-card"}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      tabIndex={0}
      initial={{ opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.86, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="listing-card-media">
        <img src={listing.image} alt={listing.title} loading="lazy" />
        <span>{listing.status}</span>
      </div>
      <div className="listing-card-body">
        <div className="listing-card-topline">
          <span>{listing.location}</span>
          <strong>{listing.price}</strong>
        </div>
        <h3>{listing.title}</h3>
        <div className="listing-card-meta">
          <span>{listing.beds} Beds</span>
          <span>{listing.baths} Baths</span>
          <span>{listing.sqft}</span>
        </div>
        <p>{listing.description}</p>
        <MagneticAnchor className="listing-card-link" href={`/property/${listing.listingKey || listing.id}`} strength={0.16}>
          View Residence
        </MagneticAnchor>
      </div>
    </motion.article>
  );
}

function PropertyDetailExperience({ property }) {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef(null);
  const [activeImage, setActiveImage] = useState(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0.2]);

  return (
    <section className="property-detail" aria-label={`${property.title} property presentation`}>
      <motion.div ref={heroRef} className="property-detail-hero" style={{ opacity: reduceMotion ? 1 : heroOpacity }}>
        <motion.img
          src={property.gallery[0]}
          alt={property.title}
          style={{ y: reduceMotion ? 0 : heroY }}
        />
        <div className="property-hero-shade" />
        <motion.div
          className="property-hero-content"
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>{property.marketPosition}</span>
          <h1>{property.title}</h1>
          <p>{property.location}</p>
          <div className="property-hero-meta">
            <strong>{property.price}</strong>
            <span>{property.address}</span>
          </div>
          <MagneticAnchor className="property-hero-cta" href="#private-showing" strength={0.18}>
            Request Private Showing
          </MagneticAnchor>
        </motion.div>
      </motion.div>

      <motion.div
        className="property-specs"
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {property.specs.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </motion.div>

      <section className="property-narrative">
        <motion.div
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={{ duration: 0.86, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>Architectural Narrative</span>
          <h2>Waterfront privacy, composed for Miami light.</h2>
          <p>{property.narrative}</p>
        </motion.div>
      </section>

      <PropertyImageGallery property={property} onOpen={setActiveImage} />
      <PropertyMap property={property} />
      <NeighborhoodIntelligence property={property} />
      <ConciergeInquiry property={property} />

      <AnimatePresence>
        {activeImage && (
          <motion.button
            className="property-lightbox"
            type="button"
            onClick={() => setActiveImage(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src={activeImage}
              alt=""
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            />
            <span>Close</span>
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}

function PropertyImageGallery({ property, onOpen }) {
  return (
    <section className="property-gallery-section">
      <div className="property-section-heading">
        <span>Gallery</span>
        <h2>Architecture, atmosphere, horizon.</h2>
      </div>
      <div className="property-gallery">
        {property.gallery.map((image, index) => (
          <motion.button
            key={image}
            className={index === 0 ? "is-large" : ""}
            type="button"
            onClick={() => onOpen(image)}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.72, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={image} alt={`${property.title} gallery ${index + 1}`} loading="lazy" />
          </motion.button>
        ))}
      </div>
    </section>
  );
}

function PropertyMap({ property }) {
  const mapUrl = googleMapsEmbedUrl(property);

  return (
    <section className="property-map-section">
      <div className="property-section-heading">
        <span>Waterfront Positioning</span>
        <h2>{property.city || "South Florida"} positioning, reviewed in context.</h2>
      </div>
      <div className="property-map-canvas">
        <iframe
          src={mapUrl}
          title={`${property.title} satellite map`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="map-satellite-shade" />
        <div className="property-main-pin"><span>{property.price}</span></div>
      </div>
    </section>
  );
}

function NeighborhoodIntelligence({ property }) {
  return (
    <section className="neighborhood-intel">
      <div className="property-section-heading">
        <span>Neighborhood Intelligence</span>
        <h2>North Bay Road, read with market context.</h2>
      </div>
      <div className="intel-grid">
        {property.intelligence.map(([label, value, note], index) => (
          <motion.div
            key={label}
            className="intel-card"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{note}</p>
            <i style={{ "--intel-level": `${62 + index * 8}%` }} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ConciergeInquiry({ property }) {
  return (
    <section id="private-showing" className="concierge-inquiry">
      <div>
        <span>Private Advisory</span>
        <h2>Request a private showing.</h2>
        <p>
          A discreet concierge conversation for qualified buyers seeking access,
          context, and a private read on {property.address}.
        </p>
      </div>
      <div className="concierge-actions">
        <input aria-label="Name" placeholder="Name" />
        <input aria-label="Phone or email" placeholder="Phone or email" />
        <MagneticAnchor
          href={messageUrl(`Hi Yairo, I would like to request a private showing for ${property.address}.`)}
          strength={0.18}
        >
          Request Private Showing
        </MagneticAnchor>
      </div>
    </section>
  );
}

function LuxuryMap({ listings, activeListing, onActivate }) {
  const mapUrl = googleMapsEmbedUrl(activeListing);

  return (
    <aside id="listings-map" className="luxury-map" aria-label="Luxury Miami property map">
      <div className="map-canvas">
        <iframe
          key={activeListing.id}
          src={mapUrl}
          title={`${activeListing.title} satellite map`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="map-satellite-shade" />
        <div className="map-active-pin" aria-hidden="true"><span /></div>
        <div className="map-market-count">{listings.length} Active Matches</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeListing.id}
            className="map-preview"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={activeListing.image} alt="" />
            <div>
              <span>{activeListing.location}</span>
              <strong>{activeListing.price}</strong>
              <p>{activeListing.title}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
}

function FeaturedPropertyCard({ property, index }) {
  return (
    <motion.article
      className="property-card"
      initial={{ opacity: 0, y: 54 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.95, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="property-media">
        <img src={property.image} alt={`${property.title} at ${property.address}`} loading="lazy" />
        <span className="property-status">{property.status}</span>
      </div>
      <div className="property-content">
        <span className="property-location">{property.city} / {property.neighborhood}</span>
        <div className="property-title-row">
          <h3>{property.title}</h3>
          <strong>{property.price}</strong>
        </div>
        <p className="property-address">{property.address}</p>
        <div className="property-stats">
          <span>{property.beds} Beds</span>
          <span>{property.baths} Baths</span>
          <span>{property.sqft}</span>
        </div>
        <p>{property.description}</p>
      </div>
    </motion.article>
  );
}

function MagneticAnchor({ children, className = "", strength = 0.22, ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 320, damping: 26, mass: 0.28 });
  const springY = useSpring(y, { stiffness: 320, damping: 26, mass: 0.28 });

  const handlePointerMove = (event) => {
    const element = ref.current;
    if (!element || event.pointerType === "touch") return;

    const rect = element.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    x.set(offsetX * strength);
    y.set(offsetY * strength);
  };

  const resetPosition = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.a>
  );
}

function CustomCursor() {
  const reduceMotion = useReducedMotion();
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const dotX = useSpring(cursorX, { stiffness: 1200, damping: 54, mass: 0.12 });
  const dotY = useSpring(cursorY, { stiffness: 1200, damping: 54, mass: 0.12 });
  const ringX = useSpring(cursorX, { stiffness: 520, damping: 38, mass: 0.22 });
  const ringY = useSpring(cursorY, { stiffness: 520, damping: 38, mass: 0.22 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const hoverRef = useRef(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    const finePointerQuery = window.matchMedia("(pointer: fine)");
    const updatePointer = () => setIsFinePointer(finePointerQuery.matches);
    updatePointer();
    finePointerQuery.addEventListener("change", updatePointer);

    return () => finePointerQuery.removeEventListener("change", updatePointer);
  }, []);

  useEffect(() => {
    if (!isFinePointer || reduceMotion) return undefined;

    const interactiveSelector = "a, button, input, textarea, select, [role='button']";

    const handlePointerMove = (event) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }
      const hovering = Boolean(event.target.closest(interactiveSelector));
      if (hovering !== hoverRef.current) {
        hoverRef.current = hovering;
        setIsHovering(hovering);
      }
    };

    const handlePointerLeave = () => {
      visibleRef.current = false;
      hoverRef.current = false;
      setIsVisible(false);
      setIsHovering(false);
    };
    const handlePointerDown = () => document.documentElement.classList.add("is-cursor-pressed");
    const handlePointerUp = () => document.documentElement.classList.remove("is-cursor-pressed");

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handlePointerLeave);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    document.documentElement.classList.add("has-luxury-cursor");

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.documentElement.classList.remove("has-luxury-cursor", "is-cursor-pressed");
    };
  }, [cursorX, cursorY, isFinePointer, reduceMotion]);

  if (!isFinePointer || reduceMotion) return null;

  return (
    <>
      <motion.div
        className="luxury-cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{
          opacity: isVisible ? (isHovering ? 1 : 0.42) : 0,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="luxury-cursor-dot"
        style={{ x: dotX, y: dotY }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isHovering ? 0.72 : 1,
        }}
        transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </>
  );
}
