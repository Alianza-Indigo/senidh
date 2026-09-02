import type { Metadata } from "next";
import { and, asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { db } from "@/db";
import { contentItems } from "@/db/schema";
import { getSettings } from "@/lib/settings";

const config = {
  donaciones: { type: null, title: "Donaciones y transparencia", description: "La confianza se construye explicando para qué se reciben recursos y cómo fortalecen la labor institucional." },
  reconocimientos: { type: "reconocimiento", title: "Reconocimientos", description: "Distinciones y expresiones de reconocimiento al trabajo y la colaboración institucional." },
  convenios: { type: "convenio", title: "Convenios institucionales", description: "Instrumentos de colaboración para fortalecer capacidades y ampliar nuestra labor." },
  eventos: { type: "evento", title: "Eventos y actividades", description: "Jornadas, encuentros y acciones de formación de SENIDH." },
  oficios: { type: "oficio", title: "Oficios y documentos públicos", description: "Comunicaciones y documentos institucionales disponibles para consulta." }
} as const;

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const slug = (await params).section as keyof typeof config;
  const section = config[slug];
  return section ? { title: section.title, description: section.description, alternates: { canonical: `/${slug}` } } : {};
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const slug = (await params).section as keyof typeof config;
  const section = config[slug];
  if (!section) notFound();
  if (!section.type) {
    const settings = await getSettings();
    return <><PageHero eyebrow="Transparencia" title={section.title} description={section.description}/><section className="section"><div className="container content-grid"><div><h2>Apoyo con propósito</h2><p>Las aportaciones permiten sostener actividades de observación, documentación, capacitación y vinculación.</p><div className="cards"><article><h3>Operación</h3><p>Traslados, materiales y herramientas para intervenciones documentadas.</p></article><article><h3>Formación</h3><p>Actualización y desarrollo de capacidades.</p></article><article><h3>Vinculación</h3><p>Acciones públicas y mecanismos de colaboración.</p></article></div></div><aside><h2>Transparencia institucional</h2><p>{settings.donation_transparency}</p></aside></div></section></>;
  }
  const items = await db.select().from(contentItems).where(and(eq(contentItems.itemType, section.type), eq(contentItems.isPublished, true))).orderBy(desc(contentItems.eventDate), asc(contentItems.sortOrder));
  return <><PageHero title={section.title} description={section.description}/><section className="section"><div className="container item-list">{items.map(item => { const fileHref = item.filePathname ? `/api/media/contenido/${item.id}` : item.fileUrl; return <article className="content-item" key={item.id}><time>{item.eventDate ? formatDate(item.eventDate) : section.title}</time><div><small>{item.subtitle}</small><h2>{item.title}</h2><p>{item.summary}</p>{fileHref && <a href={fileHref} target="_blank" rel="noreferrer">Consultar documento →</a>}</div></article>; })}{!items.length && <div className="empty"><h2>Próximamente</h2><p>Esta sección está preparada para publicar información institucional.</p></div>}</div></section></>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("es-MX", { timeZone: "UTC", dateStyle: "long" }).format(new Date(`${value}T00:00:00Z`)); }
