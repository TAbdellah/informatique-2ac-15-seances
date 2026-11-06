"use client";
import type {ReactNode} from "react";
import {Cable,Check,Download,FileText,Folder,FolderPlus,Monitor,Network,Terminal,Users,Wifi} from "lucide-react";
import {Session3Text as Text} from "./session3-translation";
import {publicAsset} from "../lib/public-assets";
import {s4t as t,session4Equipment,type Session4Activity} from "./session4-data";
import {isPrivateIPv4,runSession4Command,session4SourceIP,session4PeerIP,type Session4Draft} from "./session4-model";
import {ExpoNetworkLab,ExpoTopologyLab} from "./session4-expo-network";
import {expoFile,expoFolder,expoMedia,expoMessage,expoPath,expoPathCorrect,expoFolderReady,expoShareReady} from "./session4-expo-model";
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
function downloadExample(file: "Affiche.txt" | "Retour.txt") {
 const content=file==="Affiche.txt"?expoMessage:"Bien reçu, le club !";
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
   <PracticeTask number={1} post="POSTE A" title={t("Partager Affiche.txt","مشاركة Affiche.txt")} {...task("source")}>
    <p><Text value={t("Crée Club_reseau dans Documents. Place Affiche.txt dans ce dossier.","أنشئ Club_reseau داخل Documents وضع فيه Affiche.txt.")}/></p>
    <button type="button" className="s4-file-download" onClick={()=>downloadExample("Affiche.txt")}><Download size={15}/><Text value={t("Télécharger Affiche.txt","تنزيل Affiche.txt")}/></button>
    <p><Text value={t("Clic droit sur Club_reseau → Afficher plus d’options → Accorder l’accès à → Des personnes spécifiques. Donne le droit Lecture au compte indiqué.","انقر Club_reseau بالزر الأيمن ثم إظهار المزيد من الخيارات ثم منح حق الوصول ثم أشخاص محددون. امنح الحساب المحدد صلاحية القراءة.")}/></p>
   </PracticeTask>
   <PracticeTask number={2} post="POSTE B" title={t("Ouvrir et copier Affiche.txt","فتح Affiche.txt ونسخه")} {...task("receive")}>
    <p><Text value={t("Saisis ce chemin dans la barre d’adresse de l’Explorateur et appuie sur Entrée.","اكتب هذا المسار في شريط عنوان المستكشف واضغط Enter.")}/></p>
    <code className="s4-unc-example">{path(draft.ip,"IPv4-du-poste-A")}</code>
    <p><Text value={t("Ouvre Affiche.txt puis copie-le sur ton Bureau.","افتح Affiche.txt ثم انسخه إلى سطح مكتبك.")}/></p>
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
  <details className="s4-real-details">
   <summary><Text value={t("Confirmer la réception avec BeeBEEP","تأكيد التوصل باستعمال BeeBEEP")}/></summary>
   <p><Text value={t("Si BeeBEEP est ouvert sur les postes, vérifie le destinataire puis envoie-lui la phrase lue dans son fichier.","إذا كان BeeBEEP مفتوحًا على الحواسيب، تحقق من المستلم ثم أرسل إليه العبارة التي قرأتها في ملفه.")}/></p>
  </details>
  <p className="s4-help"><Text value={t("Ton enseignant vérifiera le compte rendu et les fichiers sur les deux postes.","سيتحقق أستاذك من التقرير والملفات على الحاسوبين.")}/></p>
 </div>;
}


type LabProps = { draft:Session4Draft; onChange:(patch:Partial<Session4Draft>)=>void };

function Inventory({draft,onChange}:LabProps) {
 const stock=[session4Equipment[4],session4Equipment[1],session4Equipment[3],session4Equipment[5],session4Equipment[0],session4Equipment[2]];
 function choose(field:string,value:string) { onChange({selections:{...draft.selections,[field]:value}}); }
 return <div className="expo-inventory">
  {stock.map((item,i)=>{
   const number=String(i+1).padStart(2,"0");
   const nameKey=`name-${item.id}`,roleKey=`role-${item.id}`;
   const identified=draft.selections[nameKey]===item.id,understood=draft.selections[roleKey]===item.id;
   return <article key={item.id} className="expo-photo-card">
    <div className="expo-packshot"><span>CAISSE {number}</span><img src={publicAsset(item.image)} alt={`Matériel réseau à identifier · photo ${i+1}`} /></div>
    <label><Text value={t("Nom de l’équipement","اسم الجهاز")}/>
     <select aria-label={`Nom · caisse ${i+1}`} value={draft.selections[nameKey]??""} onChange={e=>choose(nameKey,e.target.value)}>
      <option value="">Associer un nom…</option>{session4Equipment.map(option=><option key={option.id} value={option.id}>{option.name.fr}</option>)}
     </select>
    </label>
    <label><Text value={t("Sa fonction dans le réseau","وظيفته داخل الشبكة")}/>
     <select aria-label={`Fonction · caisse ${i+1}`} value={draft.selections[roleKey]??""} onChange={e=>choose(roleKey,e.target.value)}>
      <option value="">Associer une fonction…</option>{[...session4Equipment].reverse().map(option=><option key={option.id} value={option.id}>{option.role.fr}</option>)}
     </select>
    </label>
    {draft.result!==null&&<p className={`expo-inventory-feedback ${identified&&understood?"good":""}`} role="status">
     <Text value={identified&&understood?t("Caisse identifiée","تم التعرف على الجهاز"):identified?t("La fonction reste à trouver","ابحث عن الوظيفة"):understood?t("Le nom reste à trouver","ابحث عن الاسم"):t("Revois le nom et la fonction","راجع الاسم والوظيفة")}/>
    </p>}
   </article>;
  })}
 </div>;
}

function MediaChoice({draft,onChange}:LabProps) {
 return <div className="expo-media-grid">
  {expoMedia.map(device=><article className="expo-media-card" key={device.id}>
   <img src={publicAsset(device.image)} alt="" /><div><h3><Text value={device.name}/></h3><p><Text value={device.clue}/></p></div>
   <div role="group" aria-label={`Liaison · ${device.name.fr}`}>
    {[{id:"wired",icon:Cable,label:t("RJ45","كابل RJ45")},{id:"wifi",icon:Wifi,label:t("Wi-Fi","Wi-Fi")}].map(({id,icon:Icon,label})=>
     <button type="button" key={id} aria-pressed={draft.selections[device.id]===id} onClick={()=>onChange({selections:{...draft.selections,[device.id]:id}})}>
      <Icon size={16} aria-hidden="true"/><Text value={label}/>
     </button>)}
   </div>
  </article>)}
 </div>;
}

function FolderLab({draft,onChange}:LabProps) {
 const [s,folderReady,shareReady]=[draft.selections,expoFolderReady(draft),expoShareReady(draft)];
 const paths=[["","","192.168.10.22",expoFolder].join("\\"),["C:","Documents",expoFolder].join("\\"),expoPath];
 const mark=(changes:Record<string,string>,patch:Partial<Session4Draft>={})=>onChange({...patch,selections:{...s,...changes}});
 const open=draft.opened&&shareReady&&expoPathCorrect(draft.path);
 return <div className="expo-share">
  <div className="expo-wired-strip">
   <img src={publicAsset("session4/images/ordinateur-bureau.webp")} alt=""/><b>PC-21</b><span/>
   <img src={publicAsset("session4/images/commutateur.webp")} alt=""/><b>RJ45</b><span/>
   <img src={publicAsset("session4/images/ordinateur-bureau.webp")} alt=""/><b>PC-22</b>
  </div>
  <div className="expo-share-grid">
   <section className="expo-station">
    <header><Monitor size={18}/><span>PC-21 · <Text value={t("Source","المصدر")}/></span><code>{session4SourceIP}</code></header>
    <form onSubmit={e=>{e.preventDefault();if(s.folderInput?.trim())mark({folder:s.folderInput.trim(),file:"",read:"",copied:"",triedPath:""},{shared:false,opened:false});}}>
     <label><Text value={t("1 · Nom du nouveau dossier","1 · اسم المجلد الجديد")}/>
      <input aria-label="Nom du nouveau dossier" value={s.folderInput??""} placeholder={expoFolder} maxLength={40} onChange={e=>mark({folderInput:e.target.value})}/>
     </label>
     <button type="submit" disabled={!s.folderInput?.trim()}><FolderPlus size={17}/><Text value={t("Créer","إنشاء")}/></button>
    </form>
    {s.folder&&<div className="expo-folder-token"><Folder size={21}/><strong>{s.folder}</strong>{s.file==="placed"&&<span>{expoFile}</span>}</div>}
    <button type="button" disabled={!folderReady||s.file==="placed"} onClick={()=>mark({file:"placed"})}><FileText size={17}/><Text value={t(`2 · Déposer ${expoFile}`,`2 · وضع ${expoFile}`)}/></button>
    <label><Text value={t("3 · Quel droit suffit au voisin ?","3 · ما الصلاحية الكافية للزميل؟")}/>
     <select aria-label="Droit du partage" value={draft.permission} disabled={s.file!=="placed"} onChange={e=>mark({read:"",copied:"",triedPath:""},{permission:e.target.value,shared:false,opened:false})}>
      <option value="">Choisir…</option><option value="none">Aucun accès</option><option value="write">Lecture et écriture</option><option value="read">Lecture</option>
     </select>
    </label>
    <button type="button" disabled={s.file!=="placed"||!draft.permission} onClick={()=>onChange({shared:true})}><Network size={17}/><Text value={t("Partager sur le réseau","المشاركة عبر الشبكة")}/></button>
    {draft.shared&&<p role="status"><Text value={draft.permission==="read"?t("Partagé en lecture.","تمت المشاركة للقراءة."):draft.permission==="none"?t("Le voisin n’a aucun accès.","لا يملك الزميل صلاحية الولوج."):t("Le voisin peut aussi modifier. Pour cette mission, le droit Lecture suffit.","يمكن للزميل أيضًا التعديل. تكفي صلاحية القراءة في هذه المهمة.")}/></p>}
   </section>
   <section className="expo-station">
    <header><Monitor size={18}/><span>PC-22 · <Text value={t("Destinataire","المستلم")}/></span><code>{session4PeerIP}</code></header>
    <label><Text value={t("4 · Chemin du dossier dans l’Explorateur","4 · مسار المجلد في المستكشف")}/>
     <select aria-label="Chemin du dossier" value={draft.path} onChange={e=>mark({read:"",copied:"",triedPath:""},{path:e.target.value,opened:false})}>
      <option value="">Choisir le chemin…</option>{paths.map(path=><option key={path}>{path}</option>)}
     </select>
    </label>
    <button type="button" disabled={!draft.path} onClick={()=>mark({triedPath:"yes"},{opened:shareReady&&expoPathCorrect(draft.path)})}><Folder size={17}/><Text value={t("Ouvrir le partage","فتح المجلد المشترك")}/></button>
    {s.triedPath==="yes"&&!open&&<p role="status"><Text value={t("Dossier inaccessible. Vérifie l’adresse du poste source et son droit de partage.","يتعذر فتح المجلد. تحقق من عنوان الحاسوب المصدر وصلاحية المشاركة.")}/></p>}
    {open&&<div className="expo-received-file"><FileText size={25}/><strong>{expoFile}</strong>
     <button type="button" onClick={()=>mark({copied:"yes"})}><Text value={s.copied==="yes"?t("Copie sur le Bureau","نسخة على سطح المكتب"):t("Copier sur le Bureau","نسخ إلى سطح المكتب")}/></button>
     <button type="button" disabled={s.copied!=="yes"} onClick={()=>mark({read:"yes"})}><Text value={t("Lire la copie","قراءة النسخة")}/></button>
     {s.read==="yes"&&<p role="status"><Text value={t(expoMessage,"موعدنا في الجناح 04 على الساعة العاشرة.")}/></p>}
    </div>}
   </section>
  </div>
 </div>;
}

const commands=["ipconfig","hostname",`ping ${session4PeerIP}`];
function IdentityLab({draft,onChange}:LabProps) {
 function run() {
  const command=draft.command.trim().toLowerCase().replace(/\s+/g," ");
  if(!command)return;
  const result=runSession4Command(command,true);
  onChange({command:"",commands:commands.includes(command)?[...new Set([...draft.commands,command])]:draft.commands,
   output:`C:\\> ${command}\n\n${result}`,selections:{...draft.selections,commandRun:"yes"}});
 }
 return <div className="expo-identity">
  <section className="expo-terminal">
   <header><Terminal size={19}/> <Text value={t("Invite de commandes","نافذة الأوامر")}/></header>
   <pre aria-live="polite">{draft.output}</pre>
   <form onSubmit={e=>{e.preventDefault();run();}}>
    <label><Text value={t("Commande","الأمر")}/><input aria-label="Commande réseau" spellCheck={false} maxLength={80} value={draft.command} onChange={e=>onChange({command:e.target.value})}/></label>
    <button type="submit" disabled={!draft.command.trim()}><Text value={t("Exécuter","تنفيذ")}/></button>
   </form>
   <div className="expo-command-tools">{commands.map(command=><button type="button" key={command} aria-label={`Préparer ${command}`} onClick={()=>onChange({command})}>{draft.commands.includes(command)&&<Check size={14}/>}<code>{command}</code></button>)}</div>
  </section>
  <aside className="expo-ticket">
   <span>FICHE DE RACCORDEMENT</span>
   <img src={publicAsset("session4/images/ordinateur-bureau.webp")} alt="Poste fixe du club"/>
   <label><Text value={t("Adresse IPv4 relevée","عنوان IPv4 المقروء")}/><input aria-label="Adresse IPv4 relevée" maxLength={15} value={draft.ip} onChange={e=>onChange({ip:e.target.value})}/></label>
   <label><Text value={t("Nom du PC relevé","اسم الحاسوب المقروء")}/><input aria-label="Nom du PC relevé" maxLength={30} value={draft.host} onChange={e=>onChange({host:e.target.value})}/></label>
  </aside>
 </div>;
}

export function Session4ActivityPlayer({activity,draft,onChange}:LabProps&{activity:Session4Activity}) {
 switch(activity.kind){
  case "inventory": return <Inventory draft={draft} onChange={onChange}/>;
  case "media": return <MediaChoice draft={draft} onChange={onChange}/>;
  case "plans": return <ExpoTopologyLab draft={draft} onChange={onChange}/>;
  case "wired":
  case "wireless":
  case "mixed":
  case "diagnostic": return <ExpoNetworkLab kind={activity.kind} draft={draft} onChange={onChange}/>;
  case "folder": return <FolderLab draft={draft} onChange={onChange}/>;
  case "identity": return <IdentityLab draft={draft} onChange={onChange}/>;
  case "practice": return <RealExchange draft={draft} onChange={onChange}/>;
 }
}
