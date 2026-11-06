import Site from '../site';
import {notFound} from 'next/navigation';
import {pages} from '../content';
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}){const {slug}=await params;const p=pages['/'+slug.join('/')];return {title:p?`${p.title} — RenovIm`:'RenovIm',description:p?.description};}
export default async function Page({params}:{params:Promise<{slug:string[]}>}){const {slug}=await params;const path='/'+slug.join('/');if(!pages[path])notFound();return <Site path={path}/>}
