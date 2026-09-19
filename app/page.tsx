"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  FileCheck2,
  FlaskConical,
  FolderKanban,
  Gauge,
  Hand,
  Home,
  ImageIcon,
  Languages,
  Lightbulb,
  LoaderCircle,
  Menu,
  MousePointer2,
  MonitorCog,
  PanelLeftClose,
  PanelLeftOpen,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  Target,
  TimerReset,
  UserRoundPen,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getUnit,
  phases,
  sessions,
  units,
  type CourseSession,
  type Lang,
  type LocalizedText,
} from "./course-data";
import { beginnerGuides, photoChallenges } from "./practice-data";
import {
  levelLabels,
  unit1Labs,
  type ExerciseLevel,
  type Unit1Exercise,
} from "./unit1-labs";
import {
  registerParticipant,
  submitCourseAttempt,
  type StudentProfile,
} from "@/lib/supabase-api";

type ViewTab = "mission" | "plan" | "workshop" | "trace" | "quiz";

type SubmissionInput = {
  sessionId: number;
  activityType: "unit1_exercise" | "quiz" | "photo_challenge" | "workshop" | "session_completion";
  activityId: string;
  answer: unknown;
  isCorrect?: boolean;
  score?: number;
  maxScore?: number;
};

type QueuedSubmission = SubmissionInput & {
  id: string;
  participantId: string;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const activeParticipantKey = "lab2ac-active-participant";
const submissionQueueKey = "lab2ac-submission-queue";

const ui = {
  fr: {
    program: "Programme",
    overview: "Vue d’ensemble",
    progress: "Ma progression",
    finished: "terminées",
    session: "Séance",
    sessions: "séances",
    hours: "heures",
    pair: "Travail en binôme",
    room: "Salle informatique · 15 postes",
    start: "Commencer le parcours",
    continue: "Continuer",
    open: "Ouvrir la séance",
    all: "Toutes",
    mission: "Mission",
    plan: "Déroulement",
    workshop: "Atelier",
    trace: "Trace écrite",
    quiz: "Évaluation",
    situation: "Situation-problème",
    goal: "Votre mission",
    objectives: "Objectifs d’apprentissage",
    organization: "Organisation du binôme",
    pilot: "Pilote",
    pilotText: "manipule pendant 15 min",
    copilot: "Copilote",
    copilotText: "observe et vérifie, puis on inverse",
    timing: "120 minutes, minute par minute",
    total: "Total exact",
    minutes: "min",
    workshopTitle: "Deux ateliers, une production",
    beginner: "Je débute sur ordinateur",
    beginnerIntro: "Aucune expérience n’est nécessaire. Fais ces gestes lentement avec ton binôme.",
    photoChallenge: "Photo-défi",
    realPhoto: "Observer une situation réelle",
    practiceTime: "85 min de pratique",
    choose: "Choisis une réponse",
    wellDone: "Bien vu !",
    tryAgain: "Observe encore et réessaie.",
    startPractice: "Passer à la pratique",
    peerCheck: "10 min · vérification par un autre binôme",
    validate: "Atelier terminé",
    deliverable: "Production attendue",
    notebook: "Trace écrite structurée",
    vocabulary: "Vocabulaire clé",
    quizTitle: "Vérification rapide",
    quizIntro: "Répondez aux questions puis vérifiez votre résultat.",
    check: "Vérifier mes réponses",
    retry: "Recommencer",
    correct: "Bonne réponse",
    wrong: "À revoir",
    score: "Votre score",
    complete: "Marquer comme terminée",
    completed: "Séance terminée",
    previous: "Précédente",
    next: "Suivante",
    timer: "Chronomètre de séance",
    reset: "Remettre à 2 h",
    back: "Retour au programme",
  },
  ar: {
    program: "البرنامج",
    overview: "نظرة عامة",
    progress: "تقدمي",
    finished: "منجزة",
    session: "الحصة",
    sessions: "حصص",
    hours: "ساعات",
    pair: "عمل ثنائي",
    room: "قاعة الإعلاميات · 15 حاسوبا",
    start: "ابدأ المسار",
    continue: "متابعة",
    open: "فتح الحصة",
    all: "الكل",
    mission: "المهمة",
    plan: "المراحل",
    workshop: "الورشة",
    trace: "خلاصة الدرس",
    quiz: "التقويم",
    situation: "الوضعية المشكلة",
    goal: "مهمتكم",
    objectives: "أهداف التعلم",
    organization: "تنظيم العمل الثنائي",
    pilot: "القائد",
    pilotText: "يستعمل الحاسوب لمدة 15 دقيقة",
    copilot: "الملاحظ",
    copilotText: "يراقب ويتحقق ثم نتبادل الأدوار",
    timing: "120 دقيقة، مرحلة بمرحلة",
    total: "المجموع المضبوط",
    minutes: "د",
    workshopTitle: "ورشتان وإنتاج واحد",
    beginner: "أنا مبتدئ في استعمال الحاسوب",
    beginnerIntro: "لا تحتاج إلى خبرة سابقة. أنجز هذه الحركات بهدوء مع زميلك.",
    photoChallenge: "تحدي الصورة",
    realPhoto: "ملاحظة وضعية حقيقية",
    practiceTime: "85 دقيقة من التطبيق",
    choose: "اختر جوابا",
    wellDone: "أحسنت الملاحظة!",
    tryAgain: "لاحظ من جديد ثم أعد المحاولة.",
    startPractice: "الانتقال إلى التطبيق",
    peerCheck: "10 دقائق · تحقق من طرف ثنائية أخرى",
    validate: "أنهيت الورشة",
    deliverable: "الإنتاج المطلوب",
    notebook: "خلاصة الدرس المنظمة",
    vocabulary: "المفردات الأساسية",
    quizTitle: "تحقق سريع",
    quizIntro: "أجب عن الأسئلة ثم تحقق من النتيجة.",
    check: "تحقق من الأجوبة",
    retry: "إعادة المحاولة",
    correct: "جواب صحيح",
    wrong: "يحتاج مراجعة",
    score: "نتيجتك",
    complete: "تحديد الحصة كمنجزة",
    completed: "الحصة منجزة",
    previous: "السابقة",
    next: "التالية",
    timer: "مؤقت الحصة",
    reset: "إرجاع ساعتين",
    back: "العودة إلى البرنامج",
  },
} as const;

const tabItems: { id: ViewTab; icon: typeof Target }[] = [
  { id: "mission", icon: Target },
  { id: "plan", icon: Clock3 },
  { id: "workshop", icon: FlaskConical },
  { id: "trace", icon: BookOpen },
  { id: "quiz", icon: FileCheck2 },
];

function txt(value: LocalizedText, lang: Lang) {
  return value[lang];
}

function bilingualAria(value: LocalizedText) {
  return `${value.fr} — ${value.ar}`;
}

function BilingualText({ value, className = "" }: { value: LocalizedText; className?: string }) {
  return (
    <span className={`bilingual-copy ${className}`.trim()}>
      <span className="bilingual-copy-fr" lang="fr" dir="ltr">{value.fr}</span>
      <span className="bilingual-copy-ar" lang="ar" dir="rtl">{value.ar}</span>
    </span>
  );
}

function readSubmissionQueue() {
  try {
    const stored = window.localStorage.getItem(submissionQueueKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) ? (parsed as QueuedSubmission[]) : [];
  } catch {
    return [];
  }
}

function writeSubmissionQueue(queue: QueuedSubmission[]) {
  window.localStorage.setItem(submissionQueueKey, JSON.stringify(queue));
}

function createClientSubmissionId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const values = new Uint32Array(4);
  crypto.getRandomValues(values);
  return `${Date.now().toString(36)}-${Array.from(values, (value) => value.toString(36)).join("-")}`;
}

function isStudentProfile(value: unknown): value is StudentProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<StudentProfile>;
  return Boolean(
    profile.id &&
    profile.studentOne &&
    profile.className &&
    profile.groupName &&
    typeof profile.isPair === "boolean"
  );
}

function StudentIdentityGate({ onReady }: { onReady: (profile: StudentProfile) => void }) {
  const [isPair, setIsPair] = useState(true);
  const [studentOne, setStudentOne] = useState("");
  const [studentTwo, setStudentTwo] = useState("");
  const [className, setClassName] = useState("2/1");
  const [groupName, setGroupName] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submitIdentity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const participant = await registerParticipant({
        studentOne,
        studentTwo: isPair ? studentTwo : null,
        className,
        groupName,
        isPair,
      });
      window.sessionStorage.setItem(activeParticipantKey, JSON.stringify(participant));
      onReady(participant);
    } catch (identityError) {
      setError(identityError instanceof Error ? identityError.message : "Enregistrement impossible.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="identity-gate" dir="ltr">
      <section className="identity-card" aria-labelledby="identity-title">
        <div className="identity-brand">
          <span className="brand-symbol" aria-hidden="true">{"//"}</span>
          <span><strong>LAB·2AC</strong><small>INFORMATIQUE</small></span>
        </div>
        <div className="identity-heading">
          <span className="identity-kicker"><Users size={16} /> Identification des élèves · تعريف التلاميذ</span>
          <h1 id="identity-title"><BilingualText value={{ fr: "Avant de commencer", ar: "قبل البدء" }} /></h1>
          <p><BilingualText value={{
            fr: "Indique ton nom, ta classe et ton groupe. Tes réponses seront enregistrées pour le suivi pédagogique.",
            ar: "أدخل اسمك وقسمك ومجموعتك. ستُسجّل إجاباتك من أجل التتبع التربوي.",
          }} /></p>
        </div>

        <form className="identity-form" onSubmit={submitIdentity}>
          <label className="pair-check">
            <input type="checkbox" checked={isPair} onChange={(event) => setIsPair(event.target.checked)} />
            <span className="pair-check-box"><Check size={16} /></span>
            <span><BilingualText value={{ fr: "Nous travaillons en binôme", ar: "نشتغل في ثنائي" }} /></span>
          </label>

          <div className={`student-name-grid ${isPair ? "pair" : "solo"}`}>
            <label>
              <span><BilingualText value={{ fr: isPair ? "Nom complet de l’élève 1" : "Nom complet", ar: isPair ? "الاسم الكامل للتلميذ(ة) الأول(ى)" : "الاسم الكامل" }} /></span>
              <input required value={studentOne} onChange={(event) => setStudentOne(event.target.value)} autoComplete="name" dir="auto" maxLength={100} />
            </label>
            {isPair && (
              <label>
                <span><BilingualText value={{ fr: "Nom complet de l’élève 2", ar: "الاسم الكامل للتلميذ(ة) الثاني(ة)" }} /></span>
                <input required value={studentTwo} onChange={(event) => setStudentTwo(event.target.value)} autoComplete="off" dir="auto" maxLength={100} />
              </label>
            )}
          </div>

          <div className="class-group-grid">
            <label>
              <span><BilingualText value={{ fr: "Classe", ar: "القسم" }} /></span>
              <select required value={className} onChange={(event) => setClassName(event.target.value)}>
                {Array.from({ length: 9 }, (_, index) => {
                  const value = `2/${index + 1}`;
                  return <option value={value} key={value}>{value}</option>;
                })}
              </select>
            </label>
            <label>
              <span><BilingualText value={{ fr: "Groupe", ar: "المجموعة" }} /></span>
              <select value={groupName} onChange={(event) => setGroupName(event.target.value)}>
                <option value="1">Groupe 1 · المجموعة 1</option>
                <option value="2">Groupe 2 · المجموعة 2</option>
              </select>
            </label>
          </div>

          {error && <div className="identity-error" role="alert"><AlertTriangle size={17} /><span>{error}</span></div>}

          <button className="identity-submit" type="submit" disabled={submitting}>
            {submitting ? <LoaderCircle className="spin" size={19} /> : <ArrowRight size={19} />}
            <BilingualText value={{ fr: submitting ? "Enregistrement…" : "Entrer dans le cours", ar: submitting ? "جارٍ التسجيل…" : "الدخول إلى الدرس" }} />
          </button>
        </form>
      </section>
    </main>
  );
}

function padTime(value: number) {
  return String(value).padStart(2, "0");
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${padTime(hours)}:${padTime(minutes)}:${padTime(secs)}`;
}

function UnitMark({ unit }: { unit: number }) {
  return <span className={`unit-mark unit-${unit}`}>U{unit}</span>;
}

function Sidebar({
  lang,
  selectedId,
  completed,
  isOpen,
  onClose,
  onToggle,
  onHome,
  onOpenSession,
}: {
  lang: Lang;
  selectedId: number | null;
  completed: Set<number>;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  onHome: () => void;
  onOpenSession: (id: number) => void;
}) {
  const labels = ui[lang];
  return (
    <>
      <button
        className={`sidebar-scrim ${isOpen ? "visible" : ""}`}
        aria-label={lang === "fr" ? "Fermer le menu" : "إغلاق القائمة"}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={isOpen
            ? (lang === "fr" ? "Réduire le programme" : "طي البرنامج")
            : (lang === "fr" ? "Développer le programme" : "فتح البرنامج")}
        >
          {isOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
        </button>
        <div className="brand-row">
          <button className="brand" onClick={onHome} aria-label={labels.overview}>
            <span className="brand-symbol" aria-hidden="true">{"//"}</span>
            <span>
              <strong>LAB·2AC</strong>
              <small>INFORMATIQUE</small>
            </span>
          </button>
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="Fermer">
            <X size={19} />
          </button>
        </div>

        <button className={`home-link ${selectedId === null ? "active" : ""}`} onClick={onHome}>
          <Home size={17} />
          <span>{labels.overview}</span>
        </button>

        <div className="sidebar-scroll">
          <p className="sidebar-label">{labels.program}</p>
          {units.map((unit) => {
            const unitSessions = sessions.filter((session) => session.unit === unit.id);
            return (
              <section className="sidebar-unit" key={unit.id}>
                <div className="sidebar-unit-title">
                  <UnitMark unit={unit.id} />
                  <span>{txt(unit.title, lang)}</span>
                  <small>{unit.hours}h</small>
                </div>
                <div className="sidebar-session-list">
                  {unitSessions.map((session) => (
                    <button
                      key={session.id}
                      className={`sidebar-session ${selectedId === session.id ? "active" : ""}`}
                      onClick={() => onOpenSession(session.id)}
                    >
                      <span className="sidebar-session-number">{padTime(session.id)}</span>
                      <span className="sidebar-session-name">{txt(session.title, lang)}</span>
                      {completed.has(session.id) ? (
                        <CheckCircle2 className="session-check" size={15} />
                      ) : (
                        <ChevronRight size={14} className="session-chevron" />
                      )}
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="progress-panel">
          <div className="progress-copy">
            <span>{labels.progress}</span>
            <strong>{completed.size}/15</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${(completed.size / 15) * 100}%` }} />
          </div>
          <small>{completed.size} {labels.finished}</small>
        </div>
      </aside>
    </>
  );
}

function Topbar({
  lang,
  selected,
  timerSeconds,
  timerRunning,
  student,
  saveStatus,
  onToggleLang,
  onToggleTimer,
  onResetTimer,
  onMenu,
  onChangeStudent,
  onRetrySave,
}: {
  lang: Lang;
  selected: CourseSession | null;
  timerSeconds: number;
  timerRunning: boolean;
  student: StudentProfile;
  saveStatus: SaveStatus;
  onToggleLang: () => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onMenu: () => void;
  onChangeStudent: () => void;
  onRetrySave: () => void;
}) {
  const labels = ui[lang];
  const studentLabel = student.isPair && student.studentTwo
    ? `${student.studentOne} + ${student.studentTwo}`
    : student.studentOne;
  return (
    <header className="topbar">
      <div className="topbar-path">
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Menu">
          <Menu size={20} />
        </button>
        <span>{selected ? `U${selected.unit}` : labels.program}</span>
        <ChevronRight size={14} />
        <strong>{selected ? `${labels.session} ${padTime(selected.id)}` : labels.overview}</strong>
      </div>
      <div className="topbar-actions">
        {saveStatus !== "idle" && (
          <button
            className={`save-status ${saveStatus}`}
            onClick={saveStatus === "error" ? onRetrySave : undefined}
            type="button"
            aria-label={saveStatus === "error" ? (lang === "fr" ? "Réessayer l’enregistrement" : "إعادة محاولة التسجيل") : undefined}
          >
            {saveStatus === "saving" && <LoaderCircle className="spin" size={14} />}
            {saveStatus === "saved" && <CheckCircle2 size={14} />}
            {saveStatus === "error" && <AlertTriangle size={14} />}
            <span>{saveStatus === "saving"
              ? (lang === "fr" ? "Enregistrement…" : "جارٍ التسجيل…")
              : saveStatus === "saved"
                ? (lang === "fr" ? "Réponses enregistrées" : "تم تسجيل الإجابات")
                : (lang === "fr" ? "Réessayer" : "إعادة المحاولة")}</span>
          </button>
        )}
        {selected && (
          <div className={`mini-timer ${timerRunning ? "running" : ""}`}>
            <Clock3 size={15} />
            <span>{formatTime(timerSeconds)}</span>
            <button onClick={onToggleTimer} aria-label={timerRunning ? "Pause" : "Start"}>
              {timerRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button onClick={onResetTimer} aria-label={labels.reset}>
              <RefreshCw size={13} />
            </button>
          </div>
        )}
        <button className="student-chip" onClick={onChangeStudent} title={lang === "fr" ? "Changer d’élève" : "تغيير التلميذ"}>
          <UserRoundPen size={16} />
          <span><strong>{studentLabel}</strong><small>{student.className} · G{student.groupName}</small></span>
        </button>
        <button className="lang-switch" onClick={onToggleLang}>
          <Languages size={17} />
          <span>{lang === "fr" ? "العربية" : "Français"}</span>
        </button>
      </div>
    </header>
  );
}

function Dashboard({
  lang,
  completed,
  onOpenSession,
}: {
  lang: Lang;
  completed: Set<number>;
  onOpenSession: (id: number) => void;
}) {
  const labels = ui[lang];
  const [filter, setFilter] = useState<number | "all">("all");
  const visibleSessions = filter === "all" ? sessions : sessions.filter((session) => session.unit === filter);
  const nextSession = sessions.find((session) => !completed.has(session.id)) ?? sessions[0];

  return (
    <div className="dashboard page-enter">
      <section className="dashboard-hero">
        <div className="hero-grid-mark" aria-hidden="true">
          <span>01</span><span>05</span><span>10</span><span>15</span>
        </div>
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> PARCOURS INTERACTIF · 2AC</div>
          <h1>
            {lang === "fr" ? (
              <>15 séances.<br /><em>30 heures.</em><br />Un vrai laboratoire.</>
            ) : (
              <>15 حصة.<br /><em>30 ساعة.</em><br />مختبر حقيقي.</>
            )}
          </h1>
          <p>
            {lang === "fr"
              ? "Même si tu n’as jamais touché un ordinateur : un geste montré, puis tu pratiques — toujours avec ton binôme."
              : "حتى لو لم تستعمل الحاسوب من قبل: حركة واحدة معروضة ثم تطبقها — دائما مع زميلك."}
          </p>
          <button className="primary-button" onClick={() => onOpenSession(nextSession.id)}>
            {completed.size ? labels.continue : labels.start}
            {lang === "fr" ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          </button>
        </div>
        <div className="hero-data">
          <div className="hero-stat hero-stat-main">
            <span>41</span>
            <small>{lang === "fr" ? "exercices interactifs dans l’unité 1" : "تمرينًا تفاعليًا في الوحدة 1"}</small>
          </div>
          <div className="hero-stat"><span>15</span><small>{labels.sessions}</small></div>
          <div className="hero-stat"><span>30h</span><small>{lang === "fr" ? "au total" : "في المجموع"}</small></div>
          <div className="hero-room">
            <MonitorCog size={20} />
            <div><strong>{labels.room}</strong><span>{labels.pair} · {lang === "fr" ? "débutants accompagnés" : "دعم للمبتدئين"}</span></div>
          </div>
        </div>
      </section>

      <section className="unit-overview">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{lang === "fr" ? "ARCHITECTURE DU PARCOURS" : "بنية المسار"}</span>
            <h2>{lang === "fr" ? "4 unités qui construisent l’autonomie" : "أربع وحدات لبناء الاستقلالية"}</h2>
          </div>
          <span className="section-rule" />
        </div>
        <div className="unit-cards">
          {units.map((unit) => (
            <button className={`unit-card unit-${unit.id}`} key={unit.id} onClick={() => setFilter(unit.id)}>
              <div className="unit-card-top">
                <UnitMark unit={unit.id} />
                <span>{unit.hours}H</span>
              </div>
              <strong>{txt(unit.title, lang)}</strong>
              <small>{unit.sessions} {labels.sessions}</small>
              <div className="unit-card-meter">
                {Array.from({ length: unit.sessions }).map((_, index) => {
                  const unitSession = sessions.filter((item) => item.unit === unit.id)[index];
                  return <span key={index} className={completed.has(unitSession.id) ? "done" : ""} />;
                })}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="sessions-section">
        <div className="section-heading session-heading">
          <div>
            <span className="eyebrow">{lang === "fr" ? "FEUILLE DE ROUTE" : "خارطة الطريق"}</span>
            <h2>{lang === "fr" ? "Les 15 séances" : "الحصص الخمس عشرة"}</h2>
          </div>
          <div className="filter-row" role="group" aria-label="Filtrer par unité">
            <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>{labels.all}</button>
            {units.map((unit) => (
              <button className={filter === unit.id ? "active" : ""} onClick={() => setFilter(unit.id)} key={unit.id}>U{unit.id}</button>
            ))}
          </div>
        </div>
        <div className="session-grid">
          {visibleSessions.map((session) => {
            const unit = getUnit(session.unit);
            const done = completed.has(session.id);
            return (
              <button className={`session-card unit-${session.unit} ${done ? "done" : ""}`} key={session.id} onClick={() => onOpenSession(session.id)}>
                <div className="session-card-top">
                  <span className="session-index">{padTime(session.id)}</span>
                  <span className="session-duration"><Clock3 size={13} /> 2H</span>
                </div>
                <div className="session-card-unit">U{session.unit} · {txt(unit.title, lang)}</div>
                <h3>{txt(session.title, lang)}</h3>
                <p>{txt(session.subtitle, lang)}</p>
                <div className="session-card-foot">
                  <span>
                    {labels.open} · {session.unit === 1
                      ? `${unit1Labs[session.id as 1 | 2 | 3].exercises.length} ${lang === "fr" ? "exercices" : "تمرينًا"}`
                      : `85 min ${lang === "fr" ? "pratique" : "تطبيق"}`}
                  </span>
                  {done ? <CheckCircle2 size={19} /> : <ArrowRight size={19} />}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function MissionView({ session, lang, onStartPractice }: { session: CourseSession; lang: Lang; onStartPractice: () => void }) {
  const labels = ui[lang];
  const guide = beginnerGuides[session.id];
  return (
    <div className="tab-content two-column-content page-enter">
      <div className="content-main">
        <article className="content-card situation-card">
          <span className="card-kicker"><FolderKanban size={16} /> {labels.situation}</span>
          <p className="lead-text">{txt(session.situation, lang)}</p>
        </article>
        <article className="beginner-card">
          <div className="beginner-card-head">
            <span className="beginner-icon"><Hand size={21} /></span>
            <div>
              <span>{labels.beginner}</span>
              <p>{labels.beginnerIntro}</p>
            </div>
          </div>
          <ol>
            {guide.map((step, index) => (
              <li key={step.fr}><span>{index + 1}</span><p>{txt(step, lang)}</p></li>
            ))}
          </ol>
        </article>
        <article className="content-card mission-card">
          <span className="card-kicker"><Target size={16} /> {labels.goal}</span>
          <h2>{txt(session.mission, lang)}</h2>
          <div className="mission-output">
            <FileCheck2 size={19} />
            <div><span>{labels.deliverable}</span><strong>{txt(session.deliverable, lang)}</strong></div>
          </div>
          <button className="practice-button" onClick={onStartPractice}>
            <MousePointer2 size={18} />
            {labels.startPractice}
          </button>
        </article>
      </div>
      <aside className="content-side">
        <article className="content-card objective-card">
          <span className="card-kicker">{labels.objectives}</span>
          <ol className="objective-list">
            {session.objectives.map((objective, index) => (
              <li key={objective.fr}><span>{index + 1}</span><p>{txt(objective, lang)}</p></li>
            ))}
          </ol>
        </article>
        <article className="content-card pair-card">
          <span className="card-kicker"><Users size={16} /> {labels.organization}</span>
          <div className="role-row"><span>P</span><div><strong>{labels.pilot}</strong><small>{labels.pilotText}</small></div></div>
          <div className="role-row"><span>C</span><div><strong>{labels.copilot}</strong><small>{labels.copilotText}</small></div></div>
        </article>
      </aside>
    </div>
  );
}

function PlanView({ lang }: { lang: Lang }) {
  const labels = ui[lang];
  const phaseDetails = lang === "fr"
    ? [
        "Observer la situation réelle et tenter une première réponse, sans cours préalable.",
        "Le professeur montre uniquement le geste indispensable ; chaque élève le reproduit aussitôt.",
        "Résoudre la photo-défi puis réaliser les ateliers A et B sur le poste. Les rôles changent régulièrement.",
        "Faire vérifier la production, compléter la trace écrite structurée puis réussir le défi final.",
      ]
    : [
        "ملاحظة الوضعية الحقيقية ومحاولة جواب أول دون درس نظري مسبق.",
        "يعرض الأستاذ الحركة الضرورية فقط ثم يطبقها كل تلميذ مباشرة.",
        "حل تحدي الصورة ثم إنجاز الورشتين A وB على الحاسوب مع تبادل الأدوار.",
        "التحقق من الإنتاج وإتمام الخلاصة المنظمة ثم إنجاز التحدي النهائي.",
      ];
  return (
    <div className="tab-content page-enter">
      <div className="plan-head">
        <div><span className="card-kicker">{labels.plan}</span><h2>{labels.timing}</h2></div>
        <div className="total-badge"><strong>120</strong><span>{labels.minutes}<br />{labels.total}</span></div>
      </div>
      <div className="timeline">
        {phases.map((phase, index) => {
          const start = phases.slice(0, index).reduce((total, item) => total + item.minutes, 0);
          const end = start + phase.minutes;
          return (
            <article className={`timeline-step phase-${index + 1}`} key={phase.key}>
              <div className="timeline-time"><strong>{padTime(start)}</strong><span>→</span><strong>{padTime(end)}</strong></div>
              <div className="timeline-dot"><span>{index + 1}</span></div>
              <div className="timeline-card">
                <div className="timeline-card-head">
                  <div><small>{txt(phase.note, lang)}</small><h3>{txt(phase.label, lang)}</h3></div>
                  <strong>{phase.minutes} {labels.minutes}</strong>
                </div>
                <p>{phaseDetails[index]}</p>
                <div className="timeline-meter"><span style={{ width: `${(phase.minutes / 120) * 100}%` }} /></div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function sameNumbers(left: number[], right: number[]) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function ExercisePlayer({
  exercise,
  lang,
  alreadyCompleted,
  onComplete,
  onResult,
}: {
  exercise: Unit1Exercise;
  lang: Lang;
  alreadyCompleted: boolean;
  onComplete: () => void;
  onResult: (answer: unknown, correct: boolean) => void;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [multi, setMulti] = useState<Set<number>>(new Set());
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [sequence, setSequence] = useState<number[]>([]);
  const [textValue, setTextValue] = useState("");
  const [gestureProgress, setGestureProgress] = useState(
    exercise.type === "gesture" && exercise.mode === "precision" && alreadyCompleted ? 5 : 0
  );
  const [result, setResult] = useState<boolean | null>(alreadyCompleted ? true : null);

  useEffect(() => {
    if (!alreadyCompleted) return;
    setResult(true);
    if (exercise.type === "gesture" && exercise.mode === "precision") setGestureProgress(5);
  }, [alreadyCompleted, exercise]);

  const typeLabel: Record<Unit1Exercise["type"], LocalizedText> = {
    choice: { fr: "Choix unique", ar: "اختيار واحد" },
    multi: { fr: "Choix multiple", ar: "اختيار متعدد" },
    match: { fr: "Classement", ar: "تصنيف" },
    sequence: { fr: "Mise en ordre", ar: "ترتيب" },
    text: { fr: "Réponse courte", ar: "جواب قصير" },
    gesture: { fr: "Manipulation", ar: "تطبيق عملي" },
  };

  function recordResult(correct: boolean, answer: unknown) {
    setResult(correct);
    onResult(answer, correct);
    if (correct) onComplete();
  }

  function resetAttempt() {
    setChoice(null);
    setMulti(new Set());
    setMatches({});
    setSequence([]);
    setTextValue("");
    setGestureProgress(0);
    setResult(null);
  }

  function checkCurrent() {
    if (exercise.type === "choice") recordResult(choice === exercise.answer, { selectedIndex: choice });
    if (exercise.type === "multi") {
      const selectedIndices = [...multi].sort((a, b) => a - b);
      recordResult(sameNumbers(selectedIndices, [...exercise.answers].sort((a, b) => a - b)), { selectedIndices });
    }
    if (exercise.type === "match") {
      recordResult(
        exercise.rows.every((row, index) => matches[index] === row.answer),
        { matches: exercise.rows.map((_, index) => matches[index]) }
      );
    }
    if (exercise.type === "sequence") {
      recordResult(sameNumbers(sequence, exercise.steps.map((_, index) => index)), { sequence });
    }
    if (exercise.type === "text") {
      const proposed = normalizeAnswer(textValue);
      const acceptedAnswers = [...exercise.accepted.fr, ...exercise.accepted.ar];
      recordResult(acceptedAnswers.some((answer) => normalizeAnswer(answer) === proposed), { text: textValue.trim() });
    }
  }

  const canCheck =
    (exercise.type === "choice" && choice !== null) ||
    (exercise.type === "multi" && multi.size > 0) ||
    (exercise.type === "match" && Object.keys(matches).length === exercise.rows.length) ||
    (exercise.type === "sequence" && sequence.length === exercise.steps.length) ||
    (exercise.type === "text" && textValue.trim().length > 0);

  return (
    <article className={`exercise-player level-${exercise.level}`}>
      <div className="exercise-copy">
        <div className="exercise-meta">
          <span>{txt(levelLabels[exercise.level], lang)}</span>
          <strong>{txt(typeLabel[exercise.type], lang)}</strong>
          {alreadyCompleted && <small><CheckCircle2 size={14} />{lang === "fr" ? "Déjà réussi" : "تم بنجاح"}</small>}
        </div>
        <h3><BilingualText value={exercise.title} /></h3>
        <p className="exercise-prompt"><BilingualText value={exercise.prompt} /></p>
      </div>

      {exercise.image && (
        <figure className="exercise-image">
          <img src={exercise.image.src} alt={bilingualAria(exercise.image.alt)} loading="lazy" referrerPolicy="no-referrer" />
          <figcaption><ImageIcon size={14} />{txt(exercise.image.caption, lang)}</figcaption>
        </figure>
      )}

      {exercise.type === "choice" && (
        <div className="exercise-options">
          {exercise.choices.map((item, index) => (
            <button
              className={choice === index ? "selected" : ""}
              key={item.fr}
              onClick={() => { setChoice(index); setResult(null); }}
            >
              <span className="option-marker">{String.fromCharCode(65 + index)}</span>
              <BilingualText value={item} />
            </button>
          ))}
        </div>
      )}

      {exercise.type === "multi" && (
        <div className="exercise-options multi-options">
          {exercise.choices.map((item, index) => {
            const selected = multi.has(index);
            return (
              <button
                className={selected ? "selected" : ""}
                key={item.fr}
                onClick={() => {
                  setMulti((current) => {
                    const next = new Set(current);
                    if (next.has(index)) next.delete(index); else next.add(index);
                    return next;
                  });
                  setResult(null);
                }}
              >
                <span className="option-marker">{selected ? <Check size={14} /> : <Circle size={14} />}</span>
                <BilingualText value={item} />
              </button>
            );
          })}
        </div>
      )}

      {exercise.type === "match" && (
        <div className="match-board">
          {exercise.rows.map((row, rowIndex) => (
            <div className="match-row" key={row.label.fr}>
              <strong><BilingualText value={row.label} /></strong>
              <div>
                {exercise.categories.map((category, categoryIndex) => (
                  <button
                    key={category.fr}
                    className={matches[rowIndex] === categoryIndex ? "selected" : ""}
                    onClick={() => { setMatches((current) => ({ ...current, [rowIndex]: categoryIndex })); setResult(null); }}
                  >
                    <BilingualText value={category} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {exercise.type === "sequence" && (
        <div className="sequence-board">
          <div className="sequence-answer" aria-label={lang === "fr" ? "Ordre choisi" : "الترتيب المختار"}>
            {exercise.steps.map((_, index) => {
              const selectedIndex = sequence[index];
              return (
                <div className={selectedIndex === undefined ? "empty" : "filled"} key={index}>
                  <span>{index + 1}</span>
                  <p>
                    <BilingualText
                      value={selectedIndex === undefined
                        ? { fr: "Choisir une étape", ar: "اختر مرحلة" }
                        : exercise.steps[selectedIndex]}
                    />
                  </p>
                </div>
              );
            })}
          </div>
          <div className="sequence-bank">
            {exercise.shuffled.map((stepIndex) => (
              <button
                key={stepIndex}
                disabled={sequence.includes(stepIndex)}
                onClick={() => { setSequence((current) => [...current, stepIndex]); setResult(null); }}
              >
                <BilingualText value={exercise.steps[stepIndex]} />
              </button>
            ))}
          </div>
          <button className="reset-sequence" onClick={() => { setSequence([]); setResult(null); }}>
            <RefreshCw size={15} />{lang === "fr" ? "Recommencer l’ordre" : "إعادة الترتيب"}
          </button>
        </div>
      )}

      {exercise.type === "text" && (
        <div className="text-answer">
          <input
            value={textValue}
            onChange={(event) => { setTextValue(event.target.value); setResult(null); }}
            onKeyDown={(event) => { if (event.key === "Enter" && textValue.trim()) checkCurrent(); }}
            placeholder={`${exercise.placeholder.fr} / ${exercise.placeholder.ar}`}
            aria-label={bilingualAria(exercise.prompt)}
          />
          <small>{lang === "fr" ? "Entrée ou le bouton Vérifier" : "اضغط Enter أو زر التحقق"}</small>
        </div>
      )}

      {exercise.type === "gesture" && exercise.mode === "precision" && (
        <div className="precision-board">
          {[1, 2, 3, 4, 5].map((target) => (
            <button
              key={target}
              className={`precision-target target-${target} ${gestureProgress >= target ? "hit" : ""}`}
              disabled={gestureProgress >= target}
              onClick={() => {
                if (target === gestureProgress + 1) {
                  const next = gestureProgress + 1;
                  setGestureProgress(next);
                  setResult(null);
                  if (next === 5) recordResult(true, { mode: "precision", completedTargets: 5 });
                } else {
                  setGestureProgress(0);
                  recordResult(false, { mode: "precision", clickedTarget: target, expectedTarget: gestureProgress + 1 });
                }
              }}
            >
              {gestureProgress >= target ? <Check size={18} /> : target}
            </button>
          ))}
          <span>{gestureProgress}/5</span>
        </div>
      )}

      {exercise.type === "gesture" && exercise.mode === "double" && (
        <div className="double-click-board">
          <button
            onClick={() => setResult(false)}
            onDoubleClick={() => recordResult(true, { mode: "double_click", completed: true })}
            aria-label="Dossier à ouvrir par double-clic — مجلد يفتح بالنقر المزدوج"
          >
            <FolderKanban size={54} />
            <BilingualText
              className="double-click-label"
              value={result === true
                ? { fr: "Dossier ouvert", ar: "تم فتح المجلد" }
                : { fr: "Mon dossier", ar: "مجلدي" }}
            />
          </button>
        </div>
      )}

      {exercise.type === "gesture" && exercise.mode === "typing" && (
        <div className="typing-board">
          <label htmlFor={`typing-${exercise.id}`}><BilingualText value={{ fr: "Ton prénom", ar: "اسمك" }} /></label>
          <input
            id={`typing-${exercise.id}`}
            value={textValue}
            onChange={(event) => { setTextValue(event.target.value); setResult(null); }}
            onKeyDown={(event) => {
              if (event.key === "Enter") recordResult(textValue.trim().length >= 2, { mode: "typing", text: textValue.trim() });
            }}
            placeholder="Écris ici… / اكتب هنا…"
          />
          <kbd>Entrée / إدخال ↵</kbd>
        </div>
      )}

      {exercise.type !== "gesture" && (
        <div className="exercise-actions">
          <button className="check-exercise" disabled={!canCheck} onClick={checkCurrent}>
            <CheckCircle2 size={17} />{lang === "fr" ? "Vérifier ma réponse" : "التحقق من جوابي"}
          </button>
          <button className="clear-exercise" onClick={resetAttempt}><RefreshCw size={15} />{lang === "fr" ? "Effacer" : "مسح"}</button>
        </div>
      )}

      {exercise.hint && result !== true && (
        <div className="exercise-hint">
          <Lightbulb size={16} />
          <span>
            <strong>{lang === "fr" ? "Indice" : "مساعدة"}</strong>
            <BilingualText value={exercise.hint} />
          </span>
        </div>
      )}

      {result !== null && (
        <div className={`exercise-result ${result ? "correct" : "wrong"}`} role="status">
          {result ? <CheckCircle2 size={20} /> : <Lightbulb size={20} />}
          <div>
            <strong>{result ? (lang === "fr" ? "Exercice réussi" : "تمرين ناجح") : (lang === "fr" ? "Pas encore" : "ليس بعد")}</strong>
            <p>
              <BilingualText
                value={result
                  ? exercise.feedback
                  : {
                    fr: "Relis la consigne, corrige ta réponse puis vérifie de nouveau.",
                    ar: "أعد قراءة التعليمة وصحح جوابك ثم تحقق من جديد.",
                  }}
              />
            </p>
          </div>
        </div>
      )}
    </article>
  );
}

function Unit1Workshop({
  session,
  lang,
  participantId,
  onRecordSubmission,
}: {
  session: CourseSession;
  lang: Lang;
  participantId: string;
  onRecordSubmission: (submission: SubmissionInput) => void;
}) {
  const lab = unit1Labs[session.id as 1 | 2 | 3];
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [progressLoaded, setProgressLoaded] = useState(false);
  const exerciseAnchorRef = useRef<HTMLDivElement>(null);
  const exercise = lab.exercises[exerciseIndex];
  const levels: ExerciseLevel[] = ["start", "train", "challenge"];
  const progress = Math.round((completedExercises.size / lab.exercises.length) * 100);

  useEffect(() => {
    setProgressLoaded(false);
    setCompletedExercises(new Set());
    const stored = window.localStorage.getItem(`lab2ac-unit1-session-${session.id}-${participantId}`);
    if (stored) {
      try { setCompletedExercises(new Set(JSON.parse(stored) as string[])); } catch { /* Ignore malformed local data. */ }
    }
    setProgressLoaded(true);
  }, [participantId, session.id]);

  useEffect(() => {
    if (!progressLoaded) return;
    window.localStorage.setItem(`lab2ac-unit1-session-${session.id}-${participantId}`, JSON.stringify([...completedExercises]));
  }, [completedExercises, participantId, progressLoaded, session.id]);

  useEffect(() => {
    const scrollTimer = window.setTimeout(() => {
      exerciseAnchorRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    }, 120);
    return () => window.clearTimeout(scrollTimer);
  }, [exerciseIndex]);

  function markCompleted(id: string) {
    setCompletedExercises((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }

  return (
    <div className="tab-content unit1-lab page-enter">
      <div className="lab-head">
        <div>
          <span className="card-kicker"><FlaskConical size={16} />{lang === "fr" ? "Atelier pratique intégré" : "ورشة تطبيقية مدمجة"}</span>
          <h2>{txt(lab.title, lang)}</h2>
          <p>{txt(lab.subtitle, lang)}</p>
        </div>
        <div className="lab-score">
          <strong>{completedExercises.size}<span>/{lab.exercises.length}</span></strong>
          <small>{lang === "fr" ? "exercices réussis" : "تمارين ناجحة"}</small>
        </div>
      </div>

      <div className="lab-progress" aria-label={`${progress}%`}><span style={{ width: `${progress}%` }} /></div>

      <div className="level-switcher" role="group" aria-label={lang === "fr" ? "Niveaux d’exercices" : "مستويات التمارين"}>
        {levels.map((level) => {
          const indices = lab.exercises.map((item, index) => item.level === level ? index : -1).filter((index) => index >= 0);
          const completeCount = indices.filter((index) => completedExercises.has(lab.exercises[index].id)).length;
          return (
            <button
              key={level}
              className={exercise.level === level ? "active" : ""}
              onClick={() => setExerciseIndex(indices[0])}
            >
              <span>{txt(levelLabels[level], lang)}</span>
              <small>{completeCount}/{indices.length}</small>
            </button>
          );
        })}
      </div>

      <div className="exercise-counter" ref={exerciseAnchorRef}>
        <span>{lang === "fr" ? "EXERCICE" : "تمرين"} {padTime(exerciseIndex + 1)}</span>
        <strong>{exerciseIndex + 1} / {lab.exercises.length}</strong>
      </div>

      <ExercisePlayer
        key={exercise.id}
        exercise={exercise}
        lang={lang}
        alreadyCompleted={completedExercises.has(exercise.id)}
        onComplete={() => markCompleted(exercise.id)}
        onResult={(answer, correct) => onRecordSubmission({
          sessionId: session.id,
          activityType: "unit1_exercise",
          activityId: exercise.id,
          answer,
          isCorrect: correct,
        })}
      />

      <nav className="exercise-navigation" aria-label={lang === "fr" ? "Navigation entre les exercices" : "التنقل بين التمارين"}>
        <button disabled={exerciseIndex === 0} onClick={() => setExerciseIndex((current) => Math.max(0, current - 1))}>
          <ArrowLeft size={18} />{lang === "fr" ? "Exercice précédent" : "التمرين السابق"}
        </button>
        <div>
          {lab.exercises.map((item, index) => (
            <button
              key={item.id}
              className={`${index === exerciseIndex ? "active" : ""} ${completedExercises.has(item.id) ? "done" : ""}`}
              onClick={() => setExerciseIndex(index)}
              aria-label={`${lang === "fr" ? "Exercice" : "تمرين"} ${index + 1}`}
            />
          ))}
        </div>
        <button
          disabled={exerciseIndex === lab.exercises.length - 1 || !completedExercises.has(exercise.id)}
          onClick={() => setExerciseIndex((current) => Math.min(lab.exercises.length - 1, current + 1))}
        >
          {lang === "fr" ? "Exercice suivant" : "التمرين التالي"}<ArrowRight size={18} />
        </button>
      </nav>

      <article className="deliverable-card lab-deliverable">
        <div className="deliverable-icon"><FileCheck2 size={24} /></div>
        <div><span>{ui[lang].deliverable}</span><strong>{txt(session.deliverable, lang)}</strong></div>
        <div className="quality-stamp"><Check size={16} />{completedExercises.size === lab.exercises.length ? (lang === "fr" ? "Parcours entièrement réussi" : "تم إنجاز المسار كاملا") : (lang === "fr" ? "Progression enregistrée pendant la séance" : "يتم حفظ التقدم خلال الحصة")}</div>
      </article>
    </div>
  );
}

function StandardWorkshopView({
  session,
  lang,
  onRecordSubmission,
}: {
  session: CourseSession;
  lang: Lang;
  onRecordSubmission: (submission: SubmissionInput) => void;
}) {
  const labels = ui[lang];
  const [checked, setChecked] = useState<boolean[]>([false, false]);
  const [photoAnswer, setPhotoAnswer] = useState<number | null>(null);
  const challenge = photoChallenges[session.id];
  const photoCorrect = photoAnswer === challenge.answer;
  return (
    <div className="tab-content page-enter">
      <div className="workshop-head">
        <div><span className="card-kicker"><FlaskConical size={16} /> {labels.workshop}</span><h2>{labels.workshopTitle}</h2><small>{labels.practiceTime}</small></div>
        <span>{checked.filter(Boolean).length + (photoCorrect ? 1 : 0)}/3</span>
      </div>
      <article className="photo-challenge">
        <div className="photo-frame">
          <img src={challenge.image.src} alt={txt(challenge.image.alt, lang)} loading="lazy" referrerPolicy="no-referrer" />
          <a href={challenge.image.source} target="_blank" rel="noreferrer">{challenge.image.credit}</a>
          <span><ImageIcon size={15} /> {labels.realPhoto}</span>
        </div>
        <div className="photo-task">
          <div className="photo-task-meta">
            <span>{labels.photoChallenge}</span>
            <strong>{txt(challenge.kind, lang)}</strong>
          </div>
          <h3>{txt(challenge.prompt, lang)}</h3>
          <p className="choose-label">{labels.choose}</p>
          <div className="photo-choices">
            {challenge.choices.map((choice, index) => {
              const selected = photoAnswer === index;
              const correct = photoAnswer !== null && index === challenge.answer;
              const wrong = selected && photoAnswer !== challenge.answer;
              return (
                <button
                  key={choice.fr}
                  className={`${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                  onClick={() => {
                    setPhotoAnswer(index);
                    onRecordSubmission({
                      sessionId: session.id,
                      activityType: "photo_challenge",
                      activityId: `session-${session.id}-photo`,
                      answer: { selectedIndex: index, selectedChoice: choice },
                      isCorrect: index === challenge.answer,
                    });
                  }}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {txt(choice, lang)}
                  {correct && <Check size={16} />}
                </button>
              );
            })}
          </div>
          {photoAnswer !== null && (
            <div className={`photo-feedback ${photoCorrect ? "correct" : "wrong"}`}>
              {photoCorrect ? <CheckCircle2 size={18} /> : <Lightbulb size={18} />}
              <div><strong>{photoCorrect ? labels.wellDone : labels.tryAgain}</strong><p>{txt(challenge.feedback, lang)}</p></div>
            </div>
          )}
        </div>
      </article>
      <div className="workshop-grid">
        {session.workshops.map((workshop, index) => (
          <article className={`workshop-card ${checked[index] ? "checked" : ""}`} key={workshop.label}>
            <div className="workshop-card-top">
              <span className="workshop-letter">{workshop.label}</span>
              <span><Clock3 size={14} /> {workshop.duration} {labels.minutes}</span>
            </div>
            <h3>{lang === "fr" ? `Atelier ${workshop.label}` : `الورشة ${workshop.label}`}</h3>
            <p>{txt(workshop.text, lang)}</p>
            <button onClick={() => setChecked((current) => {
              const nextValue = !current[index];
              if (nextValue) {
                onRecordSubmission({
                  sessionId: session.id,
                  activityType: "workshop",
                  activityId: `session-${session.id}-workshop-${workshop.label}`,
                  answer: { completed: true, workshop: workshop.label },
                  isCorrect: true,
                });
              }
              return current.map((value, itemIndex) => itemIndex === index ? nextValue : value);
            })}>
              {checked[index] ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              {labels.validate}
            </button>
          </article>
        ))}
      </div>
      <article className="deliverable-card">
        <div className="deliverable-icon"><FileCheck2 size={24} /></div>
        <div><span>{labels.deliverable}</span><strong>{txt(session.deliverable, lang)}</strong></div>
        <div className="quality-stamp"><Check size={16} /> {labels.peerCheck}</div>
      </article>
    </div>
  );
}

function WorkshopView({
  session,
  lang,
  participantId,
  onRecordSubmission,
}: {
  session: CourseSession;
  lang: Lang;
  participantId: string;
  onRecordSubmission: (submission: SubmissionInput) => void;
}) {
  if (session.unit === 1) {
    return <Unit1Workshop session={session} lang={lang} participantId={participantId} onRecordSubmission={onRecordSubmission} />;
  }
  return <StandardWorkshopView session={session} lang={lang} onRecordSubmission={onRecordSubmission} />;
}

function TraceView({ session, lang }: { session: CourseSession; lang: Lang }) {
  const labels = ui[lang];
  const hasSections = Boolean(session.traceSections?.length);
  return (
    <div className="tab-content page-enter">
      <article className={`notebook ${hasSections ? "notebook-expanded" : ""}`}>
        <div className="notebook-margin" aria-hidden="true" />
        <div className="notebook-heading">
          <div><span>{labels.session} {padTime(session.id)}</span><h2>{labels.notebook}</h2></div>
          <BookOpen size={29} />
        </div>
        {hasSections ? (
          <div className="notebook-sections">
            {session.traceSections!.map((section) => (
              <section className="trace-section" key={section.title.fr}>
                <h3>{txt(section.title, lang)}</h3>
                <ul>
                  {section.items.map((item) => <li key={item.fr}>{txt(item, lang)}</li>)}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <div className="notebook-lines">
            {session.trace.map((line, index) => (
              <p key={line.fr}><strong>{index + 1}.</strong> {txt(line, lang)}</p>
            ))}
          </div>
        )}
        <div className="vocabulary-box">
          <span>{labels.vocabulary}</span>
          <div>
            {session.vocabulary.map((word) => (
              <div key={word.fr}><strong>{word.fr}</strong><small dir="rtl">{word.ar}</small></div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

function QuizView({
  session,
  lang,
  onRecordSubmission,
}: {
  session: CourseSession;
  lang: Lang;
  onRecordSubmission: (submission: SubmissionInput) => void;
}) {
  const labels = ui[lang];
  const isBilingual = session.unit === 1;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = session.quiz.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);

  function submitQuiz() {
    const detailedAnswers = session.quiz.map((question, questionIndex) => {
      const selectedIndex = answers[questionIndex];
      return {
        questionIndex,
        question: question.question,
        selectedIndex,
        selectedChoice: question.choices[selectedIndex],
        correct: selectedIndex === question.answer,
      };
    });
    onRecordSubmission({
      sessionId: session.id,
      activityType: "quiz",
      activityId: `session-${session.id}-quiz`,
      answer: { answers: detailedAnswers },
      isCorrect: score === session.quiz.length,
      score,
      maxScore: session.quiz.length,
    });
    setSubmitted(true);
  }

  return (
    <div className="tab-content page-enter">
      <div className="quiz-layout">
        <div className="quiz-intro">
          <span className="card-kicker"><FileCheck2 size={16} /> {labels.quiz}</span>
          <h2>{labels.quizTitle}</h2>
          <p>{labels.quizIntro}</p>
          <div className="quiz-gauge"><Gauge size={22} /><span>{session.quiz.length} {lang === "fr" ? "questions" : "أسئلة"}</span><strong>{session.quiz.length > 3 ? "10 min" : "5 min"}</strong></div>
        </div>
        <div className="quiz-questions">
          {session.quiz.map((question, questionIndex) => (
            <article className="quiz-question" key={question.question.fr}>
              <div className="question-title">
                <span>0{questionIndex + 1}</span>
                <h3>{isBilingual ? <BilingualText value={question.question} /> : txt(question.question, lang)}</h3>
              </div>
              <div className="choices">
                {question.choices.map((choice, choiceIndex) => {
                  const selected = answers[questionIndex] === choiceIndex;
                  const correct = submitted && choiceIndex === question.answer;
                  const wrong = submitted && selected && choiceIndex !== question.answer;
                  return (
                    <button
                      className={`${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                      key={choice.fr}
                      onClick={() => !submitted && setAnswers((current) => ({ ...current, [questionIndex]: choiceIndex }))}
                    >
                      <span className="choice-letter">{String.fromCharCode(65 + choiceIndex)}</span>
                      {isBilingual ? <BilingualText value={choice} /> : <span>{txt(choice, lang)}</span>}
                      {correct && <Check size={16} />}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className={`answer-note ${answers[questionIndex] === question.answer ? "correct" : "wrong"}`}>
                  {isBilingual
                    ? <BilingualText value={answers[questionIndex] === question.answer
                      ? { fr: "Réponse correcte", ar: "إجابة صحيحة" }
                      : { fr: "À revoir", ar: "تحتاج إلى مراجعة" }} />
                    : (answers[questionIndex] === question.answer ? labels.correct : labels.wrong)}
                </div>
              )}
            </article>
          ))}
          {!submitted ? (
            <button className="primary-button quiz-submit" disabled={Object.keys(answers).length < session.quiz.length} onClick={submitQuiz}>{labels.check}<CheckCircle2 size={18} /></button>
          ) : (
            <div className="quiz-result">
              <div><span>{labels.score}</span><strong>{score}/{session.quiz.length}</strong></div>
              <p>{score === session.quiz.length ? (lang === "fr" ? "Excellent, la notion est maîtrisée." : "ممتاز، تم التحكم في التعلم.") : (lang === "fr" ? "Relisez la trace écrite puis réessayez." : "راجع الخلاصة ثم أعد المحاولة.")}</p>
              <button onClick={() => { setAnswers({}); setSubmitted(false); }}><TimerReset size={17} />{labels.retry}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionPage({
  session,
  lang,
  activeTab,
  completed,
  participantId,
  onTab,
  onToggleCompleted,
  onBack,
  onNavigate,
  onRecordSubmission,
}: {
  session: CourseSession;
  lang: Lang;
  activeTab: ViewTab;
  completed: boolean;
  participantId: string;
  onTab: (tab: ViewTab) => void;
  onToggleCompleted: () => void;
  onBack: () => void;
  onNavigate: (id: number) => void;
  onRecordSubmission: (submission: SubmissionInput) => void;
}) {
  const labels = ui[lang];
  const unit = getUnit(session.unit);
  return (
    <div className={`session-page page-enter unit-${session.unit}`}>
      <button className="back-link" onClick={onBack}><ArrowLeft size={17} />{labels.back}</button>
      <section className={`session-hero unit-${session.unit}`}>
        <div className="session-hero-number"><span>{labels.session}</span><strong>{padTime(session.id)}</strong></div>
        <div className="session-hero-copy">
          <div className="session-meta">
            <UnitMark unit={session.unit} />
            <span>{txt(unit.title, lang)}</span>
            <span className="meta-dot" />
            <Clock3 size={15} />
            <strong>
              2H · {session.unit === 1
                ? `${unit1Labs[session.id as 1 | 2 | 3].exercises.length} ${lang === "fr" ? "EXERCICES" : "تمرينًا"}`
                : "85 MIN PRATIQUE"}
            </strong>
          </div>
          <h1>{txt(session.title, lang)}</h1>
          <p>{txt(session.subtitle, lang)}</p>
        </div>
        <button className={`complete-button ${completed ? "done" : ""}`} onClick={onToggleCompleted}>
          {completed ? <CheckCircle2 size={19} /> : <Circle size={19} />}
          {completed ? labels.completed : labels.complete}
        </button>
        <div className="session-hero-pattern" aria-hidden="true"><span /><span /><span /><span /></div>
      </section>

      <nav className="tab-nav" aria-label="Contenu de la séance">
        {tabItems.map(({ id, icon: Icon }) => (
          <button className={activeTab === id ? "active" : ""} onClick={() => onTab(id)} key={id}>
            <Icon size={17} />
            <span>{labels[id]}</span>
          </button>
        ))}
      </nav>

      {activeTab === "mission" && <MissionView session={session} lang={lang} onStartPractice={() => onTab("workshop")} />}
      {activeTab === "plan" && <PlanView lang={lang} />}
      {activeTab === "workshop" && (
        <WorkshopView
          key={`${participantId}-${session.id}`}
          session={session}
          lang={lang}
          participantId={participantId}
          onRecordSubmission={onRecordSubmission}
        />
      )}
      {activeTab === "trace" && <TraceView session={session} lang={lang} />}
      {activeTab === "quiz" && <QuizView key={`${participantId}-${session.id}`} session={session} lang={lang} onRecordSubmission={onRecordSubmission} />}

      <footer className="session-navigation">
        <button disabled={session.id === 1} onClick={() => onNavigate(session.id - 1)}><ArrowLeft size={17} /><span><small>{labels.previous}</small>{session.id > 1 && txt(sessions[session.id - 2].title, lang)}</span></button>
        <span>{padTime(session.id)} / 15</span>
        <button disabled={session.id === 15} onClick={() => onNavigate(session.id + 1)}><span><small>{labels.next}</small>{session.id < 15 && txt(sessions[session.id].title, lang)}</span><ArrowRight size={17} /></button>
      </footer>
    </div>
  );
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("fr");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>("mission");
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(7200);
  const [timerRunning, setTimerRunning] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [identityLoaded, setIdentityLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const mainRef = useRef<HTMLElement>(null);
  const submissionFlushRef = useRef(false);
  const saveStatusTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const hydration = window.setTimeout(() => {
      const storedLang = window.localStorage.getItem("lab2ac-lang");
      if (storedLang === "ar") setLang("ar");
      const storedParticipant = window.sessionStorage.getItem(activeParticipantKey);
      if (storedParticipant) {
        try {
          const parsed = JSON.parse(storedParticipant) as unknown;
          if (isStudentProfile(parsed)) setStudentProfile(parsed);
        } catch { /* Ignore malformed local data. */ }
      }
      const match = window.location.hash.match(/^#seance-(\d+)$/);
      if (match) {
        const id = Number(match[1]);
        if (id >= 1 && id <= 15) setSelectedId(id);
      }
      setIdentityLoaded(true);
    }, 0);
    return () => window.clearTimeout(hydration);
  }, []);

  useEffect(() => {
    if (!studentProfile) {
      setCompleted(new Set());
      return;
    }
    const stored = window.localStorage.getItem(`lab2ac-progress-${studentProfile.id}`);
    if (!stored) {
      setCompleted(new Set());
      return;
    }
    try { setCompleted(new Set(JSON.parse(stored) as number[])); } catch { setCompleted(new Set()); }
  }, [studentProfile]);

  useEffect(() => () => {
    if (saveStatusTimerRef.current !== null) window.clearTimeout(saveStatusTimerRef.current);
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    const timer = window.setInterval(() => {
      setTimerSeconds((value) => {
        if (value <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  const selected = useMemo(() => sessions.find((session) => session.id === selectedId) ?? null, [selectedId]);

  async function flushPendingSubmissions() {
    if (submissionFlushRef.current) return;
    let queue = readSubmissionQueue();
    if (queue.length === 0) {
      setSaveStatus("idle");
      return;
    }

    submissionFlushRef.current = true;
    setSaveStatus("saving");
    try {
      while (queue.length > 0) {
        const submissionId = queue[0].id;
        await submitCourseAttempt(queue[0] as unknown as Record<string, unknown>);
        queue = readSubmissionQueue().filter((item) => item.id !== submissionId);
        writeSubmissionQueue(queue);
      }
      setSaveStatus("saved");
      if (saveStatusTimerRef.current !== null) window.clearTimeout(saveStatusTimerRef.current);
      saveStatusTimerRef.current = window.setTimeout(() => setSaveStatus("idle"), 2400);
    } catch {
      setSaveStatus("error");
    } finally {
      submissionFlushRef.current = false;
    }
  }

  useEffect(() => {
    if (studentProfile) void flushPendingSubmissions();
  }, [studentProfile]);

  function recordSubmission(submission: SubmissionInput) {
    if (!studentProfile) return;
    const queued: QueuedSubmission = {
      ...submission,
      id: createClientSubmissionId(),
      participantId: studentProfile.id,
    };
    writeSubmissionQueue([...readSubmissionQueue(), queued]);
    void flushPendingSubmissions();
  }

  function handleIdentityReady(profile: StudentProfile) {
    setStudentProfile(profile);
  }

  function changeStudent() {
    window.sessionStorage.removeItem(activeParticipantKey);
    setStudentProfile(null);
    setSelectedId(null);
    setActiveTab("mission");
    setCompleted(new Set());
    setSidebarOpen(false);
    setTimerRunning(false);
    setTimerSeconds(7200);
    setSaveStatus("idle");
    window.history.replaceState(null, "", window.location.pathname);
  }

  function openSession(id: number) {
    setSelectedId(id);
    setActiveTab("mission");
    setTimerSeconds(7200);
    setTimerRunning(false);
    if (window.matchMedia("(max-width: 860px)").matches) setSidebarOpen(false);
    window.history.replaceState(null, "", `#seance-${id}`);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goHome() {
    setSelectedId(null);
    if (window.matchMedia("(max-width: 860px)").matches) setSidebarOpen(false);
    setTimerRunning(false);
    window.history.replaceState(null, "", window.location.pathname);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleComplete() {
    if (!selected || !studentProfile) return;
    const willComplete = !completed.has(selected.id);
    setCompleted((current) => {
      const next = new Set(current);
      if (willComplete) next.add(selected.id);
      else next.delete(selected.id);
      window.localStorage.setItem(`lab2ac-progress-${studentProfile.id}`, JSON.stringify([...next]));
      return next;
    });
    recordSubmission({
      sessionId: selected.id,
      activityType: "session_completion",
      activityId: `session-${selected.id}-completion`,
      answer: { completed: willComplete },
      isCorrect: willComplete,
    });
  }

  function toggleLang() {
    setLang((current) => {
      const next = current === "fr" ? "ar" : "fr";
      window.localStorage.setItem("lab2ac-lang", next);
      return next;
    });
  }

  if (!identityLoaded) {
    return <div className="identity-loading"><LoaderCircle className="spin" size={26} /><span>LAB·2AC</span></div>;
  }

  if (!studentProfile) {
    return <StudentIdentityGate onReady={handleIdentityReady} />;
  }

  return (
    <div className="app-shell" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Sidebar
        lang={lang}
        selectedId={selectedId}
        completed={completed}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((value) => !value)}
        onHome={goHome}
        onOpenSession={openSession}
      />
      <div className="app-main">
        <Topbar
          lang={lang}
          selected={selected}
          timerSeconds={timerSeconds}
          timerRunning={timerRunning}
          student={studentProfile}
          saveStatus={saveStatus}
          onToggleLang={toggleLang}
          onToggleTimer={() => setTimerRunning((value) => !value)}
          onResetTimer={() => { setTimerSeconds(7200); setTimerRunning(false); }}
          onMenu={() => setSidebarOpen(true)}
          onChangeStudent={changeStudent}
          onRetrySave={() => void flushPendingSubmissions()}
        />
        <main className="main-scroll" ref={mainRef}>
          {selected ? (
            <SessionPage
              session={selected}
              lang={lang}
              activeTab={activeTab}
              completed={completed.has(selected.id)}
              participantId={studentProfile.id}
              onTab={setActiveTab}
              onToggleCompleted={toggleComplete}
              onBack={goHome}
              onNavigate={openSession}
              onRecordSubmission={recordSubmission}
            />
          ) : (
            <Dashboard lang={lang} completed={completed} onOpenSession={openSession} />
          )}
          <div className="site-credit">
            <span>LAB·2AC</span>
            <p>Prof. Abdellah TAHTOH · Collège Othmane Ibn Affane</p>
          </div>
        </main>
      </div>
    </div>
  );
}
