/* Contrats et vérification des gestes du simulateur. Même modèle pour les tests et le navigateur. */
(function(root){
 'use strict';
 const phrase='Bonjour le club !';
 const missions={
  identity:{title:'Retrouver l’identité du poste',ar:'تحديد هوية الحاسوب',steps:[
   ['Sur PC-21, exécute ipconfig.','على PC-21، نفذ ipconfig.','Ouvre « Invite de commandes », écris ipconfig puis appuie sur Entrée.'],
   ['Exécute hostname pour lire le nom du poste.','نفذ hostname لقراءة اسم الحاسوب.','Garde la même fenêtre : la commande précédente reste visible.']
  ]},
  ping:{title:'Faire répondre le voisin',ar:'الحصول على استجابة الحاسوب المجاور',steps:[
   ['Sur PC-21, teste ping 192.168.10.22 : le premier essai doit échouer.','على PC-21، اختبر ping 192.168.10.22: يجب أن تفشل المحاولة الأولى.','Le PC-22 est débranché au début. Utilise l’invite de commandes du PC-21.'],
   ['Ouvre « Le réseau » et rebranche le câble du PC-22.','افتح «الشبكة» وأعد توصيل كابل PC-22.','Le bouton sous la photo du PC-22 change l’état de son câble.'],
   ['Reviens sur PC-21 et refais le même ping : quatre réponses sont attendues.','عد إلى PC-21 وكرر ping نفسه: تنتظر أربع استجابات.','Une réponse indique que ce poste est joignable dans cette simulation.']
  ]},
  sharing:{title:'Partager puis récupérer le fichier',ar:'مشاركة الملف ثم الحصول عليه',steps:[
   ['Sur PC-21, crée Club_reseau dans Documents et copie Bonjour.txt dedans.','على PC-21، أنشئ Club_reseau داخل Documents وانسخ Bonjour.txt إليه.','Explorateur → Documents → Nouveau dossier. Renomme-le Club_reseau. Copie Bonjour.txt, ouvre le dossier puis Colle.'],
   ['Partage Club_reseau avec « Postes de la salle », en Lecture seule.','شارك Club_reseau مع «حواسيب القاعة» بصلاحية القراءة فقط.','Retourne dans Documents. Sélectionne le dossier, clique Partager, choisis les destinataires et le droit, puis Partager.'],
   ['Sur PC-22, ouvre le partage et copie Bonjour.txt sur le Bureau.','على PC-22، افتح المجلد المشترك وانسخ Bonjour.txt إلى سطح المكتب.','Dans l’Explorateur : Réseau → PC-21 → Club_reseau. Sélectionne Bonjour.txt → Copier → Bureau → Coller.'],
   ['Sur le Bureau du PC-22, ouvre Bonjour.txt et lis son contenu.','على سطح مكتب PC-22، افتح Bonjour.txt واقرأ محتواه.','Double-clique le fichier copié, ou sélectionne-le puis clique Ouvrir.'],
   ['Sur PC-21, arrête le partage quand l’échange est terminé.','على PC-21، أوقف المشاركة بعد انتهاء التبادل.','Sélectionne Club_reseau dans Documents → Partager → Arrêter le partage. La copie du PC-22 reste disponible.']
  ]},
  messenger:{title:'Envoyer, recevoir et confirmer',ar:'الإرسال والتوصل والتأكيد',steps:[
   ['Sur PC-21, envoie « Bonjour le club ! » à PC-22 avec Bonjour.txt en pièce jointe.','على PC-21، أرسل «Bonjour le club !» إلى PC-22 مع إرفاق Bonjour.txt.','Messagerie → Nouveau message. Vérifie À : PC-22, écris le message, choisis Bonjour.txt et clique Envoyer.'],
   ['Sur PC-22, ouvre le message reçu dans la messagerie.','على PC-22، افتح الرسالة المتوصل بها داخل المراسلة.','Change de poste en haut, ouvre Messagerie puis le message de PC-21.'],
   ['Enregistre la pièce jointe dans Téléchargements sur PC-22.','احفظ المرفق داخل Téléchargements على PC-22.','Dans le message reçu, clique « Enregistrer Bonjour.txt dans Téléchargements ».'],
   ['Ouvre Bonjour.txt depuis Téléchargements sur PC-22.','افتح Bonjour.txt من Téléchargements على PC-22.','Ouvre l’Explorateur, clique Téléchargements puis ouvre Bonjour.txt.'],
   ['Depuis PC-22, réponds « Reçu » à PC-21. Sur PC-21, lis cette réponse.','من PC-22، أجب «Reçu» على PC-21، ثم اقرأ الرد على PC-21.','Dans Nouveau message, choisis PC-21 et envoie Reçu. Reviens sur PC-21 et ouvre le message dans sa boîte de réception.']
  ]},
  repair:{title:'Réparer un partage en lecture seule',ar:'إصلاح مشاركة تسمح بالقراءة فقط',steps:[
   ['Sur PC-22, copie notes.txt puis essaie de le coller dans le partage Échange du PC-21.','على PC-22، انسخ notes.txt ثم حاول لصقه داخل المجلد المشترك Échange على PC-21.','Documents → notes.txt → Copier. Réseau → PC-21 → Échange → Coller. Observe le refus.'],
   ['Sur PC-21, autorise Lecture et écriture pour le partage Échange.','على PC-21، اسمح بالقراءة والكتابة في مشاركة Échange.','Documents → sélectionne Échange → Partager → Lecture et écriture → Enregistrer.'],
   ['Sur PC-22, colle à nouveau notes.txt dans Échange.','على PC-22، ألصق notes.txt مجددا داخل Échange.','Reviens dans le dossier partagé. Actualise si nécessaire, puis clique Coller.'],
   ['Sur PC-21, ouvre notes.txt dans Documents / Échange pour vérifier la réception.','على PC-21، افتح notes.txt داخل Documents / Échange للتحقق من التوصل.','L’ordinateur source doit vérifier le fichier ajouté par son voisin.']
  ]}
 };
 function find(machine,path){
  if(!machine||!machine.nodes)return null;
  let current=machine.nodes.root;
  for(const segment of path){if(!current||!Array.isArray(current.kids))return null;current=current.kids.map(id=>machine.nodes[id]).find(node=>node&&node.name.toLowerCase()===segment.toLowerCase());}
  return current||null;
 }
 function opened(machine,name,local){return (machine.did.openedFiles||[]).some(f=>f.name===name&&f.local===local);}
 function transferred(machine,from,name){return (machine.did.transfers||[]).some(t=>t.from===from&&t.names.includes(name));}
 function rawChecks(mode,a,b){
  if(!a||!b)return [];
  const commands=a.did.commands||[],share=a.shares.find(s=>s.name==='Club_reseau'),folder=find(a,['Documents','Club_reseau']),copy=find(b,['Bureau','Bonjour.txt']),download=find(b,['Téléchargements','Bonjour.txt']);
  if(mode==='identity')return [commands.includes('ipconfig'),commands.includes('hostname')];
  if(mode==='ping')return [!!a.did.failedPing,!!b.cable&&!!b.did.cable,!!a.did.successPing&&a.cable&&b.cable];
  if(mode==='sharing')return [!!folder&&find(a,['Documents','Club_reseau','Bonjour.txt'])?.content===phrase,!!share&&share.dirId===folder?.id&&share.perm==='read'&&share.who==='Postes de la salle',copy?.content===phrase&&transferred(b,'PC-21','Bonjour.txt'),!!copy&&opened(b,'Bonjour.txt',true),!share&&!!a.did.unshared];
  if(mode==='messenger')return [(a.did.sentMessages||[]).some(m=>m.to==='PC-22'&&m.attachment==='Bonjour.txt'&&m.text.toLowerCase().includes('bonjour')),b.inbox.some(m=>m.from==='PC-21'&&m.att?.content===phrase&&m.read),download?.content===phrase&&!!b.did.attSaved,!!download&&opened(b,'Bonjour.txt',true),a.inbox.some(m=>m.from==='PC-22'&&/re[cç]u/i.test(m.text)&&m.read)];
  if(mode==='repair'){const exchange=a.shares.find(s=>s.name==='Échange');return [b.did.denied>0,exchange?.perm==='write'&&exchange.who==='Postes de la salle',!!find(a,['Documents','Échange','notes.txt'])&&transferred(a,'PC-22','notes.txt'),opened(a,'notes.txt',true)];}
  return [];
 }
 function evaluate(mode,a,b,previous){
  const raw=rawChecks(mode,a,b),count=missions[mode]?.steps.length||0,checks=[];
  for(let i=0;i<count;i++)checks.push((i===0||checks[i-1])&&(previous?.[i]===true||raw[i]===true));
  return {checks,completed:count>0&&checks.length===count&&checks.every(Boolean)};
 }
 function validMachine(m,name){return !!m&&m.version===2&&m.name===name&&m.nodes&&typeof m.nodes==='object'&&Object.keys(m.nodes).length<400&&m.nodes.root&&m.nodes.trash&&m.dirs&&m.nodes[m.dirs.docs]&&Array.isArray(m.shares)&&Array.isArray(m.inbox)&&Array.isArray(m.sent)&&m.did&&Array.isArray(m.users);}
 function validSnapshot(s,mode){try{return s?.version===2&&s.mode===mode&&validMachine(s.machines?.A,'PC-21')&&validMachine(s.machines?.B,'PC-22')&&JSON.stringify(s).length<200000;}catch{return false;}}
 const api={missions,find,evaluate,validSnapshot};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Session4Missions=api;
})(typeof window==='undefined'?{}:window);
