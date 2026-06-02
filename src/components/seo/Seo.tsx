/**
 * Per-page SEO metadata.
 *
 * React 19 hoists `<title>`, `<meta>`, `<link>`, `<script type=application/ld+json>`
 * placed anywhere in a render tree directly into `<head>` — no helmet library
 * needed. This component is a thin convenience wrapper that ensures every
 * crawlable page emits a consistent set of tags.
 *
 * For server-side rendering / crawler-without-JS, the defaults in index.html
 * still apply — this just overrides them on the client.
 *
 * Reference: https://react.dev/reference/react-dom/components/title
 */
import type { ReactNode } from 'react'

export const SITE_ORIGIN = 'https://bowled.store'
export const SITE_NAME = 'Bowled'
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/hero-spread.jpg`

interface SeoProps {
  /** Browser tab + Google SERP title. Keep <= 60 chars. */
  title: string
  /** SERP meta description. Keep 140–160 chars for ideal display. */
  description: string
  /** Path-only (e.g. "/hostel-food-chennai") — full URL is built from SITE_ORIGIN. */
  path: string
  /** Comma-separated keywords. Soft signal nowadays but cheap to include. */
  keywords?: string
  /** OG image override; defaults to the hero spread. */
  ogImage?: string
  /** "article" for content pages, "website" for hubs. Default: website. */
  ogType?: 'website' | 'article'
  /** Structured data (one or many). Rendered as JSON-LD. */
  schema?: object | object[]
  /** Set `noindex` for behind-auth or duplicate pages. */
  noindex?: boolean
  /** Extra head tags via children if needed. */
  children?: ReactNode
}

export function Seo({
  title,
  description,
  path,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  schema,
  noindex,
  children,
}: SeoProps) {
  const canonical = `${SITE_ORIGIN}${path}`
  const schemas = Array.isArray(schema) ? schema : schema ? [schema] : []

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Geo signals — keep specific to Chennai operations */}
      <meta name="geo.region" content="IN-TN" />
      <meta name="geo.placename" content="Chennai" />
      <meta name="geo.position" content="13.0827;80.2707" />
      <meta name="ICBM" content="13.0827, 80.2707" />

      {/* Structured data */}
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}

      {children}
    </>
  )
}

/* ---------- Schema.org builders ---------- */

/**
 * LocalBusiness / FoodEstablishment — the canonical business identity.
 * Drop on the Home page. Google uses this for the knowledge panel + rich results.
 */
export function localBusinessSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'FoodEstablishment'],
    '@id': `${SITE_ORIGIN}/#business`,
    name: SITE_NAME,
    alternateName: 'Bowled by Sree Krishna Catering',
    description:
      'Bowled is a daily home-style meal subscription for students, hostels, PGs and working professionals in Chennai. A venture by Sree Krishna Catering, feeding Chennai since 2006.',
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/logo.webp`,
    image: DEFAULT_OG_IMAGE,
    foundingDate: '2025-05-05',
    parentOrganization: {
      '@type': 'Organization',
      name: 'Sree Krishna Catering',
      foundingDate: '2006',
    },
    telephone: '+91-9360113501',
    priceRange: '₹63–₹89 per meal',
    servesCuisine: ['South Indian', 'Tamil', 'Home-style Indian'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Chennai',
      addressRegion: 'Tamil Nadu',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 13.0827,
      longitude: 80.2707,
    },
    areaServed: [
      { '@type': 'City', name: 'Chennai' },
      { '@type': 'Place', name: 'Adyar' },
      { '@type': 'Place', name: 'Velachery' },
      { '@type': 'Place', name: 'T. Nagar' },
      { '@type': 'Place', name: 'OMR (Thoraipakkam)' },
      { '@type': 'Place', name: 'Anna Nagar' },
      { '@type': 'Place', name: 'Tambaram' },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '07:00',
        closes: '21:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '300',
      bestRating: '5',
      worstRating: '1',
    },
    sameAs: [
      'https://www.instagram.com/bowled.chennai',
      'https://twitter.com/bowled_chennai',
    ],
  }
}

/**
 * Restaurant subtype — emphasise food service offering on landing pages.
 * Includes menu link so Google can pull "Has Menu" rich result.
 */
export function restaurantSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${SITE_ORIGIN}/#restaurant`,
    name: SITE_NAME,
    servesCuisine: ['South Indian', 'Tamil', 'Home-style Indian'],
    acceptsReservations: false,
    hasMenu: `${SITE_ORIGIN}/#menu`,
    priceRange: '₹63–₹89',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Chennai',
      addressRegion: 'Tamil Nadu',
      addressCountry: 'IN',
    },
    image: DEFAULT_OG_IMAGE,
    url: SITE_ORIGIN,
  }
}

export interface FaqItem {
  q: string
  a: string
}

/** Per-page FAQ schema — fuels Google's "People also ask" + featured snippets. */
export function faqPageSchema(items: FaqItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.a,
      },
    })),
  }
}

/** Per-page breadcrumb schema — helps Google show breadcrumb in SERP. */
export function breadcrumbSchema(trail: Array<{ name: string; path: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${SITE_ORIGIN}${t.path}`,
    })),
  }
}
