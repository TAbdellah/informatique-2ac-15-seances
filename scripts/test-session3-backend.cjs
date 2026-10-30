const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const project=require('node:path').resolve(__dirname,'..');
const ts=require(project+'/node_modules/typescript');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const load=(relative,imports={})=>{const exports={};vm.runInNewContext(compile(fs.readFileSync(project+'/'+relative,'utf8')),{exports,require:name=>{if(!imports[name])throw Error('Unexpected import '+name);return imports[name]},TextEncoder,TextDecoder,crypto:crypto.webcrypto,btoa,atob});return exports};
const m=load('app/session3-windows-model.ts');
const a=load('app/session3-assessment-data.ts',{'./session3-windows-model':m});
const exportsGrader=load('supabase/functions/informatique-2ac-api/session3-evaluation.ts');
const validate=exportsGrader.validSession3Evaluation;
const knowledge={families:Object.fromEntries(a.assessmentCards.map(c=>[c.id,c.family])),forms:Object.fromEntries(a.assessmentFiles.map(f=>[f.id,f.form]))};
let full=m.createWindowsState('assessment');
const act=action=>full=m.windowsReducer(full,action);
act({type:'folder',parent:'documents',name:'Bilan_club'});const target=full.nodes.find(n=>n.name==='Bilan_club').id;
for(const action of [{type:'clipboard',id:'source-photo',cut:true},{type:'paste',parent:target},{type:'clipboard',id:'source-note',cut:false},{type:'paste',parent:target}])act(action);
const copied=full.nodes.find(n=>n.id!=='source-note'&&n.parent===target&&n.origin==='club-invitation');act({type:'rename',id:copied.id,name:'Invitation.txt'});act({type:'restore',id:'lost-note'});
const fullAnswer=a.assessSession3(knowledge,full),empty=a.assessSession3({families:{},forms:{}},m.createWindowsState('assessment'));
let assertions=0;const equal=(x,y,message)=>{assert.deepEqual(x,y,message);assertions++};
const check=answer=>validate(answer,answer.score===20,answer.score,20);
equal(check(fullAnswer),true,'full score accepted');equal(check(empty),true,'zero score is a valid submission');equal(Buffer.byteLength(JSON.stringify(fullAnswer))<12000,true,'full answer fits current DB size');
for(const card of a.assessmentCards){const answers={...knowledge,families:{...knowledge.families,[card.id]:'wrong'}};const result=a.assessSession3(answers,full);equal(result.score,19);equal(check(result),true,'knowledge error accepted with accurate score');}
for(const file of a.assessmentFiles){const result=a.assessSession3({...knowledge,forms:{...knowledge.forms,[file.id]:'wrong'}},full);equal(result.score,19);equal(check(result),true,'file form error accepted');}
for(const item of [{type:'delete',id:target},{type:'delete',id:'source-photo'},{type:'delete',id:'source-note'},{type:'delete',id:copied.id},{type:'delete',id:'lost-note'},{type:'rename',id:target,name:'bILAN_club'}]){
 const result=a.assessSession3(knowledge,m.windowsReducer(full,item));equal(check(result),true,'server agrees with simulator outcomes');
}
for(const mutation of [r=>r.score=19,r=>r.answers[0].earnedPoints=0,r=>r.sections[2]=0,r=>r.dossier.files.find(f=>f.id==='source-photo').deleted=true,r=>r.dossier.files.push(r.dossier.files[0]),r=>r.dossier.criteria[0].correct=false,r=>r.answers[0].selectedChoice.fr='Logiciel',r=>r.answers[0].maxPoints=10,r=>r.format='arbitrary']){const r=structuredClone(fullAnswer);mutation(r);equal(check(r),false,'tampered result rejected');}
equal(validate(fullAnswer,false,20,20),false,'isCorrect must agree with score');equal(validate(fullAnswer,true,20,100),false,'rubric limited to 20');equal(validate(null,null,null,null),false);
let handler,unlocked=true,missing=false;const rows=[];const learner={id:'c24bd0fb-60cc-4a87-a56b-1a86b54e732b',student_one:'TEST TECHNIQUE S3',student_two:null,class_name:'2/1',group_name:'1',is_pair:false,created_at:new Date().toISOString()};
const password='LOCAL TEST ONLY',secret='LOCAL SESSION TEST ONLY';
const databaseFetch=async(url,init={})=>{
 const path=url.split('/rest/v1/')[1];
 if(path.startsWith('course_2ac_teacher_config'))return Response.json([{password_hash:crypto.createHash('sha256').update(password).digest('hex'),session_secret:secret}]);
 if(path.startsWith('course_2ac_session_access'))return Response.json([{is_unlocked:unlocked}]);
 if(path.startsWith('course_2ac_participants'))return Response.json(missing?[]:[learner]);
 if(path.startsWith('course_2ac_submissions')){if(init.method==='POST'){const row=JSON.parse(init.body);if(!rows.some(r=>r.id===row.id))rows.push({...row,created_at:new Date().toISOString()});return new Response(null,{status:201})}return Response.json(rows)}
 throw Error('Unexpected request '+path);
};
const context={exports:{},require:name=>name.includes("learning-service")?load("supabase/functions/informatique-2ac-api/learning-service.ts",{"./student-names.ts":load("supabase/functions/informatique-2ac-api/student-names.ts")}):exportsGrader,Deno:{serve:f=>handler=f,env:{get:key=>key==='SUPABASE_URL'?'https://local.test':'TEST SERVER ONLY'}},fetch:databaseFetch,TextEncoder,TextDecoder,Request,Response,crypto:crypto.webcrypto,btoa,atob,console,setTimeout};
vm.runInNewContext(compile(fs.readFileSync(project+'/supabase/functions/informatique-2ac-api/index.ts','utf8')),context);
const request=async(body,origin='https://tabdellah.github.io')=>{const response=await handler(new Request('https://local.test/function',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)}));return {status:response.status,body:await response.json()}};
const payload={action:'submit',id:crypto.randomUUID(),participantId:learner.id,sessionId:3,activityType:'practical_evaluation',activityId:'session-3-bilan-situations-v5',answer:fullAnswer,score:20,maxScore:20,isCorrect:true};
(async()=>{
 let r=await request(payload);equal(r.status,201,'new assessment HTTP accepted');equal(r.body.saved,true);equal(rows[0].response.answers.length,15,'all detailed answers stored');equal(rows[0].score,20);await request(payload);equal(rows.length,1,'retry idempotency');
 r=await request({...payload,id:crypto.randomUUID(),score:19});equal(r.status,400,'reject forged note');equal(rows.length,1);
 r=await request({...payload,id:crypto.randomUUID(),answer:empty,score:0,isCorrect:false});equal(r.status,201,'empty result saved for remediation');
 unlocked=false;r=await request({...payload,id:crypto.randomUUID()});equal(r.status,423,'lesson access still enforced');unlocked=true;missing=true;r=await request({...payload,id:crypto.randomUUID()});equal(r.status,404,'known learner required');missing=false;
 r=await request({action:'dashboard'});equal(r.status,401,'teacher results still private');r=await request(payload,'https://unapproved.example');equal(r.status,403,'origin restriction preserved');
 for(const old of [{activityId:'s2-evaluation-assembler',answer:{completed:true,errors:0,total:23,placements:Array(23).fill({})},score:23,maxScore:23},{activityId:'s2-evaluation-depanner',answer:{completed:true,errors:0,cases:Array(6).fill({}),score:12,maxScore:12},score:12,maxScore:12}]){r=await request({...payload,...old,id:crypto.randomUUID(),sessionId:2});equal(r.status,201,'existing lesson-2 evaluation compatible');}
 r=await request({action:'login',password});equal(r.status,200);const token=r.body.token;r=await request({action:'dashboard',token,filters:{className:'2/1',groupName:'1',sessionId:'3'},page:1});equal(r.status,200,'teacher dashboard accepts current auth');equal(r.body.attempts.length,2,'lesson-3 attempts in dashboard');equal(r.body.attempts.some(at=>at.activityId===payload.activityId&&at.score===20&&JSON.parse(at.responseJson).answers.length===15),true,'teacher receives detail and score');
 console.log(JSON.stringify({passed:true,assertions,fullAnswerBytes:Buffer.byteLength(JSON.stringify(fullAnswer))}));
})().catch(e=>{console.error(e);process.exitCode=1});
