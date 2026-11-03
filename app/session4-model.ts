import {session4Activities,session4Equipment,session4Repairs,type Session4Activity} from "./session4-data";
export const session4SourceIP="192.168.10.21",session4PeerIP="192.168.10.22";
export const session4SharePath=String.raw`\\192.168.10.21\Club_reseau`;
export type Session4Draft={selections:Record<string,string>;links:string[];internet:boolean;tested:boolean;delivered:boolean;connected:boolean;commands:string[];command:string;output:string;ip:string;host:string;shared:boolean;permission:string;path:string;opened:boolean;recipient:string;message:string;attached:boolean;checks:string[];peerIP:string;proof:string;practicalConfirmed:boolean;result:boolean|null};
export type Session4WorkshopState={version:1;activityIndex:number;completedIds:string[];drafts:Record<string,Session4Draft>;summary:boolean};
export const freshSession4Draft=():Session4Draft=>({selections:{},links:[],internet:true,tested:false,delivered:false,connected:false,commands:[],command:"",output:"Microsoft Windows [Entraînement]\nTape ipconfig, hostname ou ping 192.168.10.22.",ip:"",host:"",shared:false,permission:"",path:"",opened:false,recipient:"",message:"",attached:false,checks:[],peerIP:"",proof:"",practicalConfirmed:false,result:null});
export function initialSession4Workshop(previous:unknown):Session4WorkshopState{
 const old=previous as {checked?:unknown[]}|null;
 return {version:1,activityIndex:0,completedIds:[...(old?.checked?.[0]===true?["session-4-workshop-A"]:[]),...(old?.checked?.[1]===true?["session-4-workshop-B"]:[])],drafts:{},summary:false};
}
export function validSession4Workshop(v:unknown):v is Session4WorkshopState{const s=v as Session4WorkshopState|null;return Boolean(s?.version===1&&Number.isInteger(s.activityIndex)&&s.activityIndex>=0&&s.activityIndex<session4Activities.length&&Array.isArray(s.completedIds)&&s.drafts&&typeof s.drafts==="object"&&typeof s.summary==="boolean")}
export function isPrivateIPv4(value:string){const parts=value.trim().split('.');if(parts.length!==4||parts.some(p=>!/^\d{1,3}$/.test(p)||Number(p)>255))return false;const [a,b]=parts.map(Number);return a===10||(a===172&&b>=16&&b<=31)||(a===192&&b===168)}
export function runSession4Command(command:string,connected:boolean){const c=command.trim().toLowerCase();if(c==="hostname")return "PC-21";if(c==="ipconfig")return `Configuration IP de Windows\n\nCarte Ethernet :\n   Adresse IPv4 . . . . . . : ${session4SourceIP}\n   Masque de sous-réseau . . : 255.255.255.0\n   Passerelle par défaut . . : 192.168.10.1`;
 if(c===`ping ${session4PeerIP}`)return connected?`Envoi d’une requête 'Ping' sur ${session4PeerIP} :\n${Array(4).fill(`Réponse de ${session4PeerIP} : octets=32 temps<1ms TTL=128`).join("\n")}\nPaquets : envoyés = 4, reçus = 4, perdus = 0 (perte 0 %).`:`Envoi d’une requête 'Ping' sur ${session4PeerIP} :\nDélai d’attente de la demande dépassé.\nPaquets : envoyés = 4, reçus = 0, perdus = 4 (perte 100 %).`;
 return "Commande non prévue dans cet entraînement. Essaie ipconfig, hostname ou ping 192.168.10.22.";
}
export function session4ActivityCorrect(activity:Session4Activity,d:Session4Draft):boolean{
 switch(activity.kind){
  case "lan":return !d.internet&&d.delivered&&d.selections.lan==="local";
  case "cables":return ["PC-21","PC-22","PC-23"].every(pc=>d.links.includes(pc))&&d.tested;
  case "equipment":return session4Equipment.every(e=>d.selections[e.id]===e.answer);
  case "topology":return d.selections.star==="star"&&d.selections.bus==="bus"&&d.selections.ring==="ring";
  case "identity":return d.commands.includes("ipconfig")&&d.commands.includes("hostname")&&d.ip.trim()===session4SourceIP&&d.host.trim().toUpperCase()==="PC-21";
  case "ping":return d.connected&&d.delivered&&d.commands.includes(`ping ${session4PeerIP}`);
  case "sharing":return d.shared&&d.permission==="read"&&d.path.trim().toLowerCase()===session4SharePath.toLowerCase()&&d.opened;
  case "practice":return ["source","receive","reverse","return"].every(id=>d.checks.includes(id))&&isPrivateIPv4(d.ip)&&isPrivateIPv4(d.peerIP)&&d.ip.trim()!==d.peerIP.trim()&&d.proof.trim().length>=3;
  case "messenger":return d.recipient==="PC-22"&&d.message.toLowerCase().includes("bonjour")&&d.attached&&d.delivered;
  case "repair":return session4Repairs.every(c=>d.selections[c.id]===String(c.answer));
 }
}
