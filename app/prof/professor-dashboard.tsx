"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  KeyRound,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
  Users,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  teacherDashboard,
  teacherExport,
  teacherLogin,
  teacherLogout,
  type ProfessorFilters,
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
  completedSessions: number;
  lastAttemptAt: string | null;
};

type DashboardData = {
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

function csvCell(value: unknown) {
  const text = String(value ?? "").replace(/\r?\n/g, " ");
  const spreadsheetSafe = /^[=+\-@\t]/.test(text) ? `'${text}` : text;
  return `"${spreadsheetSafe.replace(/"/g, '""')}"`;
}

function attemptCsvRow(row: Attempt) {
  const date = parseDatabaseDate(row.createdAt);
  const dateText = new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "short",
    timeZone: "Africa/Casablanca",
  }).format(date);
  const timeText = new Intl.DateTimeFormat("fr-MA", {
    timeStyle: "medium",
    timeZone: "Africa/Casablanca",
  }).format(date);

  return [
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
    row.responseJson,
    row.isCorrect === null ? "Non évalué" : row.isCorrect ? "Correct" : "Incorrect",
    row.score === null || row.maxScore === null ? "" : `${row.score}/${row.maxScore}`,
    `${row.completedSessions}/15`,
  ].map(csvCell).join(";");
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
              <div><dt>Indice du choix</dt><dd>{typeof item.selectedIndex === "number" ? String.fromCharCode(65 + item.selectedIndex) : "—"}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    );
  }

  if (answer && typeof answer === "object" && !Array.isArray(answer)) {
    return (
      <dl className="prof-answer-list">
        {Object.entries(answer as Record<string, unknown>).map(([key, value]) => (
          <div key={key}>
            <dt>{answerLabels[key] ?? key}</dt>
            <dd>{key === "selectedIndex" && typeof value === "number" ? String.fromCharCode(65 + value) : displayAnswerValue(value)}</dd>
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
  const [error, setError] = useState("");
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);

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
        "Réponse détaillée",
        "Résultat",
        "Score",
        "Progression",
      ].map(csvCell).join(";");
      const csv = `\uFEFF${[header, ...payload.rows.map(attemptCsvRow)].join("\r\n")}`;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "reponses-eleves-2ac.csv";
      link.click();
      URL.revokeObjectURL(url);
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
          <button className="prof-export" type="button" onClick={() => void downloadCsv()} disabled={exporting}>
            <FileSpreadsheet size={18} />
            <span><strong>{exporting ? "Préparation…" : "Exporter Excel / CSV"}</strong><small>Filtres actuels</small></span>
            {exporting ? <LoaderCircle className="spin" size={17} /> : <Download size={17} />}
          </button>
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
          <Tabs defaultValue="attempts">
            <div className="prof-data-head">
              <TabsList className="prof-tabs-list">
                <TabsTrigger value="attempts">Tentatives <span>{data?.pagination.totalItems ?? 0}</span></TabsTrigger>
                <TabsTrigger value="progress">Progression <span>{data?.learners.length ?? 0}</span></TabsTrigger>
              </TabsList>
              {loading && <span className="prof-refreshing"><LoaderCircle className="spin" size={16} /> Actualisation…</span>}
            </div>

            <TabsContent value="attempts">
              {data && data.attempts.length > 0 ? (
                <>
                  <Table className="prof-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date et heure (Maroc)</TableHead>
                        <TableHead>Élève(s)</TableHead>
                        <TableHead>Classe</TableHead>
                        <TableHead>Séance</TableHead>
                        <TableHead>Activité</TableHead>
                        <TableHead>Résultat</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Progression</TableHead>
                        <TableHead>Détails</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.attempts.map((attempt) => (
                        <TableRow key={attempt.id}>
                          <TableCell><span className="prof-date"><Clock3 size={14} />{formatDateTime(attempt.createdAt)}</span></TableCell>
                          <TableCell><span className="prof-student-name"><strong>{studentName(attempt)}</strong><small>{attempt.isPair ? "Binôme" : "Individuel"}</small></span></TableCell>
                          <TableCell><span className="prof-class-badge">{attempt.className} · G{attempt.groupName}</span></TableCell>
                          <TableCell>S{String(attempt.sessionId).padStart(2, "0")}</TableCell>
                          <TableCell><span className="prof-activity"><strong>{activityLabels[attempt.activityType] ?? attempt.activityType}</strong><small>{attempt.activityId}</small></span></TableCell>
                          <TableCell>
                            <span className={`prof-result ${attempt.isCorrect === null ? "neutral" : attempt.isCorrect ? "good" : "bad"}`}>
                              {attempt.isCorrect === null ? "Non évalué" : attempt.isCorrect ? "Correct" : "Incorrect"}
                            </span>
                          </TableCell>
                          <TableCell>{attempt.score === null || attempt.maxScore === null ? "—" : <strong>{attempt.score}/{attempt.maxScore}</strong>}</TableCell>
                          <TableCell><span className="prof-mini-progress"><i><b style={{ width: `${Math.round((attempt.completedSessions / 15) * 100)}%` }} /></i><small>{attempt.completedSessions}/15</small></span></TableCell>
                          <TableCell><button className="prof-detail-button" onClick={() => setSelectedAttempt(attempt)}><Eye size={15} /> Voir</button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="prof-pagination">
                    <span>{data.pagination.totalItems} tentative(s) · page {data.pagination.page}/{data.pagination.totalPages}</span>
                    <div>
                      <button disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={17} /> Précédente</button>
                      <button disabled={page >= data.pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Suivante <ChevronRight size={17} /></button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="prof-empty"><Activity size={28} /><strong>Aucune tentative</strong><p>Aucune réponse ne correspond aux filtres sélectionnés.</p></div>
              )}
            </TabsContent>

            <TabsContent value="progress">
              {data && data.learners.length > 0 ? (
                <Table className="prof-table prof-progress-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Élève(s)</TableHead>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Classe et groupe</TableHead>
                      <TableHead>Tentatives</TableHead>
                      <TableHead>Séances terminées</TableHead>
                      <TableHead>Dernière tentative</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.learners.map((learner) => (
                      <TableRow key={learner.id}>
                        <TableCell><strong>{studentName(learner)}</strong></TableCell>
                        <TableCell>{learner.isPair ? "Binôme" : "Individuel"}</TableCell>
                        <TableCell><span className="prof-class-badge">{learner.className} · G{learner.groupName}</span></TableCell>
                        <TableCell><strong>{learner.totalAttempts}</strong></TableCell>
                        <TableCell><span className="prof-wide-progress"><i><b style={{ width: `${Math.round((learner.completedSessions / 15) * 100)}%` }} /></i><strong>{learner.completedSessions}/15</strong></span></TableCell>
                        <TableCell><span className="prof-date"><Clock3 size={14} />{formatDateTime(learner.lastAttemptAt)}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="prof-empty"><Users size={28} /><strong>Aucun élève</strong><p>Aucune inscription ne correspond aux filtres sélectionnés.</p></div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>

      <Dialog open={Boolean(selectedAttempt)} onOpenChange={(open) => { if (!open) setSelectedAttempt(null); }}>
        <DialogContent className="prof-answer-dialog">
          {selectedAttempt && (
            <>
              <DialogHeader>
                <span className="prof-dialog-kicker">{activityLabels[selectedAttempt.activityType] ?? selectedAttempt.activityType}</span>
                <DialogTitle>Réponse détaillée</DialogTitle>
                <DialogDescription>
                  {studentName(selectedAttempt)} · {selectedAttempt.className} · Groupe {selectedAttempt.groupName}
                </DialogDescription>
              </DialogHeader>
              <div className="prof-dialog-meta">
                <span><Clock3 size={15} />{formatDateTime(selectedAttempt.createdAt)}</span>
                <span>Séance {selectedAttempt.sessionId}</span>
                <span className={`prof-result ${selectedAttempt.isCorrect === null ? "neutral" : selectedAttempt.isCorrect ? "good" : "bad"}`}>
                  {selectedAttempt.isCorrect === null ? "Non évalué" : selectedAttempt.isCorrect ? "Correct" : "Incorrect"}
                </span>
                {selectedAttempt.score !== null && selectedAttempt.maxScore !== null && <strong>Score {selectedAttempt.score}/{selectedAttempt.maxScore}</strong>}
              </div>
              <AnswerDetails attempt={selectedAttempt} />
              <div className="prof-dialog-id"><span>Identifiant de l’activité</span><code>{selectedAttempt.activityId}</code></div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
