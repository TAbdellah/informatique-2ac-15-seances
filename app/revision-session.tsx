"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, ExternalLink, RotateCcw, Target, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { StudentProfile } from "@/lib/supabase-api";
import { useTeacherCourse } from "@/lib/teacher-course-context";
import { publicAsset } from "@/lib/public-assets";
import "./revision-session.css";

type Question = {
  id: string;
  section: string;
  title: string;
  ar: string;
  choices: string[];
  correct: number[];
  image?: { src: string; alt: string };
  kind?: "choice" | "text";
  accepted?: string[];
  placeholder?: string;
  multiple?: boolean;
  hint: string;
  explanation: string;
};

type Submission = {
  sessionId: number;
  activityType: "workshop" | "quiz" | "session_completion";
  activityId: string;
  answer: unknown;
  isCorrect?: boolean;
  score?: number;
  maxScore?: number;
};

const evaluationUrl = "https://tabdellah.github.io/evaluation-1-2ac/duo/#eleve";

const questions: Question[] = [
  { id:"info-definition", section:"Information & traitement", title:"L’informatique est la science…", ar:"المعلوميات هي علم…", choices:["du traitement automatique des informations","de la fabrication des claviers","du dessin uniquement","de la connexion à Internet"], correct:[0], hint:"Cherche les deux mots qui forment l’idée d’informatique.", explanation:"L’informatique étudie le traitement automatique des informations." },
  { id:"info-formes", section:"Information & traitement", title:"Choisis les quatre formes d’information étudiées.", ar:"اختر أشكال المعلومات الأربعة المدروسة.", choices:["Texte","Image","Son","Vidéo","Clavier","Dossier"], correct:[0,1,2,3], multiple:true, hint:"Une forme permet de présenter ou transmettre une information.", explanation:"Une information peut être présentée sous forme de texte, d’image, de son ou de vidéo." },
  { id:"info-cycle", section:"Information & traitement", title:"Quel ordre décrit correctement un traitement ?", ar:"ما الترتيب الصحيح الذي يصف المعالجة؟", choices:["État initial → traitement → état final","Traitement → état final → état initial","État final → état initial → traitement","Information → clavier → Internet"], correct:[0], hint:"On part d’une situation de départ pour obtenir un résultat.", explanation:"Le traitement transforme un état initial en un état final." },
  { id:"info-types", section:"Information & traitement", title:"Un lave-vaisselle réalise seul lavage, rinçage et séchage. Le traitement est…", ar:"غسالة الصحون تنجز الغسل والشطف والتجفيف وحدها. المعالجة…", choices:["manuelle","semi-automatique","automatique","sans traitement"], correct:[2], hint:"Observe qui réalise toutes les opérations.", explanation:"La machine exécute toutes les étapes : le traitement est automatique." },

  { id:"materiel-role", section:"Matériel & capacités", title:"Écris le nom du composant qui exécute les instructions et les calculs.", ar:"اكتب اسم المكون الذي ينفذ التعليمات والحسابات.", choices:[], correct:[], kind:"text", accepted:["processeur","cpu","microprocesseur"], placeholder:"Nom du composant…", hint:"On le compare souvent au cerveau de l’ordinateur.", explanation:"Le processeur exécute les instructions et effectue les calculs." },
  { id:"materiel-memoire", section:"Matériel & capacités", title:"Quelle proposition distingue correctement RAM et SSD ?", ar:"أي اقتراح يميز بشكل صحيح بين RAM وSSD؟", choices:["RAM temporaire, SSD stockage durable","RAM durable, SSD temporaire","Les deux sont des écrans","Ils ont exactement le même rôle"], correct:[0], hint:"Les données de la RAM disparaissent à l’arrêt.", explanation:"La RAM est une mémoire de travail temporaire ; le SSD conserve durablement les fichiers." },
  { id:"materiel-peripheriques", section:"Matériel & capacités", title:"Quels éléments sont des périphériques d’entrée ?", ar:"ما العناصر التي تعتبر أجهزة إدخال؟", choices:["Clavier","Souris","Scanner","Écran","Imprimante"], correct:[0,1,2], multiple:true, hint:"Ils envoient des données vers l’unité centrale.", explanation:"Clavier, souris et scanner permettent d’introduire des données." },
  { id:"materiel-conversion1", section:"Matériel & capacités", title:"Avec 1 Go = 1000 Mo, calcule puis écris la valeur de 3 Go en Mo.", ar:"إذا كان 1 Go = 1000 Mo، احسب واكتب قيمة 3 Go بوحدة Mo.", choices:[], correct:[], kind:"text", accepted:["3000 mo","3 000 mo","3000mo"], placeholder:"… Mo", hint:"Pour descendre de Go vers Mo, on multiplie par 1000.", explanation:"3 × 1000 = 3 000 Mo." },
  { id:"materiel-conversion2", section:"Matériel & capacités", title:"Avec 1 Go = 1000 Mo, calcule puis écris la valeur de 5 000 Mo en Go.", ar:"إذا كان 1 Go = 1000 Mo، احسب واكتب قيمة 5000 Mo بوحدة Go.", choices:[], correct:[], kind:"text", accepted:["5 go","5go","5"], placeholder:"… Go", hint:"Pour monter de Mo vers Go, on divise par 1000.", explanation:"5 000 ÷ 1000 = 5 Go." },

  { id:"systeme-role", section:"Système & fichiers", title:"Quel est le rôle principal du système d’exploitation ?", ar:"ما الدور الأساسي لنظام التشغيل؟", choices:["Gérer le matériel et permettre l’utilisation des applications","Remplacer l’écran","Augmenter physiquement la RAM","Créer une connexion Internet"], correct:[0], hint:"Sans lui, l’ordinateur ne peut pas offrir son environnement de travail.", explanation:"Le système d’exploitation gère les ressources et permet de lancer les applications." },
  { id:"systeme-exemples", section:"Système & fichiers", title:"Quels éléments sont des systèmes d’exploitation ?", ar:"ما العناصر التي تعتبر أنظمة تشغيل؟", choices:["Windows","Android","Linux","Word","Chrome"], correct:[0,1,2], multiple:true, hint:"Une application fonctionne à l’intérieur d’un système.", explanation:"Windows, Android et Linux sont des systèmes d’exploitation." },
  { id:"systeme-fichier", section:"Système & fichiers", title:"Écris le nom de l’élément qui sert à regrouper et organiser des fichiers.", ar:"اكتب اسم العنصر الذي يستعمل لتجميع الملفات وتنظيمها.", choices:[], correct:[], kind:"text", accepted:["dossier","un dossier","repertoire","répertoire"], placeholder:"Ta réponse…", hint:"Il peut contenir plusieurs documents et sous-dossiers.", explanation:"Un dossier sert à classer des fichiers et d’autres dossiers." },

  { id:"reseau-equipement", section:"Réseau local", title:"Écris le nom de l’équipement qui relie plusieurs ordinateurs dans un réseau local.", ar:"اكتب اسم الجهاز الذي يربط عدة حواسيب داخل شبكة محلية.", choices:[], correct:[], kind:"text", accepted:["switch","commutateur","un switch","le switch"], placeholder:"Nom de l’équipement…", hint:"Il distribue les échanges entre les postes du réseau.", explanation:"Le switch, ou commutateur, relie les équipements d’un réseau local." },
  { id:"reseau-topologie", section:"Réseau local", title:"Dans quelle topologie tous les postes sont reliés à un équipement central ?", ar:"في أي طوبولوجيا ترتبط جميع الحواسيب بجهاز مركزي؟", choices:["Étoile","Bus","Anneau","Ligne téléphonique"], correct:[0], hint:"Sa forme rappelle un astre avec plusieurs branches.", explanation:"Dans la topologie en étoile, chaque poste est relié au switch central." },
  { id:"reseau-internet", section:"Réseau local", title:"Un réseau local peut-il fonctionner sans Internet ?", ar:"هل يمكن للشبكة المحلية أن تعمل بدون الإنترنت؟", choices:["Oui, les postes peuvent encore échanger localement","Non, jamais","Seulement avec une imprimante éteinte","Seulement sans switch"], correct:[0], hint:"Réseau local et Internet ne désignent pas la même chose.", explanation:"Les postes d’un LAN peuvent partager des ressources même si Internet est coupé." },
  { id:"reseau-ip", section:"Réseau local", title:"Deux PC utilisent 192.168.1.10. Quelle adresse peut corriger le conflit du second PC ?", ar:"يستعمل حاسوبان العنوان 192.168.1.10. ما العنوان الذي يمكن أن يصحح التعارض؟", choices:["192.168.1.10","192.168.1.11","192.168.1.10 encore une fois","Le même nom sans adresse"], correct:[1], hint:"Chaque poste doit avoir une adresse unique dans le même réseau.", explanation:"192.168.1.11 est différente tout en restant dans le même réseau." },
  { id:"reseau-commandes", section:"Réseau local", title:"Écris la commande qui permet de tester si un autre poste répond sur le réseau.", ar:"اكتب الأمر الذي يسمح باختبار استجابة حاسوب آخر على الشبكة.", choices:[], correct:[], kind:"text", accepted:["ping","ping 192.168.1.10","ping 192.168.1.11"], placeholder:"Commande CMD…", hint:"Cette commande envoie de petits messages de test.", explanation:"La commande ping vérifie la communication avec une autre machine." },
  { id:"info-observation", section:"Information & traitement", title:"Cette caisse lit le code-barres puis calcule le prix. Quel type de traitement est illustré ?", ar:"تقرأ هذه الصندوقة الرمز الشريطي ثم تحسب الثمن. ما نوع المعالجة؟", image:{src:"treatment-situations/caisse-scanner.jpg",alt:"Caisse équipée d’un lecteur de codes-barres"}, choices:["Manuel","Semi-automatique","Sans information","Uniquement humain"], correct:[1], hint:"L’humain présente le produit et la machine réalise une partie du traitement.", explanation:"L’action est semi-automatique : l’humain et la machine collaborent." },
  { id:"materiel-photo-uc", section:"Matériel & capacités", title:"Observe la photographie et écris le nom de cet appareil.", ar:"لاحظ الصورة واكتب اسم هذا الجهاز.", image:{src:"session2/items/unite-centrale-lenovo.jpg",alt:"Appareil informatique à identifier"}, choices:[], correct:[], kind:"text", accepted:["unite centrale","unité centrale","uc","boitier","boîtier"], placeholder:"Nom de l’appareil…", hint:"Il contient les principaux composants internes.", explanation:"Il s’agit de l’unité centrale de l’ordinateur." },
  { id:"materiel-photo-interne", section:"Matériel & capacités", title:"Observe l’image. Quels éléments appartiennent à l’intérieur de l’unité centrale ?", ar:"لاحظ الصورة. ما العناصر الموجودة داخل الوحدة المركزية؟", image:{src:"session2/composants-internes.webp",alt:"Composants internes d’un ordinateur"}, choices:["Carte mère","Processeur","RAM","Souris","Imprimante"], correct:[0,1,2], multiple:true, hint:"Choisis les composants fixés ou branchés dans le boîtier.", explanation:"La carte mère, le processeur et la RAM sont des composants internes." },
  { id:"materiel-ports", section:"Matériel & capacités", title:"Quel ensemble permet de brancher des périphériques à l’ordinateur ?", ar:"أي مجموعة تسمح بربط الأجهزة الطرفية بالحاسوب؟", image:{src:"session2/connecteurs-ports.webp",alt:"Connecteurs et ports d’un ordinateur"}, choices:["Les ports et connecteurs","Les dossiers","Les logiciels","Les adresses IP"], correct:[0], hint:"Observe les prises visibles sur l’image.", explanation:"Les ports et connecteurs assurent la liaison physique avec les périphériques." },
  { id:"materiel-conversion-regle", section:"Matériel & capacités", title:"D’après la règle illustrée, quelle opération utilise-t-on pour passer de Mo vers Go ?", ar:"حسب القاعدة الموضحة، ما العملية المستعملة للانتقال من Mo إلى Go؟", image:{src:"session2/regle-conversion-capacites.png",alt:"Règle de conversion des unités de capacité"}, choices:["Diviser par 1000","Multiplier par 1000","Ajouter 100","Soustraire 8"], correct:[0], hint:"On monte vers une unité plus grande.", explanation:"Pour passer de Mo vers Go, on divise par 1000." },
  { id:"systeme-photo", section:"Système & fichiers", title:"Quels systèmes d’exploitation reconnais-tu sur cette image ?", ar:"ما أنظمة التشغيل التي تتعرف عليها في هذه الصورة؟", image:{src:"session3/ressources/systemes-exploitation.png",alt:"Logos de systèmes d’exploitation"}, choices:["Windows","Android","Linux","Excel","PowerPoint"], correct:[0,1,2], multiple:true, hint:"Ne confonds pas système d’exploitation et application.", explanation:"Windows, Android et Linux sont des systèmes d’exploitation." },
  { id:"systeme-interface", section:"Système & fichiers", title:"L’image représente principalement…", ar:"تمثل الصورة أساسًا…", image:{src:"session3/visuels/ecran-windows.svg",alt:"Interface graphique de Windows"}, choices:["une interface graphique Windows","un câble réseau","une carte mère","une unité de capacité"], correct:[0], hint:"On y trouve le bureau, les fenêtres et les icônes.", explanation:"C’est l’interface graphique du système Windows." },
  { id:"reseau-photo-switch", section:"Réseau local", title:"Identifie cet équipement et son rôle.", ar:"حدد هذا الجهاز ودوره.", image:{src:"session4/images/commutateur.webp",alt:"Commutateur réseau"}, choices:["Switch — relie les appareils du LAN","Routeur — imprime les documents","Scanner — émet le Wi-Fi","Écran — transporte les données"], correct:[0], hint:"Il possède plusieurs ports RJ45 numérotés.", explanation:"Le switch relie plusieurs appareils au sein du réseau local." },
  { id:"reseau-photo-plan", section:"Réseau local", title:"Pour connecter les postes visibles par câble autour d’un switch, quelle topologie faut-il choisir ?", ar:"لربط الحواسيب الظاهرة بالكابل حول مبدل، ما الطوبولوجيا المناسبة؟", image:{src:"session4/reseau-salle.png",alt:"Schéma d’un réseau de salle informatique"}, choices:["Étoile","Anneau","Bus sans équipement central","Aucune topologie"], correct:[0], hint:"Chaque poste possède son propre câble vers le centre.", explanation:"Le switch occupe le centre d’une topologie en étoile." },
];

const sectionOrder = ["Information & traitement", "Matériel & capacités", "Système & fichiers", "Réseau local"];
questions.sort((a,b) => sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section));

function sameAnswer(a: number[], b: number[]) {
  return [...a].sort((x,y)=>x-y).join(",") === [...b].sort((x,y)=>x-y).join(",");
}

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").trim().replace(/\s+/g, " ");
}

export default function RevisionSession({ student, completed, onBack, onChangeStudent, onToggleCompleted, onRecordSubmission }: {
  student: StudentProfile;
  completed: boolean;
  onBack: () => void;
  onChangeStudent: () => void;
  onToggleCompleted: () => void;
  onRecordSubmission: (submission: Submission) => void;
}) {
  const teacherMode = useTeacherCourse();
  const storageKey = `lab2ac-revision-5-v3-${student.id}`;
  const [index,setIndex]=useState(0);
  const [answers,setAnswers]=useState<Record<string,number[]>>({});
  const [textAnswers,setTextAnswers]=useState<Record<string,string>>({});
  const [attempts,setAttempts]=useState<Record<string,number>>({});
  const [passed,setPassed]=useState<string[]>([]);
  const [status,setStatus]=useState<"idle"|"wrong"|"correct">("idle");
  const [showBilan,setShowBilan]=useState(false);
  const [redirectIn,setRedirectIn]=useState(10);
  const [autoRedirect,setAutoRedirect]=useState(true);
  const [restored,setRestored]=useState(false);
  const question=questions[index];

  useEffect(()=>{const timer=window.setTimeout(()=>{try{const raw=localStorage.getItem(storageKey);if(raw){const s=JSON.parse(raw);setIndex(Math.min(Number(s.index)||0,questions.length-1));setAnswers(s.answers||{});setTextAnswers(s.textAnswers||{});setAttempts(s.attempts||{});setPassed(Array.isArray(s.passed)?s.passed:[]);setShowBilan(Boolean(s.showBilan));}}catch{}finally{setRestored(true)}},0);return()=>window.clearTimeout(timer)},[storageKey]);
  useEffect(()=>{if(!restored)return;try{localStorage.setItem(storageKey,JSON.stringify({index,answers,textAnswers,attempts,passed,showBilan}))}catch{}},[restored,storageKey,index,answers,textAnswers,attempts,passed,showBilan]);
  useEffect(()=>{if(!showBilan||teacherMode||!autoRedirect)return;const preview=new URLSearchParams(location.search).get("preview")==="session5-revision";if(preview)return;const timer=window.setInterval(()=>setRedirectIn(v=>{if(v<=1){window.clearInterval(timer);window.location.assign(evaluationUrl);return 0}return v-1}),1000);return()=>window.clearInterval(timer)},[showBilan,teacherMode,autoRedirect]);

  const firstTry=useMemo(()=>questions.filter(q=>attempts[q.id]===1).length,[attempts]);
  const totalAttempts=useMemo(()=>Object.values(attempts).reduce((a,b)=>a+b,0),[attempts]);
  const preparationScore=useMemo(()=>Math.round(questions.reduce((sum,q)=>{const n=attempts[q.id]||4;return sum+(n===1?1:n===2 ? .75:n===3 ? .5:.25)},0)/questions.length*20),[attempts]);
  const sectionResults=useMemo(()=>[...new Set(questions.map(q=>q.section))].map(section=>{const list=questions.filter(q=>q.section===section);const good=list.filter(q=>(attempts[q.id]||99)<=2).length;return{section,value:Math.round(good/list.length*100)}}),[attempts]);

  function choose(choice:number){if(status==="correct")return;setStatus("idle");setAnswers(old=>{const current=old[question.id]||[];const next=question.multiple?(current.includes(choice)?current.filter(v=>v!==choice):[...current,choice]):[choice];return{...old,[question.id]:next}})}
  function verify(){const answer=answers[question.id]||[];const textAnswer=textAnswers[question.id]||"";if(question.kind==="text"?!textAnswer.trim():answer.length===0)return;const count=(attempts[question.id]||0)+1;const correct=question.kind==="text"?(question.accepted||[]).map(normalizeText).includes(normalizeText(textAnswer)):sameAnswer(answer,question.correct);setAttempts(old=>({...old,[question.id]:count}));setStatus(correct?"correct":"wrong");if(correct)setPassed(old=>old.includes(question.id)?old:[...old,question.id]);onRecordSubmission({sessionId:5,activityType:"workshop",activityId:`revision-${question.id}`,answer:question.kind==="text"?{text:textAnswer,attempt:count}:{choices:answer,attempt:count},isCorrect:correct,score:correct?1:0,maxScore:1})}
  function next(){if(status!=="correct"&&!passed.includes(question.id))return;if(index===questions.length-1){setShowBilan(true);if(!completed&&!teacherMode)onToggleCompleted();onRecordSubmission({sessionId:5,activityType:"quiz",activityId:"revision-bilan",answer:{firstTry,totalAttempts,sections:sectionResults},isCorrect:true,score:preparationScore,maxScore:20});return}setIndex(v=>v+1);setStatus(passed.includes(questions[index+1].id)?"correct":"idle")}
  function previous(){if(index===0)return;setIndex(v=>v-1);setStatus(passed.includes(questions[index-1].id)?"correct":"idle")}
  function restart(){setIndex(0);setAnswers({});setTextAnswers({});setAttempts({});setPassed([]);setStatus("idle");setShowBilan(false);setRedirectIn(10);setAutoRedirect(false);localStorage.removeItem(storageKey)}

  if(showBilan)return <div className="revision-shell revision-bilan">
    <header><button onClick={onBack}><ArrowLeft size={18}/> Programme</button><div><Trophy size={28}/><span>Révision terminée</span></div></header>
    <main>
      <div className="revision-result-hero"><span>BILAN DE PRÉPARATION</span><h1>{preparationScore}<small>/20</small></h1><strong>{preparationScore>=16?"Très prêt pour les évaluations":preparationScore>=12?"Prêt, avec une dernière relecture":"Encore quelques notions à renforcer"}</strong><p>Estimation d’entraînement — ce n’est pas une note officielle.</p></div>
      <div className="revision-stats"><div><b>{questions.length}/{questions.length}</b><span>questions comprises</span></div><div><b>{firstTry}</b><span>réussies au 1er essai</span></div><div><b>{totalAttempts}</b><span>tentatives au total</span></div></div>
      <section className="revision-section-report"><h2>Ton niveau par thème</h2>{sectionResults.map(r=><div key={r.section}><span>{r.section}</span><div><i style={{width:`${r.value}%`}}/></div><b>{r.value}%</b></div>)}</section>
      <div className="revision-bilan-actions"><a href={evaluationUrl}>Passer aux évaluations 1 et 2 <ExternalLink size={18}/></a>{!teacherMode&&autoRedirect&&<p>Ouverture automatique dans {redirectIn} s · <button onClick={()=>setAutoRedirect(false)}>Rester sur le bilan</button></p>}<button className="revision-restart" onClick={restart}><RotateCcw size={16}/> Refaire la révision</button></div>
    </main>
  </div>;

  const selected=answers[question.id]||[];const progress=Math.round(passed.length/questions.length*100);
  return <div className="revision-shell">
    <header className="revision-header"><button onClick={onBack}><ArrowLeft size={18}/> Programme</button><div className="revision-heading"><span>SÉANCE 05 · RÉVISION GÉNÉRALE</span><h1>Une heure pour préparer les deux évaluations</h1></div><button className="revision-student" onClick={onChangeStudent}>{student.studentOne}{student.studentTwo?` + ${student.studentTwo}`:""}</button></header>
    <div className="revision-progress"><div><span style={{width:`${progress}%`}}/></div><b>{passed.length}/{questions.length}</b><small><Clock3 size={14}/> 60 min</small></div>
    <main className="revision-main">
      <aside><Target size={25}/><h2>{question.section}</h2><p>Bloc {[...new Set(questions.map(q=>q.section))].indexOf(question.section)+1} sur 4</p><ol>{[...new Set(questions.map(q=>q.section))].map(s=><li className={s===question.section?"active":""} key={s}>{s}</li>)}</ol></aside>
      <section className="revision-card"><div className="revision-question-number">QUESTION {index+1} / {questions.length}</div>{question.image&&<figure className="revision-visual"><img src={publicAsset(question.image.src)} alt={question.image.alt}/><figcaption>{question.image.alt}</figcaption></figure>}<div className="revision-title-row" tabIndex={0}><h2>{question.title}</h2><span className="revision-translation" aria-label="Traduction arabe"><span>AR</span><b lang="ar" dir="rtl">{question.ar}</b></span></div><p className="revision-instruction">{question.kind==="text"?"Observe, réfléchis puis écris ta réponse.":question.multiple?"Plusieurs réponses sont possibles.":"Une seule réponse est possible."} · Survole la question pour afficher sa traduction arabe.</p>{question.kind==="text"?<div className="revision-text-answer"><label htmlFor={`answer-${question.id}`}>Ta réponse</label><input id={`answer-${question.id}`} value={textAnswers[question.id]||""} placeholder={question.placeholder} disabled={status==="correct"} onChange={event=>{setStatus("idle");setTextAnswers(old=>({...old,[question.id]:event.target.value}))}} onKeyDown={event=>{if(event.key==="Enter")verify()}}/></div>:<div className="revision-choices">{question.choices.map((choice,i)=><button key={choice} className={selected.includes(i)?"selected":""} onClick={()=>choose(i)} disabled={status==="correct"}><span>{String.fromCharCode(65+i)}</span>{choice}{selected.includes(i)&&<CheckCircle2 size={20}/>}</button>)}</div>}
      {status!=="idle"&&<div className={`revision-feedback ${status}`}><strong>{status==="correct"?"Réussi — notion comprise":"À corriger — essaie encore"}</strong><p>{status==="correct"?question.explanation:question.hint}</p></div>}
      <div className="revision-actions"><button onClick={previous} disabled={index===0}><ArrowLeft size={17}/> Précédent</button>{status!=="correct"&&!passed.includes(question.id)?<button className="verify" onClick={verify} disabled={question.kind==="text"?!(textAnswers[question.id]||"").trim():selected.length===0}>Vérifier ma réponse</button>:<button className="next" onClick={next}>{index===questions.length-1?"Afficher mon bilan":"Question suivante"}<ArrowRight size={17}/></button>}</div></section>
    </main>
  </div>;
}
