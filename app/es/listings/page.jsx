import { ListingsPage } from "../../../src/YairoHero.jsx";
import { PAGE_META, alternatesFor } from "../../../lib/i18n.js";

export const metadata = {
  title: PAGE_META.es.listings.title,
  description: PAGE_META.es.listings.description,
  alternates: alternatesFor("/listings", "es"),
};

export default function SpanishListingsRoute() {
  return <ListingsPage locale="es" />;
}
