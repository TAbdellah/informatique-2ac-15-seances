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
  Home,
  ImageIcon,
  Languages,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
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
  UserRoundPen,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getUnit,
  sessions,
  units,
  type CourseSession,
  type Lang,
  type LocalizedText,
  type QuizQuestion,
} from "./course-data";
import { photoChallenges } from "./practice-data";
import {
  unit1Labs,
  type Unit1Exercise,
} from "./unit1-labs";
import {
  getSessionAccess,
  registerParticipant,
  submitCourseAttempt,
  type SessionAccess,
  type StudentProfile,
} from "@/lib/supabase-api";

type ViewTab = "mission" | "workshop" | "trace" | "quiz";

type SubmissionInput = {
  sessionId: number;
  activityType: "unit1_exercise" | "quiz" | "practical_evaluation" | "photo_challenge" | "workshop" | "session_completion";
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

type ExerciseDraft = {
  choice: number | null;
  multi: number[];
  matches: Record<number, number>;
  sequence: number[];
  textValue: string;
  conversionValues: Record<number, string>;
  diagnosticComponent: number | null;
  diagnosticRepair: number | null;
  gestureProgress: number;
  result: boolean | null;
};

const activeParticipantKey = "lab2ac-active-participant";
const submissionQueueKey = "lab2ac-submission-queue";
const evaluationPreviewKey = "lab2ac-session2-evaluation-preview-attempts";

function session2PreviewTab(): ViewTab | null {
  const previewEnabled = process.env.NODE_ENV === "development"
    || process.env.NEXT_PUBLIC_SESSION2_EVALUATION_PREVIEW === "true";
  if (!previewEnabled || typeof window === "undefined") return null;
  const preview = new URLSearchParams(window.location.search).get("preview");
  if (preview === "session2-workshop") return "workshop";
  if (preview === "session2-trace") return "trace";
  if (preview === "session2-evaluation") return "quiz";
  return null;
}

function isSession2EvaluationPreview() {
  return session2PreviewTab() === "quiz";
}

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

function quizHasJustification(question: QuizQuestion): question is QuizQuestion & {
  justifications: LocalizedText[];
  justificationAnswer: number;
} {
  return Boolean(
    question.justifications?.length &&
    Number.isInteger(question.justificationAnswer),
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
  unlockedSessions,
  isOpen,
  onClose,
  onToggle,
  onHome,
  onOpenSession,
}: {
  lang: Lang;
  selectedId: number | null;
  completed: Set<number>;
  unlockedSessions: Set<number>;
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
                      className={`sidebar-session ${selectedId === session.id ? "active" : ""} ${unlockedSessions.has(session.id) ? "" : "locked"}`}
                      onClick={() => onOpenSession(session.id)}
                      disabled={!unlockedSessions.has(session.id)}
                    >
                      <span className="sidebar-session-number">{padTime(session.id)}</span>
                      <span className="sidebar-session-name">{txt(session.title, lang)}</span>
                      {!unlockedSessions.has(session.id) ? (
                        <LockKeyhole className="session-lock" size={14} />
                      ) : completed.has(session.id) ? (
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

function StudentIdentityBadge({
  lang,
  student,
  onChangeStudent,
}: {
  lang: Lang;
  student: StudentProfile;
  onChangeStudent: () => void;
}) {
  const studentLabel = student.isPair && student.studentTwo
    ? `${student.studentOne} + ${student.studentTwo}`
    : student.studentOne;
  const organizationLabel = student.isPair
    ? (lang === "fr" ? "Binôme" : "ثنائي")
    : (lang === "fr" ? "Individuel" : "فردي");

  return (
    <button
      className={`student-chip ${student.isPair ? "pair" : "solo"}`}
      onClick={onChangeStudent}
      title={`${organizationLabel} · ${studentLabel}`}
      aria-label={`${organizationLabel} : ${studentLabel}. ${lang === "fr" ? "Changer d’élève" : "تغيير التلميذ"}`}
      type="button"
    >
      <span className="student-chip-icon" aria-hidden="true">
        {student.isPair ? <Users size={16} /> : <UserRoundPen size={16} />}
      </span>
      <span className="student-chip-content">
        <span className="student-chip-name-row">
          <small className="student-mode-badge">{organizationLabel}</small>
          <strong>{studentLabel}</strong>
        </span>
        <small className="student-chip-meta">{student.className} · G{student.groupName}</small>
      </span>
    </button>
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
        <StudentIdentityBadge lang={lang} student={student} onChangeStudent={onChangeStudent} />
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
  unlockedSessions,
  onOpenSession,
}: {
  lang: Lang;
  completed: Set<number>;
  unlockedSessions: Set<number>;
  onOpenSession: (id: number) => void;
}) {
  const labels = ui[lang];
  const [filter, setFilter] = useState<number | "all">("all");
  const visibleSessions = filter === "all" ? sessions : sessions.filter((session) => session.unit === filter);
  const nextSession = sessions.find((session) => unlockedSessions.has(session.id) && !completed.has(session.id))
    ?? sessions.find((session) => unlockedSessions.has(session.id))
    ?? null;

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
          {nextSession ? (
            <button className="primary-button" onClick={() => onOpenSession(nextSession.id)}>
              {lang === "fr" ? `Entrer dans la séance ${nextSession.id}` : `الدخول إلى الحصة ${nextSession.id}`}
              {lang === "fr" ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            </button>
          ) : (
            <div className="no-open-session"><LockKeyhole size={18} />{lang === "fr" ? "Aucune séance ouverte par le professeur." : "لا توجد حصة مفتوحة من طرف الأستاذ."}</div>
          )}
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
              <button
                className={`session-card unit-${session.unit} ${done ? "done" : ""} ${unlockedSessions.has(session.id) ? "" : "locked"}`}
                key={session.id}
                onClick={() => onOpenSession(session.id)}
                disabled={!unlockedSessions.has(session.id)}
              >
                <div className="session-card-top">
                  <span className="session-index">{padTime(session.id)}</span>
                  <span className="session-duration"><Clock3 size={13} /> 2H</span>
                </div>
                <div className="session-card-unit">U{session.unit} · {txt(unit.title, lang)}</div>
                <h3>{txt(session.title, lang)}</h3>
                <p>{txt(session.subtitle, lang)}</p>
                <div className="session-card-foot">
                  <span>
                    {!unlockedSessions.has(session.id)
                      ? (lang === "fr" ? "Verrouillée par le professeur" : "مقفلة من طرف الأستاذ")
                      : `${labels.open} · ${session.unit === 1
                      ? `${unit1Labs[session.id as 1 | 2 | 3].exercises.length} ${lang === "fr" ? "exercices" : "تمرينًا"}`
                      : `85 min ${lang === "fr" ? "pratique" : "تطبيق"}`}`}
                  </span>
                  {!unlockedSessions.has(session.id) ? <LockKeyhole size={18} /> : done ? <CheckCircle2 size={19} /> : <ArrowRight size={19} />}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function MissionView({ session, lang, completed, onToggleCompleted, onBack, onStartPractice }: {
  session: CourseSession;
  lang: Lang;
  completed: boolean;
  onToggleCompleted: () => void;
  onBack: () => void;
  onStartPractice: () => void;
}) {
  const labels = ui[lang];
  const unit = getUnit(session.unit);
  const situationParts = lang === "fr"
    ? [
        { label: "Contexte", value: session.situation.fr },
        { label: "Fonction", value: session.mission.fr },
        { label: "Consigne", value: `Avec ton binôme, réalise les activités proposées et prépare : ${session.deliverable.fr}` },
        { label: "Tâches / activités", value: session.workshops.map((workshop) => `Atelier ${workshop.label} : ${workshop.text.fr}`).join(" · ") },
      ]
    : [
        { label: "السياق", value: session.situation.ar },
        { label: "الوظيفة", value: session.mission.ar },
        { label: "التعليمة", value: `أنجز الأنشطة مع زميلك ثم حضّر: ${session.deliverable.ar}` },
        { label: "المهام / الأنشطة", value: session.workshops.map((workshop) => `الورشة ${workshop.label}: ${workshop.text.ar}`).join(" · ") },
      ];
  return (
    <div className="tab-content simple-mission page-enter">
      <section className={`session-hero unit-${session.unit}`}>
        <div className="session-hero-number"><span>{labels.session}</span><strong>{padTime(session.id)}</strong></div>
        <div className="session-hero-copy">
          <div className="session-meta">
            <UnitMark unit={session.unit} />
            <span>{txt(unit.title, lang)}</span>
            <span className="meta-dot" />
            <Clock3 size={15} />
            <strong>2H · {session.unit === 1
              ? `${unit1Labs[session.id as 1 | 2 | 3].exercises.length} ${lang === "fr" ? "EXERCICES" : "تمرينًا"}`
              : "85 MIN PRATIQUE"}</strong>
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
      <article className="content-card situation-card simple-situation">
        <span className="card-kicker"><FolderKanban size={16} /> {labels.situation}</span>
        <div className="situation-parts">
          {situationParts.map((part, index) => (
            <section key={part.label} className={index === 2 ? "instruction" : ""}>
              <span>{index + 1}</span>
              <div><strong>{part.label}</strong><p>{part.value}</p></div>
            </section>
          ))}
        </div>
      </article>
      {session.id === 2 && (
        <section className="mission-visual-library" aria-labelledby="mission-visual-title">
          <div className="mission-visual-heading">
            <span className="card-kicker"><ImageIcon size={16} />{lang === "fr" ? "J’observe avant de pratiquer" : "ألاحظ قبل التطبيق"}</span>
            <h2 id="mission-visual-title">{lang === "fr" ? "Trois repères pour comprendre le matériel" : "ثلاث دعامات لفهم معدات الحاسوب"}</h2>
            <p>{lang === "fr" ? "Observe les images avec ton binôme. Ne cherche pas à tout mémoriser : repère le sens de circulation de l’information et le rôle de chaque matériel." : "لاحظ الصور مع زميلك. لا تحاول حفظ كل شيء، بل ابحث عن اتجاه انتقال المعلومة ووظيفة كل جهاز."}</p>
          </div>
          <div className="mission-visual-grid">
            {[
              { src: "session2/mission-categories.png", fr: "1 · Comment circule l’information ?", ar: "1 · كيف تنتقل المعلومة؟" },
              { src: "session2/mission-fonctions.png", fr: "2 · À quoi sert chaque périphérique ?", ar: "2 · ما وظيفة كل ملحق؟" },
              { src: "session2/mission-composants.png", fr: "3 · Que trouve-t-on dans l’unité centrale ?", ar: "3 · ماذا نجد داخل الوحدة المركزية؟" },
            ].map((visual) => (
          <figure key={visual.src}>
            <img src={visual.src} alt={lang === "fr" ? visual.fr : visual.ar} loading="lazy" />
            <figcaption>
              <span>{lang === "fr" ? visual.fr : visual.ar}</span>
              <a href={visual.src} target="_blank" rel="noreferrer">
                <ImageIcon size={15} />
                {lang === "fr" ? "Agrandir l’image" : "تكبير الصورة"}
              </a>
            </figcaption>
          </figure>
            ))}
          </div>
        </section>
      )}
      <div className="mission-support-grid">
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
      </div>
      <button className="practice-button mission-start-button" onClick={onStartPractice}>
        <MousePointer2 size={18} />
        {labels.startPractice}
      </button>
      <button className="back-link mission-back-link" onClick={onBack}><ArrowLeft size={17} />{labels.back}</button>
    </div>
  );
}

function ExerciseNavigation({ index, total, done, lang, onPrevious, onNext, nextLabel, nextDisabled = false, progressLabel, resultStatus }: {
  index: number;
  total: number;
  done: number;
  lang: Lang;
  onPrevious: () => void;
  onNext: () => void;
  nextLabel?: LocalizedText;
  nextDisabled?: boolean;
  progressLabel?: LocalizedText;
  resultStatus?: boolean | null;
}) {
  const percent = total ? Math.round(done / total * 100) : 0;
  return (
    <nav className="exercise-navigation simple-exercise-navigation" aria-label="Navigation des exercices / التنقل بين التمارين">
      <button type="button" disabled={index === 0} onClick={onPrevious}>
        <ArrowLeft size={18} />
        <BilingualText value={{ fr: "Exercice précédent", ar: "التمرين السابق" }} />
      </button>
      <div className="exercise-progress-summary" aria-live="polite">
        <strong>{lang === "fr" ? "Exercice" : "التمرين"} {index + 1} / {total}</strong>
        <div className="exercise-progress-track" role="progressbar" aria-label="Progression / التقدم" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <small>{done}/{total} {txt(progressLabel ?? { fr: "réussis", ar: "ناجحة" }, lang)} · {percent}%</small>
        {resultStatus !== undefined && resultStatus !== null && (
          <div className={`exercise-current-status ${resultStatus === true ? "success" : resultStatus === false ? "retry" : "waiting"}`} role="status" aria-live="polite">
            {resultStatus === true ? <CheckCircle2 size={16} /> : resultStatus === false ? <AlertTriangle size={16} /> : <LockKeyhole size={16} />}
            <BilingualText value={resultStatus === true
              ? { fr: "Exercice réussi · la suite est débloquée", ar: "تم التمرين بنجاح · تم فتح التالي" }
              : { fr: "Pas encore réussi · corrige puis réessaie", ar: "لم ينجح بعد · صحح ثم أعد المحاولة" }} />
          </div>
        )}
      </div>
      <button type="button" className="exercise-next-button" disabled={nextDisabled} onClick={onNext}>
        <BilingualText value={nextLabel ?? { fr: "Exercice suivant", ar: "التمرين التالي" }} />
        <ArrowRight size={18} />
      </button>
    </nav>
  );
}

function sameNumbers(left: number[], right: number[]) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function shuffledIndices(length: number, seed: string) {
  const indices = Array.from({ length }, (_, index) => index);
  let state = Array.from(seed).reduce((value, character) => Math.imul(value ^ character.charCodeAt(0), 16777619), 2166136261) >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let index = indices.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [indices[index], indices[randomIndex]] = [indices[randomIndex], indices[index]];
  }
  return indices;
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
  draft,
  onDraftChange,
}: {
  exercise: Unit1Exercise;
  lang: Lang;
  alreadyCompleted: boolean;
  onComplete: () => void;
  onResult: (answer: unknown, correct: boolean) => void;
  draft?: ExerciseDraft;
  onDraftChange: (draft: ExerciseDraft) => void;
}) {
  const [choice, setChoice] = useState<number | null>(draft?.choice ?? null);
  const [multi, setMulti] = useState<Set<number>>(() => new Set(draft?.multi ?? []));
  const [matches, setMatches] = useState<Record<number, number>>(draft?.matches ?? {});
  const [dragSelection, setDragSelection] = useState<number | null>(null);
  const [sequence, setSequence] = useState<number[]>(draft?.sequence ?? []);
  const [textValue, setTextValue] = useState(draft?.textValue ?? "");
  const [conversionValues, setConversionValues] = useState<Record<number, string>>(draft?.conversionValues ?? {});
  const [diagnosticComponent, setDiagnosticComponent] = useState<number | null>(draft?.diagnosticComponent ?? null);
  const [diagnosticRepair, setDiagnosticRepair] = useState<number | null>(draft?.diagnosticRepair ?? null);
  const [gestureProgress, setGestureProgress] = useState(
    draft?.gestureProgress ?? (exercise.type === "gesture" && exercise.mode === "precision" && alreadyCompleted ? 5 : 0)
  );
  const [result, setResult] = useState<boolean | null>(draft ? draft.result : (alreadyCompleted ? true : null));
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onDraftChange({ choice, multi: [...multi], matches, sequence, textValue, conversionValues, diagnosticComponent, diagnosticRepair, gestureProgress, result });
  }, [choice, multi, matches, sequence, textValue, conversionValues, diagnosticComponent, diagnosticRepair, gestureProgress, result, onDraftChange]);
  const choiceOrder = useMemo(
    () => shuffledIndices(exercise.type === "choice" || exercise.type === "multi" ? exercise.choices.length : 0, `${exercise.id}-choices`),
    [exercise],
  );
  const categoryOrder = useMemo(
    () => shuffledIndices(exercise.type === "match" ? exercise.categories.length : 0, `${exercise.id}-categories`),
    [exercise],
  );
  const sequenceOrder = useMemo(
    () => shuffledIndices(exercise.type === "sequence" ? exercise.steps.length : 0, `${exercise.id}-sequence`),
    [exercise],
  );
  const diagnosticComponentOrder = useMemo(
    () => shuffledIndices(exercise.type === "diagnostic" ? exercise.components.length : 0, `${exercise.id}-components`),
    [exercise],
  );
  const diagnosticRepairOrder = useMemo(
    () => shuffledIndices(exercise.type === "diagnostic" ? exercise.repairs.length : 0, `${exercise.id}-repairs`),
    [exercise],
  );

  const typeLabel: Record<Unit1Exercise["type"], LocalizedText> = {
    choice: { fr: "Choix unique", ar: "اختيار واحد" },
    multi: { fr: "Choix multiple", ar: "اختيار متعدد" },
    match: { fr: "Classement", ar: "تصنيف" },
    sequence: { fr: "Mise en ordre", ar: "ترتيب" },
    text: { fr: "Réponse courte", ar: "جواب قصير" },
    conversions: { fr: "Conversions", ar: "تحويلات" },
    diagnostic: { fr: "Diagnostic en 2 étapes", ar: "تشخيص في مرحلتين" },
    gesture: { fr: "Manipulation", ar: "تطبيق عملي" },
  };
  const currentTypeLabel = exercise.type === "match" && exercise.interaction === "drag"
    ? { fr: "Glisser-déposer", ar: "سحب وإفلات" }
    : typeLabel[exercise.type];

  function recordResult(correct: boolean, answer: unknown) {
    setResult(correct);
    onResult(answer, correct);
    if (correct) onComplete();
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }));
  }

  function checkCurrent() {
    if (exercise.type === "choice") recordResult(choice === exercise.answer, {
      question: exercise.prompt,
      selectedIndex: choice,
      selectedChoice: choice === null ? null : exercise.choices[choice],
      correctIndex: exercise.answer,
      correctChoice: exercise.choices[exercise.answer],
    });
    if (exercise.type === "multi") {
      const selectedIndices = [...multi].sort((a, b) => a - b);
      recordResult(sameNumbers(selectedIndices, [...exercise.answers].sort((a, b) => a - b)), {
        question: exercise.prompt,
        selectedIndices,
        selectedChoices: selectedIndices.map((index) => exercise.choices[index]),
        correctIndices: exercise.answers,
        correctChoices: exercise.answers.map((index) => exercise.choices[index]),
      });
    }
    if (exercise.type === "match") {
      recordResult(
        exercise.rows.every((row, index) => matches[index] === row.answer),
        {
          question: exercise.prompt,
          matches: exercise.rows.map((row, index) => ({
            item: row.label,
            selected: matches[index] === undefined ? null : exercise.categories[matches[index]],
            expected: exercise.categories[row.answer],
            correct: matches[index] === row.answer,
          })),
        }
      );
    }
    if (exercise.type === "sequence") {
      recordResult(sameNumbers(sequence, exercise.steps.map((_, index) => index)), {
        question: exercise.prompt,
        sequence: sequence.map((index) => exercise.steps[index]),
        expectedSequence: exercise.steps,
      });
    }
    if (exercise.type === "text") {
      const proposed = normalizeAnswer(textValue);
      const acceptedAnswers = [...exercise.accepted.fr, ...exercise.accepted.ar];
      recordResult(acceptedAnswers.some((answer) => normalizeAnswer(answer) === proposed), {
        question: exercise.prompt,
        text: textValue.trim(),
        acceptedAnswers,
      });
    }
    if (exercise.type === "conversions") {
      const details = exercise.rows.map((row, index) => {
        const proposed = normalizeAnswer(conversionValues[index] ?? "").replace(/\s/g, "").replace(",", ".");
        const correct = row.accepted.some((answer) => normalizeAnswer(answer).replace(/\s/g, "").replace(",", ".") === proposed);
        return { conversion: `${row.before} … ${row.after}`, answer: conversionValues[index] ?? "", expected: row.accepted[0], correct };
      });
      recordResult(details.every((item) => item.correct), { question: exercise.prompt, conversions: details });
    }
    if (exercise.type === "diagnostic") {
      const componentCorrect = diagnosticComponent === exercise.componentAnswer;
      const repairCorrect = diagnosticRepair === exercise.repairAnswer;
      recordResult(componentCorrect && repairCorrect, {
        question: exercise.prompt,
        scenario: exercise.scenario,
        selectedComponent: diagnosticComponent === null ? null : exercise.components[diagnosticComponent].label,
        correctComponent: exercise.components[exercise.componentAnswer].label,
        selectedRepair: diagnosticRepair === null ? null : exercise.repairs[diagnosticRepair],
        correctRepair: exercise.repairs[exercise.repairAnswer],
        componentCorrect,
        repairCorrect,
      });
    }
  }

  const canCheck =
    (exercise.type === "choice" && choice !== null) ||
    (exercise.type === "multi" && multi.size > 0) ||
    (exercise.type === "match" && Object.keys(matches).length === exercise.rows.length) ||
    (exercise.type === "sequence" && sequence.length === exercise.steps.length) ||
    (exercise.type === "text" && textValue.trim().length > 0) ||
    (exercise.type === "conversions" && exercise.rows.every((_, index) => conversionValues[index]?.trim())) ||
    (exercise.type === "diagnostic" && diagnosticComponent !== null && diagnosticRepair !== null);

  return (
    <article className={`exercise-player level-${exercise.level}`}>
      <div className="exercise-copy">
        <div className="exercise-meta">
          <strong>{txt(currentTypeLabel, lang)}</strong>
          {exercise.minutes && <small className="exercise-time"><Clock3 size={14} />{exercise.minutes} min</small>}
          {alreadyCompleted && <small><CheckCircle2 size={14} />{lang === "fr" ? "Déjà réussi" : "تم بنجاح"}</small>}
        </div>
        <h3><BilingualText value={exercise.title} /></h3>
        <div className="exercise-prompt">
          <span className="instruction-label">Consigne / التعليمة</span>
          <BilingualText value={exercise.prompt} />
        </div>
      </div>

      {exercise.image && (
        <figure className="exercise-image">
          <img src={exercise.image.src} alt={bilingualAria(exercise.image.alt)} loading="lazy" referrerPolicy="no-referrer" />
          <figcaption><ImageIcon size={14} />{txt(exercise.image.caption, lang)}</figcaption>
        </figure>
      )}

      {exercise.type === "choice" && (
        <div className="exercise-options">
          {choiceOrder.map((originalIndex, displayIndex) => {
            const item = exercise.choices[originalIndex];
            return (
            <button
              className={choice === originalIndex ? "selected" : ""}
              key={item.fr}
              onClick={() => { setChoice(originalIndex); setResult(null); }}
            >
              <span className="option-marker">{String.fromCharCode(65 + displayIndex)}</span>
              <BilingualText value={item} />
            </button>
            );
          })}
        </div>
      )}

      {exercise.type === "multi" && (
        <div className="exercise-options multi-options">
          {choiceOrder.map((originalIndex) => {
            const item = exercise.choices[originalIndex];
            const selected = multi.has(originalIndex);
            return (
              <button
                className={`${selected ? "selected" : ""} ${exercise.choiceImages?.[originalIndex] ? "option-with-image" : ""}`}
                key={item.fr}
                onClick={() => {
                  setMulti((current) => {
                    const next = new Set(current);
                    if (next.has(originalIndex)) next.delete(originalIndex); else next.add(originalIndex);
                    return next;
                  });
                  setResult(null);
                }}
              >
                <span className="option-marker">{selected ? <Check size={14} /> : <Circle size={14} />}</span>
                {exercise.choiceImages?.[originalIndex] && <img className="option-image" src={exercise.choiceImages[originalIndex] ?? ""} alt="" loading="lazy" />}
                <BilingualText value={item} />
              </button>
            );
          })}
        </div>
      )}

      {exercise.type === "match" && exercise.interaction === "drag" && (
        <div className="drag-classification">
          <section className="drag-bank" aria-label={lang === "fr" ? "Éléments à classer" : "عناصر التصنيف"}>
            <header>
              <strong>{lang === "fr" ? "Cartes à classer" : "بطاقات للتصنيف"}</strong>
              <small>{lang === "fr" ? "Glisse ou touche une carte" : "اسحب أو المس بطاقة"}</small>
            </header>
            <div className="drag-card-list">
              {exercise.rows.map((row, rowIndex) => matches[rowIndex] === undefined ? (
                <button
                  type="button"
                  draggable
                  className={`drag-card ${dragSelection === rowIndex ? "selected" : ""}`}
                  key={row.label.fr}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", String(rowIndex));
                    event.dataTransfer.effectAllowed = "move";
                    setDragSelection(rowIndex);
                  }}
                  onClick={() => setDragSelection((current) => current === rowIndex ? null : rowIndex)}
                >
                  {row.image && <img src={row.image} alt="" loading="lazy" />}
                  <strong><BilingualText value={row.label} /></strong>
                </button>
              ) : null)}
              {Object.keys(matches).length === exercise.rows.length && (
                <p className="drag-bank-empty"><CheckCircle2 size={17} />{lang === "fr" ? "Toutes les cartes sont placées." : "تم وضع جميع البطاقات."}</p>
              )}
            </div>
          </section>
          <div className="drag-zones">
            {categoryOrder.map((categoryIndex) => {
              const category = exercise.categories[categoryIndex];
              const placedRows = exercise.rows
                .map((row, rowIndex) => ({ row, rowIndex }))
                .filter(({ rowIndex }) => matches[rowIndex] === categoryIndex);
              const placeRow = (rowIndex: number) => {
                if (!Number.isInteger(rowIndex) || !exercise.rows[rowIndex]) return;
                setMatches((current) => ({ ...current, [rowIndex]: categoryIndex }));
                setDragSelection(null);
                setResult(null);
              };
              return (
                <section
                  className={`drag-zone ${dragSelection !== null ? "ready" : ""}`}
                  key={category.fr}
                  onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}
                  onDrop={(event) => {
                    event.preventDefault();
                    placeRow(Number(event.dataTransfer.getData("text/plain")));
                  }}
                  onClick={() => { if (dragSelection !== null) placeRow(dragSelection); }}
                >
                  <header>
                    <strong><BilingualText value={category} /></strong>
                    <small>{placedRows.length}</small>
                  </header>
                  <div className="drag-zone-items">
                    {placedRows.map(({ row, rowIndex }) => (
                      <button
                        type="button"
                        draggable
                        className={`drag-card placed ${result === false ? (row.answer === categoryIndex ? "answer-correct" : "answer-wrong") : ""}`}
                        key={row.label.fr}
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", String(rowIndex));
                          event.dataTransfer.effectAllowed = "move";
                          setDragSelection(rowIndex);
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          setMatches((current) => {
                            const next = { ...current };
                            delete next[rowIndex];
                            return next;
                          });
                          setDragSelection(rowIndex);
                          setResult(null);
                        }}
                        title={lang === "fr" ? "Toucher pour déplacer" : "المس لنقل البطاقة"}
                      >
                        {row.image && <img src={row.image} alt="" loading="lazy" />}
                        <strong><BilingualText value={row.label} /></strong>
                      </button>
                    ))}
                    {placedRows.length === 0 && <p>{lang === "fr" ? "Dépose ici" : "ضع هنا"}</p>}
                  </div>
                </section>
              );
            })}
          </div>
          <button
            type="button"
            className="reset-drag"
            onClick={() => { setMatches({}); setDragSelection(null); setResult(null); }}
          >
            <RefreshCw size={15} />{lang === "fr" ? "Recommencer le classement" : "إعادة التصنيف"}
          </button>
        </div>
      )}

      {exercise.type === "match" && exercise.interaction !== "drag" && (
        <div className="match-board">
          {exercise.rows.map((row, rowIndex) => (
            <div
              className={`match-row ${result === false ? (matches[rowIndex] === row.answer ? "answer-correct" : "answer-wrong") : ""}`}
              key={row.label.fr}
            >
              <div className="match-item">
                {row.image && <img src={row.image} alt="" loading="lazy" />}
                <strong><BilingualText value={row.label} /></strong>
              </div>
              <div className="match-answers">
                {exercise.categories.length > 5 ? (
                  <select
                    value={matches[rowIndex] ?? ""}
                    onChange={(event) => {
                      setMatches((current) => ({ ...current, [rowIndex]: Number(event.target.value) }));
                      setResult(null);
                    }}
                    aria-label={`${row.label.fr} / ${row.label.ar}`}
                  >
                    <option value="" disabled>{lang === "fr" ? "Choisir la réponse…" : "اختر الجواب…"}</option>
                    {categoryOrder.map((categoryIndex) => (
                      <option key={categoryIndex} value={categoryIndex}>
                        {exercise.categories[categoryIndex].fr} — {exercise.categories[categoryIndex].ar}
                      </option>
                    ))}
                  </select>
                ) : categoryOrder.map((categoryIndex) => {
                  const category = exercise.categories[categoryIndex];
                  return (
                  <button
                    key={category.fr}
                    className={`${matches[rowIndex] === categoryIndex ? "selected" : ""} ${exercise.categoryImages?.[categoryIndex] ? "visual-answer" : ""}`}
                    onClick={() => { setMatches((current) => ({ ...current, [rowIndex]: categoryIndex })); setResult(null); }}
                  >
                    {exercise.categoryImages?.[categoryIndex] && <img src={exercise.categoryImages[categoryIndex] ?? ""} alt="" loading="lazy" />}
                    <BilingualText value={category} />
                  </button>
                  );
                })}
              </div>
              {result === false && matches[rowIndex] !== row.answer && (
                <small className="match-correction">
                  {lang === "fr" ? "Réponse attendue : " : "الجواب الصحيح: "}
                  <b>{txt(exercise.categories[row.answer], lang)}</b>
                </small>
              )}
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
            {sequenceOrder.map((stepIndex) => (
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

      {exercise.type === "conversions" && (
        <div className="conversion-board">
          {exercise.rows.map((row, index) => (
            <label className={result === false ? "conversion-review" : ""} key={`${row.before}-${row.after}`}>
              <strong>{row.before}</strong>
              <input
                inputMode="decimal"
                value={conversionValues[index] ?? ""}
                onChange={(event) => {
                  setConversionValues((current) => ({ ...current, [index]: event.target.value }));
                  setResult(null);
                }}
                aria-label={`${row.before} ${row.after}`}
              />
              <strong>{row.after}</strong>
              {result === false && <small>{lang === "fr" ? "Réponse :" : "الجواب:"} {row.accepted[0]}</small>}
            </label>
          ))}
        </div>
      )}

      {exercise.type === "diagnostic" && (
        <div className="diagnostic-board">
          <div className="diagnostic-scenario">
            <AlertTriangle size={24} />
            <div>
              <strong>{lang === "fr" ? "Panne observée" : "العطل الملاحظ"}</strong>
              <BilingualText value={exercise.scenario} />
            </div>
          </div>
          <section className="diagnostic-step">
            <header><span>1</span><strong>{lang === "fr" ? "Quel composant est en cause ?" : "ما المكوّن المسؤول؟"}</strong></header>
            <div className="diagnostic-options component-options">
              {diagnosticComponentOrder.map((originalIndex) => {
                const component = exercise.components[originalIndex];
                return (
                  <button
                    type="button"
                    className={diagnosticComponent === originalIndex ? "selected" : ""}
                    key={component.label.fr}
                    onClick={() => { setDiagnosticComponent(originalIndex); setResult(null); }}
                  >
                    {component.image && <img src={component.image} alt="" loading="lazy" />}
                    <BilingualText value={component.label} />
                  </button>
                );
              })}
            </div>
          </section>
          <section className="diagnostic-step">
            <header><span>2</span><strong>{lang === "fr" ? "Quelle réparation choisis-tu ?" : "ما الإصلاح الذي تختاره؟"}</strong></header>
            <div className="diagnostic-options repair-options">
              {diagnosticRepairOrder.map((originalIndex) => (
                <button
                  type="button"
                  className={diagnosticRepair === originalIndex ? "selected" : ""}
                  key={exercise.repairs[originalIndex].fr}
                  onClick={() => { setDiagnosticRepair(originalIndex); setResult(null); }}
                >
                  <BilingualText value={exercise.repairs[originalIndex]} />
                </button>
              ))}
            </div>
          </section>
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
        </div>
      )}

      {exercise.hint && result === false && (
        <div className="exercise-hint">
          <Lightbulb size={16} />
          <span>
            <strong>{lang === "fr" ? "Indice" : "مساعدة"}</strong>
            <BilingualText value={exercise.hint} />
          </span>
        </div>
      )}

      {result !== null && (
        <div ref={resultRef} className={`exercise-result ${result ? "correct" : "wrong"}`} role="status" aria-live="assertive">
          {result ? <CheckCircle2 size={20} /> : <Lightbulb size={20} />}
          <div>
            <strong>{result ? (lang === "fr" ? "Exercice réussi" : "تمرين ناجح") : (lang === "fr" ? "Pas encore" : "ليس بعد")}</strong>
            <p>
              <BilingualText
                value={result ? exercise.feedback : {
                  fr: `Observe la correction, comprends ton erreur puis essaie de nouveau. ${exercise.feedback.fr}`,
                  ar: `لاحظ التصحيح وافهم خطأك ثم حاول من جديد. ${exercise.feedback.ar}`,
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
  onGoToTrace,
}: {
  session: CourseSession;
  lang: Lang;
  participantId: string;
  onRecordSubmission: (submission: SubmissionInput) => void;
  onGoToTrace: () => void;
}) {
  const lab = unit1Labs[session.id as 1 | 2 | 3];
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, ExerciseDraft>>({});
  const exerciseAnchorRef = useRef<HTMLDivElement>(null);
  const exercise = lab.exercises[exerciseIndex];
  const currentResult = completedExercises.has(exercise.id) ? true : (drafts[exercise.id]?.result ?? null);
  const keepDraft = useCallback((draft: ExerciseDraft) => {
    setDrafts((current) => ({ ...current, [exercise.id]: draft }));
  }, [exercise.id]);

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
      <div className="exercise-counter" ref={exerciseAnchorRef}>
        <span>{lang === "fr" ? "EXERCICE" : "تمرين"} {padTime(exerciseIndex + 1)}</span>
      </div>

      <ExercisePlayer
        key={exercise.id}
        exercise={exercise}
        lang={lang}
        draft={drafts[exercise.id]}
        onDraftChange={keepDraft}
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

      <ExerciseNavigation
        index={exerciseIndex}
        total={lab.exercises.length}
        done={completedExercises.size}
        lang={lang}
        onPrevious={() => setExerciseIndex((current) => Math.max(0, current - 1))}
        onNext={() => exerciseIndex === lab.exercises.length - 1 ? onGoToTrace() : setExerciseIndex((current) => current + 1)}
        nextLabel={exerciseIndex === lab.exercises.length - 1 ? { fr: "Trace écrite", ar: "خلاصة الدرس" } : undefined}
        nextDisabled={currentResult !== true}
        resultStatus={currentResult}
      />
    </div>
  );
}

function StandardWorkshopView({
  session,
  lang,
  onRecordSubmission,
  onGoToTrace,
}: {
  session: CourseSession;
  lang: Lang;
  onRecordSubmission: (submission: SubmissionInput) => void;
  onGoToTrace: () => void;
}) {
  const labels = ui[lang];
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [checked, setChecked] = useState<boolean[]>(() => session.workshops.map(() => false));
  const [photoAnswer, setPhotoAnswer] = useState<number | null>(null);
  const challenge = photoChallenges[session.id];
  const photoChoiceOrder = useMemo(
    () => shuffledIndices(challenge.choices.length, `session-${session.id}-photo`),
    [challenge, session.id],
  );
  const photoCorrect = photoAnswer === challenge.answer;
  const total = session.workshops.length + 1;
  const currentResult = exerciseIndex === 0
    ? photoAnswer === null ? null : photoCorrect
    : checked[exerciseIndex - 1] ? true : null;
  const exerciseAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    exerciseAnchorRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
  }, [exerciseIndex]);

  return (
    <div className="tab-content standard-workshop simple-workshop page-enter">
      <div className="exercise-counter" ref={exerciseAnchorRef}>
        <span>{lang === "fr" ? "EXERCICE" : "تمرين"} {padTime(exerciseIndex + 1)}</span>
      </div>
      {exerciseIndex === 0 && (
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
          <div className="photo-question">
            <span className="instruction-label">Question / السؤال</span>
            <h3><BilingualText value={challenge.prompt} /></h3>
          </div>
          <p className="choose-label">{labels.choose}</p>
          <div className="photo-choices">
            {photoChoiceOrder.map((originalIndex, displayIndex) => {
              const choice = challenge.choices[originalIndex];
              const selected = photoAnswer === originalIndex;
              const correct = photoAnswer !== null && originalIndex === challenge.answer;
              const wrong = selected && photoAnswer !== challenge.answer;
              return (
                <button
                  key={choice.fr}
                  className={`${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                  onClick={() => {
                    setPhotoAnswer(originalIndex);
                    onRecordSubmission({
                      sessionId: session.id,
                      activityType: "photo_challenge",
                      activityId: `session-${session.id}-photo`,
                      answer: {
                        question: challenge.prompt,
                        selectedIndex: originalIndex,
                        displayedChoice: String.fromCharCode(65 + displayIndex),
                        selectedChoice: choice,
                        correctIndex: challenge.answer,
                        correctChoice: challenge.choices[challenge.answer],
                      },
                      isCorrect: originalIndex === challenge.answer,
                    });
                  }}
                >
                  <span>{String.fromCharCode(65 + displayIndex)}</span>
                  <BilingualText value={choice} />
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
      )}
      {exerciseIndex > 0 && (
      <div className="workshop-grid single-workshop-grid">
        {session.workshops.map((workshop, index) => exerciseIndex !== index + 1 ? null : (
          <article className={`workshop-card ${checked[index] ? "checked" : ""}`} key={workshop.label}>
            <div className="workshop-card-top">
              <span className="workshop-letter">{workshop.label}</span>
              <span><Clock3 size={14} /> {workshop.duration} {labels.minutes}</span>
            </div>
            <h3>{lang === "fr" ? `Atelier ${workshop.label}` : `الورشة ${workshop.label}`}</h3>
            <div className="exercise-prompt">
              <span className="instruction-label">Consigne / التعليمة</span>
              <BilingualText value={workshop.text} />
            </div>
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
      )}
      <ExerciseNavigation
        index={exerciseIndex}
        total={total}
        done={checked.filter(Boolean).length + (photoCorrect ? 1 : 0)}
        lang={lang}
        onPrevious={() => setExerciseIndex((current) => Math.max(0, current - 1))}
        onNext={() => exerciseIndex === total - 1 ? onGoToTrace() : setExerciseIndex((current) => current + 1)}
        nextLabel={exerciseIndex === total - 1 ? { fr: "Trace écrite", ar: "خلاصة الدرس" } : undefined}
        nextDisabled={currentResult !== true}
        resultStatus={currentResult}
      />
    </div>
  );
}

function WorkshopView({
  session,
  lang,
  participantId,
  onRecordSubmission,
  onGoToTrace,
}: {
  session: CourseSession;
  lang: Lang;
  participantId: string;
  onRecordSubmission: (submission: SubmissionInput) => void;
  onGoToTrace: () => void;
}) {
  if (session.unit === 1) {
    return <Unit1Workshop session={session} lang={lang} participantId={participantId} onRecordSubmission={onRecordSubmission} onGoToTrace={onGoToTrace} />;
  }
  return <StandardWorkshopView session={session} lang={lang} onRecordSubmission={onRecordSubmission} onGoToTrace={onGoToTrace} />;
}

function TraceView({ session, lang }: { session: CourseSession; lang: Lang }) {
  const labels = ui[lang];
  const hasSections = Boolean(session.traceSections?.length);
  return (
    <div className="tab-content page-enter">
      <article className={`notebook ${hasSections ? "notebook-expanded" : ""}`}>
        <div className="notebook-margin" aria-hidden="true" />
        <div className="notebook-heading">
          <div>
            <span>{labels.session} {padTime(session.id)}</span>
            <h2>{session.id === 1
              ? txt({ fr: "Rappel sur le système informatique", ar: "تذكير بالنظام المعلوماتي" }, lang)
              : session.id === 2
                ? txt({ fr: "Environnement matériel d’un système informatique", ar: "البيئة المادية لنظام معلوماتي" }, lang)
              : txt(session.title, lang)}</h2>
            {session.id === 2 && (
              <h3 className="notebook-subtitle">
                {txt({ fr: "I- La configuration monoposte", ar: "I- التجهيز أحادي الحاسوب" }, lang)}
              </h3>
            )}
          </div>
          <BookOpen size={29} />
        </div>
        {hasSections ? (
          <div className="notebook-sections">
            {session.traceSections!.map((section) => (
              <section className={`trace-section ${section.cards?.length || section.wide ? "trace-section-with-cards" : ""}`} key={section.title.fr}>
                <h3>{txt(section.title, lang)}</h3>
                {section.image && <img className={`trace-section-image trace-section-image-${section.image.size ?? "full"}`} src={section.image.src} alt={bilingualAria(section.image.alt)} loading="lazy" />}
                {section.cards?.length ? (
                  <div className="trace-component-grid">
                    {section.cards.map((card) => (
                      <article className="trace-component-card" key={card.title.fr}>
                        {card.image
                          ? <img src={card.image} alt={bilingualAria(card.title)} loading="lazy" />
                          : <span className="trace-component-symbol" aria-hidden="true">{card.icon ?? "•"}</span>}
                        <strong>{txt(card.title, lang)}</strong>
                        <p>{txt(card.text, lang)}</p>
                      </article>
                    ))}
                  </div>
                ) : null}
                {section.items.length > 0 && (
                  <ul>
                    {section.items.map((item) => <li key={item.fr}>{txt(item, lang)}</li>)}
                  </ul>
                )}
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

type Session2EvaluationStage = "assembly" | "repair" | "quiz";

type EvaluationAssemblyItem = {
  id: string;
  label: LocalizedText;
  image: string;
  target: string;
};

type EvaluationAssemblyZone = {
  id: string;
  label: LocalizedText;
  hint: LocalizedText;
};

type EvaluationAssemblyResult = {
  completed: true;
  errors: number;
  total: number;
  placements: Array<{
    element: LocalizedText;
    destination: LocalizedText;
  }>;
};

type EvaluationRepairResult = {
  completed: true;
  errors: number;
  score: number;
  maxScore: number;
  cases: Array<{
    scenario: LocalizedText;
    componentAttempts: LocalizedText[];
    correctComponent: LocalizedText;
    repairAttempts: LocalizedText[];
    correctRepair: LocalizedText;
  }>;
};

const evaluationInternalZones: EvaluationAssemblyZone[] = [
  { id: "connect", label: { fr: "Connecter tous les composants", ar: "ربط جميع المكونات" }, hint: { fr: "Support principal du PC", ar: "الدعامة الرئيسية للحاسوب" } },
  { id: "calculate", label: { fr: "Exécuter les instructions", ar: "تنفيذ التعليمات" }, hint: { fr: "Le cerveau de l’ordinateur", ar: "دماغ الحاسوب" } },
  { id: "temporary", label: { fr: "Mémoriser temporairement", ar: "الحفظ المؤقت" }, hint: { fr: "Mémoire rapide de travail", ar: "ذاكرة عمل سريعة" } },
  { id: "permanent", label: { fr: "Stocker durablement", ar: "التخزين الدائم" }, hint: { fr: "Conserve système et fichiers", ar: "يحفظ النظام والملفات" } },
  { id: "graphics", label: { fr: "Traiter les images", ar: "معالجة الصور" }, hint: { fr: "Affichage et 3D", ar: "العرض والرسوم ثلاثية الأبعاد" } },
  { id: "network", label: { fr: "Se connecter au réseau", ar: "الاتصال بالشبكة" }, hint: { fr: "Communication réseau", ar: "الاتصال بالشبكة" } },
  { id: "power", label: { fr: "Fournir l’énergie", ar: "توفير الطاقة" }, hint: { fr: "Alimente tous les composants", ar: "يزود كل المكونات بالطاقة" } },
  { id: "audio", label: { fr: "Gérer le son", ar: "معالجة الصوت" }, hint: { fr: "Entrées et sorties audio", ar: "مداخل ومخارج الصوت" } },
];

const evaluationInternalItems: EvaluationAssemblyItem[] = [
  { id: "motherboard", label: { fr: "Carte mère", ar: "اللوحة الأم" }, image: "session2/items/ex12-card-02.jpg", target: "connect" },
  { id: "cpu", label: { fr: "Processeur (CPU)", ar: "المعالج (CPU)" }, image: "session2/items/ex12-card-01.png", target: "calculate" },
  { id: "ram", label: { fr: "Mémoire RAM", ar: "ذاكرة RAM" }, image: "session2/items/ex12-card-03.jpg", target: "temporary" },
  { id: "ssd", label: { fr: "Disque SSD", ar: "قرص SSD" }, image: "session2/items/ex12-card-05.jpg", target: "permanent" },
  { id: "gpu", label: { fr: "Carte graphique", ar: "بطاقة الرسوم" }, image: "session2/items/ex12-card-06.jpg", target: "graphics" },
  { id: "network-card", label: { fr: "Carte réseau", ar: "بطاقة الشبكة" }, image: "session2/items/ex12-card-09.jpg", target: "network" },
  { id: "power-supply", label: { fr: "Alimentation", ar: "مزود الطاقة" }, image: "session2/items/ex12-card-07.jpg", target: "power" },
  { id: "sound-card", label: { fr: "Carte son", ar: "بطاقة الصوت" }, image: "session2/items/carte-son.png", target: "audio" },
];

const evaluationPeripheralZones: EvaluationAssemblyZone[] = [
  { id: "input", label: { fr: "Périphériques d’entrée", ar: "ملحقات الإدخال" }, hint: { fr: "Envoient des informations vers l’unité centrale", ar: "ترسل المعلومات إلى الوحدة المركزية" } },
  { id: "output", label: { fr: "Périphériques de sortie", ar: "ملحقات الإخراج" }, hint: { fr: "Restituent les informations", ar: "تعرض المعلومات" } },
  { id: "input-output", label: { fr: "Périphériques d’entrée / sortie", ar: "ملحقات الإدخال والإخراج" }, hint: { fr: "Reçoivent et envoient des informations", ar: "تستقبل وترسل المعلومات" } },
  { id: "storage", label: { fr: "Périphériques de stockage", ar: "ملحقات التخزين" }, hint: { fr: "Conservent les informations", ar: "تحفظ المعلومات" } },
];

const evaluationPeripheralItems: EvaluationAssemblyItem[] = [
  { id: "keyboard", label: { fr: "Clavier", ar: "لوحة المفاتيح" }, image: "session2/items/ex02-card-05.jpg", target: "input" },
  { id: "mouse", label: { fr: "Souris", ar: "الفأرة" }, image: "session2/items/ex02-card-04.jpg", target: "input" },
  { id: "scanner", label: { fr: "Scanner", ar: "الماسح الضوئي" }, image: "session2/items/ex02-card-06.jpg", target: "input" },
  { id: "gamepad", label: { fr: "Manette de jeu", ar: "ذراع اللعب" }, image: "session2/items/ex02-card-03.jpg", target: "input" },
  { id: "monitor", label: { fr: "Écran", ar: "الشاشة" }, image: "session2/items/ex02-card-16.png", target: "output" },
  { id: "speakers", label: { fr: "Haut-parleurs", ar: "مكبرات الصوت" }, image: "session2/items/ex02-card-01.jpg", target: "output" },
  { id: "printer", label: { fr: "Imprimante", ar: "الطابعة" }, image: "session2/items/ex02-card-09.jpg", target: "output" },
  { id: "projector", label: { fr: "Vidéoprojecteur", ar: "مسلاط" }, image: "session2/items/ex02-card-15.jpg", target: "output" },
  { id: "touchscreen", label: { fr: "Écran tactile", ar: "شاشة لمسية" }, image: "session2/items/ex02-card-11.jpg", target: "input-output" },
  { id: "router", label: { fr: "Routeur", ar: "موجه" }, image: "session2/items/ex02-card-08.jpg", target: "input-output" },
  { id: "headset", label: { fr: "Casque-micro", ar: "سماعة بميكروفون" }, image: "session2/items/ex02-card-14.jpg", target: "input-output" },
  { id: "hard-drive", label: { fr: "Disque dur", ar: "قرص صلب" }, image: "session2/items/ex02-card-12.jpg", target: "storage" },
  { id: "sd-card", label: { fr: "Carte SD", ar: "بطاقة SD" }, image: "session2/items/ex02-card-17.jpg", target: "storage" },
  { id: "usb-key", label: { fr: "Clé USB", ar: "مفتاح USB" }, image: "session2/items/ex02-card-07.jpg", target: "storage" },
  { id: "dvd", label: { fr: "DVD", ar: "قرص DVD" }, image: "session2/items/ex02-card-10.png", target: "storage" },
];

const evaluationRepairComponents = evaluationInternalItems.map(({ id, label, image }) => ({ id, label, image }));

const evaluationRepairCases = [
  {
    id: "ram-slow",
    scenario: { fr: "Le PC possède 4 Go de RAM. Il devient très lent lorsque plusieurs logiciels sont ouverts.", ar: "يتوفر الحاسوب على 4 Go من RAM ويصبح بطيئا جدا عند فتح عدة برامج." },
    component: "ram",
    repairs: [
      { id: "ram-16", label: { fr: "Remplacer la RAM par 16 Go", ar: "استبدال RAM بذاكرة 16 Go" } },
      { id: "speaker-add", label: { fr: "Ajouter des haut-parleurs", ar: "إضافة مكبرات صوت" } },
      { id: "keyboard-change", label: { fr: "Changer le clavier", ar: "تغيير لوحة المفاتيح" } },
    ],
    repair: "ram-16",
  },
  {
    id: "gpu-game",
    scenario: { fr: "Un jeu 3D saccade, alors que le stockage et la mémoire sont suffisants.", ar: "تتقطع لعبة ثلاثية الأبعاد رغم كفاية التخزين والذاكرة." },
    component: "gpu",
    repairs: [
      { id: "gpu-dedicated", label: { fr: "Installer une carte graphique dédiée", ar: "تركيب بطاقة رسوم مستقلة" } },
      { id: "printer-driver", label: { fr: "Réinstaller l’imprimante", ar: "إعادة تثبيت الطابعة" } },
      { id: "dvd-add", label: { fr: "Ajouter un lecteur DVD", ar: "إضافة قارئ DVD" } },
    ],
    repair: "gpu-dedicated",
  },
  {
    id: "network-offline",
    scenario: { fr: "Le câble réseau est branché, mais le PC ne détecte aucune connexion.", ar: "سلك الشبكة موصول لكن الحاسوب لا يكتشف أي اتصال." },
    component: "network-card",
    repairs: [
      { id: "network-install", label: { fr: "Installer ou remplacer la carte réseau", ar: "تركيب أو استبدال بطاقة الشبكة" } },
      { id: "ram-clean", label: { fr: "Nettoyer la mémoire RAM", ar: "تنظيف ذاكرة RAM" } },
      { id: "screen-change", label: { fr: "Changer l’écran", ar: "تغيير الشاشة" } },
    ],
    repair: "network-install",
  },
  {
    id: "power-shutdown",
    scenario: { fr: "Le PC s’éteint dès qu’un jeu sollicite fortement ses composants.", ar: "ينطفئ الحاسوب عندما تستهلك اللعبة مكوناته بشكل كبير." },
    component: "power-supply",
    repairs: [
      { id: "psu-650", label: { fr: "Installer une alimentation de 650 W adaptée", ar: "تركيب مزود طاقة مناسب بقدرة 650 W" } },
      { id: "mouse-change", label: { fr: "Changer la souris", ar: "تغيير الفأرة" } },
      { id: "sound-driver", label: { fr: "Mettre à jour le pilote audio", ar: "تحديث برنامج تشغيل الصوت" } },
    ],
    repair: "psu-650",
  },
  {
    id: "ssd-boot",
    scenario: { fr: "Le démarrage dure plusieurs minutes et l’ancien disque est presque plein.", ar: "يستغرق الإقلاع عدة دقائق والقرص القديم شبه ممتلئ." },
    component: "ssd",
    repairs: [
      { id: "ssd-512", label: { fr: "Installer un SSD de 512 Go et y transférer le système", ar: "تركيب SSD بسعة 512 Go ونقل النظام إليه" } },
      { id: "webcam-add", label: { fr: "Ajouter une webcam", ar: "إضافة كاميرا ويب" } },
      { id: "router-reset", label: { fr: "Redémarrer le routeur", ar: "إعادة تشغيل الموجه" } },
    ],
    repair: "ssd-512",
  },
  {
    id: "cpu-calculation",
    scenario: { fr: "Les calculs et les traitements complexes sont très lents, même avec assez de RAM.", ar: "الحسابات والمعالجات المعقدة بطيئة جدا رغم توفر RAM كافية." },
    component: "cpu",
    repairs: [
      { id: "cpu-upgrade", label: { fr: "Installer un processeur plus puissant et compatible", ar: "تركيب معالج أقوى ومتوافق" } },
      { id: "usb-format", label: { fr: "Formater une clé USB", ar: "تهيئة مفتاح USB" } },
      { id: "speaker-add-2", label: { fr: "Ajouter des haut-parleurs", ar: "إضافة مكبرات صوت" } },
    ],
    repair: "cpu-upgrade",
  },
] satisfies Array<{
  id: string;
  scenario: LocalizedText;
  component: string;
  repairs: Array<{ id: string; label: LocalizedText }>;
  repair: string;
}>;

function Session2AssemblyEvaluation({
  lang,
  onComplete,
  onContinue,
}: {
  lang: Lang;
  onComplete: (result: EvaluationAssemblyResult) => void;
  onContinue: () => void;
}) {
  const [section, setSection] = useState<"internal" | "peripherals">("internal");
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<{ kind: "good" | "bad"; text: LocalizedText } | null>(null);
  const [shuffleAttempt, setShuffleAttempt] = useState("initial");
  const reportedRef = useRef(false);
  const allItems = useMemo(() => [...evaluationInternalItems, ...evaluationPeripheralItems], []);
  const shuffledInternalItems = useMemo(
    () => shuffledIndices(evaluationInternalItems.length, `evaluation-assembly-internal-${shuffleAttempt}`).map((index) => evaluationInternalItems[index]),
    [shuffleAttempt],
  );
  const shuffledPeripheralItems = useMemo(
    () => shuffledIndices(evaluationPeripheralItems.length, `evaluation-assembly-peripherals-${shuffleAttempt}`).map((index) => evaluationPeripheralItems[index]),
    [shuffleAttempt],
  );
  const internalDone = evaluationInternalItems.every((item) => placements[item.id] === item.target);
  const peripheralsDone = evaluationPeripheralItems.every((item) => placements[item.id] === item.target);
  const allDone = internalDone && peripheralsDone;
  const items = section === "internal" ? shuffledInternalItems : shuffledPeripheralItems;
  const zones = section === "internal" ? evaluationInternalZones : evaluationPeripheralZones;
  const placedInSection = items.filter((item) => placements[item.id] === item.target).length;

  useEffect(() => {
    const randomValues = new Uint32Array(2);
    window.crypto.getRandomValues(randomValues);
    setShuffleAttempt(`${randomValues[0]}-${randomValues[1]}`);
  }, []);

  useEffect(() => {
    if (!allDone || reportedRef.current) return;
    reportedRef.current = true;
    onComplete({
      completed: true,
      errors,
      total: allItems.length,
      placements: allItems.map((item) => ({
        element: item.label,
        destination: [...evaluationInternalZones, ...evaluationPeripheralZones].find((zone) => zone.id === item.target)!.label,
      })),
    });
  }, [allDone, allItems, errors, onComplete]);

  const placeItem = useCallback((itemId: string, zoneId: string) => {
    const item = allItems.find((candidate) => candidate.id === itemId);
    if (!item || placements[item.id]) return;
    if (item.target !== zoneId) {
      setErrors((current) => current + 1);
      setFeedback({
        kind: "bad",
        text: { fr: `${item.label.fr} ne correspond pas à cette zone. Observe sa fonction puis réessaie.`, ar: `${item.label.ar} لا يناسب هذه الخانة. لاحظ وظيفته ثم أعد المحاولة.` },
      });
      return;
    }
    setPlacements((current) => ({ ...current, [item.id]: zoneId }));
    setSelectedItem(null);
    setFeedback({
      kind: "good",
      text: { fr: `${item.label.fr} est bien placé.`, ar: `تم وضع ${item.label.ar} في المكان الصحيح.` },
    });
  }, [allItems, placements]);

  function placeSelectedItem(zoneId: string) {
    if (selectedItem) placeItem(selectedItem, zoneId);
  }

  return (
    <section className="native-practical-evaluation">
      <header className="native-practical-heading">
        <div>
          <span>ÉTAPE 1 / الخطوة 1</span>
          <h2><BilingualText value={{ fr: "Assembler le PC", ar: "تركيب الحاسوب" }} /></h2>
          <p><BilingualText value={{
            fr: "Clique sur une image puis sur sa destination, ou glisse-la directement. Chaque élément doit rejoindre sa fonction ou sa famille.",
            ar: "انقر على صورة ثم على مكانها، أو اسحبها مباشرة. ضع كل عنصر حسب وظيفته أو فئته.",
          }} /></p>
        </div>
        <div className="native-score-chip"><strong>{Object.keys(placements).length}/{allItems.length}</strong><span>{lang === "fr" ? "éléments placés" : "عنصرا موضوعا"}</span></div>
      </header>

      <div className="assembly-section-tabs" role="tablist" aria-label="Parties de l’assemblage">
        <button type="button" role="tab" aria-selected={section === "internal"} onClick={() => setSection("internal")}>
          <span>1</span><BilingualText value={{ fr: "Dans l’unité centrale", ar: "داخل الوحدة المركزية" }} /><small>{evaluationInternalItems.filter((item) => placements[item.id]).length}/8</small>
        </button>
        <button type="button" role="tab" aria-selected={section === "peripherals"} disabled={!internalDone} onClick={() => setSection("peripherals")}>
          <span>{internalDone ? <Check size={16} /> : <LockKeyhole size={14} />}</span><BilingualText value={{ fr: "Autour de l’unité centrale", ar: "حول الوحدة المركزية" }} /><small>{evaluationPeripheralItems.filter((item) => placements[item.id]).length}/15</small>
        </button>
      </div>

      <div className="assembly-instruction">
        <MousePointer2 size={20} />
        <BilingualText value={section === "internal"
          ? { fr: "Associe les 8 composants internes à leur fonction exacte.", ar: "اربط المكونات الداخلية الثمانية بوظيفتها الصحيحة." }
          : { fr: "Classe les 15 périphériques dans les quatre familles.", ar: "صنّف الملحقات الخمسة عشر في الفئات الأربع." }} />
      </div>

      <div className={`assembly-workspace ${section === "peripherals" ? "peripheral-workspace" : ""}`}>
        <div className="assembly-bank" aria-label="Éléments à placer">
          <div className="assembly-bank-head"><strong>{lang === "fr" ? "Éléments à placer" : "العناصر المطلوب وضعها"}</strong><span>{placedInSection}/{items.length}</span></div>
          <div className="assembly-bank-grid">
            {items.filter((item) => !placements[item.id]).map((item) => (
              <button
                type="button"
                draggable
                className={selectedItem === item.id ? "selected" : ""}
                key={item.id}
                onClick={() => setSelectedItem((current) => current === item.id ? null : item.id)}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", item.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
              >
                <img src={item.image} alt={bilingualAria(item.label)} />
                <BilingualText value={item.label} />
              </button>
            ))}
            {items.every((item) => placements[item.id]) && (
              <div className="assembly-bank-complete"><CheckCircle2 size={25} /><BilingualText value={{ fr: "Tous les éléments sont placés", ar: "تم وضع جميع العناصر" }} /></div>
            )}
          </div>
        </div>

        <div className="assembly-zones">
          {zones.map((zone) => {
            const zoneItems = items.filter((item) => placements[item.id] === zone.id);
            return (
              <div
                className={`assembly-zone ${selectedItem ? "ready" : ""} ${zoneItems.length ? "filled" : ""}`}
                key={zone.id}
                role="button"
                tabIndex={0}
                onClick={() => placeSelectedItem(zone.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") placeSelectedItem(zone.id);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  placeItem(event.dataTransfer.getData("text/plain"), zone.id);
                }}
              >
                <header><strong><BilingualText value={zone.label} /></strong><small><BilingualText value={zone.hint} /></small></header>
                <div className="assembly-zone-content">
                  {zoneItems.length === 0 ? <span className="assembly-drop-label">{lang === "fr" ? "Déposer ici" : "ضع هنا"}</span> : zoneItems.map((item) => (
                    <span className="assembly-placed-item" key={item.id}><img src={item.image} alt="" /><BilingualText value={item.label} /><CheckCircle2 size={15} /></span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {feedback && <div className={`native-practical-feedback ${feedback.kind}`} aria-live="polite">{feedback.kind === "good" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}<BilingualText value={feedback.text} /></div>}

      <div className="native-practical-footer">
        <div className="native-progress"><span style={{ width: `${(Object.keys(placements).length / allItems.length) * 100}%` }} /></div>
        {!internalDone ? (
          <p><LockKeyhole size={16} /><BilingualText value={{ fr: "Place correctement les 8 composants pour continuer.", ar: "ضع المكونات الثمانية بشكل صحيح للمتابعة." }} /></p>
        ) : section === "internal" ? (
          <button type="button" onClick={() => setSection("peripherals")}><BilingualText value={{ fr: "Continuer avec les périphériques", ar: "المتابعة مع الملحقات" }} /><ChevronRight size={18} /></button>
        ) : allDone ? (
          <button type="button" onClick={onContinue}><BilingualText value={{ fr: "Passer au dépannage", ar: "الانتقال إلى إصلاح الأعطال" }} /><ChevronRight size={18} /></button>
        ) : (
          <p><LockKeyhole size={16} /><BilingualText value={{ fr: "Classe correctement tous les périphériques.", ar: "صنّف جميع الملحقات بشكل صحيح." }} /></p>
        )}
      </div>
    </section>
  );
}

function Session2RepairEvaluation({
  lang,
  onComplete,
  onContinue,
}: {
  lang: Lang;
  onComplete: (result: EvaluationRepairResult) => void;
  onContinue: () => void;
}) {
  const [caseIndex, setCaseIndex] = useState(0);
  const [componentSolved, setComponentSolved] = useState<Record<number, boolean>>({});
  const [repairSolved, setRepairSolved] = useState<Record<number, boolean>>({});
  const [wrongComponents, setWrongComponents] = useState<Record<number, string[]>>({});
  const [wrongRepairs, setWrongRepairs] = useState<Record<number, string[]>>({});
  const [reports, setReports] = useState<Array<{ componentAttempts: LocalizedText[]; repairAttempts: LocalizedText[] }>>(
    () => evaluationRepairCases.map(() => ({ componentAttempts: [], repairAttempts: [] })),
  );
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<{ kind: "good" | "bad"; text: LocalizedText } | null>(null);
  const reportedRef = useRef(false);
  const currentCase = evaluationRepairCases[caseIndex];
  const completedCases = evaluationRepairCases.filter((_, index) => repairSolved[index]).length;
  const allDone = completedCases === evaluationRepairCases.length;
  const correctComponent = evaluationRepairComponents.find((item) => item.id === currentCase.component)!;

  useEffect(() => {
    if (!allDone || reportedRef.current) return;
    reportedRef.current = true;
    onComplete({
      completed: true,
      errors,
      score: evaluationRepairCases.length * 2,
      maxScore: evaluationRepairCases.length * 2,
      cases: evaluationRepairCases.map((item, index) => ({
        scenario: item.scenario,
        componentAttempts: reports[index].componentAttempts,
        correctComponent: evaluationRepairComponents.find((component) => component.id === item.component)!.label,
        repairAttempts: reports[index].repairAttempts,
        correctRepair: item.repairs.find((repair) => repair.id === item.repair)!.label,
      })),
    });
  }, [allDone, errors, onComplete, reports]);

  function recordAttempt(kind: "component" | "repair", label: LocalizedText) {
    setReports((current) => current.map((report, index) => index === caseIndex
      ? { ...report, [kind === "component" ? "componentAttempts" : "repairAttempts"]: [...report[kind === "component" ? "componentAttempts" : "repairAttempts"], label] }
      : report));
  }

  function chooseComponent(componentId: string) {
    if (componentSolved[caseIndex]) return;
    const component = evaluationRepairComponents.find((item) => item.id === componentId)!;
    recordAttempt("component", component.label);
    if (componentId === currentCase.component) {
      setComponentSolved((current) => ({ ...current, [caseIndex]: true }));
      setFeedback({ kind: "good", text: { fr: `${component.label.fr} explique bien les symptômes. Choisis maintenant la réparation.`, ar: `${component.label.ar} يفسر الأعراض. اختر الآن الإصلاح المناسب.` } });
    } else {
      setErrors((current) => current + 1);
      setWrongComponents((current) => ({ ...current, [caseIndex]: [...(current[caseIndex] ?? []), componentId] }));
      setFeedback({ kind: "bad", text: { fr: "Ce composant n’explique pas tous les symptômes. Relis la situation.", ar: "هذا المكون لا يفسر جميع الأعراض. أعد قراءة الوضعية." } });
    }
  }

  function chooseRepair(repairId: string) {
    if (!componentSolved[caseIndex] || repairSolved[caseIndex]) return;
    const repair = currentCase.repairs.find((item) => item.id === repairId)!;
    recordAttempt("repair", repair.label);
    if (repairId === currentCase.repair) {
      setRepairSolved((current) => ({ ...current, [caseIndex]: true }));
      setFeedback({ kind: "good", text: { fr: "Diagnostic complet : le composant et la réparation sont corrects.", ar: "اكتمل التشخيص: المكون والإصلاح صحيحان." } });
    } else {
      setErrors((current) => current + 1);
      setWrongRepairs((current) => ({ ...current, [caseIndex]: [...(current[caseIndex] ?? []), repairId] }));
      setFeedback({ kind: "bad", text: { fr: "Cette action ne répare pas la panne décrite. Cherche une solution liée au composant.", ar: "هذا الإجراء لا يصلح العطل الموصوف. ابحث عن حل مرتبط بالمكون." } });
    }
  }

  function goToNextCase() {
    if (!repairSolved[caseIndex] || caseIndex >= evaluationRepairCases.length - 1) return;
    setCaseIndex((current) => current + 1);
    setFeedback(null);
  }

  return (
    <section className="native-practical-evaluation repair-evaluation">
      <header className="native-practical-heading">
        <div>
          <span>ÉTAPE 2 / الخطوة 2</span>
          <h2><BilingualText value={{ fr: "Dépanner le PC", ar: "إصلاح أعطال الحاسوب" }} /></h2>
          <p><BilingualText value={{ fr: "Pour chaque panne, identifie d’abord le composant responsable, puis choisis la réparation cohérente.", ar: "لكل عطل، حدد أولا المكون المسؤول ثم اختر الإصلاح المناسب." }} /></p>
        </div>
        <div className="native-score-chip"><strong>{completedCases}/{evaluationRepairCases.length}</strong><span>{lang === "fr" ? "pannes résolues" : "أعطال محلولة"}</span></div>
      </header>

      <div className="repair-case-progress" aria-label="Progression des pannes">
        {evaluationRepairCases.map((item, index) => (
          <button type="button" key={item.id} disabled={index > completedCases} className={`${index === caseIndex ? "active" : ""} ${repairSolved[index] ? "done" : ""}`} onClick={() => index <= completedCases && setCaseIndex(index)}>
            {repairSolved[index] ? <Check size={15} /> : index + 1}
          </button>
        ))}
      </div>

      <article className="repair-scenario-card">
        <div className="repair-scenario-number"><span>{lang === "fr" ? "PANNE" : "العطل"}</span><strong>{String(caseIndex + 1).padStart(2, "0")}</strong></div>
        <div><small>Situation-problème / الوضعية المشكلة</small><h3><BilingualText value={currentCase.scenario} /></h3></div>
      </article>

      <section className={`repair-native-step ${componentSolved[caseIndex] ? "solved" : ""}`}>
        <header><span>{componentSolved[caseIndex] ? <Check size={17} /> : "1"}</span><div><strong><BilingualText value={{ fr: "Quel composant est responsable ?", ar: "ما المكون المسؤول؟" }} /></strong><small>{lang === "fr" ? "Observe la fonction de chaque composant" : "لاحظ وظيفة كل مكون"}</small></div></header>
        <div className="repair-component-grid">
          {evaluationRepairComponents.map((component) => {
            const isCorrect = componentSolved[caseIndex] && component.id === currentCase.component;
            const isWrong = (wrongComponents[caseIndex] ?? []).includes(component.id);
            return (
              <button type="button" key={component.id} disabled={componentSolved[caseIndex]} className={`${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`} onClick={() => chooseComponent(component.id)}>
                <img src={component.image} alt={bilingualAria(component.label)} />
                <BilingualText value={component.label} />
                {isCorrect && <CheckCircle2 size={18} />}
              </button>
            );
          })}
        </div>
      </section>

      <section className={`repair-native-step ${!componentSolved[caseIndex] ? "locked" : ""} ${repairSolved[caseIndex] ? "solved" : ""}`}>
        <header><span>{repairSolved[caseIndex] ? <Check size={17} /> : componentSolved[caseIndex] ? "2" : <LockKeyhole size={15} />}</span><div><strong><BilingualText value={{ fr: "Quelle réparation faut-il effectuer ?", ar: "ما الإصلاح الذي يجب القيام به؟" }} /></strong><small>{componentSolved[caseIndex] ? txt(correctComponent.label, lang) : (lang === "fr" ? "Trouve d’abord le composant" : "حدد المكون أولا")}</small></div></header>
        {componentSolved[caseIndex] && (
          <div className="repair-solution-grid">
            {currentCase.repairs.map((repair) => {
              const isCorrect = repairSolved[caseIndex] && repair.id === currentCase.repair;
              const isWrong = (wrongRepairs[caseIndex] ?? []).includes(repair.id);
              return <button type="button" key={repair.id} disabled={repairSolved[caseIndex]} className={`${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`} onClick={() => chooseRepair(repair.id)}><BilingualText value={repair.label} />{isCorrect && <CheckCircle2 size={18} />}</button>;
            })}
          </div>
        )}
      </section>

      {feedback && <div className={`native-practical-feedback ${feedback.kind}`} aria-live="polite">{feedback.kind === "good" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}<BilingualText value={feedback.text} /></div>}

      <div className="native-practical-footer">
        <div className="native-progress"><span style={{ width: `${(completedCases / evaluationRepairCases.length) * 100}%` }} /></div>
        {allDone ? (
          <button type="button" onClick={onContinue}><BilingualText value={{ fr: "Continuer avec le QCM + justification", ar: "المتابعة إلى الاختيار والتعليل" }} /><ChevronRight size={18} /></button>
        ) : repairSolved[caseIndex] ? (
          <button type="button" onClick={goToNextCase}><BilingualText value={{ fr: "Panne suivante", ar: "العطل التالي" }} /><ChevronRight size={18} /></button>
        ) : (
          <p><LockKeyhole size={16} /><BilingualText value={{ fr: "Résous les deux étapes pour continuer.", ar: "أنجز المرحلتين للمتابعة." }} /></p>
        )}
      </div>
    </section>
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
  const isBilingual = true;
  const [evaluationStage, setEvaluationStage] = useState<Session2EvaluationStage>(session.id === 2 ? "assembly" : "quiz");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [justifications, setJustifications] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [shuffleRound, setShuffleRound] = useState(0);
  const [practicalResults, setPracticalResults] = useState<{
    assembly?: EvaluationAssemblyResult;
    repair?: EvaluationRepairResult;
  }>({});
  const practicalSignaturesRef = useRef(new Set<string>());
  const quizChoiceOrders = useMemo(
    () => {
      void shuffleRound;
      return session.quiz.map((question, questionIndex) =>
        shuffledIndices(question.choices.length, `session-${session.id}-quiz-${questionIndex}-round-${shuffleRound}`)
      );
    },
    [session, shuffleRound],
  );
  const quizJustificationOrders = useMemo(
    () => {
      void shuffleRound;
      return session.quiz.map((question, questionIndex) =>
        quizHasJustification(question)
          ? shuffledIndices(question.justifications.length, `session-${session.id}-quiz-${questionIndex}-justification-round-${shuffleRound}`)
          : []
      );
    },
    [session, shuffleRound],
  );
  const score = session.quiz.reduce((total, question, index) => {
    const answerPoint = answers[index] === question.answer ? 1 : 0;
    const justificationPoint = quizHasJustification(question) && justifications[index] === question.justificationAnswer ? 1 : 0;
    return total + answerPoint + justificationPoint;
  }, 0);
  const maxScore = session.quiz.reduce((total, item) => total + (quizHasJustification(item) ? 2 : 1), 0);
  const answeredQuestions = session.quiz.reduce((total, item, index) => {
    const answerChosen = Number.isInteger(answers[index]);
    const justificationChosen = !quizHasJustification(item) || Number.isInteger(justifications[index]);
    return total + (answerChosen && justificationChosen ? 1 : 0);
  }, 0);
  const question = session.quiz[questionIndex];
  const hasJustification = quizHasJustification(question);
  const answerCorrect = answers[questionIndex] === question.answer;
  const justificationCorrect = hasJustification && justifications[questionIndex] === question.justificationAnswer;
  const questionScore = (answerCorrect ? 1 : 0) + (justificationCorrect ? 1 : 0);
  const questionAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session.id === 2 && evaluationStage !== "quiz") return;
    questionAnchorRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
  }, [evaluationStage, questionIndex, session.id]);

  const recordAssemblyResult = useCallback((result: EvaluationAssemblyResult) => {
    if (practicalSignaturesRef.current.has("assembly")) return;
    practicalSignaturesRef.current.add("assembly");
    setPracticalResults((current) => ({ ...current, assembly: result }));
    onRecordSubmission({
      sessionId: 2,
      activityType: "practical_evaluation",
      activityId: "s2-evaluation-assembler",
      answer: result,
      isCorrect: true,
      score: result.total,
      maxScore: result.total,
    });
  }, [onRecordSubmission]);

  const recordRepairResult = useCallback((result: EvaluationRepairResult) => {
    if (practicalSignaturesRef.current.has("repair")) return;
    practicalSignaturesRef.current.add("repair");
    setPracticalResults((current) => ({ ...current, repair: result }));
    onRecordSubmission({
      sessionId: 2,
      activityType: "practical_evaluation",
      activityId: "s2-evaluation-depanner",
      answer: result,
      isCorrect: true,
      score: result.score,
      maxScore: result.maxScore,
    });
  }, [onRecordSubmission]);

  function submitQuiz() {
    const detailedAnswers = session.quiz.map((question, questionIndex) => {
      const selectedIndex = answers[questionIndex];
      const selectedJustificationIndex = justifications[questionIndex];
      const hasQuestionJustification = quizHasJustification(question);
      const answerIsCorrect = selectedIndex === question.answer;
      const justificationIsCorrect = hasQuestionJustification
        ? selectedJustificationIndex === question.justificationAnswer
        : null;
      return {
        questionIndex,
        question: question.question,
        selectedIndex,
        selectedChoice: question.choices[selectedIndex],
        correctIndex: question.answer,
        correctChoice: question.choices[question.answer],
        displayedChoice: String.fromCharCode(65 + quizChoiceOrders[questionIndex].indexOf(selectedIndex)),
        displayedCorrectChoice: String.fromCharCode(65 + quizChoiceOrders[questionIndex].indexOf(question.answer)),
        selectedJustificationIndex: hasQuestionJustification ? selectedJustificationIndex : null,
        selectedJustification: hasQuestionJustification ? question.justifications[selectedJustificationIndex] : null,
        correctJustificationIndex: hasQuestionJustification ? question.justificationAnswer : null,
        correctJustification: hasQuestionJustification ? question.justifications[question.justificationAnswer] : null,
        displayedJustification: hasQuestionJustification ? quizJustificationOrders[questionIndex].indexOf(selectedJustificationIndex) + 1 : null,
        displayedCorrectJustification: hasQuestionJustification ? quizJustificationOrders[questionIndex].indexOf(question.justificationAnswer) + 1 : null,
        answerCorrect: answerIsCorrect,
        justificationCorrect: justificationIsCorrect,
        earnedPoints: (answerIsCorrect ? 1 : 0) + (justificationIsCorrect ? 1 : 0),
        maxPoints: hasQuestionJustification ? 2 : 1,
        correct: answerIsCorrect && (!hasQuestionJustification || justificationIsCorrect === true),
      };
    });
    onRecordSubmission({
      sessionId: session.id,
      activityType: "quiz",
      activityId: `session-${session.id}-quiz`,
      answer: { answers: detailedAnswers },
      isCorrect: score === maxScore,
      score,
      maxScore,
    });
    setSubmitted(true);
  }

  return (
    <div className="tab-content simple-quiz page-enter">
      {session.id === 2 && (
        <div className="evaluation-stage-tabs" role="tablist" aria-label="Étapes de l’évaluation / مراحل التقويم">
          <button type="button" role="tab" aria-selected={evaluationStage === "assembly"} onClick={() => setEvaluationStage("assembly")}>
            <MonitorCog size={18} /><span className="evaluation-stage-number">1</span><BilingualText value={{ fr: "Assembler", ar: "تركيب" }} />
          </button>
          <button type="button" role="tab" aria-selected={evaluationStage === "repair"} disabled={!practicalResults.assembly} onClick={() => setEvaluationStage("repair")}>
            {practicalResults.assembly ? <AlertTriangle size={18} /> : <LockKeyhole size={17} />}<span className="evaluation-stage-number">2</span><BilingualText value={{ fr: "Dépanner", ar: "إصلاح" }} />
          </button>
          <button type="button" role="tab" aria-selected={evaluationStage === "quiz"} disabled={!practicalResults.repair} onClick={() => setEvaluationStage("quiz")}>
            {practicalResults.repair ? <FileCheck2 size={18} /> : <LockKeyhole size={17} />}<span className="evaluation-stage-number">3</span><BilingualText value={{ fr: "QCM + justification", ar: "اختيار وتعليل" }} />
          </button>
        </div>
      )}

      {session.id === 2 && (
        <div hidden={evaluationStage !== "assembly"}>
          <Session2AssemblyEvaluation
            lang={lang}
            onComplete={recordAssemblyResult}
            onContinue={() => setEvaluationStage("repair")}
          />
        </div>
      )}

      {session.id === 2 && (
        <div hidden={evaluationStage !== "repair"}>
          <Session2RepairEvaluation
            lang={lang}
            onComplete={recordRepairResult}
            onContinue={() => setEvaluationStage("quiz")}
          />
        </div>
      )}

      <div className="evaluation-quiz-content" hidden={session.id === 2 && evaluationStage !== "quiz"}>
      <div className="exercise-counter" ref={questionAnchorRef}>
        <span>{lang === "fr" ? "QUESTION" : "السؤال"} {padTime(questionIndex + 1)}</span>
      </div>
      {session.quiz.some(quizHasJustification) && (
        <div className="quiz-double-choice-intro">
          <CheckCircle2 size={20} />
          <BilingualText value={{
            fr: "Pour chaque question : choisis la bonne réponse, puis la justification qui prouve ton raisonnement.",
            ar: "في كل سؤال: اختر الجواب الصحيح ثم اختر التعليل الذي يثبت فهمك.",
          }} />
          <strong>2 points</strong>
        </div>
      )}
      <div className="quiz-layout simple-quiz-layout">
        <div className="quiz-questions">
            <article className="quiz-question" key={question.question.fr}>
              <div className="question-title">
                <span>{padTime(questionIndex + 1)}</span>
                <div><small>Question / السؤال</small><h3><BilingualText value={question.question} /></h3></div>
              </div>
              <div className="choices">
                {quizChoiceOrders[questionIndex].map((originalIndex, displayIndex) => {
                  const choice = question.choices[originalIndex];
                  const selected = answers[questionIndex] === originalIndex;
                  const correct = submitted && originalIndex === question.answer;
                  const wrong = submitted && selected && originalIndex !== question.answer;
                  return (
                    <button
                      type="button"
                      disabled={submitted}
                      className={`${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                      key={choice.fr}
                      onClick={() => !submitted && setAnswers((current) => ({ ...current, [questionIndex]: originalIndex }))}
                    >
                      <span className="choice-letter">{String.fromCharCode(65 + displayIndex)}</span>
                      {isBilingual ? <BilingualText value={choice} /> : <span>{txt(choice, lang)}</span>}
                      {correct && <Check size={16} />}
                    </button>
                  );
                })}
              </div>
              {hasJustification && (
                <div className="quiz-justification-block">
                  <div className="justification-title">
                    <span aria-hidden="true">2</span>
                    <div>
                      <small>Justification / التعليل</small>
                      <h4><BilingualText value={{
                        fr: "Pourquoi cette réponse est-elle correcte ?",
                        ar: "لماذا هذا الجواب صحيح؟",
                      }} /></h4>
                    </div>
                  </div>
                  <div className="choices justification-choices">
                    {quizJustificationOrders[questionIndex].map((originalIndex, displayIndex) => {
                      const justification = question.justifications[originalIndex];
                      const selected = justifications[questionIndex] === originalIndex;
                      const correct = submitted && originalIndex === question.justificationAnswer;
                      const wrong = submitted && selected && originalIndex !== question.justificationAnswer;
                      return (
                        <button
                          type="button"
                          disabled={submitted}
                          className={`${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                          key={justification.fr}
                          onClick={() => !submitted && setJustifications((current) => ({ ...current, [questionIndex]: originalIndex }))}
                        >
                          <span className="choice-letter">{displayIndex + 1}</span>
                          <BilingualText value={justification} />
                          {correct && <Check size={16} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {submitted && (
                <div className={`answer-note ${questionScore === (hasJustification ? 2 : 1) ? "correct" : "wrong"}`}>
                  {hasJustification ? (
                    <>
                      <strong>{questionScore}/2</strong>
                      <BilingualText value={questionScore === 2
                        ? { fr: "Réponse et justification correctes", ar: "الجواب والتعليل صحيحان" }
                        : questionScore === 1 && answerCorrect
                          ? { fr: "Bonne réponse, mais justification à revoir", ar: "الجواب صحيح لكن التعليل يحتاج إلى مراجعة" }
                          : questionScore === 1
                            ? { fr: "Justification correcte, mais réponse à revoir", ar: "التعليل صحيح لكن الجواب يحتاج إلى مراجعة" }
                            : { fr: "Réponse et justification à revoir", ar: "الجواب والتعليل يحتاجان إلى مراجعة" }} />
                    </>
                  ) : isBilingual
                    ? <BilingualText value={answerCorrect
                      ? { fr: "Réponse correcte", ar: "إجابة صحيحة" }
                      : { fr: "À revoir", ar: "تحتاج إلى مراجعة" }} />
                    : (answerCorrect ? labels.correct : labels.wrong)}
                </div>
              )}
            </article>
          {submitted && (
            <div className="quiz-result">
              <div><span>{labels.score}</span><strong>{score}/{maxScore}</strong></div>
              <p>{score === maxScore ? (lang === "fr" ? "Excellent : les réponses et leurs justifications sont maîtrisées." : "ممتاز: تم إتقان الأجوبة وتعليلاتها.") : (lang === "fr" ? "Consulte les questions à revoir, puis recommence l’évaluation." : "راجع الأسئلة التي تحتاج إلى تصحيح ثم أعد التقويم.")}</p>
            </div>
          )}
        </div>
      </div>
      <ExerciseNavigation
        index={questionIndex}
        total={session.quiz.length}
        done={answeredQuestions}
        lang={lang}
        progressLabel={{ fr: "questions complétées", ar: "أسئلة مكتملة" }}
        onPrevious={() => setQuestionIndex((current) => Math.max(0, current - 1))}
        onNext={() => {
          if (questionIndex < session.quiz.length - 1) setQuestionIndex((current) => current + 1);
          else if (!submitted) submitQuiz();
          else {
            setAnswers({});
            setJustifications({});
            setSubmitted(false);
            setQuestionIndex(0);
            setShuffleRound((current) => current + 1);
          }
        }}
        nextDisabled={questionIndex === session.quiz.length - 1 && !submitted && answeredQuestions < session.quiz.length}
        nextLabel={questionIndex === session.quiz.length - 1
          ? submitted ? { fr: "Recommencer", ar: "إعادة المحاولة" } : { fr: "Valider l’évaluation", ar: "تأكيد التقويم" }
          : undefined}
      />
      </div>
    </div>
  );
}

function SessionPage({
  session,
  lang,
  student,
  activeTab,
  completed,
  participantId,
  onTab,
  onToggleCompleted,
  onBack,
  onChangeStudent,
  onRecordSubmission,
  saveStatus,
}: {
  session: CourseSession;
  lang: Lang;
  student: StudentProfile;
  activeTab: ViewTab;
  completed: boolean;
  participantId: string;
  onTab: (tab: ViewTab) => void;
  onToggleCompleted: () => void;
  onBack: () => void;
  onChangeStudent: () => void;
  onRecordSubmission: (submission: SubmissionInput) => void;
  saveStatus: SaveStatus;
}) {
  const [visitedTabs, setVisitedTabs] = useState<ViewTab[]>([activeTab]);

  function showTab(tab: ViewTab) {
    setVisitedTabs((current) => current.includes(tab) ? current : [...current, tab]);
    onTab(tab);
    window.requestAnimationFrame(() => {
      document.querySelector(".main-scroll")?.scrollTo({ top: 0, behavior: "auto" });
    });
  }

  function goToTrace() {
    showTab("trace");
  }
  return (
    <div className={`session-page page-enter unit-${session.unit}`}>
      <div className="session-student-identity">
        <StudentIdentityBadge lang={lang} student={student} onChangeStudent={onChangeStudent} />
      </div>
      <nav className="tab-nav" aria-label="Contenu de la séance">
        {tabItems.map(({ id, icon: Icon }) => (
          <button className={activeTab === id ? "active" : ""} aria-current={activeTab === id ? "page" : undefined} onClick={() => showTab(id)} key={id}>
            <Icon size={17} />
            <span>{ui.fr[id]}<small lang="ar" dir="rtl">{ui.ar[id]}</small></span>
          </button>
        ))}
      </nav>

      {visitedTabs.includes("mission") && (
        <section className="session-panel" data-panel="mission" hidden={activeTab !== "mission"}>
          <MissionView session={session} lang={lang} completed={completed} onToggleCompleted={onToggleCompleted} onBack={onBack} onStartPractice={() => showTab("workshop")} />
        </section>
      )}
      {visitedTabs.includes("workshop") && (
        <section className="session-panel" data-panel="workshop" hidden={activeTab !== "workshop"}>
        <WorkshopView
          key={`${participantId}-${session.id}`}
          session={session}
          lang={lang}
          participantId={participantId}
          onRecordSubmission={onRecordSubmission}
          onGoToTrace={goToTrace}
        />
        </section>
      )}
      {visitedTabs.includes("trace") && (
        <section className="session-panel" data-panel="trace" hidden={activeTab !== "trace"}>
          <TraceView session={session} lang={lang} />
        </section>
      )}
      {visitedTabs.includes("quiz") && (
        <section className="session-panel" data-panel="quiz" hidden={activeTab !== "quiz"}>
          <QuizView key={`${participantId}-${session.id}`} session={session} lang={lang} onRecordSubmission={onRecordSubmission} />
        </section>
      )}

      {saveStatus !== "idle" && (
        <div className={`session-save-status ${saveStatus}`} role="status">
          {saveStatus === "saving" ? <LoaderCircle size={14} className="spin" /> : saveStatus === "saved" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {saveStatus === "saving" ? "Enregistrement… / جار الحفظ…" : saveStatus === "saved" ? "Réponse enregistrée / تم حفظ الإجابة" : "Réponse en attente d’envoi / الإجابة في انتظار الإرسال"}
        </div>
      )}
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
  const [sessionAccess, setSessionAccess] = useState<SessionAccess[]>([]);
  const [sessionAccessLoaded, setSessionAccessLoaded] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const submissionFlushRef = useRef(false);
  const saveStatusTimerRef = useRef<number | null>(null);
  const autoOpenedSessionRef = useRef(false);

  useEffect(() => {
    const hydration = window.setTimeout(() => {
      const previewTab = session2PreviewTab();
      if (previewTab) {
        const previewProfile: StudentProfile = {
          id: "00000000-0000-4000-8000-000000000002",
          studentOne: "Élève test · Séance 2",
          studentTwo: null,
          className: "2/1",
          groupName: "1",
          isPair: false,
        };
        setPreviewMode(true);
        setStudentProfile(previewProfile);
        setSessionAccess([{ sessionId: 2, isUnlocked: true, updatedAt: new Date().toISOString() }]);
        setSessionAccessLoaded(true);
        setSelectedId(2);
        setActiveTab(previewTab);
        autoOpenedSessionRef.current = true;
        setIdentityLoaded(true);
        return;
      }
      const storedLang = window.localStorage.getItem("lab2ac-lang");
      if (storedLang === "ar") setLang("ar");
      const storedParticipant = window.sessionStorage.getItem(activeParticipantKey);
      if (storedParticipant) {
        try {
          const parsed = JSON.parse(storedParticipant) as unknown;
          if (isStudentProfile(parsed)) setStudentProfile(parsed);
        } catch { /* Ignore malformed local data. */ }
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
    if (studentProfile && !previewMode) void flushPendingSubmissions();
  }, [previewMode, studentProfile]);

  useEffect(() => {
    if (!studentProfile) {
      setSessionAccess([]);
      setSessionAccessLoaded(false);
      return;
    }
    if (previewMode) {
      setSessionAccess([{ sessionId: 2, isUnlocked: true, updatedAt: new Date().toISOString() }]);
      setSessionAccessLoaded(true);
      return;
    }
    let cancelled = false;
    let refreshTimer: number | null = null;
    const refreshAccess = async () => {
      try {
        const access = await getSessionAccess();
        if (cancelled) return;
        setSessionAccess(access);
        setSessionAccessLoaded(true);
      } catch {
        if (cancelled) return;
        // Conserver la dernière autorisation valide pendant une coupure réseau.
        // Une séance ne doit être verrouillée que par une réponse réussie du backend.
        setSessionAccessLoaded(true);
      } finally {
        if (!cancelled) refreshTimer = window.setTimeout(() => void refreshAccess(), 10_000);
      }
    };
    void refreshAccess();
    return () => {
      cancelled = true;
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
    };
  }, [previewMode, studentProfile]);

  const unlockedSessions = useMemo(
    () => new Set(sessionAccess.filter((session) => session.isUnlocked).map((session) => session.sessionId)),
    [sessionAccess],
  );

  useEffect(() => {
    if (!studentProfile || !sessionAccessLoaded || autoOpenedSessionRef.current) return;
    autoOpenedSessionRef.current = true;
    const hashMatch = window.location.hash.match(/^#seance-(\d+)$/);
    const requested = hashMatch ? Number(hashMatch[1]) : null;
    if (requested && unlockedSessions.has(requested)) {
      openSession(requested);
      return;
    }
    const openSessions = [...unlockedSessions];
    if (openSessions.length === 1) openSession(openSessions[0]);
  }, [sessionAccessLoaded, studentProfile, unlockedSessions]);

  useEffect(() => {
    if (selectedId !== null && sessionAccessLoaded && !unlockedSessions.has(selectedId)) goHome();
  }, [selectedId, sessionAccessLoaded, unlockedSessions]);

  function recordSubmission(submission: SubmissionInput) {
    if (!studentProfile) return;
    if (previewMode) {
      const previewAttempt = {
        ...submission,
        id: createClientSubmissionId(),
        participantId: studentProfile.id,
        studentOne: studentProfile.studentOne,
        studentTwo: studentProfile.studentTwo,
        className: studentProfile.className,
        groupName: studentProfile.groupName,
        isPair: studentProfile.isPair ? 1 : 0,
        responseJson: JSON.stringify(submission.answer ?? null),
        isCorrect: submission.isCorrect ?? null,
        score: submission.score ?? null,
        maxScore: submission.maxScore ?? null,
        createdAt: new Date().toISOString(),
        completedSessions: 0,
      };
      try {
        const stored = window.localStorage.getItem(evaluationPreviewKey);
        const current = stored ? JSON.parse(stored) as unknown : [];
        const attempts = Array.isArray(current) ? current : [];
        window.localStorage.setItem(evaluationPreviewKey, JSON.stringify([previewAttempt, ...attempts]));
        setSaveStatus("saved");
        if (saveStatusTimerRef.current !== null) window.clearTimeout(saveStatusTimerRef.current);
        saveStatusTimerRef.current = window.setTimeout(() => setSaveStatus("idle"), 2400);
      } catch {
        setSaveStatus("error");
      }
      return;
    }
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
    setSessionAccess([]);
    setSessionAccessLoaded(false);
    autoOpenedSessionRef.current = false;
    window.history.replaceState(null, "", window.location.pathname);
  }

  function openSession(id: number) {
    if (!unlockedSessions.has(id)) return;
    setSelectedId(id);
    setActiveTab("mission");
    setSidebarOpen(false);
    setTimerSeconds(7200);
    setTimerRunning(false);
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
    <div className={`app-shell ${selected ? "session-focus" : ""}`} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Sidebar
        lang={lang}
        selectedId={selectedId}
        completed={completed}
        unlockedSessions={unlockedSessions}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((value) => !value)}
        onHome={goHome}
        onOpenSession={openSession}
      />
      {selected && (
        <button
          type="button"
          className="session-sidebar-trigger"
          onClick={() => setSidebarOpen(true)}
          aria-label={lang === "fr" ? "Ouvrir le programme" : "فتح البرنامج"}
        >
          <Menu size={19} />
        </button>
      )}
      <div className="app-main">
        {!selected && (
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
        )}
        <main className="main-scroll" ref={mainRef}>
          {!sessionAccessLoaded ? (
            <div className="session-access-loading"><LoaderCircle className="spin" size={25} /><span>{lang === "fr" ? "Ouverture de la séance autorisée…" : "جار فتح الحصة المسموح بها…"}</span></div>
          ) : selected ? (
            <SessionPage
              key={`${studentProfile.id}-${selected.id}`}
              session={selected}
              lang={lang}
              student={studentProfile}
              activeTab={activeTab}
              completed={completed.has(selected.id)}
              participantId={studentProfile.id}
              onTab={setActiveTab}
              onToggleCompleted={toggleComplete}
              onBack={goHome}
              onChangeStudent={changeStudent}
              onRecordSubmission={recordSubmission}
              saveStatus={saveStatus}
            />
          ) : (
            <Dashboard lang={lang} completed={completed} unlockedSessions={unlockedSessions} onOpenSession={openSession} />
          )}
          {!selected && <div className="site-credit">
            <span>LAB·2AC</span>
            <p>Prof. Abdellah TAHTOH · Collège Othmane Ibn Affane</p>
          </div>}
        </main>
      </div>
    </div>
  );
}
