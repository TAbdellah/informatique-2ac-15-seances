/* Interface et reprise du laboratoire. Aucune donnée personnelle, aucun appel réseau. */
(function(){
 'use strict';
 const channel='lab2ac-session4',protocol=2,root=document.getElementById('laboratoire'),contract=window.Session4Missions;
 const mode=new URLSearchParams(location.search).get('mode');
 if(!contract.missions[mode]){root.textContent='Cette activité du laboratoire n’existe pas.';return;}
 let nonce=null,parentOrigin='*',ready=false,pending=false,net=null,ctx=null,current='A',view='desktop',checks=[],frameReady=false;
 const send=data=>{if(nonce)parent.postMessage({channel,protocol,nonce,...data},parentOrigin);};
 const photo=name=>'../images/'+name+'.webp';
 function show(next){
  if(next==='network'){view='network';}else{view='desktop';current=next;}
  document.getElementById('network-view').hidden=view!=='network';
  document.getElementById('desktop-view').hidden=view!=='desktop';
  document.querySelectorAll('[data-machine]').forEach(el=>{el.hidden=el.dataset.machine!==current;});
  document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.view===(view==='network'?'network':current)?'true':'false'));
  const pc=ctx[current];
  document.getElementById('active-poste').textContent=pc.name+' · '+pc.ip;
  // A newly visible desktop needs its responsive class recalculated.
  if(view==='desktop'){pc.fitWindows();pc.render();}
  schedule();
 }
 function init(data){
  if(frameReady)return;frameReady=true;nonce=data.nonce;parentOrigin=data.origin;
  const saved=contract.validSnapshot(data.snapshot,mode)?data.snapshot:null,M=contract.missions[mode];
  checks=saved?.checks||[];
  root.innerHTML='<header class="lab-top"><div><span>LAB·2AC / RÉSEAU LOCAL</span><strong></strong></div><span class="local-badge">Simulation · Internet coupé</span></header>'+
   '<nav class="machine-tabs" aria-label="Choisir le poste virtuel"><button type="button" data-view="network">Le réseau</button><button type="button" data-view="A"><img alt="" src="'+photo('ordinateur-bureau')+'">PC-21 <small>Amine</small></button><button type="button" data-view="B"><img alt="" src="'+photo('ordinateur-bureau')+'">PC-22 <small>Sara</small></button></nav>'+
   '<div class="lab-grid"><aside class="mission-card"><span class="mini-label">À FAIRE DANS LE SIMULATEUR</span><ol id="mission-steps"></ol><p class="mission-result" role="status"></p><details class="help"><summary>Comment manipuler ?</summary><p>Un clic sélectionne un fichier ; un double-clic l’ouvre. Les boutons de l’Explorateur permettent de copier, coller et partager. Tu peux aussi utiliser le clic droit et Ctrl+C / Ctrl+V.</p></details></aside>'+
   '<section class="simulation"><section id="network-view" hidden><h2>Deux postes, un même commutateur</h2><p>Les messages et fichiers passent par le réseau local.</p><div class="network-plan"><div class="wire wire-a"></div><div class="wire wire-b"></div><div class="plan-switch"><img src="'+photo('commutateur')+'" alt="Commutateur réel"><strong>Commutateur</strong></div>'+['A','B'].map((key,i)=>'<article class="plan-pc pc-'+key+'"><img src="'+photo('ordinateur-bureau')+'" alt="Ordinateur '+(i?'PC-22':'PC-21')+'"><strong>'+(i?'PC-22':'PC-21')+'</strong><code>192.168.10.'+(i?'22':'21')+'</code><button type="button" data-cable="'+key+'"></button></article>').join('')+'</div><figure class="cable-detail"><img src="'+photo('cable-rj45')+'" alt="Connecteur RJ45"><figcaption>Le câble RJ45 relie chaque carte réseau à un port du commutateur.</figcaption></figure></section>'+
   '<section id="desktop-view"><header class="desktop-top"><strong id="active-poste"></strong><span>Poste virtuel</span></header><nav class="app-shortcuts" aria-label="Applications du poste"><button type="button" data-app="explorer">Explorateur</button><button type="button" data-app="terminal">Invite de commandes</button><button type="button" data-app="mail">Messagerie</button><button type="button" data-app="settings">Réseau</button></nav><div class="desktop-host" data-machine="A"></div><div class="desktop-host" data-machine="B" hidden></div></section></section></div>'+
   '<footer class="lab-footer">Deux ordinateurs simulés dans ton navigateur · les étapes se valident après tes manipulations.</footer>';
  root.querySelector('.lab-top strong').textContent=M.title;root.querySelector('.lab-top strong').dataset.ar=M.ar;
  net={machines:{},internet:false};ctx={A:null,B:null};
  const isRepair=mode==='repair';
  ctx.A=makeOS(root.querySelector('[data-machine="A"]'),{name:'PC-21',user:'Amine',ip:'192.168.10.21',seed:isRepair?'netA2':'clubA',net,snapshot:saved?.machines.A,onchange:schedule});
  ctx.B=makeOS(root.querySelector('[data-machine="B"]'),{name:'PC-22',user:'Sara',ip:'192.168.10.22',seed:isRepair?'netB0':'clubB',net,cable:mode!=='ping',snapshot:saved?.machines.B,onchange:schedule});
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>show(button.dataset.view)));
  document.querySelectorAll('[data-app]').forEach(button=>button.addEventListener('click',()=>{ctx[current].openApp(button.dataset.app);schedule();}));
  document.querySelectorAll('[data-cable]').forEach(button=>button.addEventListener('click',()=>{const pc=ctx[button.dataset.cable];pc.setCable(!pc.cable);schedule();}));
  M.steps.forEach((step,index)=>{
   const li=document.createElement('li');li.innerHTML='<span class="step-number"></span><div><p></p><details><summary>Un indice</summary><p></p></details></div>';
   li.querySelector('.step-number').textContent=index+1;li.querySelector('div>p').textContent=step[0];li.querySelector('div>p').dataset.ar=step[1];li.querySelector('details p').textContent=step[2];document.getElementById('mission-steps').appendChild(li);
  });
  ready=true;
  if(saved){ctx.A.restoreViews(saved.machines.A);ctx.B.restoreViews(saved.machines.B);current=saved.current==='B'?'B':'A';view=saved.view==='network'?'network':'desktop';}
  else if(mode==='identity'||mode==='ping')ctx.A.openApp('terminal');
  else ctx.A.openApp(mode==='messenger'?'mail':'explorer');
  show(view==='network'?'network':current);update();
 }
 function schedule(){if(!ready||pending)return;pending=true;queueMicrotask(()=>{pending=false;update();});}
 function update(){
  if(!ready)return;
  const a=ctx.A.dump(),b=ctx.B.dump(),result=contract.evaluate(mode,a,b,checks);checks=result.checks;
  document.querySelectorAll('#mission-steps li').forEach((li,i)=>{li.classList.toggle('done',checks[i]);li.classList.toggle('current',!checks[i]&&(i===0||checks[i-1]));li.querySelector('.step-number').textContent=checks[i]?'✓':i+1;});
  const count=checks.filter(Boolean).length,status=document.querySelector('.mission-result');
  status.textContent=result.completed?'Mission réussie · les manipulations ont été réalisées.':count+' / '+checks.length+' étapes réalisées';status.classList.toggle('complete',result.completed);
  document.querySelectorAll('[data-cable]').forEach(button=>{const key=button.dataset.cable,pc=ctx[key];button.textContent=pc.cable?'Débrancher le câble':'Rebrancher le câble';button.setAttribute('aria-pressed',String(pc.cable));button.closest('article').classList.toggle('unplugged',!pc.cable);document.querySelector('.wire-'+key.toLowerCase()).classList.toggle('unplugged',!pc.cable);});
  const snapshot={version:2,mode,machines:{A:a,B:b},checks,current,view};
  const evidence={steps:contract.missions[mode].steps.map((step,i)=>({task:step[0],done:checks[i]})),posts:[a,b].map(pc=>({name:pc.name,ip:pc.ip,connected:pc.cable,shares:pc.shares.map(s=>({name:s.name,permission:s.perm})),commands:(pc.did.commands||[]).slice(-6),messagesReceived:pc.inbox.slice(0,6).map(m=>({from:m.from,text:m.text,attachment:m.att?.name,read:m.read}))}))};
  send({type:'state',mode,checks,completed:result.completed,snapshot,evidence});
  send({type:'resize',height:Math.ceil(root.scrollHeight)});
 }
 window.addEventListener('message',event=>{
  const data=event.data;
  if(event.source!==parent||!data||data.channel!==channel||data.protocol!==protocol)return;
  if(data.type==='init'&&typeof data.nonce==='string'&&data.mode===mode){init({...data,origin:event.origin});}
 });
 // Capture unfinished message / terminal / file names too, without recreating the desktop.
 document.addEventListener('input',schedule,true);document.addEventListener('change',schedule,true);document.addEventListener('click',()=>setTimeout(schedule,0),true);document.addEventListener('keydown',()=>setTimeout(schedule,0),true);
 new ResizeObserver(()=>{if(ready)send({type:'resize',height:Math.ceil(root.scrollHeight)});}).observe(root);
 parent.postMessage({channel,protocol,type:'ready'},'*');
 const translations={'Le réseau':'الشبكة','Explorateur':'مستكشف الملفات','Invite de commandes':'نافذة الأوامر','Messagerie':'المراسلة','Réseau':'الشبكة','Nouveau dossier':'مجلد جديد','Nouveau fichier':'ملف جديد','Copier':'نسخ','Coller':'لصق','Couper':'قص','Partager':'مشاركة','Ouvrir':'فتح','Enregistrer':'حفظ','Fermer':'إغلاق','Démarrer':'ابدأ','Envoyer':'إرسال','Nouveau message':'رسالة جديدة','Documents':'المستندات','Bureau':'سطح المكتب','Téléchargements':'التنزيلات','Lecture seule':'القراءة فقط','Lecture et écriture':'القراءة والكتابة','Postes de la salle':'حواسيب القاعة','Moi seulement':'أنا فقط','Arrêter le partage':'إيقاف المشاركة','Rebrancher le câble':'إعادة توصيل الكابل','Débrancher le câble':'فصل الكابل','Exécuter':'تنفيذ','Un indice':'تلميح','Comment manipuler ?':'كيف أنجز العمليات؟'};
 const tooltip=document.getElementById('translation');let tipTarget=null;
 document.addEventListener('pointerover',event=>{const el=event.target.closest('[data-ar],button,summary');if(!el)return;const ar=el.dataset.ar||translations[el.textContent.trim()];if(!ar)return;tipTarget=el;tooltip.textContent=ar;tooltip.hidden=false;const r=el.getBoundingClientRect();tooltip.style.left=Math.min(Math.max(10,r.left),Math.max(10,innerWidth-290))+'px';tooltip.style.top=Math.max(8,Math.min(r.bottom+7,innerHeight-90))+'px';});
 document.addEventListener('pointerout',event=>{if(tipTarget&&!tipTarget.contains(event.relatedTarget)){tooltip.hidden=true;tipTarget=null;}});
 document.addEventListener('scroll',()=>{tooltip.hidden=true;tipTarget=null;},true);
})();
