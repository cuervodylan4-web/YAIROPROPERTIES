import { SITE_URL } from "./seo.js";

export const LOCALES = ["en", "es"];
export const DEFAULT_LOCALE = "en";

/** hreflang code for each locale. Miami's Spanish audience is US-based. */
export const HREFLANG = { en: "en-US", es: "es-US" };

/** `/listings` in English lives at `/es/listings` in Spanish. */
export function localizedPath(path = "/", locale = DEFAULT_LOCALE) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? "/es" : `/es${clean}`;
}

/** Strips the locale prefix so a page can find its counterpart. */
export function neutralPath(path = "/") {
  if (path === "/es") return "/";
  return path.startsWith("/es/") ? path.slice(3) : path;
}

/**
 * Reciprocal hreflang for one page, in the shape Next's metadata expects.
 * Every locale points at every other one, plus x-default, or Google ignores
 * the annotation entirely.
 */
export function alternatesFor(path = "/", locale = DEFAULT_LOCALE) {
  const base = neutralPath(path);
  const languages = {};
  for (const code of LOCALES) {
    languages[HREFLANG[code]] = new URL(localizedPath(base, code), SITE_URL).toString();
  }
  languages["x-default"] = new URL(base, SITE_URL).toString();
  return {
    canonical: localizedPath(base, locale),
    languages,
  };
}

const DICTIONARY = {
  en: {
    navHome: "Home",
    navListings: "Listings",
    navJournal: "Journal",
    navAction: "Private Access",
    heroLine1: "Luxury Homes in Miami",
    heroLine2: "& South Florida",
    heroSubline:
      "Your home, my priority. Residential guidance for buyers and sellers across Miami, Fort Lauderdale, and Palm Beach.",
    heroCta: "Let's Connect",
    switchTo: "Ver en español",
    switchLabel: "ES",
    listingsTitle: "Luxury Listings in South Florida",
    listingsIntro:
      "Active homes, condos, and waterfront residences across Miami, Broward, and Palm Beach.",
  },
  es: {
    navHome: "Inicio",
    navListings: "Propiedades",
    navJournal: "Revista",
    navAction: "Acceso Privado",
    heroLine1: "Casas de Lujo en Miami",
    heroLine2: "y el Sur de Florida",
    heroSubline:
      "Tu casa, mi prioridad. Asesoría inmobiliaria para compradores y vendedores en Miami, Fort Lauderdale y Palm Beach.",
    heroCta: "Hablemos",
    switchTo: "View in English",
    switchLabel: "EN",
    listingsTitle: "Propiedades de Lujo en el Sur de Florida",
    listingsIntro:
      "Casas, condominios y residencias frente al mar en Miami, Broward y Palm Beach.",
  },
};

export function t(locale, key) {
  const table = DICTIONARY[locale] || DICTIONARY[DEFAULT_LOCALE];
  return table[key] ?? DICTIONARY[DEFAULT_LOCALE][key] ?? key;
}

/** Page metadata (title/description) per locale, for the routes that have both. */
export const PAGE_META = {
  en: {
    home: {
      title: "South Florida Real Estate With Clarity",
      description:
        "Yairo Properties offers residential guidance across Miami and South Florida for buyers, sellers, and private real estate opportunities.",
    },
    listings: {
      title: "Luxury Listings in South Florida",
      description:
        "Browse active homes, condos, and waterfront residences for sale across Miami, Broward, and Palm Beach.",
    },
  },
  es: {
    home: {
      title: "Bienes Raíces en el Sur de Florida",
      description:
        "Yairo Properties ofrece asesoría inmobiliaria en Miami y el sur de Florida para compradores, vendedores y oportunidades de inversión.",
    },
    listings: {
      title: "Propiedades de Lujo en el Sur de Florida",
      description:
        "Explora casas, condominios y residencias frente al mar en venta en Miami, Broward y Palm Beach.",
    },
  },
};
