"use client";
import type {ReactNode} from "react";
import {CloudOff,Send,Check,Monitor,Download,Users} from "lucide-react";
import {Session3Text as Text} from "./session3-translation";
import {publicAsset} from "../lib/public-assets";
import {s4t as t,session4Equipment,type Session4Activity} from "./session4-data";
import {isPrivateIPv4,type Session4Draft} from "./session4-model";
import Session4Simulator from "./session4-simulator";
import {Session4Network,Session4NetworkBuilder} from "./session4-network";
export {Session4Network} from "./session4-network";
export function Session4Topology({kind}:{kind:"star"|"bus"|"ring"}){
 const positions=kind==="star"?[[150,35],[260,120],[150,205],[40,120]]:kind==="bus"?[[45,55],[150,55],[255,55]]:[[150,30],[250,110],[210,200],[90,200],[50,110]];
 return <svg viewBox="0 0 300 240" role="img" aria-label={kind==="star"?"Les PC rejoignent un équipement au centre":kind==="bus"?"Les PC rejoignent une ligne commune":"Les PC sont reliés en boucle fermée"}>
  {kind==="star"&&positions.map(([x,y],i)=><line key={i} x1={x} y1={y} x2="150" y2="120"/>)}
  {kind==="bus"&&<><line x1="20" y1="140" x2="280" y2="140"/>{positions.map(([x,y],i)=><line key={i} x1={x} y1={y} x2={x} y2="140"/>)}</>}
  {kind==="ring"&&<polygon points={positions.map(p=>p.join(',')).join(' ')} fill="none"/>}
  {kind==="star"&&<image href={publicAsset("session4/images/commutateur.webp")} x="120" y="108" width="60" height="25"/>}
  {positions.map(([x,y],i)=><image key={i} href={publicAsset("session4/images/ordinateur-bureau.webp")} x={x-25} y={y-20} width="50" height="40"/>)}
 </svg>;
}
function downloadExample(file: "Bonjour.txt" | "Retour.txt") {
 const content=file==="Bonjour.txt"?"Bonjour le club !":"Bien reçu, le club !";
 const url=URL.createObjectURL(new Blob([content+"\n"],{type:"text/plain;charset=utf-8"}));
 const link=document.createElement("a");
 link.href=url;
 link.download=file;
 link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function PracticeTask({number,post,title,done,onToggle,children}:{
 number:number;post:string;title:ReturnType<typeof t>;done:boolean;onToggle:()=>void;children:ReactNode;
}) {
 return <article className={`s4-practice-task ${done?"done":""}`}>
  <header><span className="s4-task-number">{number}</span><div><small>{post}</small><h3><Text value={title}/></h3></div></header>
  <div className="s4-task-details">{children}</div>
  <label className="s4-task-done"><input type="checkbox" checked={done} onChange={onToggle} aria-label={`Étape ${number} faite · ${title.fr}`}/>
   <Text value={t("Étape faite","أُنجزت الخطوة")}/>
  </label>
 </article>;
}

function RealExchange({draft,onChange}:{draft:Session4Draft;onChange:(patch:Partial<Session4Draft>)=>void}) {
 const task=(id:string)=>({
  done:draft.checks.includes(id),
  onToggle:()=>onChange({checks:draft.checks.includes(id)?draft.checks.filter(check=>check!==id):[...draft.checks,id]})
 });
 const path=(ip:string,placeholder:string)=>["","",isPrivateIPv4(ip)?ip.trim():placeholder,"Club_reseau"].join("\\");
 return <div className="s4-real-practice">
  <div className="s4-real-pc-pair"><img src={publicAsset("session4/images/ordinateur-bureau.webp")} alt="Poste A"/><img src={publicAsset("session4/images/commutateur.webp")} alt="Commutateur"/><img src={publicAsset("session4/images/portable-windows.webp")} alt="Poste B"/></div>
  <span className="s4-real-label"><Users size={17}/><Text value={t("TP sur les postes Windows de la salle","تطبيق على حواسيب Windows في القاعة")}/></span>
  <div className="s4-address-prep">
   <p><Text value={t("Sur chaque poste, lancez ipconfig et relevez la ligne « Adresse IPv4 ». L’enseignant indique les comptes autorisés pour le partage.","نفذا ipconfig على كل حاسوب واقرآ سطر «عنوان IPv4». يحدد الأستاذ الحسابات المسموح لها بالمشاركة.")}/></p>
   <div className="s4-practice-proofs">
    <label><Text value={t("IPv4 du poste A","عنوان IPv4 للحاسوب A")}/><input aria-label="IPv4 réelle du poste A" spellCheck={false} maxLength={15} value={draft.ip} onChange={e=>onChange({ip:e.target.value})}/></label>
    <label><Text value={t("IPv4 du poste B","عنوان IPv4 للحاسوب B")}/><input aria-label="IPv4 réelle du poste B" spellCheck={false} maxLength={15} value={draft.peerIP} onChange={e=>onChange({peerIP:e.target.value})}/></label>
   </div>
  </div>
  <div className="s4-practice-tasks">
   <PracticeTask number={1} post="POSTE A" title={t("Partager Bonjour.txt","مشاركة Bonjour.txt")} {...task("source")}>
    <p><Text value={t("Crée Club_reseau dans Documents. Place Bonjour.txt dans ce dossier.","أنشئ Club_reseau داخل Documents وضع فيه Bonjour.txt.")}/></p>
    <button type="button" className="s4-file-download" onClick={()=>downloadExample("Bonjour.txt")}><Download size={15}/><Text value={t("Télécharger Bonjour.txt","تنزيل Bonjour.txt")}/></button>
    <p><Text value={t("Clic droit sur Club_reseau → Afficher plus d’options → Accorder l’accès à → Des personnes spécifiques. Donne le droit Lecture au compte indiqué.","انقر Club_reseau بالزر الأيمن ثم إظهار المزيد من الخيارات ثم منح حق الوصول ثم أشخاص محددون. امنح الحساب المحدد صلاحية القراءة.")}/></p>
   </PracticeTask>
   <PracticeTask number={2} post="POSTE B" title={t("Ouvrir et copier Bonjour.txt","فتح Bonjour.txt ونسخه")} {...task("receive")}>
    <p><Text value={t("Saisis ce chemin dans la barre d’adresse de l’Explorateur et appuie sur Entrée.","اكتب هذا المسار في شريط عنوان المستكشف واضغط Enter.")}/></p>
    <code className="s4-unc-example">{path(draft.ip,"IPv4-du-poste-A")}</code>
    <p><Text value={t("Ouvre Bonjour.txt puis copie-le sur ton Bureau.","افتح Bonjour.txt ثم انسخه إلى سطح مكتبك.")}/></p>
   </PracticeTask>
   <PracticeTask number={3} post="POSTE B" title={t("Partager le fichier de retour","مشاركة ملف الرد")} {...task("reverse")}>
    <p><Text value={t("Sur ton poste, refais l’étape 1 avec Retour.txt dans Club_reseau. Garde le droit Lecture.","أعد الخطوة الأولى على حاسوبك باستعمال Retour.txt داخل Club_reseau. احتفظ بصلاحية القراءة.")}/></p>
    <button type="button" className="s4-file-download" onClick={()=>downloadExample("Retour.txt")}><Download size={15}/><Text value={t("Télécharger Retour.txt","تنزيل Retour.txt")}/></button>
   </PracticeTask>
   <PracticeTask number={4} post="POSTE A" title={t("Lire et vérifier le retour","قراءة الرد والتحقق منه")} {...task("return")}>
    <p><Text value={t("Ouvre ce chemin dans l’Explorateur et lis Retour.txt.","افتح هذا المسار في المستكشف واقرأ Retour.txt.")}/></p>
    <code className="s4-unc-example">{path(draft.peerIP,"IPv4-du-poste-B")}</code>
    <label><Text value={t("Recopie la phrase lue dans Retour.txt.","انقل العبارة التي قرأتها في Retour.txt.")}/><input aria-label="Phrase reçue dans Retour.txt" value={draft.proof} onChange={e=>onChange({proof:e.target.value})} maxLength={180}/></label>
   </PracticeTask>
  </div>
  <p className="s4-help"><Text value={t("Ton enseignant vérifiera le compte rendu et les fichiers sur les deux postes.","سيتحقق أستاذك من التقرير والملفات على الحاسوبين.")}/></p>
 </div>;
}

export function Session4ActivityPlayer({activity,draft:d,onChange}:{activity:Session4Activity;draft:Session4Draft;onChange:(patch:Partial<Session4Draft>)=>void}){
 const choose=(id:string,value:string)=>onChange({selections:{...d.selections,[id]:value},result:null});
 const kind=activity.kind;
 if(kind==="identity"||kind==="ping"||kind==="sharing"||kind==="messenger"||kind==="repair")return <>
  <Session4Simulator key={activity.id} mode={kind} state={d.simulator} onChange={simulator=>onChange({simulator})}/>
  {kind==="identity"&&<div className="s4-identity-card">
   <span>MES OBSERVATIONS · ملاحظاتي</span>
   <label><Text value={t("1 · IPv4 affichée par ipconfig","1 · عنوان IPv4 الذي يعرضه ipconfig")}/><input aria-label="IPv4 du PC d’entraînement" maxLength={15} value={d.ip} placeholder="192.168.…" onChange={e=>onChange({ip:e.target.value})}/></label>
   <label><Text value={t("2 · Nom affiché par hostname","2 · الاسم الذي يعرضه hostname")}/><input aria-label="Nom du PC d’entraînement" maxLength={30} value={d.host} placeholder="PC-…" onChange={e=>onChange({host:e.target.value})}/></label>
  </div>}
  {kind==="messenger"&&<details className="s4-real-details">
   <summary><Text value={t("Le même échange dans BeeBEEP, sur les vrais postes","التبادل نفسه في BeeBEEP على الحواسيب الحقيقية")}/></summary>
   <ol>
    <li><Text value={t("Ouvrez BeeBEEP. Envoyez Bonjour.txt au poste voisin indiqué par l’enseignant.","افتحوا BeeBEEP وأرسلوا Bonjour.txt إلى الحاسوب المجاور الذي يحدده الأستاذ.")}/></li>
    <li><Text value={t("Sur le poste voisin, ouvrez le fichier et envoyez « Reçu ».","على الحاسوب المجاور، افتحوا الملف وأرسلوا «تم التوصل».")}/></li>
   </ol>
   <label><input type="checkbox" checked={d.practicalConfirmed} onChange={e=>onChange({practicalConfirmed:e.target.checked})}/><Text value={t("Nous avons réalisé cet échange sur nos postes.","أنجزنا هذا التبادل على حواسيبنا.")}/></label>
  </details>}
 </>;
 if(kind==="lan")return <><div className="s4-simulation-label"><Monitor size={15}/><Text value={t("Observe le réseau : les appareils sont reliés par câble ou par Wi-Fi.","لاحظ الشبكة: ترتبط الأجهزة بالكابل أو بواسطة Wi-Fi.")}/></div><Session4Network internet={d.internet} delivered={d.delivered}/><div className="s4-inline-actions"><button type="button" onClick={()=>onChange({internet:!d.internet,delivered:false})}><CloudOff size={17}/><Text value={d.internet?t("Couper Internet","قطع الإنترنت"):t("Rétablir Internet","إعادة الإنترنت")}/></button><button type="button" className="s4-primary" onClick={()=>onChange({delivered:true})}><Send size={17}/><Text value={t("Envoyer une consigne au PC-22","إرسال تعليمة إلى PC-22")}/></button></div>{d.delivered&&<p className="s4-success-inline" role="status"><Check size={18}/><Text value={t("Le message est passé par le commutateur : PC-22 l’a reçu.","مرت الرسالة عبر المبدل: توصل بها PC-22.")}/></p>}<div className="s4-question-mini"><h3><Text value={t("Pourquoi la consigne arrive-t-elle même sans Internet ?","لماذا تصل التعليمة حتى دون الإنترنت؟")}/></h3>{[["local",t("Les deux PC communiquent dans le même réseau local.","يتواصل الحاسوبان عبر الشبكة المحلية نفسها.")],["web",t("La consigne doit obligatoirement passer par un site Web.","يجب أن تمر التعليمة عبر موقع ويب.")]].map(([id,label])=><button type="button" key={String(id)} aria-pressed={d.selections.lan===id} className={d.selections.lan===id?"selected":""} onClick={()=>choose("lan",String(id))}><Text value={label as ReturnType<typeof t>}/></button>)}</div></>;
 if(kind==="cables")return <Session4NetworkBuilder draft={d} onChange={onChange}/>;
 if(kind==="equipment")return <div className="s4-equipment-grid s4-equipment-identify">{session4Equipment.map((e,i)=><article key={e.id}><span className="s4-eyebrow">PHOTO {String(i+1).padStart(2,"0")}</span><img src={publicAsset(e.image)} alt={`Photo de matériel réseau ${i+1}`}/><p><Text value={e.role}/></p><label><Text value={t("Cet équipement est…","هذا الجهاز هو…")}/><select aria-label={`Nom de l’équipement ${i+1}`} value={d.selections[e.id]??""} onChange={event=>choose(e.id,event.target.value)}><option value="">Choisir son nom…</option>{session4Equipment.map(option=><option key={option.id} value={option.id}>{option.name.fr}</option>)}</select></label></article>)}</div>;
 if(kind==="topology")return <><p className="s4-help"><Text value={t("Suis les câbles entre les images. Le nom dépend de la façon dont les postes sont reliés.","تتبع الكابلات بين الصور. يعتمد الاسم على طريقة ربط الحواسيب.")}/></p><div className="s4-topology-grid">{(["star","bus","ring"] as const).map((topology,i)=><article key={topology}><span>RÉSEAU {i+1}</span><Session4Topology kind={topology}/><label><Text value={t("Cette topologie est…","هذه البنية هي…")}/><select aria-label={`Topologie du réseau ${i+1}`} value={d.selections[topology]??""} onChange={e=>choose(topology,e.target.value)}><option value="">Choisir…</option><option value="ring">Anneau · حلقية</option><option value="star">Étoile · نجمية</option><option value="bus">Bus · خطية</option></select></label></article>)}</div></>;
 if(kind==="practice")return <RealExchange draft={d} onChange={onChange}/>;
 return null;
}
