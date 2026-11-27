import type {Metadata} from 'next';
import {company} from '../lib/company';
import './globals.css';

// Canonicals are defined by each page, never inherited from the root layout.
export const metadata: Metadata = {
  metadataBase: new URL(company.url),
  title: company.name,
  applicationName: company.name,
  icons: {icon: '/favicon.svg', shortcut: '/favicon.svg'},
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return <html lang="fr-CH"><body>{children}</body></html>;
}
