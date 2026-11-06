import {createClient, type Client, type InValue} from '@libsql/client';
const schema=[
'CREATE TABLE IF NOT EXISTS contact_receipts(id TEXT PRIMARY KEY NOT NULL,fingerprint TEXT NOT NULL,created_at TEXT NOT NULL,status TEXT NOT NULL,lease_until INTEGER NOT NULL DEFAULT 0)',
'CREATE TABLE IF NOT EXISTS contact_limits(key TEXT PRIMARY KEY NOT NULL,count INTEGER NOT NULL,expires_at INTEGER NOT NULL)'];
export class ContactDatabase {
 private initialized?:Promise<unknown>;
 constructor(private client:Client){}
 private async execute(sql:string,args:InValue[]){
  if(!this.initialized)this.initialized=this.client.batch(schema,'write').catch(e=>{this.initialized=undefined;throw e});
  await this.initialized;
  return this.client.execute({sql,args});
 }
 prepare(sql:string){return {bind:(...args:InValue[])=>({run:()=>this.execute(sql,args),first:async<T=Record<string,unknown>>()=>{const r=await this.execute(sql,args);return (r.rows[0] as unknown as T)||null}})}}
}
let db:ContactDatabase|undefined;
export function getDatabase(){
 if(!process.env.TURSO_DATABASE_URL||!process.env.TURSO_AUTH_TOKEN)return undefined;
 return db??=new ContactDatabase(createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN}));
}
