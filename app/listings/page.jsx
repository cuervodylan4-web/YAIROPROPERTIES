import { ListingsPage } from "../../src/YairoHero.jsx";

export const metadata = {
  title: "Luxury Listings in South Florida",
  description: "Explore curated homes and condos for sale across South Florida. Browse active listings and request private guidance with Yairo Properties.",
  alternates: {
    canonical: "/listings",
  },
};

export default function ListingsRoute() {
  return <ListingsPage />;
}
