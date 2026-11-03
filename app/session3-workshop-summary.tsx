"use client";

import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, Monitor, Folder, HardDrive, Calculator } from "lucide-react";
import { Session3Text as Text } from "./session3-translation";
import { session3Lab } from "./session3-lab-data";
import { useTeacherCourse } from "../lib/teacher-course-context";
import "./session3-revision.css";

const points = [
  {icon: ClipboardCheck, title: {fr: "Information et traitement", ar: "المعلومة والمعالجة"}, text: {fr: "Le traitement transforme les données reçues en un résultat.", ar: "تحول المعالجة المعطيات المستقبلة إلى نتيجة."}},
  {icon: HardDrive, title: {fr: "Matériel et logiciels", ar: "المعدات والبرمجيات"}, text: {fr: "Le matériel correspond aux éléments physiques. Les logiciels sont des programmes.", ar: "المعدات عناصر مادية، والبرمجيات برامج."}},
  {icon: Calculator, title: {fr: "Capacités de stockage", ar: "سعات التخزين"}, text: {fr: "1 octet = 8 bits. Entre Ko, Mo, Go et To, chaque passage utilise le facteur 1 000.", ar: "1 أوكتات = 8 بت. بين Ko وMo وGo وTo نستعمل العامل 1000 في كل انتقال."}},
  {icon: Monitor, title: {fr: "Système d’exploitation", ar: "نظام التشغيل"}, text: {fr: "Windows et Android permettent d’utiliser l’appareil et d’ouvrir les applications.", ar: "يتيح Windows وAndroid استعمال الجهاز وفتح التطبيقات."}},
  {icon: Folder, title: {fr: "Fichiers et dossiers", ar: "الملفات والمجلدات"}, text: {fr: "Un fichier contient une information ; un dossier range des fichiers. Copier garde l’original. Déplacer change son emplacement.", ar: "يحتوي الملف على معلومة، وينظم المجلد الملفات. يحتفظ النسخ بالأصل، ويغير النقل مكانه."}},
];

export function Session3WorkshopSummary({completedIds, onBack, onResume, onTrace, onEvaluate}: {
  completedIds: string[];
  onBack: () => void;
  onResume: (index: number) => void;
  onTrace: () => void;
  onEvaluate: () => void;
}) {
  const teacher = useTeacherCourse();
  const passed = new Set(completedIds);
  const completed = session3Lab.exercises.filter(exercise => passed.has(exercise.id)).length;
  const firstMissing = session3Lab.exercises.findIndex(exercise => !passed.has(exercise.id));
  return <section className="s3-workshop-summary" aria-labelledby="s3-workshop-summary-title">
    <header><span className="s3-guide-kicker">APRÈS L’ATELIER · SÉANCE 3</span><h2 id="s3-workshop-summary-title"><Text value={{fr: "Bilan de la séance", ar: "حصيلة الحصة"}} /></h2><p><Text value={{fr: "Je retiens l’essentiel et je fais le point avant l’évaluation.", ar: "أحتفظ بالأساسيات وأراجع تعلماتي قبل التقويم."}} /></p></header>
    {!teacher && <div className="s3-workshop-summary-progress"><CheckCircle2 size={25} /><div><strong>{completed} / {session3Lab.exercises.length}</strong><span><Text value={{fr: "exercices réussis dans l’atelier", ar: "تمرينًا منجزًا بنجاح في الورشة"}} /></span></div><progress max={session3Lab.exercises.length} value={completed} aria-label="Progression de l’atelier" /></div>}
    <div className="s3-workshop-summary-points">{points.map(({icon: Icon, title, text}) => <article key={title.fr}><Icon size={25} /><h3><Text value={title} /></h3><p><Text value={text} /></p></article>)}</div>
    <p className="s3-workshop-summary-share"><Text value={{fr: "Avec ton binôme : explique la différence entre copier et déplacer, puis montre un geste appris sur Windows.", ar: "مع زميلك: اشرح الفرق بين النسخ والنقل، ثم طبق حركة تعلمتها في Windows."}} /></p>
    {!teacher && firstMissing >= 0 && <button type="button" className="s3-summary-resume" onClick={() => onResume(firstMissing)}><ArrowLeft size={18} /><Text value={{fr: `Il reste des exercices à réussir : reprendre à l’exercice ${firstMissing + 1}`, ar: `بقيت تمارين لإتمامها بنجاح: استأنف من التمرين ${firstMissing + 1}`}} /></button>}
    <footer><button type="button" onClick={onBack}><ArrowLeft size={18} /><Text value={{fr: "Revoir l’exercice 25", ar: "مراجعة التمرين 25"}} /></button><button type="button" onClick={onTrace}><BookOpen size={18} /><Text value={{fr: "Lire la trace écrite", ar: "قراءة خلاصة الدرس"}} /></button><button type="button" className="s3-summary-evaluate" onClick={onEvaluate}><Text value={{fr: "Passer à l’évaluation", ar: "الانتقال إلى التقويم"}} /><ArrowRight size={18} /></button></footer>
  </section>;
}
