import { useEffect } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  faqs?: FaqItem[];
}

const DEFAULT_TITLE = 'Sell or Buy Any Business, Anywhere — smbx.ai';
const DEFAULT_DESC = 'AI deal advisory from valuation to close. Sell, buy, raise capital, or integrate. Start free.';

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

export default function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = meta.title;

    const descEl = upsertMeta('description', meta.description);
    const ogTitleEl = upsertMeta('og:title', meta.ogTitle || meta.title, 'property');
    const ogDescEl = upsertMeta('og:description', meta.ogDescription || meta.description, 'property');

    let canonicalEl: HTMLLinkElement | null = null;
    if (meta.canonical) {
      canonicalEl = upsertLink('canonical', meta.canonical);
    }

    // JSON-LD for FAQ schema
    let jsonLdScript: HTMLScriptElement | null = null;
    if (meta.faqs && meta.faqs.length > 0) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.type = 'application/ld+json';
      jsonLdScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: meta.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
      document.head.appendChild(jsonLdScript);
    }

    return () => {
      document.title = prevTitle;
      descEl.content = DEFAULT_DESC;
      ogTitleEl.content = DEFAULT_TITLE;
      ogDescEl.content = DEFAULT_DESC;
      if (canonicalEl) canonicalEl.remove();
      if (jsonLdScript) jsonLdScript.remove();
    };
  }, [meta.title, meta.description, meta.canonical, meta.ogTitle, meta.ogDescription, meta.faqs]);
}
