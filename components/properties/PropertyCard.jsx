"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { reveal } from "../../animations/motionPresets.js";
import { formatPrice } from "../../lib/listings.js";
import { seoPropertyPath } from "../../lib/seo.js";

export function PropertyCard({ listing, priority = false }) {
  return (
    <motion.article className="property-card-shell" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <Link href={seoPropertyPath(listing)} aria-label={`View ${listing.title}`}>
        <figure>
          <img src={listing.heroImage || listing.media?.[0]} alt={listing.title} loading={priority ? "eager" : "lazy"} />
          <span>{listing.status}</span>
        </figure>
        <div>
          <p>{listing.city} / {listing.neighborhood}</p>
          <h3>{listing.title}</h3>
          <strong>{listing.displayPrice || formatPrice(listing.price)}</strong>
          <small>{listing.beds} Beds / {listing.baths} Baths / {listing.displaySqft || `${listing.sqft} SF`}</small>
        </div>
      </Link>
    </motion.article>
  );
}
