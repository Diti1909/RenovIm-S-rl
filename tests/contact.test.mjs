import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
const dir=new URL('../.test-temp',import.meta.url).pathname;mkdirSync(dir,{recursive:true});
for(const [src,name] of [['lib/contact-contract.ts','contact-contract'],['lib/contact-mail.ts','contact-mail'],['lib/contact-photos.ts','contact-photos'],['lib/database.ts','database'],['app/api/enquiries/route.ts','route']]){
 let code=readFileSync(src,'utf8').replace("import {env} from 'cloudflare:workers';","const env=globalThis.__testEnv;").replace("from '../../../lib/database'","from './database.mjs'").replace(/from '(?:\.\/|\.\.\/\.\.\/\.\.\/lib\/)(contact-[^']+)'/g,"from './$1.mjs'");
 writeFileSync(`${dir}/${name}.mjs`,ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
}
const {createClient}=await import('@libsql/client');
const {ContactDatabase}=await import(`${dir}/database.mjs`);
const client=createClient({url:'file::memory:'});
const db=new ContactDatabase(client);
globalThis.__testEnv={DB:db,RESEND_API_KEY:'test-not-real',CONTACT_RATE_SECRET:'local-test-secret',CONTACT_FROM:'site@renov-im.ch',CONTACT_TO:'info@renov-im.ch',CONTACT_DELIVERY_ENABLED:'true'};
let routeCode=readFileSync(`${dir}/route.mjs`,'utf8');
routeCode=routeCode.replace('const config = () => ({ ...process.env, DB: getDatabase() });','const config = () => globalThis.__testEnv;');
assert.ok(routeCode.includes('const config = () => globalThis.__testEnv;'));
writeFileSync(`${dir}/route.mjs`,routeCode);
const {POST,GET}=await import(`${dir}/route.mjs`);const {validateEnquiry}=await import(`${dir}/contact-contract.mjs`);const {cleanJpeg}=await import(`${dir}/contact-photos.mjs`);
let sends=0,lastMail,mode='ok';globalThis.fetch=async(url,opts)=>{assert.equal(url,'https://api.resend.com/emails');sends++;lastMail=JSON.parse(opts.body);if(mode==='fail')return new Response('',{status:503});return Response.json({id:'test-provider-id'})};
let ip=0;const input=(patch={})=>({id:crypto.randomUUID(),service:'Peinture',clientType:'Particulier / Propriétaire',reason:'Demande de devis',contactMethod:'',town:'',timing:'À définir',description:'Un projet de test <script>alert(1)</script>\nDeuxième ligne',name:'Test Client',email:'test@example.invalid',phone:'',website:'',...patch});
function request(p,files=[],origin='https://renovim.diti1909.chatgpt.site',address=String(++ip)){const f=new FormData();f.set('payload',JSON.stringify(p));for(const file of files)f.append('photos',file);return new Request('https://renovim.diti1909.chatgpt.site/api/enquiries',{method:'POST',headers:{origin,'x-vercel-forwarded-for':address},body:f})}
let checks=0;async function status(req,expected){assert.equal((await POST(req)).status,expected);checks++}
for(const clientType of ['Particulier / Propriétaire','Gérance immobilière','Entreprise / Professionnel','Architecte','Autre']){await status(request(input({clientType})),201);assert.ok(lastMail.subject.startsWith('['));assert.ok(lastMail.html.includes('&lt;script&gt;'));assert.ok(!lastMail.html.includes('<script>'));assert.ok(lastMail.text.includes('\nDeuxième ligne'))}
await status(request(input({reason:'Demande de renseignements'})),201);
assert.throws(()=>validateEnquiry(input({contactMethod:'Par WhatsApp'})));checks++;
await status(request(input({contactMethod:'Par WhatsApp',phone:'+41780000000'})),201);assert.ok(lastMail.html.includes('https://wa.me/41780000000'));
await status(request(input({name:''})),400);await status(request(input({email:'bad\r\nbcc:other@example.com'})),400);await status(request(input({website:'bot'})),400);await status(request(input(),[],'https://evil.example'),403);
const jpg=new Uint8Array(readFileSync('public/images/led-detail.jpeg'));const cleaned=cleanJpeg(jpg);assert.ok(cleaned.length<=jpg.length);checks++;
const photo=()=>new File([jpg],'private.jpg',{type:'image/jpeg'});await status(request(input(),[photo()]),201);assert.equal(lastMail.attachments.length,1);await status(request(input(),[photo(),photo()]),201);assert.equal(lastMail.attachments.length,2);
await status(request(input(),[new File(['<script>bad</script>'],'fake.jpg',{type:'image/jpeg'})]),400);await status(request(input(),[new File(['%PDF-123'],'file.pdf',{type:'application/pdf'})]),400);
await status(request(input(),[new File([new Uint8Array(3000001)],'large.jpg',{type:'image/jpeg'})]),400);
const same=input();const before=sends;await status(request(same),201);await status(request(same),200);assert.equal(sends,before+1);
const concurrent=input();const pair=await Promise.all([POST(request(concurrent)),POST(request(concurrent))]);assert.ok(pair.some(r=>r.status===201));assert.ok(pair.every(r=>[201,200,409].includes(r.status)));checks++;
mode='fail';const retry=input();await status(request(retry),503);mode='ok';await status(request(retry),201);
for(let i=0;i<10;i++)await POST(request(input({name:''}),[],'https://renovim.diti1909.chatgpt.site','rate-test'));await status(request(input(),[],'https://renovim.diti1909.chatgpt.site','rate-test'),429);
globalThis.__testEnv.CONTACT_DELIVERY_ENABLED='false';assert.deepEqual(await (await GET()).json(),{available:false});const n=sends;await status(request(input()),503);assert.equal(sends,n);
console.log(`${checks} checks passed. Email transport mocked: no external mail sent or received.`);client.close();rmSync(dir,{recursive:true,force:true});
