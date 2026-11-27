import Site from '../site';
import {notFound} from 'next/navigation';
import {pages} from '../content';
import {pageMetadata} from '../../lib/seo';

type Props = {params: Promise<{slug: string[]}>};
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(pages).filter(path => path !== '/').map(path => ({slug: path.slice(1).split('/')}));
}

export async function generateMetadata({params}: Props) {
  const {slug} = await params;
  const path = '/' + slug.join('/');
  if (!Object.hasOwn(pages, path)) notFound();
  return pageMetadata(path);
}

export default async function Page({params}: Props) {
  const {slug} = await params;
  const path = '/' + slug.join('/');
  if (!Object.hasOwn(pages, path)) notFound();
  return <Site path={path}/>;
}
