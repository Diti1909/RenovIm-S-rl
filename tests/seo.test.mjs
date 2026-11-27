// Integration checks after npm run build. Only GET requests; no live emails.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createServer} from 'node:net';
import {request as httpRequest} from 'node:http';
import {setTimeout as delay} from 'node:timers/promises';
import ts from 'typescript';

const content = ts.transpileModule(readFileSync('app/content.ts', 'utf8'), {
  compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext},
}).outputText;
const {pages} = await import(`data:text/javascript;base64,${Buffer.from(content).toString('base64')}`);
const origin = 'https://www.renov-im.ch';
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#(?:39|x27);/g, "'");
function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))].map(match =>
    Object.fromEntries([...match[1].matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key.toLowerCase(), decode(value)])));
}
function meta(html, name) {
  const values = tags(html, 'meta').filter(tag => tag.name === name || tag.property === name);
  assert.equal(values.length, 1, `Exactly one ${name}`);
  return values[0].content;
}
async function start(environment) {
  const reservation = createServer();
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    env: {...process.env, VERCEL_ENV: environment, CONTACT_DELIVERY_ENABLED: 'false'}, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  child.stdout.on('data', data => {logs += data;});
  child.stderr.on('data', data => {logs += data;});
  const base = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(logs);
    try { if ((await fetch(base)).ok) return {child, base}; } catch {}
    await delay(100);
  }
  child.kill();
  throw new Error(`Next server did not start: ${logs}`);
}
async function stop(child) {
  if (child.exitCode !== null) return;
  await new Promise(resolve => {child.once('exit', resolve); child.kill('SIGTERM');});
}

const {child, base} = await start('production');
try {
  const graph = new Map(), titles = new Set(), descriptions = new Set(), assets = new Set();
  for (const [path, page] of Object.entries(pages)) {
    const response = await fetch(base + path, {redirect: 'manual'});
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('x-robots-tag'), null, `Production: ${path}`);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.ok(response.headers.get('content-security-policy').includes("form-action 'self'"));
    const html = await response.text();
    assert.deepEqual(tags(html, 'link').filter(tag => tag.rel === 'canonical').map(tag => new URL(tag.href).href), [origin + path]);
    const title = decode(html.match(/<title>([^<]+)<\/title>/)[1]);
    assert.ok(title.includes('Renovim Sàrl'));
    assert.ok(!titles.has(title), `Unique title: ${path}`); titles.add(title);
    const description = meta(html, 'description');
    assert.equal(description, page.description);
    assert.ok(!descriptions.has(description), `Unique description: ${path}`); descriptions.add(description);
    assert.equal(meta(html, 'robots'), page.indexable === false ? 'noindex, follow' : 'index, follow');
    assert.equal(new URL(meta(html, 'og:url')).href, origin + path);
    assert.equal(meta(html, 'og:title'), title);
    assert.equal(meta(html, 'og:description'), description);
    assert.equal(meta(html, 'og:site_name'), 'Renovim Sàrl');
    assert.equal(meta(html, 'twitter:title'), title);
    assert.equal(meta(html, 'twitter:card'), 'summary_large_image');
    assert.ok(meta(html, 'og:image').startsWith(origin + '/'));
    assert.equal(tags(html, 'h1').length, 1, `Single H1 in initial HTML: ${path}`);
    for (const text of ['tel:+41783532803', 'mailto:info@renov-im.ch', 'https://wa.me/41783532803', 'sans accueil du public']) assert.ok(html.includes(text));
    const links = tags(html, 'a').map(tag => tag.href).filter(href => href?.startsWith('/'));
    graph.set(path, new Set(links.map(href => new URL(href, origin).pathname)));
    for (const img of tags(html, 'img')) {
      assert.ok(img.alt, `Image description: ${path}`);
      if (img.src?.startsWith('/')) assets.add(img.src);
    }
    if (path === '/') {
      const structured = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      assert.equal(structured.length, 1);
      const data = JSON.parse(structured[0][1]);
      assert.equal(data['@context'], 'https://schema.org');
      const business = data['@graph'].find(node => node['@type'] === 'HousePainter');
      const website = data['@graph'].find(node => node['@type'] === 'WebSite');
      assert.equal(business.name, 'Renovim Sàrl');
      assert.equal(business.legalName, 'RenovIm Sàrl');
      assert.equal(business.identifier.value, 'CHE-226.712.155');
      assert.equal(business.areaServed, 'Suisse romande');
      assert.equal(business.address.addressLocality, 'Le Mont-sur-Lausanne');
      assert.equal(website.publisher['@id'], business['@id']);
      for (const field of ['aggregateRating', 'review', 'geo', 'openingHours', 'foundingDate', 'vatID']) assert.equal(business[field], undefined);
      assets.add(new URL(business.logo.url).pathname);
    }
  }
  const reached = new Set();
  function visit(path) {
    if (reached.has(path)) return;
    assert.ok(graph.has(path), `No broken internal link: ${path}`);
    reached.add(path); graph.get(path).forEach(visit);
  }
  visit('/');
  assert.equal(reached.size, Object.keys(pages).length, 'No orphan public pages');
  for (const path of assets) assert.equal((await fetch(base + path)).status, 200, path);
  const sitemapResponse = await fetch(base + '/sitemap.xml');
  assert.equal(sitemapResponse.status, 200);
  assert.ok(sitemapResponse.headers.get('content-type').includes('xml'));
  const xml = await sitemapResponse.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(urls.sort(), Object.entries(pages).filter(([, page]) => page.indexable !== false).map(([path]) => origin + path).sort());
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(!/<lastmod>|<changefreq>|<priority>|vercel\.app/.test(xml));
  const robotsResponse = await fetch(base + '/robots.txt');
  assert.equal(robotsResponse.status, 200);
  const robots = await robotsResponse.text();
  for (const directive of ['Allow: /', 'Disallow: /api/', `Sitemap: ${origin}/sitemap.xml`]) assert.ok(robots.includes(directive));
  assert.ok(!robots.includes('Disallow: /\n'));
  for (const path of ['/inexistante', '/savoir-faire/inexistant', '/realisations/inexistante', '/constructor', '/toString']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 404, path);
    assert.ok(meta(await response.text(), 'robots').includes('noindex'));
  }
  const query = await (await fetch(base + '/contact?service=Peinture')).text();
  assert.equal(tags(query, 'link').find(tag => tag.rel === 'canonical').href, origin + '/contact');
  const slash = await fetch(base + '/savoir-faire/peinture/', {redirect: 'manual'});
  assert.equal(slash.status, 308);
  assert.ok(slash.headers.get('location').endsWith('/savoir-faire/peinture'));
  // A raw HTTP request preserves Host; fetch may normalize this forbidden header.
  const technical = await new Promise((resolve, reject) => {
    const request = httpRequest(base, {headers: {host: 'renovim.vercel.app'}}, response => {
      response.resume(); resolve(response.headers);
    });
    request.on('error', reject); request.end();
  });
  assert.equal(technical['x-robots-tag'], 'noindex, nofollow');
  const api = await fetch(base + '/api/enquiries');
  assert.equal(api.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await api.json(), {available: false});
  console.log(`SEO HTTP checks passed: ${graph.size} pages, ${urls.length} sitemap URLs, links, metadata, JSON-LD, assets, 404, redirects and technical-domain noindex.`);
} finally { await stop(child); }

const preview = await start('preview');
try {
  for (const path of ['/', '/savoir-faire/peinture', '/robots.txt', '/sitemap.xml']) {
    const response = await fetch(preview.base + path);
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow', `Preview: ${path}`);
  }
  console.log('Preview noindex checks passed; no live form submission performed.');
} finally { await stop(preview.child); }
