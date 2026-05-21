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
    mlsId: "A11411592",
    source: "supplemental",
    sourceUrl: "https://www.zillow.com/homedetails/1054-Coral-Club-Dr-1054-Coral-Springs-FL-33071/66124285_zpid/",
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
    yearBuilt: 1988,
    hoa: "$427 / monthly",
    architecturalStyle: "Condominium",
    propertyType: "Condominium",
    media: listingMedia.coralClub,
    heroImage: listingMedia.coralClub[0],
    gallery: listingMedia.coralClub,
    map: { lat: 26.2704, lng: -80.2572, x: 50, y: 28 },
    pin: { x: 50, y: 28 },
    amenities: ["Community pool", "Clubhouse", "Tennis court", "Coral Springs location", "Condominium community"],
    description:
      "Closed Coral Springs condominium residence with two bedrooms, two bathrooms, 1,044 square feet, and community amenities.",
    summary:
      "Closed Coral Springs condominium residence with two bedrooms, two bathrooms, 1,044 square feet, and community amenities.",
    narrative:
      "A Coral Springs condominium residence recorded as closed at $256,000. The home sits within the Coral Club community and is best reviewed through comparable sales, ownership costs, and nearby active opportunities.",
    marketPosition: "Condominium / Coral Springs",
    specs: [
      ["Bedrooms", "2"],
      ["Bathrooms", "2"],
      ["Square Footage", "1,044 SF"],
      ["Waterfront", "Verify"],
      ["Year Built", "1988"],
      ["Parking", "Available by request"],
      ["HOA", "$427 / monthly"],
      ["Architecture", "Condominium"],
    ],
    intelligence: [
      ["Market Status", "Closed", "Supplemental record added for direct address lookup."],
      ["Sale Record", "$256,000", "Recorded as a closed condominium sale for Coral Springs market review."],
      ["Property Type", "Condominium", "Two bedrooms, two bathrooms, and 1,044 square feet."],
      ["Year Built", "1988", "Condominium community context should be reviewed with HOA documents."],
      ["HOA", "$427 / monthly", "Monthly association cost shown for advisory review."],
      ["MLS Reference", "A11411592", "MiamiMLS reference retained for direct property search and advisory review."],
    ],
  },
];

export const listingIndex = new Map(listings.map((listing) => [listing.slug, listing]));
export const supplementalListingIndex = new Map(supplementalListings.map((listing) => [listing.slug, listing]));
