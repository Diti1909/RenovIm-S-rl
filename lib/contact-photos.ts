// The browser converts supported photos to JPEG; the server independently removes APP/COM metadata.
// This is format validation and metadata removal, not an antivirus scanner.
export function cleanJpeg(bytes:Uint8Array):Uint8Array{
 if(bytes.length<8||bytes[0]!==255||bytes[1]!==216)throw new Error('photo');
 const parts:Uint8Array[]=[bytes.slice(0,2)];let p=2;let dimensions=false;
 while(p<bytes.length){
  if(bytes[p]!==255)throw new Error('photo');const start=p;while(bytes[p]===255)p++;const marker=bytes[p++];
  if(marker===0xd9)throw new Error('photo');
  if(marker===0xda){if(!dimensions||bytes.at(-2)!==255||bytes.at(-1)!==217)throw new Error('photo');parts.push(bytes.slice(start));const n=parts.reduce((s,b)=>s+b.length,0);const out=new Uint8Array(n);let at=0;for(const b of parts){out.set(b,at);at+=b.length}return out;}
  if(p+2>bytes.length)throw new Error('photo');const len=(bytes[p]<<8)|bytes[p+1];if(len<2||p+len>bytes.length)throw new Error('photo');
  if([0xc0,0xc1,0xc2].includes(marker)){if(len<8)throw new Error('photo');const h=(bytes[p+3]<<8)|bytes[p+4],w=(bytes[p+5]<<8)|bytes[p+6];if(!w||!h||w*h>40000000)throw new Error('photo');dimensions=true;}
  if(!(marker>=0xe0&&marker<=0xef)&&marker!==0xfe)parts.push(bytes.slice(start,p+len));p+=len;
 }
 throw new Error('photo');
}
