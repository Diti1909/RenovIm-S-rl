import Site from './site';
import {businessStructuredData, pageMetadata} from '../lib/seo';

export const metadata = pageMetadata('/');

export default function Home() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{
      __html: JSON.stringify(businessStructuredData()).replace(/</g, '\\u003c'),
    }}/>
    <Site path="/"/>
  </>;
}
