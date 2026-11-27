import type {Metadata} from 'next';
import {pages} from '../app/content';
import {company} from './company';

export function canonicalUrl(path: string): string {
  return new URL(path, company.url).href;
}

export function pageMetadata(path: string): Metadata {
  const page = pages[path];
  if (!page) throw new Error(`Unknown public page: ${path}`);
  const title = path === '/' ? page.title : `${page.title} | ${company.name}`;
  const image = {url: canonicalUrl(company.logo), width: 2158, height: 729, alt: `Logo ${company.name}`};
  return {
    title,
    description: page.description,
    alternates: {canonical: canonicalUrl(path)},
    robots: {index: page.indexable !== false, follow: true},
    openGraph: {
      type: 'website', locale: 'fr_CH', siteName: company.name,
      url: canonicalUrl(path), title, description: page.description, images: [image],
    },
    twitter: {card: 'summary_large_image', title, description: page.description, images: [image]},
  };
}

export function businessStructuredData() {
  const businessId = `${company.url}/#organization`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HousePainter', '@id': businessId,
        name: company.name, legalName: company.legalName,
        alternateName: 'Renovim', url: canonicalUrl('/'),
        description: 'Entreprise familiale de peinture, plâtrerie et rénovation en Suisse romande, basée au Mont-sur-Lausanne. Interventions chez les clients ; adresse administrative sans accueil du public.',
        identifier: {'@type': 'PropertyValue', propertyID: 'IDE suisse', value: company.uid, url: company.registryUrl},
        logo: {'@type': 'ImageObject', url: canonicalUrl(company.logo), width: 2158, height: 729},
        telephone: company.phone, email: company.email,
        address: {
          '@type': 'PostalAddress', streetAddress: company.street,
          postalCode: company.postalCode, addressLocality: company.locality,
          addressRegion: company.region, addressCountry: 'CH',
        },
        areaServed: company.areaServed,
      },
      {
        '@type': 'WebSite', '@id': `${company.url}/#website`,
        url: canonicalUrl('/'), name: company.name, alternateName: 'Renovim',
        inLanguage: 'fr-CH', publisher: {'@id': businessId},
      },
    ],
  };
}
