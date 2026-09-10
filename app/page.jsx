import { YairoHero } from "../src/YairoHero.jsx";
import { alternatesFor } from "../lib/i18n.js";

export const metadata = {
  title: "Homes for Sale in Miami & Fort Lauderdale",
  description:
    "Search homes, condos, and waterfront properties for sale in Miami, Fort Lauderdale, and Palm Beach. Browse active MLS listings with Yairo Properties.",
  alternates: alternatesFor("/", "en"),
};

export default function HomePage() {
  return <YairoHero />;
}
