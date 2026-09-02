export type SEOContentInput = {
  title: string;
  contentType?: 'movie' | 'series' | 'documentary' | 'music' | 'show' | 'other';
  genre?: string;
  language?: string;
  year?: string;
  synopsis?: string;
  focusKeyword?: string;
  siteName?: string;
  canonicalUrl?: string;
  imageUrl?: string;
};

export type SEOMetadata = {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  ogTitle: string;
  ogDescription: string;
  ogType: 'website' | 'video.movie' | 'video.tv_show' | 'music.song';
  twitterCard: 'summary' | 'summary_large_image';
  jsonLd: Record<string, unknown>;
};

const clean = (value = '') => value.replace(/\s+/g, ' ').trim();

const truncate = (value: string, max: number) => {
  const text = clean(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1).replace(/\s+\S*$/, '');
  return `${cut}…`;
};

const slugify = (value: string) => clean(value)
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^\w\s-]/g, '')
  .replace(/[\s_-]+/g, '-')
  .replace(/^-+|-+$/g, '');

const typeLabel: Record<NonNullable<SEOContentInput['contentType']>, string> = {
  movie: 'Movie',
  series: 'Series',
  documentary: 'Documentary',
  music: 'Music',
  show: 'Show',
  other: 'Content',
};

export function generateSEOMetadata(input: SEOContentInput): SEOMetadata {
  const title = clean(input.title) || 'Untitled Content';
  const type = input.contentType || 'other';
  const label = typeLabel[type];
  const genre = clean(input.genre);
  const language = clean(input.language);
  const year = clean(input.year);
  const focus = clean(input.focusKeyword) || title;
  const siteName = clean(input.siteName) || 'StreamVista';
  const synopsis = clean(input.synopsis);

  const qualifiers = [genre, language, year].filter(Boolean).join(' · ');
  const seoTitle = truncate(
    `${title}${qualifiers ? ` | ${qualifiers}` : ''} | ${siteName}`,
    60,
  );

  const descriptionBase = synopsis || `${title} is a ${label.toLowerCase()}${genre ? ` in the ${genre} genre` : ''}${language ? ` in ${language}` : ''}. Discover details, story information and streaming updates on ${siteName}.`;
  const description = truncate(descriptionBase, 155);
  const keywords = Array.from(new Set([
    title,
    focus,
    genre,
    language,
    `${title} ${label.toLowerCase()}`,
    `${focus} streaming`,
    `${focus} OTT`,
  ].map(clean).filter(Boolean)));

  const canonicalUrl = clean(input.canonicalUrl) || `https://streamvista.in/${slugify(title)}`;
  const ogType = type === 'movie' || type === 'documentary' ? 'video.movie' : type === 'series' || type === 'show' ? 'video.tv_show' : type === 'music' ? 'music.song' : 'website';
  const jsonLdType = type === 'movie' || type === 'documentary' ? 'Movie' : type === 'series' || type === 'show' ? 'TVSeries' : type === 'music' ? 'MusicRecording' : 'CreativeWork';

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': jsonLdType,
    name: title,
    description,
    url: canonicalUrl,
    inLanguage: language || undefined,
    genre: genre || undefined,
    image: input.imageUrl || undefined,
  };

  return {
    title: seoTitle,
    description,
    keywords,
    canonicalUrl,
    ogTitle: seoTitle,
    ogDescription: description,
    ogType,
    twitterCard: input.imageUrl ? 'summary_large_image' : 'summary',
    jsonLd: Object.fromEntries(Object.entries(jsonLd).filter(([, value]) => value !== undefined)),
  };
}

export function applySEOMetadata(metadata: SEOMetadata): void {
  document.title = metadata.title;
  const setMeta = (selector: string, attribute: 'name' | 'property', value: string) => {
    let element = document.head.querySelector<HTMLMetaElement>(selector);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, selector.match(/\[([^=]+)=/)?.[1] || attribute,);
      document.head.appendChild(element);
    }
    element.setAttribute('content', value);
  };

  setMeta('meta[name="description"]', 'name', metadata.description);
  setMeta('meta[name="keywords"]', 'name', metadata.keywords.join(', '));
  setMeta('meta[property="og:title"]', 'property', metadata.ogTitle);
  setMeta('meta[property="og:description"]', 'property', metadata.ogDescription);
  setMeta('meta[property="og:type"]', 'property', metadata.ogType);
  setMeta('meta[property="og:url"]', 'property', metadata.canonicalUrl || '');
  setMeta('meta[name="twitter:card"]', 'name', metadata.twitterCard);
  setMeta('meta[name="twitter:title"]', 'name', metadata.ogTitle);
  setMeta('meta[name="twitter:description"]', 'name', metadata.ogDescription);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = metadata.canonicalUrl || '';

  const existingSchema = document.head.querySelector<HTMLScriptElement>('script[data-streamvista-seo]');
  const schema = existingSchema || document.createElement('script');
  schema.type = 'application/ld+json';
  schema.setAttribute('data-streamvista-seo', 'true');
  schema.textContent = JSON.stringify(metadata.jsonLd);
  if (!existingSchema) document.head.appendChild(schema);
}
