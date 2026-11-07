"use client";

import { useRef, useState } from "react";
import { Check, ExternalLink, Film, RotateCcw } from "lucide-react";
import { publicAsset } from "../lib/public-assets";
import { Session3Text as Text } from "./session3-translation";
import { s4t as t, type Session4VideoActivity } from "./session4-data";
import { session4ActivityChecks, type Session4Draft } from "./session4-model";
import { session4U2Url } from "./session4-video-data";

export function Session4VideoExercise({activity,draft,onChange}:{
  activity:Session4VideoActivity;
  draft:Session4Draft;
  onChange:(patch:Partial<Session4Draft>)=>void;
}){
  const {video}=activity;
  const player=useRef<HTMLVideoElement>(null);
  const [unavailable,setUnavailable]=useState(false);
  const clipUrl=session4U2Url+video.file;
  const checks=session4ActivityChecks(activity,draft);

  function review(second:number){
    const clip=player.current;
    if(!clip)return;
    clip.currentTime=second;
    clip.scrollIntoView({block:"nearest",behavior:"smooth"});
    void clip.play().catch(error=>{if(error.name!=="AbortError")setUnavailable(true);});
  }

  return <div className="s4-video-exercise">
    <section className="s4-video-screen" aria-label="Vidéo de l’unité 2">
      <header>
        <span><Film size={17} aria-hidden="true"/> <Text value={t(`U2 · Séance ${video.source}`,`الوحدة 2 · الحصة ${video.source}`)}/></span>
        <span className="s4-video-duration">{video.duration}</span>
      </header>
      <video ref={player} src={clipUrl} controls playsInline preload="none"
        poster={publicAsset(`session4/videos/${activity.label}.webp`)}
        aria-label={video.title.fr} onError={()=>setUnavailable(true)} onPlaying={()=>setUnavailable(false)}/>
      {unavailable&&<p role="status" className="s4-video-unavailable"><Text value={t("La vidéo ne se lance pas ici. Essaie de l’ouvrir dans un autre onglet.","لم يبدأ تشغيل الفيديو هنا. جرّب فتحه في علامة تبويب أخرى.")}/></p>}
      <div className="s4-video-links">
        <a href={clipUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} aria-hidden="true"/><Text value={t("Ouvrir la vidéo","فتح الفيديو")}/></a>
        <a href={session4U2Url+"s"+video.source} target="_blank" rel="noreferrer"><Text value={t("Page source","الصفحة الأصلية")}/></a>
        <a href={session4U2Url} target="_blank" rel="noreferrer"><Text value={t("Plan de l’unité 2","خطة الوحدة 2")}/></a>
      </div>
    </section>
    <div className="s4-video-questions">
      {video.questions.map((question,index)=>{
        const time=Math.floor(question.second/60)+":"+String(question.second%60).padStart(2,"0");
        return <fieldset className="s4-video-question" key={question.id}>
          <legend><b>{index+1}.</b> <Text value={question.prompt}/></legend>
          <button type="button" className="s4-video-review" disabled={unavailable} onClick={()=>review(question.second)}>
            <RotateCcw size={14} aria-hidden="true"/><Text value={t(`Revoir à ${time}`,`إعادة المشاهدة عند ${time}`)}/>
          </button>
          <div className="s4-video-choices">
            {question.choices.map(choice=><button type="button" key={choice.id}
              aria-pressed={draft.selections[question.id]===choice.id}
              onClick={()=>onChange({selections:{...draft.selections,[question.id]:choice.id}})}>
              <Text value={choice.label}/>
            </button>)}
          </div>
          {draft.result!==null&&<p className={`s4-video-feedback ${checks[index]?"good":"retry"}`}>
            {checks[index]&&<Check size={15} aria-hidden="true"/>}
            <Text value={checks[index]?question.explanation:t("Revois le passage, puis essaie une autre réponse.","أعد مشاهدة المقطع ثم جرّب جوابًا آخر.")}/>
          </p>}
        </fieldset>;
      })}
    </div>
  </div>;
}
