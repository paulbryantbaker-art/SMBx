import { useEffect } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  /** Absolute URL. */
  url: string;
}

interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  /** Absolute URL to an OG/Twitter card image */
  ogImage?: string;
  faqs?: FaqItem[];
  /** BreadcrumbList entries — ordered root → current. */
  breadcrumbs?: BreadcrumbItem[];
}

const DEFAULT_TITLE = 'Sell or Buy Any Business, Anywhere — smbx.ai';
const DEFAULT_DESC = 'AI deal advisory from valuation to close. Sell, buy, raise capital, or integrate. Start free.';
const DEFAULT_OG_IMAGE = 'https://smbx.ai/og-default.png';

function upsertMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
  return el;
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  return el;
}

function buildJsonLd(meta: PageMeta): object | null {
  const blocks: object[] = [];

  if (meta.faqs && meta.faqs.length > 0) {
    blocks.push({
      '@type': 'FAQPage',
      mainEntity: meta.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
  }

  if (meta.breadcrumbs && meta.breadcrumbs.length > 0) {
    blocks.push({
      '@type': 'BreadcrumbList',
      itemListElement: meta.breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: b.url,
      })),
    });
  }

  if (blocks.length === 0) return null;
  if (blocks.length === 1) return { '@context': 'https://schema.org', ...(blocks[0] as object) };
  return {
    '@context': 'https://schema.org',
    '@graph': blocks,
  };
}

export default function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = meta.title;

    const descEl = upsertMeta('description', meta.description);
    const ogTitleEl = upsertMeta('og:title', meta.ogTitle || meta.title, 'property');
    const ogDescEl = upsertMeta('og:description', meta.ogDescription || meta.description, 'property');
    const ogImageEl = upsertMeta('og:image', meta.ogImage || DEFAULT_OG_IMAGE, 'property');
    const ogTypeEl = upsertMeta('og:type', 'website', 'property');
    const twCardEl = upsertMeta('twitter:card', 'summary_large_image');
    const twTitleEl = upsertMeta('twitter:title', meta.ogTitle || meta.title);
    const twDescEl = upsertMeta('twitter:description', meta.ogDescription || meta.description);
    const twImageEl = upsertMeta('twitter:image', meta.ogImage || DEFAULT_OG_IMAGE);

    let canonicalEl: HTMLLinkElement | null = null;
    if (meta.canonical) {
      canonicalEl = upsertLink('canonical', meta.canonical);
      upsertMeta('og:url', meta.canonical, 'property');
    }

    // JSON-LD schema — FAQPage + BreadcrumbList, as a @graph when both present
    let jsonLdScript: HTMLScriptElement | null = null;
    const jsonLd = buildJsonLd(meta);
    if (jsonLd) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.type = 'application/ld+json';
      jsonLdScript.setAttribute('data-source', 'usePageMeta');
      jsonLdScript.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(jsonLdScript);
    }

    return () => {
      document.title = prevTitle;
      descEl.content = DEFAULT_DESC;
      ogTitleEl.content = DEFAULT_TITLE;
      ogDescEl.content = DEFAULT_DESC;
      ogImageEl.content = DEFAULT_OG_IMAGE;
      ogTypeEl.content = 'website';
      twCardEl.content = 'summary_large_image';
      twTitleEl.content = DEFAULT_TITLE;
      twDescEl.content = DEFAULT_DESC;
      twImageEl.content = DEFAULT_OG_IMAGE;
      if (canonicalEl) canonicalEl.remove();
      if (jsonLdScript) jsonLdScript.remove();
    };
  }, [meta.title, meta.description, meta.canonical, meta.ogTitle, meta.ogDescription, meta.ogImage, meta.faqs, meta.breadcrumbs]);
}
