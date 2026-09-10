import { YairoHero } from "../../src/YairoHero.jsx";
import { PAGE_META, alternatesFor } from "../../lib/i18n.js";

export const metadata = {
  title: PAGE_META.es.home.title,
  description: PAGE_META.es.home.description,
  alternates: alternatesFor("/", "es"),
};

export default function SpanishHomePage() {
  return <YairoHero locale="es" />;
}
