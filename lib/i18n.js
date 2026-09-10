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
    heroLine1: "Homes for Sale in Miami",
    heroLine2: "& South Florida",
    heroSubline:
      "Your home, my priority. Search active MLS listings and get buyer and seller guidance across Miami, Fort Lauderdale, Palm Beach, and the Treasure Coast.",
    heroCta: "Let's Connect",
    switchTo: "Ver en español",
    switchLabel: "ES",
    listingsTitle: "Homes for Sale in South Florida",
    listingsIntro:
      "Active homes, condos, and waterfront residences for sale across Miami, Broward, and Palm Beach.",
    h2Experience: "Buy, Lease, or Sell in South Florida",
    h2Search: "Search Homes for Sale in South Florida",
    h2Featured: "Featured South Florida Homes for Sale",
    h2Guidance: "Real estate guidance in Miami, Fort Lauderdale, and Palm Beach.",
    h2Worth: "What Is Your Home Worth?",
    h3Valuation: "Request a free home valuation.",
  },
  es: {
    navHome: "Inicio",
    navListings: "Propiedades",
    navJournal: "Revista",
    navAction: "Acceso Privado",
    heroLine1: "Casas en Venta en Miami",
    heroLine2: "y el Sur de Florida",
    heroSubline:
      "Tu casa, mi prioridad. Consulta el inventario activo del MLS y recibe asesoría para comprar o vender en Miami, Fort Lauderdale, Palm Beach y la Treasure Coast.",
    heroCta: "Hablemos",
    switchTo: "View in English",
    switchLabel: "EN",
    listingsTitle: "Casas en Venta en el Sur de Florida",
    listingsIntro:
      "Casas, condominios y residencias frente al mar en venta en Miami, Broward y Palm Beach.",
    h2Experience: "Compra, Alquila o Vende en el Sur de Florida",
    h2Search: "Busca Casas en Venta en el Sur de Florida",
    h2Featured: "Casas Destacadas en Venta en el Sur de Florida",
    h2Guidance: "Asesoría inmobiliaria en Miami, Fort Lauderdale y Palm Beach.",
    h2Worth: "¿Cuánto Vale Tu Casa?",
    h3Valuation: "Solicita una valoración gratuita.",
  },
};

/**
 * Literal-for-literal overrides for copy that lives inside static data objects
 * rather than as JSX. Lets those strings localize without restructuring the
 * 3,700-line hero component. Unknown strings pass through unchanged.
 */
const UI_ES = {
  "Purchase Search": "Búsqueda de Compra",
  "Property Lease Search": "Búsqueda de Alquiler",
  "What Is My Home Worth?": "¿Cuánto Vale Mi Casa?",
  "Buy With Clarity": "Compra con Claridad",
  "Acquisition Search": "Búsqueda de Compra",
  "Seasonal Residence Search": "Búsqueda de Temporada",
  "Free Home Valuation": "Valoración Gratuita",
  "Search Residences": "Buscar Propiedades",
  "Search Leases": "Buscar Alquileres",
  "Request Free Valuation": "Solicitar Valoración Gratuita",
  "Waterfront estates, architectural homes, and established neighborhoods.":
    "Propiedades frente al mar, casas de autor y vecindarios consolidados.",
  "Furnished residences, waterfront leases, and seasonal homes.":
    "Residencias amuebladas, alquileres frente al mar y casas de temporada.",
  "Get a clear estimate of your home's value with guidance before you decide what comes next.":
    "Obtén una estimación clara del valor de tu casa, con asesoría antes de decidir tu próximo paso.",
  "Address Search": "Búsqueda por Dirección",
  "Waterfront": "Frente al Mar",
  "New Construction": "Obra Nueva",
};

/** Translates a literal string for the given locale, or returns it unchanged. */
export function tr(locale, value) {
  if (locale !== "es") return value;
  return UI_ES[value] ?? value;
}

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
      title: "Casas en Venta en Miami y Fort Lauderdale",
      description:
        "Busca casas, condominios y propiedades frente al mar en venta en Miami, Fort Lauderdale y Palm Beach. Consulta el inventario activo del MLS con Yairo Properties.",
    },
    listings: {
      title: "Casas en Venta en el Sur de Florida",
      description:
        "Explora casas, condominios y residencias frente al mar en venta en Miami, Broward, Palm Beach y la Treasure Coast.",
    },
  },
};
