export const listingMedia = {
  northBay: [
    "/videos/optimized/miami-hero-02-poster.jpg",
    "/videos/optimized/miami-hero-04-poster.jpg",
    "/videos/optimized/miami-hero-03-poster.jpg",
    "/videos/optimized/miami-hero-01-poster.jpg",
  ],
  coralClub: [
    "/videos/optimized/miami-hero-03-poster.jpg",
    "/videos/optimized/miami-hero-02-poster.jpg",
    "/videos/optimized/miami-hero-01-poster.jpg",
  ],
};

export const listings = [
  {
    id: "north-bay-estate",
    slug: "north-bay-estate",
    mlsId: "YR-NBR-001",
    source: "curated",
    status: "For Sale",
    title: "North Bay Road Estate",
    address: "5940 North Bay Road",
    city: "Miami Beach",
    neighborhood: "North Bay Road",
    location: "Miami Beach / North Bay Road",
    price: 18900000,
    displayPrice: "$18.9M",
    beds: 7,
    baths: 9,
    sqft: 9420,
    displaySqft: "9,420 SF",
    waterfront: true,
    yearBuilt: 2021,
    parking: "6 Cars",
    hoa: "None",
    architecturalStyle: "Tropical Modern",
    media: listingMedia.northBay,
    heroImage: listingMedia.northBay[0],
    map: { lat: 25.834, lng: -80.135, x: 38, y: 28 },
    description:
      "Waterfront architecture with long bay views, private arrival, and an evening-light composition.",
    narrative:
      "Positioned along one of Miami Beach's most discreet waterfront corridors, this North Bay Road residence is composed around privacy, horizon, and a quiet sequence of indoor-outdoor rooms.",
    amenities: ["Waterfront", "Private Dock", "Gallery Scale", "Motor Court", "Outdoor Kitchen"],
    marketPosition: "Waterfront estate / Private Miami Beach advisory",
  },
];

export const supplementalListings = [
  {
    id: "1054-coral-club-1054-coral-springs-fl-33071",
    slug: "1054-coral-club-1054-coral-springs-fl-33071",
    listingKey: "1054-coral-club-1054-coral-springs-fl-33071",
    mlsId: "SUP-CORAL-1054",
    source: "supplemental",
    status: "Closed",
    title: "1054 Coral Club #1054",
    address: "1054 Coral Club Dr #1054, Coral Springs, FL 33071",
    streetAddress: "1054 Coral Club Dr #1054",
    city: "Coral Springs",
    neighborhood: "Coral Club",
    location: "Coral Springs / Coral Club",
    price: 256000,
    displayPrice: "$256K",
    beds: 2,
    baths: 2,
    sqft: 1044,
    displaySqft: "1,044 SF",
    waterfront: false,
    daysOnMarket: 0,
    yearBuilt: null,
    hoa: "Available by request",
    architecturalStyle: "Condominium",
    propertyType: "Condominium",
    media: listingMedia.coralClub,
    heroImage: listingMedia.coralClub[0],
    gallery: listingMedia.coralClub,
    map: { lat: 26.2704, lng: -80.2572, x: 50, y: 28 },
    pin: { x: 50, y: 28 },
    description:
      "Closed Coral Springs condominium residence with two bedrooms, two bathrooms, and 1,044 square feet.",
    summary:
      "Closed Coral Springs condominium residence with two bedrooms, two bathrooms, and 1,044 square feet.",
    narrative:
      "A Coral Springs condominium residence recorded as closed. Yairo Properties can review comparable sales, current value, and nearby active opportunities by request.",
    marketPosition: "Condominium / Coral Springs",
    specs: [
      ["Bedrooms", "2"],
      ["Bathrooms", "2"],
      ["Square Footage", "1,044 SF"],
      ["Waterfront", "Verify"],
      ["Year Built", "Available by request"],
      ["Parking", "Available by request"],
      ["HOA", "Available by request"],
      ["Architecture", "Condominium"],
    ],
    intelligence: [
      ["Market Status", "Closed", "Supplemental record added for direct address lookup."],
      ["Property Type", "Condominium", "Reviewed through location, condition, and comparable market context."],
      ["MLS Reference", "SUP-CORAL-1054", "Record retained for direct property search and advisory review."],
    ],
  },
];

export const listingIndex = new Map(listings.map((listing) => [listing.slug, listing]));
export const supplementalListingIndex = new Map(supplementalListings.map((listing) => [listing.slug, listing]));
