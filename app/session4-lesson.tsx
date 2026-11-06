"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,BookOpen,CheckCircle2,ClipboardCheck,CloudOff,FileCheck2,Flag,FlaskConical,Folder,GraduationCap,LoaderCircle,Monitor,Network,Send,Target,Users,X} from "lucide-react";
import {Session3Text as Text,Session3TranslationScope} from "./session3-translation";
import {useTeacherCourse} from "../lib/teacher-course-context";
import {useDurableLessonState,LearningSaveBadge} from "../lib/learning-context";
import {readSnapshot} from "../lib/learning-storage";
import {publicAsset} from "../lib/public-assets";
import type {StudentProfile} from "../lib/supabase-api";
import {WorkshopSummary,WorkshopSummaryLink,workshopSummaryTitle} from "./workshop-summary";
import {session4DraftPercent} from "../lib/workshop-progress";
import {TeacherExerciseNavigator} from "./teacher-exercise-navigator";
import {Session4ActivityPlayer,Session4Topology} from "./session4-activities";
import {session4,session4Activities,s4t as t} from "./session4-data";
import {freshSession4Draft,initialSession4Workshop,validSession4Workshop,session4ActivityChecks,session4AnswerState,type Session4Draft,type Session4WorkshopState} from "./session4-model";
import {session4Questions,gradeSession4} from "../supabase/functions/informatique-2ac-api/session4-evaluation";
import "./session4.css";
import "./session4-expo.css";

type Tab="mission"|"workshop"|"trace"|"quiz";
export type Session4Submission={sessionId:number;activityType:"workshop"|"practical_evaluation";activityId:string;answer:unknown;isCorrect?:boolean;score?:number;maxScore?:number};
type Props={student:StudentProfile;activeTab:Tab;onTab:(tab:Tab)=>void;onBack:()=>void;onChangeStudent:()=>void;onRecordSubmission:(submission:Session4Submission)=>void};
const tabs=[{id:"mission",icon:Flag,label:t("Mission","المهمة")},{id:"workshop",icon:FlaskConical,label:t("Atelier","الورشة")},{id:"trace",icon:BookOpen,label:t("Trace écrite","خلاصة الدرس")},{id:"quiz",icon:FileCheck2,label:t("Évaluation","التقويم")}] as const;
const phases=[{minutes:10,title:t("Comprendre le défi","فهم التحدي")},{minutes:85,title:t("Pratiquer dans l’atelier","التطبيق في الورشة")},{minutes:10,title:t("Retenir l’essentiel","تثبيت الأساسيات")},{minutes:15,title:t("Évaluer mes acquis","تقويم مكتسباتي")}];

export default function Session4Lesson({student,activeTab,onTab,onBack,onChangeStudent,onRecordSubmission}:Props){
 const teacher=useTeacherCourse();const [visited,setVisited]=useState<Tab[]>([activeTab]);
 function open(tab:Tab){setVisited(v=>v.includes(tab)?v:[...v,tab]);onTab(tab);requestAnimationFrame(()=>document.querySelector('.main-scroll')?.scrollTo({top:0,behavior:"auto"}))}
 return <Session3TranslationScope enabled scopeKey={`session4-${activeTab}`}><div className="session4-lesson session3-theme">
  <header className="s4-course-header"><button type="button" className="s4-back" onClick={onBack}><ArrowLeft size={17}/><span>Programme</span></button><div className="s4-brand"><Network size={24}/><div><strong>LAB·2AC</strong><small>SÉANCE 04 · 2 HEURES</small></div></div>{teacher?<span className="s4-profile"><GraduationCap size={19}/> Professeur · démonstration</span>:<button type="button" className="s4-profile" onClick={onChangeStudent}><Users size={19}/><span>{student.studentOne}{student.isPair&&student.studentTwo?` + ${student.studentTwo}`:""}<small>{student.className} · Groupe {student.groupName}</small></span></button>}</header>
  {!teacher&&<LearningSaveBadge/>}
  <nav className="s4-tabs" aria-label="Contenu de la séance 4">{tabs.map(({id,icon:Icon,label})=><button type="button" key={id} aria-current={activeTab===id?"page":undefined} className={activeTab===id?"active":""} onClick={()=>open(id)}><Icon size={19}/><span>{label.fr}<small lang="ar" dir="rtl">{label.ar}</small></span></button>)}</nav>
  {visited.includes("mission")&&<section hidden={activeTab!=="mission"} data-s4-panel="mission"><Mission onStart={()=>open("workshop")}/></section>}
  {visited.includes("workshop")&&<section hidden={activeTab!=="workshop"} data-s4-panel="workshop"><Workshop participantId={student.id} onRecord={onRecordSubmission} onTrace={()=>open("trace")} onEvaluate={()=>open("quiz")}/></section>}
  {visited.includes("trace")&&<section hidden={activeTab!=="trace"} data-s4-panel="trace"><Trace onEvaluate={()=>open("quiz")}/></section>}
  {visited.includes("quiz")&&<section hidden={activeTab!=="quiz"} data-s4-panel="quiz"><Assessment participantId={student.id} onRecord={onRecordSubmission}/></section>}
  <footer className="s4-credit">LAB·2AC · Prof. Abdellah TAHTOH · Collège Othmane Ibn Affane</footer>
 </div></Session3TranslationScope>;
}

function Mission({onStart}:{onStart:()=>void}){
 return <div className="s4-panel-enter"><section className="s4-mission-hero"><div><span className="s4-eyebrow"><Network size={16}/> MISSION DU CLUB · 120 MINUTES</span><h1><Text value={session4.title}/></h1><p className="s4-mission-lead"><Text value={session4.mission}/></p><div className="s4-mission-tags"><span><Users size={16}/> 2 élèves par PC</span><span><Monitor size={16}/> 2 PC partenaires</span><span><CloudOff size={16}/> LAN sans Internet</span></div></div><div className="s4-mission-visual"><div className="s4-mission-devices"><img src={publicAsset("session4/images/ordinateur-bureau.webp")} alt="Un poste du réseau local"/><img src={publicAsset("session4/images/commutateur.webp")} alt="Commutateur du réseau local"/><img src={publicAsset("session4/images/portable-windows.webp")} alt="Un autre poste du réseau local"/></div><span><Text value={t("Une salle. Plusieurs postes. Un même réseau.","قاعة واحدة وحواسيب متعددة وشبكة مشتركة.")}/></span></div></section>
  <section className="s4-situation"><span className="s4-eyebrow">LE DÉFI À RÉSOUDRE</span><h2><Text value={t("Trois zones à raccorder avant l’ouverture","ثلاث مناطق يجب ربطها قبل الافتتاح")}/></h2><p><Text value={session4.situation}/></p><div><Target size={24}/><strong><Text value={t("Le club veut voir un document arriver dans chaque zone.","يريد النادي رؤية مستند يصل إلى كل منطقة.")}/></strong></div></section>
  <div className="expo-zones">{[
   {photo:"imprimante",place:t("Bureau","المكتب"),label:t("Filaire · imprimer le plan","سلكي · طباعة المخطط")},
   {photo:"portable-windows",place:t("Bibliothèque","المكتبة"),label:t("Sans fil · envoyer le programme","لاسلكي · إرسال البرنامج")},
   {photo:"smart-tv",place:t("Hall","الردهة"),label:t("Mixte · afficher l’annonce","مختلط · عرض الإعلان")},
  ].map(({photo,place,label},i)=><article key={photo}><span>ZONE 0{i+1}</span>
   <img src={publicAsset(`session4/images/${photo}.webp`)} alt=""/><h3><Text value={place}/></h3><p><Text value={label}/></p>
  </article>)}</div>
  <div className="s4-plan">{phases.map((p,i)=><article key={p.minutes}><span>0{i+1}</span><strong>{p.minutes} min</strong><Text value={p.title}/></article>)}</div>
  <div className="s4-mission-columns"><section className="s4-card"><span className="s4-eyebrow">JE VAIS APPRENDRE À…</span><h2><Text value={t("Comprendre, relier, échanger","الفهم والربط والتبادل")}/></h2><ul>{session4.objectives.map(v=><li key={v.fr}><CheckCircle2 size={18}/><Text value={v}/></li>)}</ul></section><section className="s4-card s4-roles"><span className="s4-eyebrow">NOTRE ORGANISATION</span><h2><Text value={t("Deux rôles qui tournent","دوران نتبادلهما")}/></h2><article><span>P</span><div><strong><Text value={t("Pilote","المتحكم")}/></strong><p><Text value={t("Manipule la souris et le clavier ; lit les consignes avant d’agir.","يستعمل الفأرة ولوحة المفاتيح ويقرأ التعليمات قبل الإنجاز.")}/></p></div></article><article><span>C</span><div><strong><Text value={t("Copilote","المساعد")}/></strong><p><Text value={t("Observe, vérifie l’adresse et le destinataire, puis explique le résultat.","يلاحظ ويتحقق من العنوان والمستلم ثم يشرح النتيجة.")}/></p></div></article><p className="s4-help"><Text value={t("Inversez les rôles après chaque activité. Pour le TP réel, associez votre PC à celui d’un autre binôme.","تبادلا الأدوار بعد كل نشاط. في العمل الحقيقي، اربطا حاسوبكما بحاسوب ثنائي آخر.")}/></p><details><summary><Text value={t("Préparation du laboratoire · enseignant","إعداد المختبر · الأستاذ")}/></summary><p><Text value={t("Prévoir un même réseau local, les autorisations de partage et les comptes de la salle. Ouvrir BeeBEEP sur les postes. Les connexions physiques et les paramètres protégés se règlent avec l’enseignant.","تهيأ شبكة محلية واحدة وصلاحيات المشاركة وحسابات القاعة، ويفتح BeeBEEP على الأجهزة. تضبط التوصيلات والإعدادات المحمية بمرافقة الأستاذ.")}/></p></details></section></div>
  <button type="button" className="s4-primary s4-start" onClick={onStart}><Text value={t("Ouvrir les caisses du club","فتح صناديق معدات النادي")}/><ArrowRight size={19}/></button>
 </div>;
}

const recap = [
 {icon:Network,title:t("Relier les postes","ربط الحواسيب"),text:t("Le commutateur relie les appareils par câble. Le point d’accès accueille les appareils Wi-Fi. Un câble entre les deux relie les parties du réseau mixte.","يربط المبدل الأجهزة بالكابل. وتربط نقطة الولوج أجهزة Wi-Fi. يوصل كابل بين الجهازين جزأي الشبكة المختلطة.")},
 {icon:Network,title:t("Lire un plan","قراءة المخطط"),text:t("Étoile : un centre. Bus : une ligne commune. Anneau : une boucle fermée.","النجمية: مركز. الخطية: خط مشترك. الحلقية: حلقة مغلقة.")},
 {icon:Monitor,title:t("Identifier un poste","تحديد هوية الحاسوب"),text:t("ipconfig affiche l’adresse IPv4. hostname affiche le nom du poste.","يعرض ipconfig عنوان IPv4، ويعرض hostname اسم الحاسوب.")},
 {icon:Target,title:t("Tester la liaison","اختبار الاتصال"),text:t("ping permet de tester si un poste répond. Vérifie le câble si le test échoue, puis refais le même test.","يختبر ping ما إذا كان الحاسوب يستجيب. تحقق من الكابل عند الفشل ثم كرر الاختبار نفسه.")},
 {icon:Folder,title:t("Partager avec le bon droit","المشاركة بالصلاحية المناسبة"),text:t("Lecture permet d’ouvrir et de copier. Lecture et écriture permet aussi de déposer un fichier dans le dossier partagé.","تتيح القراءة فتح الملف ونسخه. وتتيح القراءة والكتابة أيضا إيداع ملف داخل المجلد المشترك.")},
 {icon:Send,title:t("Confirmer un échange","تأكيد التبادل"),text:t("Vérifie le destinataire, joins le fichier et ouvre la pièce jointe reçue avant de répondre « Reçu ».","تحقق من المستلم وأرفق الملف وافتح المرفق المتوصل به قبل الرد «تم التوصل».")},
];

function NetworkRecap(){
 return <section className="s4-network-recap">
  <h3><Text value={t("Les idées à retenir","الأفكار الأساسية")}/></h3>
  <div className="s4-recap-grid">{recap.map(({icon:Icon,title,text})=><article key={title.fr}>
   <Icon size={23} aria-hidden="true"/><h4><Text value={title}/></h4><p><Text value={text}/></p>
  </article>)}</div>
  <p className="s4-recap-pair"><Users size={19} aria-hidden="true"/><Text value={t("En binôme, expliquez le chemin du fichier entre les deux postes et dites quel droit suffit pour le lire.","في الثنائي، اشرحا مسار الملف بين الحاسوبين وحددا الصلاحية الكافية لقراءته.")}/></p>
 </section>;
}

function Workshop({participantId,onRecord,onTrace,onEvaluate}:{
 participantId:string; onRecord:Props["onRecordSubmission"]; onTrace:()=>void; onEvaluate:()=>void;
}){
 const teacher=useTeacherCourse();
 const initial=useMemo(()=>initialSession4Workshop(readSnapshot(participantId,4,"workshop")?.data),[participantId]);
 const persistent=useDurableLessonState<Session4WorkshopState>({participantId,sessionId:4,kind:"workshop",initial,validate:validSession4Workshop});
 const {value:work,setValue:setWork}=persistent;
 const anchor=useRef<HTMLDivElement>(null);
 const savedIndex=session4Activities.findIndex(item=>item.id===work.activityId);
 const firstMissing=session4Activities.findIndex(item=>!work.completedIds.includes(item.id));
 const index=savedIndex>=0?savedIndex:firstMissing>=0?firstMissing:session4Activities.length-1;
 const activity=session4Activities[index];
 const summary=savedIndex>=0&&work.summary;
 const draft={...freshSession4Draft(),...work.drafts[activity.id]};
 const criteria=session4ActivityChecks(activity,draft);
 const practical=activity.kind==="practice";
 useEffect(()=>{anchor.current?.scrollIntoView({block:"start",behavior:"auto"});},[index,summary]);

 function go(next:number){
  const showSummary=next===session4Activities.length;
  const position=showSummary?index:Math.max(0,Math.min(session4Activities.length-1,next));
  setWork(current=>({...current,activityIndex:position,activityId:session4Activities[position].id,summary:showSummary}));
 }
 function change(patch:Partial<Session4Draft>){
  setWork(current=>({...current,activityIndex:index,activityId:activity.id,summary:false,
   drafts:{...current.drafts,[activity.id]:{...freshSession4Draft(),...current.drafts[activity.id],...patch,result:null,savedAt:Date.now()}}}));
 }
 function check(){
  const correct=criteria.every(Boolean);
  setWork(current=>({...current,activityIndex:index,activityId:activity.id,summary:false,
   completedIds:correct?[...new Set([...current.completedIds,activity.id])]:current.completedIds,
   drafts:{...current.drafts,[activity.id]:{...draft,result:correct,savedAt:Date.now()}}}));
  if(!practical||correct)onRecord({
   sessionId:4,activityType:"workshop",activityId:activity.id,
   answer:{question:activity.prompt,activityTitle:activity.title,verification:practical?"declaration-eleve":"simulation-corrigee",state:session4AnswerState(draft),completed:correct},
   isCorrect:practical?undefined:correct,score:correct?100:session4DraftPercent(activity,draft)??0,maxScore:100,
  });
 }
 const feedback=draft.result
  ? practical?t("Compte rendu enregistré. L’enseignant pourra vérifier l’échange.","تم حفظ التقرير. يمكن للأستاذ التحقق من التبادل.")
    :t("Mission validée. Explique au copilote ce qui a fait fonctionner ton réseau.","تم التحقق من المهمة. اشرح لزميلك ما جعل الشبكة تعمل.")
  : practical?t("Complète les quatre étapes, les deux IPv4 différentes et la phrase de retour.","أكمل الخطوات الأربع وعنواني IPv4 المختلفين وعبارة الرد.")
    :t(`${criteria.filter(Boolean).length} critères réussis sur ${criteria.length}. Reprends les tâches en cours et refais le test.`,`تحقق ${criteria.filter(Boolean).length} من أصل ${criteria.length} معايير. أكمل المهام وأعد الاختبار.`);

 if(!persistent.ready)return <div className="s4-loading"><LoaderCircle className="spin"/><Text value={t("Recherche du travail sauvegardé…","البحث عن العمل المحفوظ…")}/></div>;
 return <div className="s4-workshop s4-panel-enter" ref={anchor}>
  <TeacherExerciseNavigator index={summary?session4Activities.length:index} titles={[...session4Activities.map(a=>a.title.fr),workshopSummaryTitle.fr]} onGo={go}/>
  {summary?<WorkshopSummary sessionId={4} participantId={participantId} state={work}
    onBack={()=>go(index)} onResume={go} onTrace={onTrace} onEvaluate={onEvaluate}>
    <NetworkRecap />
  </WorkshopSummary>:<>
   <div className="workshop-summary-entry"><WorkshopSummaryLink onClick={()=>go(session4Activities.length)}/></div>
   <div className="s4-activity-topline"><span>EXERCICE {String(index+1).padStart(2,"0")} / {session4Activities.length}</span>
    <strong>{activity.minutes} min</strong><span><Text value={activity.zone}/></span>
   </div>
   <article className="s4-activity expo-activity">
    <header><h2><Text value={activity.title}/></h2>
     <div className="s4-instruction"><span>CONSIGNE · التعليمة</span><p><Text value={activity.prompt}/></p>
      {activity.tasks.length>0&&<ol>{activity.tasks.map(task=><li key={task.fr}><Text value={task}/></li>)}</ol>}
     </div>
    </header>
    <Session4ActivityPlayer key={activity.id} activity={activity} draft={draft} onChange={change}/>
    <div className="s4-check-area">
     <button type="button" className="s4-primary" onClick={check}><ClipboardCheck size={19}/><Text value={practical?t("Enregistrer notre compte rendu","حفظ تقرير إنجازنا"):t("Vérifier mon travail","التحقق من عملي")}/></button>
     {draft.result!==null&&<p role="status" className={draft.result?"s4-feedback success":"s4-feedback retry"}><Text value={feedback}/></p>}
    </div>
   </article>
   <nav className="s4-exercise-nav" aria-label="Navigation dans l’atelier">
    <button type="button" disabled={index===0} onClick={()=>go(index-1)}><ArrowLeft size={18}/><Text value={t("Précédent","السابق")}/></button>
    <span>{index+1} / {session4Activities.length}{teacher&&<small>Professeur · navigation libre</small>}</span>
    <button type="button" className="s4-primary" disabled={!teacher&&!work.completedIds.includes(activity.id)} onClick={()=>go(index+1)}>
     <Text value={index===session4Activities.length-1?workshopSummaryTitle:t("Exercice suivant","التمرين التالي")}/><ArrowRight size={18}/>
    </button>
   </nav>
  </>}
 </div>;
}

function Trace({onEvaluate}:{onEvaluate:()=>void}){
 return <div className="s4-trace-wrap s4-panel-enter"><article className="s4-notebook"><header><span>SÉANCE 04 · À RETENIR</span><h1><Text value={session4.title}/></h1></header><h2><Text value={t("1. Le réseau local","1. الشبكة المحلية")}/></h2><p><Text value={session4.trace[0]}/></p><p><Text value={t("Il peut fonctionner sans accès à Internet. Internet relie des réseaux à l’échelle mondiale.","يمكن أن يعمل دون الإنترنت، الذي يربط الشبكات على الصعيد العالمي.")}/></p><h2><Text value={t("2. Les équipements et les liaisons","2. الأجهزة والروابط")}/></h2><p><Text value={session4.trace[1]}/></p><p><Text value={t("La carte réseau donne au poste une interface de connexion. Le routeur relie des réseaux entre eux.","توفر بطاقة الشبكة للحاسوب واجهة اتصال. ويربط الموجه شبكات مختلفة.")}/></p><p><Text value={session4.trace[2]}/></p><h2><Text value={t("3. Identifier et tester","3. التعرف والاختبار")}/></h2><dl><div><dt>ipconfig</dt><dd><Text value={t("Lire l’adresse IPv4 du poste.","قراءة عنوان IPv4 للحاسوب.")}/></dd></div><div><dt>hostname</dt><dd><Text value={t("Lire le nom du poste.","قراءة اسم الحاسوب.")}/></dd></div><div><dt>ping 192.168.10.22</dt><dd><Text value={t("Tester si cette destination répond.","اختبار استجابة هذا الجهاز.")}/></dd></div></dl><h2><Text value={t("4. Partager et communiquer","4. المشاركة والتواصل")}/></h2><p><Text value={session4.trace[4]}/></p><code className="s4-unc-example">{String.raw`\\192.168.10.21\Club_reseau`}</code><p><Text value={session4.trace[5]}/></p><p><Text value={t("Avant d’annoncer « reçu », j’ouvre le fichier et je vérifie son contenu.","قبل تأكيد التوصل، أفتح الملف وأتحقق من محتواه.")}/></p></article><div className="s4-trace-sources"><span>Pour aller plus loin :</span><a href="https://support.microsoft.com/en-us/windows/experience/connectivity-networking/file-sharing-over-a-network-in-windows" target="_blank" rel="noreferrer">Partage de fichiers · Microsoft</a><a href="https://www.beebeep.net/" target="_blank" rel="noreferrer">BeeBEEP · site officiel</a></div><button type="button" className="s4-primary" onClick={onEvaluate}><Text value={t("Je passe à l’évaluation","أنتقل إلى التقويم")}/><ArrowRight size={18}/></button></div>;
}

type AssessmentState={version:1;index:number;choices:Record<string,number>;submitted:boolean};
function Assessment({participantId,onRecord}:{participantId:string;onRecord:Props["onRecordSubmission"]}){
 const teacher=useTeacherCourse();const [confirm,setConfirm]=useState(false);const lock=useRef(false);
 const persistent=useDurableLessonState<AssessmentState>({participantId,sessionId:4,kind:"quiz",initial:{version:1,index:0,choices:{},submitted:false},validate:(v):v is AssessmentState=>Boolean(v&&typeof v==="object"&&(v as AssessmentState).version===1&&Number.isInteger((v as AssessmentState).index)&&(v as AssessmentState).index>=0&&(v as AssessmentState).index<session4Questions.length&&(v as AssessmentState).choices&&typeof (v as AssessmentState).submitted==="boolean")});
 const {value:state,setValue:setState}=persistent;const question=session4Questions[state.index];const result=gradeSession4(state.choices);const allAnswered=session4Questions.every(q=>Number.isInteger(state.choices[q.id]));
 const sections=[t("Le réseau du club","شبكة النادي"),t("Le poste et son adresse","الحاسوب وعنوانه"),t("Le fichier partagé","الملف المشترك"),t("La messagerie locale","المراسلة المحلية")];
 const orders=useMemo(()=>session4Questions.map(q=>q.choices.map((_,i)=>i).sort((a,b)=>hash(`${participantId}-${q.id}-${a}`)-hash(`${participantId}-${q.id}-${b}`))),[participantId]);
 useEffect(()=>{lock.current=state.submitted},[state.submitted]);
 function submit(){if(lock.current)return;lock.current=true;onRecord({sessionId:4,activityType:"practical_evaluation",activityId:"session-4-reseau-evaluation-v1",answer:result,score:result.score,maxScore:20,isCorrect:result.score===20});setState(v=>({...v,submitted:true}));setConfirm(false)}
 if(!persistent.ready)return <p className="s4-loading"><LoaderCircle className="spin"/> Chargement de l’évaluation sauvegardée…</p>;
 return <div className="s4-assessment s4-panel-enter"><header className="s4-assessment-intro"><span className="s4-eyebrow">ÉVALUATION · 15 MINUTES · /20</span><h1><Text value={t("Le club ouvre ses portes","يفتح النادي أبوابه")}/></h1><p><Text value={t("10 décisions pour installer le réseau, retrouver le bon poste et faire arriver le fichier. Chaque réponse correcte vaut 2 points. La correction apparaît après la remise.","10 قرارات لإعداد الشبكة وتحديد الحاسوب الصحيح وإيصال الملف. لكل جواب صحيح نقطتان. يظهر التصحيح بعد التسليم.")}/></p></header>
  {state.submitted?<section className="s4-result"><div><CheckCircle2 size={36}/><h2><Text value={teacher?t("Correction de démonstration","تصحيح توضيحي"):t("Ton bilan est enregistré","حفظ تقويمك")}/></h2><strong>{result.score} / 20</strong></div><div className="s4-result-sections">{sections.map((name,i)=><article key={name.fr}><Text value={name}/><b>{result.sections[i]} / {[6,4,6,4][i]}</b></article>)}</div><details><summary><Text value={t("Voir mes réponses et le corrigé","عرض أجوبتي والتصحيح")}/></summary>{result.answers.map((answer,i)=><article className={answer.correct?"correct":"review"} key={i}><h3>{i+1}. <Text value={answer.question}/></h3><p><Text value={t("Ma réponse : ","جوابي: ")}/><Text value={answer.selectedChoice}/></p>{!answer.correct&&<p><Text value={t("Réponse attendue : ","الجواب المنتظر: ")}/><Text value={answer.correctChoice}/></p>}<b>{answer.earnedPoints}/2</b></article>)}</details></section>:<>
   <TeacherExerciseNavigator index={state.index} titles={session4Questions.map(q=>q.question.fr)} onGo={index=>setState(v=>({...v,index}))} label="Aller à la question"/>
   <div className="s4-assessment-layout"><aside className="s4-assessment-context"><span>SITUATION {question.section+1} / 4</span><h2><Text value={sections[question.section]}/></h2>{question.section===0?<><Session4Topology kind="star"/><img src={publicAsset("session4/images/commutateur.webp")} alt="Commutateur du réseau du club"/></>:question.section===1?<pre>PC-21{"\n"}IPv4 : 192.168.10.21{"\n"}Masque : 255.255.255.0{"\n"}Passerelle : 192.168.10.1</pre>:question.section===2?<div className="s4-folder-preview"><Folder size={65}/><strong>PC-21 / Club_reseau</strong><FileCheck2 size={30}/><span>Bonjour.txt</span></div>:<div className="s4-assessment-chat"><Users size={35}/><strong>PC-21 → PC-22</strong><span>Message + Bonjour.txt</span><p>« Reçu : Bonjour le club ! »</p></div>}</aside><article className="s4-assessment-question"><span>QUESTION {String(state.index+1).padStart(2,"0")} / 10 · 2 POINTS</span><h2><Text value={question.question}/></h2><div className="s4-assessment-choices">{orders[state.index].map((index,display)=><button type="button" key={index} className={state.choices[question.id]===index?"selected":""} aria-pressed={state.choices[question.id]===index} onClick={()=>setState(v=>({...v,choices:{...v.choices,[question.id]:index}}))}><b>{String.fromCharCode(65+display)}</b><Text value={question.choices[index]}/></button>)}</div></article></div>
   <nav className="s4-exercise-nav" aria-label="Navigation de l’évaluation"><button type="button" disabled={state.index===0} onClick={()=>setState(v=>({...v,index:v.index-1}))}><ArrowLeft size={18}/><Text value={t("Précédente","السابق")}/></button><span>{Object.keys(state.choices).length} / 10 réponses</span>{state.index<9?<button type="button" className="s4-primary" disabled={!teacher&&!Number.isInteger(state.choices[question.id])} onClick={()=>setState(v=>({...v,index:v.index+1}))}><Text value={t("Suivante","التالي")}/><ArrowRight size={18}/></button>:<button type="button" className="s4-primary" disabled={!teacher&&!allAnswered} onClick={()=>setConfirm(true)}><Send size={18}/><Text value={t("Rendre mon évaluation","تسليم تقويمي")}/></button>}</nav>
  </>}
  {confirm&&<div className="s4-modal-backdrop"><section className="s4-modal" role="dialog" aria-modal="true" aria-labelledby="s4-submit-title"><button type="button" className="s4-modal-close" aria-label="Fermer" onClick={()=>setConfirm(false)}><X size={20}/></button><h2 id="s4-submit-title"><Text value={t("Remettre tes réponses ?","هل تسلم أجوبتك؟")}/></h2><p><Text value={t("La note sur 20 et la correction seront calculées à partir de tes dix réponses.","ستحسب النقطة على 20 ويعرض التصحيح انطلاقا من أجوبتك العشرة.")}/></p><div className="s4-inline-actions"><button type="button" onClick={()=>setConfirm(false)}><Text value={t("Je relis","أراجع")}/></button><button type="button" className="s4-primary" onClick={submit}><Text value={t("Confirmer la remise","تأكيد التسليم")}/></button></div></section></div>}
 </div>;
}
function hash(value:string){let h=2166136261;for(const c of value){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
