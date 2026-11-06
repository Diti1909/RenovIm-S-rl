import {getDatabase, type ContactDatabase} from '../../../lib/database';
export const runtime='nodejs';
export const maxDuration=30;
import {validateEnquiry} from '../../../lib/contact-contract';
import {mailContent} from '../../../lib/contact-mail';
import {cleanJpeg} from '../../../lib/contact-photos';
type Config={DB?:ContactDatabase;RESEND_API_KEY?:string;CONTACT_FROM?:string;CONTACT_TO?:string;CONTACT_DELIVERY_ENABLED?:string;CONTACT_RATE_SECRET?:string};
const config=():Config=>({...process.env,DB:getDatabase()});
const ready=(e:Config)=>e.CONTACT_DELIVERY_ENABLED==='true'&&!!e.RESEND_API_KEY&&!!e.CONTACT_RATE_SECRET&&!!e.DB&&/^[^\s<>@]+@renov-im\.ch$/.test(e.CONTACT_FROM||'')&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(e.CONTACT_TO||'');
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
const fail=(error:string,status:number)=>reply({error},status);
export async function GET(){try{return reply({available:ready(config())})}catch{return reply({available:false})}}
async function boundedBody(req:Request){if(!req.body)throw new Error('invalid');const reader=req.body.getReader();let size=0;const parts:Uint8Array[]=[];try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>3300000){await reader.cancel();throw new Error('size')}parts.push(value)}}finally{reader.releaseLock()}const out=new Uint8Array(size);let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length}return out}
async function digest(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('')}
function base64(b:Uint8Array){let s='';for(let i=0;i<b.length;i+=8192)s+=String.fromCharCode(...b.subarray(i,i+8192));return btoa(s)}
export async function POST(req:Request){
 const own=new URL(req.url).origin;if(req.headers.get('origin')!==own||req.headers.get('sec-fetch-site')==='cross-site')return fail('Origine non autorisée.',403);
 const e=config();if(!ready(e))return fail('L’envoi du formulaire est momentanément indisponible. Contactez-nous à info@renov-im.ch ou au 078 353 28 03. Rien n’a été transmis.',503);
 const db=e.DB!;let lockedId:string|undefined;
 try{
  const now=Date.now(),hour=Math.floor(now/3600000);const key=await digest(`${e.CONTACT_RATE_SECRET}:${hour}:${req.headers.get('x-vercel-forwarded-for')||'unknown'}`);
  await db.prepare('DELETE FROM contact_receipts WHERE created_at < ?').bind(new Date(now-30*86400000).toISOString()).run();
  await db.prepare('DELETE FROM contact_limits WHERE expires_at < ?').bind(now).run();
  const limit=await db.prepare('INSERT INTO contact_limits(key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now+7200000).first<{count:number}>();
  if(!limit||limit.count>10)return fail('Trop de tentatives. Réessayez dans une heure ou contactez-nous directement.',429);
  const type=req.headers.get('content-type')||'';if(!type.startsWith('multipart/form-data;'))return fail('Format non pris en charge.',415);
  if(Number(req.headers.get('content-length')||0)>3300000)throw new Error('size');
  const form=await new Response(await boundedBody(req),{headers:{'content-type':type}}).formData();
  if([...form.keys()].some(k=>!['payload','photos'].includes(k)))throw new Error('invalid');
  const raw=form.get('payload');if(typeof raw!=='string'||raw.length>15000)throw new Error('invalid');const p=validateEnquiry(JSON.parse(raw));
  const files=form.getAll('photos');if(files.length>5||files.some(f=>!(f instanceof File)||!f.size||f.size>3000000))throw new Error('photo');
  if(files.reduce((n,f)=>n+(f as File).size,0)>3000000)throw new Error('size');
  const attachments=[];for(let i=0;i<files.length;i++){const f=files[i] as File;if(f.type!=='image/jpeg')throw new Error('photo');attachments.push({filename:`photo-${i+1}.jpg`,content:base64(cleanJpeg(new Uint8Array(await f.arrayBuffer())))});}
  const fingerprint=await digest(JSON.stringify({p,attachments}));
  await db.prepare("INSERT OR IGNORE INTO contact_receipts(id,fingerprint,created_at,status,lease_until) VALUES (?,?,?,'pending',0)").bind(p.id,fingerprint,new Date(now).toISOString()).run();
  const record=await db.prepare('SELECT fingerprint,created_at,status FROM contact_receipts WHERE id=?').bind(p.id).first<{fingerprint:string;created_at:string;status:string}>();
  if(!record||record.fingerprint!==fingerprint)return fail('Cette demande a changé depuis une tentative d’envoi. Contactez-nous directement pour éviter un doublon.',409);
  if(record.status==='sent')return reply({id:p.id});
  if(now-Date.parse(record.created_at)>23*3600000)return fail('La tentative précédente doit être vérifiée par RenovIm. Contactez-nous directement avant un nouvel envoi.',409);
  const lock=await db.prepare("UPDATE contact_receipts SET lease_until=? WHERE id=? AND status='pending' AND lease_until<? RETURNING id").bind(now+90000,p.id,now).first();
  if(!lock)return fail('L’envoi est déjà en cours. Patientez avant de réessayer.',409);lockedId=p.id;
  const content=mailContent(p,record.created_at,attachments.map(x=>x.filename));
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${e.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`renovim/${p.id}`},body:JSON.stringify({from:e.CONTACT_FROM,to:[e.CONTACT_TO],reply_to:p.email,...content,attachments}),signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error('delivery');const result=await response.json() as {id?:string};if(!result.id)throw new Error('delivery');
  await db.prepare("UPDATE contact_receipts SET status='sent',lease_until=0 WHERE id=?").bind(p.id).run();lockedId=undefined;
  return reply({id:p.id},201);
 }catch(err){if(lockedId)await db.prepare('UPDATE contact_receipts SET lease_until=0 WHERE id=?').bind(lockedId).run().catch(()=>{});const msg=err instanceof Error?err.message:'';if(msg==='size')return fail('Maximum 3 Mo par photo et 3 Mo au total.',413);if(msg==='photo')return fail('Photo non acceptée. Choisissez jusqu’à 5 photos JPG, PNG ou WebP dans le formulaire.',400);if(msg==='invalid'||err instanceof SyntaxError)return fail('Vérifiez les champs et les coordonnées renseignés.',400);console.error('contact_delivery_unconfirmed');return fail('La transmission n’a pas pu être confirmée. Vos informations restent à l’écran. Réessayez avec la même demande ou contactez-nous directement.',503);}
}
