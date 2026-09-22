"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
  Trash2,
  UnlockKeyhole,
  Users,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  teacherDashboard,
  teacherDeleteAllData,
  teacherExport,
  teacherLearnerReport,
  teacherLogin,
  teacherLogout,
  teacherUpdateSessionAccess,
  type ProfessorFilters,
  type SessionAccess,
} from "@/lib/supabase-api";

type Attempt = {
  id: string;
  participantId: string;
  studentOne: string;
  studentTwo: string | null;
  className: string;
  groupName: string;
  isPair: number;
  sessionId: number;
  activityType: string;
  activityId: string;
  responseJson: string;
  isCorrect: number | null;
  score: number | null;
  maxScore: number | null;
  createdAt: string;
  completedSessions: number;
};

type Learner = {
  id: string;
  studentOne: string;
  studentTwo: string | null;
  className: string;
  groupName: string;
  isPair: number;
  createdAt: string;
  totalAttempts: number;
  gradedAttempts: number;
  correctAttempts: number;
  successRate: number | null;
  gradeOutOf20: number | null;
  averageScore: number | null;
  bestScore: number | null;
  completedSessions: number;
  lastAttemptAt: string | null;
};

type DashboardData = {
  sessionAccess: SessionAccess[];
  stats: {
    totalParticipants: number;
    totalAttempts: number;
    correctRate: number;
    averageScore: number;
  };
  attempts: Attempt[];
  learners: Learner[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

type FilterState = ProfessorFilters;

const emptyFilters: FilterState = {
  className: "",
  groupName: "",
  sessionId: "",
  search: "",
};

const activityLabels: Record<string, string> = {
  unit1_exercise: "Exercice U1",
  quiz: "QCM",
  photo_challenge: "Défi image",
  workshop: "Atelier pratique",
  session_completion: "Validation de séance",
};

const answerLabels: Record<string, string> = {
  answers: "Réponses au QCM",
  question: "Question",
  selectedChoice: "Réponse choisie",
  selectedIndex: "Choix sélectionné",
  selectedIndices: "Choix sélectionnés",
  matches: "Classement proposé",
  sequence: "Ordre proposé",
  text: "Réponse saisie",
  completed: "Activité terminée",
  workshop: "Atelier",
  mode: "Mode",
  completedTargets: "Cibles réussies",
  clickedTarget: "Cible choisie",
  expectedTarget: "Cible attendue",
  correct: "Résultat",
  correctChoice: "Réponse attendue",
  correctChoices: "Réponses attendues",
  correctIndex: "Indice attendu",
  correctIndices: "Indices attendus",
  displayedChoice: "Lettre affichée",
  displayedCorrectChoice: "Lettre attendue",
  selectedChoices: "Réponses choisies",
  expectedSequence: "Ordre attendu",
  acceptedAnswers: "Réponses acceptées",
};

function studentName(item: Pick<Attempt, "studentOne" | "studentTwo">) {
  return item.studentTwo ? `${item.studentOne} + ${item.studentTwo}` : item.studentOne;
}

function parseDatabaseDate(value: string) {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  return new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(normalized) ? normalized : `${normalized}Z`);
}

function formatDateTime(value: string | null) {
  if (!value) return "Aucune tentative";
  const date = parseDatabaseDate(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Africa/Casablanca",
  }).format(date);
}

function displayAnswerValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value || "—";
  if (Array.isArray(value)) return value.map(displayAnswerValue).join(" · ");
  if (typeof value === "object") {
    const localized = value as { fr?: unknown; ar?: unknown };
    if (typeof localized.fr === "string" || typeof localized.ar === "string") {
      return [localized.fr, localized.ar].filter(Boolean).join(" / ");
    }
    return JSON.stringify(value);
  }
  return String(value);
}

function parseAttemptAnswer(row: Attempt) {
  try {
    return JSON.parse(row.responseJson) as unknown;
  } catch {
    return row.responseJson;
  }
}

function answerPreview(row: Attempt) {
  const answer = parseAttemptAnswer(row);
  if (answer && typeof answer === "object" && !Array.isArray(answer)) {
    const record = answer as Record<string, unknown>;
    const quizAnswers = Array.isArray(record.answers) ? record.answers as Array<Record<string, unknown>> : [];
    if (quizAnswers.length > 0) {
      return quizAnswers.map((item, index) => `Q${index + 1}: ${displayAnswerValue(item.selectedChoice)}`).join(" · ");
    }
    return displayAnswerValue(
      record.selectedChoice ?? record.selectedChoices ?? record.text ?? record.sequence ?? record.matches ?? record.completed,
    );
  }
  return displayAnswerValue(answer);
}

function attemptPercentage(attempt: Attempt) {
  if (attempt.score !== null && attempt.maxScore !== null && attempt.maxScore > 0) {
    return Math.round((attempt.score / attempt.maxScore) * 100);
  }
  if (attempt.isCorrect === null) return null;
  return attempt.isCorrect ? 100 : 0;
}

function percentageToGrade(percentage: number | null) {
  return percentage === null ? null : Math.round((percentage / 5) * 10) / 10;
}

function attemptExportRows(row: Attempt) {
  const date = parseDatabaseDate(row.createdAt);
  const dateText = new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "short",
    timeZone: "Africa/Casablanca",
  }).format(date);
  const timeText = new Intl.DateTimeFormat("fr-MA", {
    timeStyle: "medium",
    timeZone: "Africa/Casablanca",
  }).format(date);

  const base = [
    dateText,
    timeText,
    row.className,
    `Groupe ${row.groupName}`,
    row.studentOne,
    row.studentTwo ?? "",
    row.isPair ? "Binôme" : "Individuel",
    row.sessionId,
    activityLabels[row.activityType] ?? row.activityType,
    row.activityId,
  ];
  const scorePercent = attemptPercentage(row);
  const gradeOutOf20 = percentageToGrade(scorePercent);
  const answer = parseAttemptAnswer(row);
  const quizAnswers = answer && typeof answer === "object" && !Array.isArray(answer) &&
    Array.isArray((answer as Record<string, unknown>).answers)
    ? (answer as { answers: Array<Record<string, unknown>> }).answers
    : [];

  const details = quizAnswers.length > 0
    ? quizAnswers.map((item, index) => ({
      number: index + 1,
      question: displayAnswerValue(item.question),
      selected: displayAnswerValue(item.selectedChoice),
      expected: displayAnswerValue(item.correctChoice),
      result: item.correct ? "Correct" : "Incorrect",
    }))
    : [{
      number: "",
      question: answer && typeof answer === "object" && !Array.isArray(answer)
        ? displayAnswerValue((answer as Record<string, unknown>).question)
        : "",
      selected: answerPreview(row),
      expected: answer && typeof answer === "object" && !Array.isArray(answer)
        ? displayAnswerValue(
          (answer as Record<string, unknown>).correctChoice ??
          (answer as Record<string, unknown>).correctChoices ??
          (answer as Record<string, unknown>).expectedSequence ??
          (answer as Record<string, unknown>).acceptedAnswers,
        )
        : "",
      result: row.isCorrect === null ? "Non évalué" : row.isCorrect ? "Correct" : "Incorrect",
    }];

  return details.map((detail) => [
    ...base,
    detail.number,
    detail.question,
    detail.selected,
    detail.expected,
    detail.result,
    row.score ?? "",
    row.maxScore ?? "",
    scorePercent ?? "",
    gradeOutOf20 ?? "",
    row.isCorrect === null ? "Non évalué" : row.isCorrect ? "Correct" : "Incorrect",
    row.completedSessions,
    15,
  ]);
}

function AnswerDetails({ attempt }: { attempt: Attempt }) {
  let answer: unknown;
  try {
    answer = JSON.parse(attempt.responseJson);
  } catch {
    answer = attempt.responseJson;
  }

  if (
    answer &&
    typeof answer === "object" &&
    Array.isArray((answer as { answers?: unknown }).answers)
  ) {
    const answers = (answer as { answers: Array<Record<string, unknown>> }).answers;
    return (
      <div className="prof-quiz-details">
        {answers.map((item, index) => (
          <article key={`${index}-${displayAnswerValue(item.question)}`}>
            <div className="prof-question-line">
              <strong>Question {index + 1}</strong>
              <span className={item.correct ? "prof-result-good" : "prof-result-bad"}>
                {item.correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {item.correct ? "Correcte" : "Incorrecte"}
              </span>
            </div>
            <p>{displayAnswerValue(item.question)}</p>
            <dl>
              <div><dt>Réponse choisie</dt><dd>{displayAnswerValue(item.selectedChoice)}</dd></div>
              <div><dt>Lettre affichée</dt><dd>{displayAnswerValue(item.displayedChoice)}</dd></div>
              <div><dt>Réponse attendue</dt><dd>{displayAnswerValue(item.correctChoice)}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    );
  }

  if (answer && typeof answer === "object" && !Array.isArray(answer)) {
    const record = answer as Record<string, unknown>;
    if (record.question) {
      const received = record.selectedChoice ?? record.selectedChoices ?? record.text ?? record.sequence ?? record.matches;
      const expected = record.correctChoice ?? record.correctChoices ?? record.expectedSequence ?? record.acceptedAnswers;
      return (
        <dl className="prof-answer-list prof-pedagogical-answer">
          <div><dt>Question</dt><dd>{displayAnswerValue(record.question)}</dd></div>
          <div><dt>Réponse de l’élève</dt><dd>{received === undefined ? "Aucune réponse" : displayAnswerValue(received)}</dd></div>
          <div><dt>Réponse attendue</dt><dd>{expected === undefined ? "—" : displayAnswerValue(expected)}</dd></div>
          <div><dt>Résultat</dt><dd>{attempt.isCorrect === null ? "Non évalué" : attempt.isCorrect ? "Correct" : "Incorrect"}</dd></div>
        </dl>
      );
    }
    return (
      <dl className="prof-answer-list">
        {Object.entries(record).filter(([key]) => key !== "selectedIndex" && key !== "correctIndex").map(([key, value]) => (
          <div key={key}>
            <dt>{answerLabels[key] ?? key}</dt>
            <dd>{displayAnswerValue(value)}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return <p className="prof-answer-plain">{displayAnswerValue(answer)}</p>;
}

export default function ProfessorDashboard() {
  const [authState, setAuthState] = useState<"checking" | "login" | "ready">("checking");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(emptyFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [updatingSessionId, setUpdatingSessionId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [learnerAttempts, setLearnerAttempts] = useState<Attempt[]>([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const loadDashboard = useCallback(async (nextFilters: FilterState, nextPage: number) => {
    setLoading(true);
    setError("");
    try {
      const payload = await teacherDashboard<DashboardData>(nextFilters, nextPage);
      setData(payload);
      setAuthState("ready");
    } catch (loadError) {
      if ((loadError as Error & { status?: number }).status === 401) {
        teacherLogout();
        setAuthState("login");
        setData(null);
        return;
      }
      setError(loadError instanceof Error ? loadError.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard(appliedFilters, page);
  }, [appliedFilters, loadDashboard, page]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      await teacherLogin(password);
      setPassword("");
      setAuthState("checking");
      await loadDashboard(appliedFilters, page);
    } catch (loginFailure) {
      setLoginError(loginFailure instanceof Error ? loginFailure.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    teacherLogout();
    setData(null);
    setAuthState("login");
  }

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedFilters({ ...filters });
  }

  function resetFilters() {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  }

  async function downloadCsv() {
    setExporting(true);
    setError("");
    try {
      const payload = await teacherExport<{ rows: Attempt[]; truncated: boolean }>(appliedFilters);
      const header = [
        "Date",
        "Heure (Maroc)",
        "Classe",
        "Groupe",
        "Élève 1",
        "Élève 2",
        "Organisation",
        "Séance",
        "Type",
        "Activité",
        "N° question",
        "Question",
        "Réponse de l’élève",
        "Réponse attendue",
        "Résultat de la question",
        "Points obtenus",
        "Points possibles",
        "Pourcentage de la tentative (%)",
        "Note de la tentative (/20)",
        "Résultat de la tentative",
        "Séances terminées",
        "Nombre total de séances",
      ];
      const rows = payload.rows.flatMap(attemptExportRows);
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
      worksheet["!cols"] = [
        { wch: 12 }, { wch: 13 }, { wch: 10 }, { wch: 11 }, { wch: 24 }, { wch: 24 },
        { wch: 14 }, { wch: 9 }, { wch: 15 }, { wch: 24 }, { wch: 12 }, { wch: 48 },
        { wch: 48 }, { wch: 48 }, { wch: 22 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
        { wch: 27 }, { wch: 24 }, { wch: 18 }, { wch: 24 },
      ];
      if (rows.length > 0) worksheet["!autofilter"] = { ref: `A1:V${rows.length + 1}` };

      const summaryHeader = [
        "Classe", "Groupe", "Élève 1", "Élève 2", "Organisation", "Nombre de tentatives",
        "Tentatives corrigées", "Réponses correctes", "Taux de réussite (%)", "Note indicative (/20)",
        "Score moyen des QCM (%)", "Meilleur score QCM (%)", "Séances terminées", "Total des séances",
        "Dernière tentative (Maroc)",
      ];
      const summaryRows = (data?.learners ?? []).map((learner) => [
        learner.className,
        `Groupe ${learner.groupName}`,
        learner.studentOne,
        learner.studentTwo ?? "",
        learner.isPair ? "Binôme" : "Individuel",
        learner.totalAttempts,
        learner.gradedAttempts,
        learner.correctAttempts,
        learner.successRate ?? "",
        learner.gradeOutOf20 ?? "",
        learner.averageScore ?? "",
        learner.bestScore ?? "",
        learner.completedSessions,
        15,
        learner.lastAttemptAt ? formatDateTime(learner.lastAttemptAt) : "Aucune tentative",
      ]);
      const summaryWorksheet = XLSX.utils.aoa_to_sheet([summaryHeader, ...summaryRows]);
      summaryWorksheet["!cols"] = [
        { wch: 10 }, { wch: 12 }, { wch: 24 }, { wch: 24 }, { wch: 14 }, { wch: 20 },
        { wch: 21 }, { wch: 20 }, { wch: 21 }, { wch: 21 }, { wch: 24 }, { wch: 24 },
        { wch: 19 }, { wch: 18 }, { wch: 25 },
      ];
      if (summaryRows.length > 0) summaryWorksheet["!autofilter"] = { ref: `A1:O${summaryRows.length + 1}` };
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Résumé par élève");
      XLSX.utils.book_append_sheet(workbook, worksheet, "Réponses détaillées");
      const exportDate = new Intl.DateTimeFormat("fr-CA", { timeZone: "Africa/Casablanca" }).format(new Date());
      XLSX.writeFile(workbook, `suivi-eleves-2ac-${exportDate}.xlsx`, { compression: true });
      if (payload.truncated) setError("L’export a été limité aux 25 000 tentatives les plus récentes.");
    } catch (exportError) {
      if ((exportError as Error & { status?: number }).status === 401) {
        logout();
        return;
      }
      setError(exportError instanceof Error ? exportError.message : "Export impossible.");
    } finally {
      setExporting(false);
    }
  }

  async function deleteAllData() {
    if (deleteConfirmation !== "EFFACER") return;
    setDeleting(true);
    setError("");
    try {
      await teacherDeleteAllData();
      setDeleteDialogOpen(false);
      setDeleteConfirmation("");
      setSelectedLearner(null);
      setLearnerAttempts([]);
      setFilters(emptyFilters);
      setAppliedFilters(emptyFilters);
      setPage(1);
      await loadDashboard(emptyFilters, 1);
    } catch (deleteError) {
      if ((deleteError as Error & { status?: number }).status === 401) {
        logout();
        return;
      }
      setError(deleteError instanceof Error ? deleteError.message : "Suppression impossible.");
    } finally {
      setDeleting(false);
    }
  }

  async function toggleSessionAccess(session: SessionAccess) {
    setUpdatingSessionId(session.sessionId);
    setError("");
    try {
      const sessionAccess = await teacherUpdateSessionAccess(session.sessionId, !session.isUnlocked);
      setData((current) => current ? { ...current, sessionAccess } : current);
    } catch (updateError) {
      if ((updateError as Error & { status?: number }).status === 401) {
        logout();
        return;
      }
      setError(updateError instanceof Error ? updateError.message : "Modification impossible.");
    } finally {
      setUpdatingSessionId(null);
    }
  }

  async function openLearnerReport(learner: Learner) {
    setSelectedLearner(learner);
    setLearnerAttempts([]);
    setSelectedAttemptId(null);
    setReportLoading(true);
    setError("");
    try {
      const report = await teacherLearnerReport<{ attempts: Attempt[]; truncated: boolean }>(learner.id);
      setLearnerAttempts(report.attempts);
      if (report.truncated) setError("Le rapport est limité aux 25 000 tentatives les plus récentes.");
    } catch (reportError) {
      if ((reportError as Error & { status?: number }).status === 401) {
        logout();
        return;
      }
      setError(reportError instanceof Error ? reportError.message : "Rapport impossible à charger.");
    } finally {
      setReportLoading(false);
    }
  }

  if (authState === "checking" && !data) {
    return (
      <main className="prof-loading">
        <LoaderCircle className="spin" size={30} />
        <span>Ouverture de l’espace professeur…</span>
      </main>
    );
  }

  if (authState === "login") {
    return (
      <main className="prof-login-page">
        <section className="prof-login-card">
          <div className="prof-login-visual">
            <span className="prof-brand-mark">{"//"}</span>
            <div>
              <small>LAB·2AC</small>
              <h1>Espace professeur</h1>
              <p>Consultez les tentatives, les réponses et la progression de vos élèves.</p>
            </div>
            <div className="prof-security-note"><ShieldCheck size={19} /> Accès protégé et invisible depuis l’espace élève</div>
          </div>
          <form className="prof-login-form" onSubmit={login}>
            <span className="prof-login-icon"><KeyRound size={24} /></span>
            <div>
              <small>ACCÈS ENSEIGNANT</small>
              <h2>Bienvenue, Prof. Abdellah</h2>
              <p>Saisissez le mot de passe de l’espace professeur.</p>
            </div>
            <label>
              <span>Mot de passe</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                autoFocus
              />
            </label>
            {loginError && <div className="prof-login-error"><XCircle size={17} />{loginError}</div>}
            <button type="submit" disabled={loading}>
              {loading ? <LoaderCircle className="spin" size={18} /> : <ShieldCheck size={18} />}
              Ouvrir le tableau de bord
            </button>
            <a href="../"><ArrowLeft size={16} /> Retour au cours</a>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="prof-page">
      <header className="prof-header">
        <div className="prof-brand">
          <span className="prof-brand-mark">{"//"}</span>
          <span><strong>LAB·2AC</strong><small>ESPACE PROFESSEUR</small></span>
        </div>
        <div className="prof-header-actions">
          <a href="../"><ArrowLeft size={16} /> Cours élève</a>
          <button onClick={() => void logout()}><LogOut size={16} /> Déconnexion</button>
        </div>
      </header>

      <div className="prof-content">
        <section className="prof-title-row">
          <div>
            <span><GraduationCap size={17} /> SUIVI PÉDAGOGIQUE</span>
            <h1>Tableau de bord des élèves</h1>
            <p>Réponses, scores et progression enregistrés en temps réel.</p>
          </div>
          <div className="prof-title-actions">
            <button className="prof-export" type="button" onClick={() => void downloadCsv()} disabled={exporting || deleting}>
              <FileSpreadsheet size={18} />
              <span><strong>{exporting ? "Préparation…" : "Exporter Excel (.xlsx)"}</strong><small>Résumé des notes + réponses détaillées</small></span>
              {exporting ? <LoaderCircle className="spin" size={17} /> : <Download size={17} />}
            </button>
            <button className="prof-delete-data" type="button" onClick={() => setDeleteDialogOpen(true)} disabled={deleting}>
              <Trash2 size={17} /> Effacer les données
            </button>
          </div>
        </section>

        <section className="prof-session-control" aria-labelledby="session-control-title">
          <div className="prof-session-control-head">
            <div>
              <span><LockKeyhole size={16} /> ACCÈS DES ÉLÈVES</span>
              <h2 id="session-control-title">Verrouillage des séances</h2>
              <p>Seules les séances ouvertes peuvent être consultées et enregistrer des réponses.</p>
            </div>
            <strong>{data?.sessionAccess.filter((session) => session.isUnlocked).length ?? 0} ouverte(s)</strong>
          </div>
          <div className="prof-session-lock-grid">
            {(data?.sessionAccess ?? []).map((session) => (
              <button
                type="button"
                key={session.sessionId}
                className={session.isUnlocked ? "unlocked" : "locked"}
                onClick={() => void toggleSessionAccess(session)}
                disabled={updatingSessionId !== null}
                aria-pressed={session.isUnlocked}
              >
                <span>S{String(session.sessionId).padStart(2, "0")}</span>
                {updatingSessionId === session.sessionId
                  ? <LoaderCircle className="spin" size={16} />
                  : session.isUnlocked ? <UnlockKeyhole size={16} /> : <LockKeyhole size={16} />}
                <small>{session.isUnlocked ? "Ouverte" : "Fermée"}</small>
              </button>
            ))}
          </div>
        </section>

        <form className="prof-filters" onSubmit={applyFilters}>
          <span className="prof-filter-title"><Filter size={17} /> Filtres</span>
          <label>
            <span>Classe</span>
            <select value={filters.className} onChange={(event) => setFilters((current) => ({ ...current, className: event.target.value }))}>
              <option value="">Toutes</option>
              {Array.from({ length: 9 }, (_, index) => <option key={index} value={`2/${index + 1}`}>{`2/${index + 1}`}</option>)}
            </select>
          </label>
          <label>
            <span>Groupe</span>
            <select value={filters.groupName} onChange={(event) => setFilters((current) => ({ ...current, groupName: event.target.value }))}>
              <option value="">Tous</option>
              <option value="1">Groupe 1</option>
              <option value="2">Groupe 2</option>
            </select>
          </label>
          <label>
            <span>Séance</span>
            <select value={filters.sessionId} onChange={(event) => setFilters((current) => ({ ...current, sessionId: event.target.value }))}>
              <option value="">Toutes</option>
              {Array.from({ length: 15 }, (_, index) => <option key={index} value={index + 1}>Séance {index + 1}</option>)}
            </select>
          </label>
          <label className="prof-search-field">
            <span>Élève</span>
            <span><Search size={16} /><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Rechercher un nom…" /></span>
          </label>
          <button className="prof-apply" type="submit"><Filter size={16} /> Appliquer</button>
          <button className="prof-reset" type="button" onClick={resetFilters}><RefreshCw size={16} /> Réinitialiser</button>
        </form>

        {error && <div className="prof-page-error"><XCircle size={18} /><span>{error}</span><button onClick={() => void loadDashboard(appliedFilters, page)}>Réessayer</button></div>}

        <section className="prof-stats" aria-label="Indicateurs principaux">
          <article><span className="prof-stat-icon"><Users /></span><div><strong>{data?.stats.totalParticipants ?? 0}</strong><small>Élèves / binômes</small></div></article>
          <article><span className="prof-stat-icon"><Activity /></span><div><strong>{data?.stats.totalAttempts ?? 0}</strong><small>Tentatives</small></div></article>
          <article><span className="prof-stat-icon"><Target /></span><div><strong>{data?.stats.correctRate ?? 0}%</strong><small>Réponses correctes</small></div></article>
          <article><span className="prof-stat-icon"><GraduationCap /></span><div><strong>{data?.stats.averageScore ?? 0}%</strong><small>Moyenne des QCM</small></div></article>
        </section>

        <section className="prof-data-card">
          <div className="prof-data-head prof-learners-head">
            <div><strong>Rapports des élèves</strong><span>Une ligne par élève ou binôme</span></div>
            {loading && <span className="prof-refreshing"><LoaderCircle className="spin" size={16} /> Actualisation…</span>}
          </div>
          {data && data.learners.length > 0 ? (
                <Table className="prof-table prof-learner-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Élève(s)</TableHead>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Classe et groupe</TableHead>
                      <TableHead>Tentatives</TableHead>
                      <TableHead>Réussite</TableHead>
                      <TableHead>Taux</TableHead>
                      <TableHead>Note indicative</TableHead>
                      <TableHead>Score moyen</TableHead>
                      <TableHead>Meilleur score</TableHead>
                      <TableHead>Séances terminées</TableHead>
                      <TableHead>Dernière tentative</TableHead>
                      <TableHead>Rapport détaillé</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.learners.map((learner) => (
                      <TableRow key={learner.id}>
                        <TableCell><strong>{studentName(learner)}</strong></TableCell>
                        <TableCell>{learner.isPair ? "Binôme" : "Individuel"}</TableCell>
                        <TableCell><span className="prof-class-badge">{learner.className} · G{learner.groupName}</span></TableCell>
                        <TableCell><strong>{learner.totalAttempts}</strong></TableCell>
                        <TableCell><strong>{learner.gradedAttempts > 0 ? `${learner.correctAttempts}/${learner.gradedAttempts}` : "—"}</strong></TableCell>
                        <TableCell><strong className="prof-percentage">{learner.successRate === null ? "—" : `${learner.successRate}%`}</strong></TableCell>
                        <TableCell><strong className="prof-grade">{learner.gradeOutOf20 === null ? "—" : `${learner.gradeOutOf20}/20`}</strong></TableCell>
                        <TableCell><strong>{learner.averageScore === null ? "—" : `${learner.averageScore}%`}</strong></TableCell>
                        <TableCell><strong>{learner.bestScore === null ? "—" : `${learner.bestScore}%`}</strong></TableCell>
                        <TableCell><span className="prof-wide-progress"><i><b style={{ width: `${Math.round((learner.completedSessions / 15) * 100)}%` }} /></i><strong>{learner.completedSessions}/15</strong></span></TableCell>
                        <TableCell><span className="prof-date"><Clock3 size={14} />{formatDateTime(learner.lastAttemptAt)}</span></TableCell>
                        <TableCell><button className="prof-detail-button" onClick={() => void openLearnerReport(learner)}><Eye size={15} /> Consulter</button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="prof-empty"><Users size={28} /><strong>Aucun élève</strong><p>Aucune inscription ne correspond aux filtres sélectionnés.</p></div>
              )}
        </section>
      </div>

      <Dialog open={Boolean(selectedLearner)} onOpenChange={(open) => { if (!open) { setSelectedLearner(null); setSelectedAttemptId(null); } }}>
        <DialogContent className="prof-answer-dialog prof-learner-report-dialog">
          {selectedLearner && (
            <>
              <DialogHeader>
                <span className="prof-dialog-kicker">RAPPORT INDIVIDUEL</span>
                <DialogTitle>{studentName(selectedLearner)}</DialogTitle>
                <DialogDescription>
                  {selectedLearner.className} · Groupe {selectedLearner.groupName} · {selectedLearner.isPair ? "Binôme" : "Individuel"}
                </DialogDescription>
              </DialogHeader>
              <div className="prof-report-summary">
                <article><small>Tentatives</small><strong>{selectedLearner.totalAttempts}</strong></article>
                <article><small>Réussite</small><strong>{selectedLearner.gradedAttempts > 0 ? `${selectedLearner.correctAttempts}/${selectedLearner.gradedAttempts}` : "—"}</strong></article>
                <article><small>Pourcentage</small><strong>{selectedLearner.successRate === null ? "—" : `${selectedLearner.successRate}%`}</strong></article>
                <article className="grade"><small>Note indicative</small><strong>{selectedLearner.gradeOutOf20 === null ? "—" : `${selectedLearner.gradeOutOf20}/20`}</strong></article>
                <article><small>Progression</small><strong>{selectedLearner.completedSessions}/15</strong></article>
              </div>
              {reportLoading ? (
                <div className="prof-report-loading"><LoaderCircle className="spin" size={22} /> Chargement des réponses…</div>
              ) : learnerAttempts.length > 0 ? (
                <div className="prof-report-attempts">
                  {learnerAttempts.map((attempt) => {
                    const expanded = selectedAttemptId === attempt.id;
                    const percentage = attemptPercentage(attempt);
                    const grade = percentageToGrade(percentage);
                    return (
                      <article className={`prof-report-attempt ${expanded ? "expanded" : ""}`} key={attempt.id}>
                        <button type="button" onClick={() => setSelectedAttemptId(expanded ? null : attempt.id)}>
                          <span><strong>S{String(attempt.sessionId).padStart(2, "0")} · {activityLabels[attempt.activityType] ?? attempt.activityType}</strong><small>{formatDateTime(attempt.createdAt)} · {attempt.activityId}</small></span>
                          <span className={`prof-result ${attempt.isCorrect === null ? "neutral" : attempt.isCorrect ? "good" : "bad"}`}>
                            {attempt.isCorrect === null ? "Non évalué" : attempt.isCorrect ? "Correct" : "Incorrect"}
                          </span>
                          <span className="prof-attempt-mark">
                            <strong>{percentage === null ? "—" : `${percentage}%`}</strong>
                            <small>{grade === null ? "" : `${grade}/20`}</small>
                          </span>
                          <Eye size={16} />
                        </button>
                        {expanded && <div className="prof-report-answer"><AnswerDetails attempt={attempt} /></div>}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="prof-empty"><Activity size={25} /><strong>Aucune tentative</strong><p>Cet élève n’a encore envoyé aucune réponse.</p></div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={(open) => { if (!deleting) { setDeleteDialogOpen(open); if (!open) setDeleteConfirmation(""); } }}>
        <DialogContent className="prof-delete-dialog">
          <DialogHeader>
            <span className="prof-delete-icon"><AlertTriangle size={24} /></span>
            <DialogTitle>Effacer toutes les données ?</DialogTitle>
            <DialogDescription>
              Cette action supprimera définitivement les élèves inscrits, leurs réponses, leurs scores et leur progression. La configuration du site sera conservée.
            </DialogDescription>
          </DialogHeader>
          <label className="prof-delete-confirmation">
            <span>Écrivez <strong>EFFACER</strong> pour confirmer</span>
            <input
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value.toUpperCase())}
              placeholder="EFFACER"
              autoComplete="off"
              disabled={deleting}
            />
          </label>
          <div className="prof-delete-actions">
            <button type="button" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Annuler</button>
            <button type="button" className="danger" onClick={() => void deleteAllData()} disabled={deleteConfirmation !== "EFFACER" || deleting}>
              {deleting ? <LoaderCircle className="spin" size={17} /> : <Trash2 size={17} />}
              {deleting ? "Suppression…" : "Effacer définitivement"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
