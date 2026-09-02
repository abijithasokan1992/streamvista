# StreamVista SEO Metadata Engine

This module provides a provider-neutral SEO metadata layer for movie, series, documentary, music and show pages.

## What it generates

- SEO title
- Meta description
- Keywords
- Canonical URL
- Open Graph title/description/type
- Twitter card metadata
- Schema.org JSON-LD

## Usage

```ts
import { applySEOMetadata, generateSEOMetadata } from './metadata';

const metadata = generateSEOMetadata({
  title: 'Example Film',
  contentType: 'movie',
  genre: 'Drama',
  language: 'Malayalam',
  year: '2026',
  synopsis: 'A short synopsis of the film.',
  focusKeyword: 'Malayalam drama movie',
  canonicalUrl: 'https://streamvista.in/watch/example-film',
  imageUrl: 'https://streamvista.in/images/example-film.jpg',
});

applySEOMetadata(metadata);
```

The generator is deterministic and does not require an AI provider. An AI provider can be added later to improve copy generation while this module remains responsible for validation, formatting and SEO output.
