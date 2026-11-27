import type {MetadataRoute} from 'next';
import {pages} from './content';
import {canonicalUrl} from '../lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.entries(pages)
    .filter(([, page]) => page.indexable !== false)
    .map(([path]) => ({url: canonicalUrl(path)}));
}
