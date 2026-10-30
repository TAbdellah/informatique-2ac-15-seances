import {sessions} from '../course-data';
import {unit1Labs} from '../unit1-labs';
import type {ActivityProgress,LearningAnalytics,RosterStudent} from '@/lib/supabase-api';
export type Mastery='acquired'|'developing'|'not-acquired'|'unassessed';
export const masteryLabels:Record<Mastery,string>={acquired:'Acquis',developing:'En cours d’acquisition','not-acquired':'Non acquis',unassessed:'Non évalué'};
type Target={id:string;title:string;objective:string;type:string};
const groups:Record<number,Array<[string,number[]]>>={
 1:[['Manipuler la souris et saisir un texte',[1,2,3]],['Définir l’informatique',[4,5]],['Reconnaître les formes de l’information',[6,7]],['Comprendre le traitement de l’information',[8,9]],['Distinguer les types de traitement',[10,11,12,13,14]]],
 2:[['Reconnaître les éléments du poste',[1,2]],['Choisir les périphériques adaptés',[3,4,5,10]],['Identifier les composants et diagnostiquer',[6,7,11,12]],['Comparer et convertir les capacités',[8,9]]],
 3:[['Reconnaître l’information et son traitement',[1,2]],['Mobiliser les connaissances sur le matériel',[3,4,5]],['Convertir les capacités de stockage',[6]],['Distinguer matériel, systèmes et applications',[7,8,9]],['Utiliser le bureau et les fenêtres Windows',[10,11,12,13,20,21]],['Comprendre les fichiers et leurs contenus',[14,15,16,22]],['Organiser, copier, déplacer et restaurer',[17,18,19,23,24,25]]],
};
export function targetsFor(sessionId:number):Target[]{
 if(sessionId<=3){const lab=unit1Labs[sessionId as 1|2|3];return lab.exercises.map((e,i)=>({id:e.id,title:e.title.fr,type:'unit1_exercise',objective:groups[sessionId].find(([,ns])=>ns.includes(i+1))?.[0]||'Mettre en pratique'}))}
 const s=sessions.find(s=>s.id===sessionId);return s?s.workshops.map(w=>({id:`session-${s.id}-workshop-${w.label}`,title:w.text.fr,objective:w.text.fr,type:'workshop'})):[];
}
export function mastery(passed:number,observed:number,total:number):Mastery{return observed===0?'unassessed':passed===total&&total>0?'acquired':observed===total&&passed/total<.5?'not-acquired':'developing'}
export type TargetResult=Target&{status:Mastery;attempts:number;passed:boolean;observed:boolean;lastAt:string|null;pair:boolean};
export type Objective={title:string;status:Mastery;passed:number;observed:number;total:number};
export type LearnerProgress={student:RosterStudent;targets:TargetResult[];objectives:Objective[];status:Mastery;passed:number;observed:number;total:number;percent:number;grade:number|null;gradeLabel:string;lastAt:string|null;pair:boolean;activities:ActivityProgress[]};
export function learnerProgress(data:LearningAnalytics,student:RosterStudent,sessionId:number):LearnerProgress{
 const dossiers=data.participants.filter(p=>p.studentOneId===student.id||p.studentTwoId===student.id);
 const ids=new Set(dossiers.map(p=>p.id)),pairs=new Set(dossiers.filter(p=>p.isPair).map(p=>p.id));
 const activities=data.activities.filter(a=>ids.has(a.participantId)&&a.sessionId===sessionId);
 const targets=targetsFor(sessionId).map(t=>{const seen=activities.filter(a=>a.activityId===t.id&&a.activityType===t.type),passed=seen.some(a=>a.successful);return {...t,status:mastery(passed?1:0,seen.length?1:0,1),passed,observed:seen.length>0,attempts:seen.reduce((n,a)=>n+a.attempts,0),lastAt:seen.map(a=>a.lastAt).sort().at(-1)??null,pair:seen.some(a=>pairs.has(a.participantId))}});
 const objectives=[...new Set(targets.map(t=>t.objective))].map(title=>{const group=targets.filter(t=>t.objective===title),passed=group.filter(t=>t.passed).length,observed=group.filter(t=>t.observed).length;return {title,passed,observed,total:group.length,status:mastery(passed,observed,group.length)}});
 const passed=targets.filter(t=>t.passed).length,observed=targets.filter(t=>t.observed).length;
 const best=(id:string)=>activities.filter(a=>a.activityId===id&&a.bestScore!==null&&a.maxScore!==null&&a.maxScore>0).sort((a,b)=>(b.bestScore!/b.maxScore!)-(a.bestScore!/a.maxScore!))[0];
 let grade:number|null=null,gradeLabel='Évaluation non remise';
 if(sessionId===3){const a=best('session-3-bilan-situations-v5');if(a){grade=20*a.bestScore!/a.maxScore!;gradeLabel='Bilan en trois situations'}}
 else if(sessionId===2){const q=best('session-2-quiz'),a=best('s2-evaluation-assembler'),r=best('s2-evaluation-depanner');if(q&&a&&r){grade=20*(q.bestScore!+a.bestScore!+r.bestScore!)/(q.maxScore!+a.maxScore!+r.maxScore!);gradeLabel='Assembler + dépanner + QCM'}else if(q||a||r)gradeLabel='Évaluation en partie remise'}
 else{const a=best(`session-${sessionId}-quiz`);if(a){grade=20*a.bestScore!/a.maxScore!;gradeLabel='QCM · meilleure note'}}
 return {student,targets,objectives,status:mastery(passed,observed,targets.length),passed,observed,total:targets.length,percent:targets.length?Math.round(100*passed/targets.length):0,grade:grade===null?null:Math.round(grade*10)/10,gradeLabel,lastAt:activities.map(a=>a.lastAt).sort().at(-1)??null,pair:activities.some(a=>pairs.has(a.participantId)),activities};
}
export function progressRows(data:LearningAnalytics,sessionId:number){return data.students.filter(s=>s.active).map(s=>learnerProgress(data,s,sessionId))}
export function successTimeline(rows:LearnerProgress[]){const events=new Map<string,number>();for(const r of rows){for(const t of r.targets){const first=r.activities.filter(a=>a.activityId===t.id&&a.activityType===t.type&&a.successful&&a.firstSuccessAt).map(a=>a.firstSuccessAt!).sort()[0];if(first){const day=first.slice(0,10);events.set(day,(events.get(day)||0)+1)}}}let total=0;return [...events].sort(([a],[b])=>a.localeCompare(b)).map(([day,value])=>({day,value:total+=value}))}
