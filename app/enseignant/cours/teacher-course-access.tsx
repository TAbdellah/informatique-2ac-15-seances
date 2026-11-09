"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, BookOpen, GraduationCap, LoaderCircle, LockKeyhole, LogOut, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import HomePage from "../../page";
import { TeacherCourseScope } from "../../../lib/teacher-course-context";
import { clearTeacherDemoAnswers, teacherDemoResetKey } from "../../../lib/teacher-course-storage";
import { teacherCourseAccess, teacherLogin, teacherLogout, teacherToken } from "../../../lib/supabase-api";

type Grant = { token: string; expiresAt: number };
const resetError = "Impossible d’effacer toutes les réponses de démonstration. Réessayez.";

export default function TeacherCourseAccess() {
  const [grant, setGrant] = useState<Grant | null>(null);
  const grantRef = useRef<Grant | null>(null);
  const requestRef = useRef(0);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetStatus, setResetStatus] = useState<"done" | "error" | null>(null);
  const [courseRevision, setCourseRevision] = useState(0);

  const resetAnswers = useCallback((clearSaved: boolean) => {
    try {
      clearTeacherDemoAnswers(clearSaved);
      setCourseRevision(revision => revision + 1);
      setResetOpen(false);
      setResetStatus("done");
    } catch {
      setResetStatus("error");
    }
  }, []);

  useEffect(() => {
    function onReset(event: StorageEvent) {
      if (event.key === teacherDemoResetKey && event.newValue) resetAnswers(false);
    }
    window.addEventListener("storage", onReset);
    return () => window.removeEventListener("storage", onReset);
  }, [resetAnswers]);

  const authorize = useCallback(async (token: string) => {
    const request = ++requestRef.current;
    if (!token) {
      grantRef.current = null; setGrant(null); setChecking(false);
      return;
    }
    if (grantRef.current && grantRef.current.token !== token) {
      grantRef.current = null; setGrant(null);
    }
    try {
      const result = await teacherCourseAccess(token);
      if (request !== requestRef.current || teacherToken() !== token) return;
      const expiresAt = Date.parse(result.expiresAt);
      if (result.role !== "teacher" || !Number.isFinite(expiresAt) || expiresAt <= Date.now()
        || !Array.from({ length: 15 }, (_, i) => i + 1).every(id => result.sessionIds.includes(id))) {
        throw Object.assign(new Error("Votre session professeur a expiré. Reconnectez-vous."), { status: 401 });
      }
      const next = { token, expiresAt };
      grantRef.current = next; setGrant(next); setError("");
    } catch (cause) {
      if (request !== requestRef.current || teacherToken() !== token) return;
      const status = (cause as Error & { status?: number }).status;
      if (status === 401 || status === 403 || !grantRef.current || grantRef.current.expiresAt <= Date.now() || grantRef.current.token !== token) {
        grantRef.current = null; setGrant(null);
      }
      if (status === 401 || status === 403) teacherLogout();
      setError(cause instanceof Error ? cause.message : "Connexion impossible. Réessayez.");
    } finally {
      if (request === requestRef.current) setChecking(false);
    }
  }, []);

  useEffect(() => {
    const refresh = () => { void authorize(teacherToken()); };
    const visible = () => { if (document.visibilityState === "visible") refresh(); };
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("storage", refresh);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", visible);
    return () => {
      ++requestRef.current;
      window.clearInterval(timer);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [authorize]);

  useEffect(() => {
    if (!grant) return;
    const timer = window.setTimeout(() => {
      ++requestRef.current;
      if (teacherToken() === grant.token) teacherLogout();
      grantRef.current = null; setGrant(null);
      setError("Votre session professeur a expiré. Reconnectez-vous.");
    }, Math.max(0, grant.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [grant]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const token = await teacherLogin(password);
      setPassword("");
      await authorize(token);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Connexion impossible. Réessayez.");
    } finally { setBusy(false); }
  }

  function logout() {
    ++requestRef.current; teacherLogout(); grantRef.current = null; setGrant(null); setError("");
  }

  if (checking) return <main className="teacher-course-login"><div role="status"><LoaderCircle className="spin" /> Vérification de la connexion professeur…</div></main>;

  if (!grant) return <main className="teacher-course-login">
    <section className="teacher-course-login-card">
      <a className="teacher-course-back" href="../"><ArrowLeft size={17} /> Espace enseignant</a>
      <span className="teacher-course-symbol"><GraduationCap size={32} /></span>
      <p className="teacher-course-eyebrow">LAB·2AC · ACCÈS ENSEIGNANT</p>
      <h1>Vos cours, en accès libre.</h1>
      <p>Ouvrez les 15 séances et rejoignez immédiatement l’exercice à expliquer à votre classe.</p>
      <form onSubmit={login}>
        <label htmlFor="teacher-course-password"><LockKeyhole size={16} /> Mot de passe professeur</label>
        <input id="teacher-course-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} disabled={busy} />
        <small>Le même mot de passe que votre espace enseignant.</small>
        {error && <p className="teacher-course-error" role="alert">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? <LoaderCircle size={18} className="spin" /> : <BookOpen size={18} />}{busy ? "Connexion…" : "Ouvrir mes cours"}</button>
      </form>
      <p className="teacher-course-demo-note">Vos démonstrations ne sont pas enregistrées dans les résultats des élèves.</p>
    </section>
  </main>;

  return <div className="teacher-course-root">
    <Dialog open={resetOpen} onOpenChange={open => { setResetOpen(open); if (open) setResetStatus(null); }}>
      <header className="teacher-course-bar">
        <div><GraduationCap size={23} /><span><strong>Mode professeur</strong><small>15 séances ouvertes · navigation libre · démonstration sans note élève</small></span></div>
        <nav aria-label="Compte professeur">
          <a href="../"><ArrowLeft size={16} /> Tableau de bord</a>
          <DialogTrigger asChild><button type="button"><Trash2 size={16} /> Effacer mes réponses</button></DialogTrigger>
          <button type="button" onClick={logout}><LogOut size={16} /> Déconnexion</button>
        </nav>
      </header>
      <DialogContent className="prof-delete-dialog teacher-course-reset-dialog" showCloseButton={false}>
        <DialogHeader>
          <span className="prof-delete-icon"><Trash2 size={24} aria-hidden="true" /></span>
          <DialogTitle>Effacer vos réponses de démonstration ?</DialogTitle>
          <DialogDescription>Cette action remet à zéro vos exercices et évaluations de démonstration dans ce navigateur.</DialogDescription>
        </DialogHeader>
        {resetStatus === "error" && <p className="teacher-course-connection" role="alert">{resetError}</p>}
        <div className="prof-delete-actions">
          <button type="button" onClick={() => setResetOpen(false)}>Annuler</button>
          <button type="button" className="danger" onClick={() => resetAnswers(true)}>Effacer les réponses</button>
        </div>
      </DialogContent>
    </Dialog>
    {error && <p className="teacher-course-connection" role="status">{error} Votre accès reste valable jusqu’à l’expiration de votre session.</p>}
    {resetStatus === "done" && <p className="teacher-course-reset-status" role="status">Vos réponses de démonstration ont été effacées.</p>}
    {resetStatus === "error" && !resetOpen && <p className="teacher-course-connection" role="alert">{resetError}</p>}
    <TeacherCourseScope><HomePage key={courseRevision} /></TeacherCourseScope>
  </div>;
}
