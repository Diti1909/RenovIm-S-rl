import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
export function proxy(request:NextRequest){
const response=NextResponse.next();
response.headers.set('X-Content-Type-Options','nosniff');
response.headers.set('Referrer-Policy','no-referrer');
response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
response.headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'"+(process.env.NODE_ENV==='development'?" ws: wss:":"")+"; object-src 'none'; base-uri 'self'; form-action 'self'");
if(request.nextUrl.protocol==='https:')response.headers.set('Strict-Transport-Security','max-age=31536000');
// Allow crawling so bots can read noindex on previews and the technical domain.
// Next.js can normalize nextUrl to its internal server hostname; use the HTTP host.
const hostname=(request.headers.get('host')||request.nextUrl.hostname).split(':')[0].toLowerCase();
if(process.env.VERCEL_ENV==='preview'||hostname.endsWith('.vercel.app'))response.headers.set('X-Robots-Tag','noindex, nofollow');
if(request.nextUrl.pathname.startsWith('/api/'))response.headers.set('Cache-Control','no-store');
return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.svg).*)']};
