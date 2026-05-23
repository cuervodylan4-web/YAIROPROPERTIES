import { JournalPage } from "../../src/YairoHero.jsx";

export const metadata = {
  title: "Real Estate Journal",
  description:
    "Editorial South Florida real estate perspective from Yairo Rincon Properties.",
  alternates: {
    canonical: "/journal",
  },
};

export default function JournalRoute() {
  return <JournalPage />;
}
