export const CLIENT_TYPES=['Particulier / Propriétaire','Gérance immobilière','Architecte','Entreprise / Professionnel','Autre'];
export const REASONS=['Demande de devis','Demande de renseignements','Autre demande'];
export const SERVICES=['Peinture','Plâtrerie','Rénovation','Plusieurs prestations','Autre / Je ne sais pas encore'];
export const CONTACT_METHODS=['Par e-mail','Par téléphone','Par WhatsApp'];
export const RESPONSE_WINDOW='24 à 48 heures';
export type Enquiry={id:string;service:string;clientType:string;reason:string;contactMethod:string;town:string;timing:string;description:string;name:string;email:string;phone:string;website:string};
export function validateEnquiry(value:unknown):Enquiry{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('invalid');
 const p=value as Enquiry;const keys=['id','service','clientType','reason','contactMethod','town','timing','description','name','email','phone','website'];
 if(keys.some(k=>typeof (p as any)[k]!=='string')||Object.keys(p).some(k=>!keys.includes(k)))throw new Error('invalid');
 if(p.website||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(p.id)||!CLIENT_TYPES.includes(p.clientType)||!REASONS.includes(p.reason)||!SERVICES.includes(p.service)||!['',...CONTACT_METHODS].includes(p.contactMethod)||!['À définir','Dès que possible','Dans 1 à 3 mois','Dans 3 à 6 mois','Plus tard'].includes(p.timing))throw new Error('invalid');
 if(p.name.trim().length<2||p.name.length>150||p.description.trim().length<10||p.description.length>5000||p.town.length>150||p.email.length>254||! /^[^\s<>\r\n@]+@[^\s<>\r\n@]+\.[^\s<>\r\n@]+$/.test(p.email)||p.phone.length>40||(/[\r\n\x00]/.test(p.name+p.town+p.phone)))throw new Error('invalid');
 if((p.phone&&!/^[+0-9(). /-]{6,40}$/.test(p.phone))||(['Par téléphone','Par WhatsApp'].includes(p.contactMethod)&&p.phone.replace(/\D/g,'').length<6))throw new Error('invalid');
 return p;
}
