import { notFound } from "next/navigation";
import { ListingsPage } from "../../../../src/YairoHero.jsx";
import { SEO_CITY_PAGES, SITE_NAME, titleCaseFromSlug } from "../../../../lib/seo.js";
import { alternatesFor } from "../../../../lib/i18n.js";
import { cityInventoryCount } from "../../../../lib/listings.js";

export const revalidate = 900;

export function generateStaticParams() {
  return SEO_CITY_PAGES.map((city) => ({ city }));
}

export async function generateMetadata({ params }) {
  const { city } = await params;
  if (!SEO_CITY_PAGES.includes(city)) return {};

  const cityName = titleCaseFromSlug(city);
  const inventory = await cityInventoryCount(cityName);
  const title = `Casas en Venta en ${cityName}`;
  const description = `Explora casas y condominios en venta en ${cityName}, Florida. Consulta el inventario activo y solicita una visita privada con ${SITE_NAME}.`;

  return {
    title,
    description,
    ...(inventory === 0 ? { robots: { index: false, follow: true } } : {}),
    alternates: alternatesFor(`/listings/${city}`, "es"),
    openGraph: { type: "website", title: `${title} | ${SITE_NAME}`, description },
  };
}

export default async function SpanishCityListingsRoute({ params }) {
  const { city } = await params;
  if (!SEO_CITY_PAGES.includes(city)) notFound();

  const cityName = titleCaseFromSlug(city);

  return (
    <ListingsPage
      locale="es"
      initialCity={cityName}
      cityTitle={`Casas en Venta en ${cityName}`}
      cityIntro={`Explora casas y condominios en venta en ${cityName}, Florida. Revisa el inventario activo, compara el contexto de mercado y solicita asesoría privada con Yairo Properties.`}
    />
  );
}
