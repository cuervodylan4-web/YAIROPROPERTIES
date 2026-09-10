import { YairoHero } from "../src/YairoHero.jsx";
import { alternatesFor } from "../lib/i18n.js";

export const metadata = {
  title: "South Florida Real Estate With Clarity",
  description:
    "Yairo Properties offers residential guidance across Miami and South Florida for buyers, sellers, and private real estate opportunities.",
  alternates: alternatesFor("/", "en"),
};

export default function HomePage() {
  return <YairoHero />;
}
