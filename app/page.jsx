import { YairoHero } from "../src/YairoHero.jsx";

export const metadata = {
  title: "South Florida Real Estate With Clarity",
  description:
    "Yairo Properties offers residential guidance across Miami and South Florida for buyers, sellers, and private real estate opportunities.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <YairoHero />;
}
