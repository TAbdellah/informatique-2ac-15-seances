"use client";

import { CheckCircle2, Eye, GraduationCap, Target } from "lucide-react";
import { revisionBilanActivityId, revisionMissionOrder, revisionWorkshopTargets } from "../revision-workshop-data";

export type Session5Attempt = {
  id: string;
  sessionId: number;
  activityId: string;
  activityType: string;
  isCorrect: number | boolean | null;
  score: number | null;
  maxScore: number | null;
  createdAt: string;
  responseJson: string;
};

export function revisionSessionSummary(attempts: Session5Attempt[]) {
  const rows = attempts.filter(attempt => attempt.sessionId === 5);
  const targetIds = new Set(revisionWorkshopTargets.map(target => target.id));
  const workshopRows = rows.filter(attempt => attempt.activityType === "workshop" && targetIds.has(attempt.activityId));
  const attemptedIds = new Set(workshopRows.map(attempt => attempt.activityId));
  const successfulIds = new Set(workshopRows.filter(attempt => Boolean(attempt.isCorrect)).map(attempt => attempt.activityId));
  const graded = workshopRows.filter(attempt => attempt.isCorrect !== null);
  const correct = graded.filter(attempt => Boolean(attempt.isCorrect)).length;
  const bestBilan = rows
    .filter(attempt => attempt.activityId === revisionBilanActivityId && attempt.score !== null && attempt.maxScore !== null && attempt.maxScore > 0)
    .sort((left, right) => {
      const scoreDifference = right.score! / right.maxScore! - left.score! / left.maxScore!;
      return scoreDifference || Date.parse(right.createdAt) - Date.parse(left.createdAt);
    })[0] ?? null;
  const competencies = revisionMissionOrder.map(mission => {
    const targets = revisionWorkshopTargets.filter(target => target.mission === mission);
    const passed = targets.filter(target => successfulIds.has(target.id)).length;
    return { mission, passed, total: targets.length, percentage: Math.round(100 * passed / targets.length) };
  });
  return {
    rows,
    attempts: rows.length,
    attempted: attemptedIds.size,
    successful: successfulIds.size,
    total: revisionWorkshopTargets.length,
    graded: graded.length,
    correct,
    successRate: graded.length ? Math.round(100 * correct / graded.length) : 0,
    bestBilan,
    competencies,
    competencyText: competencies.map(item => `${item.mission}: ${item.passed}/${item.total}`).join(" · "),
  };
}

export default function Session5TeacherReport({ attempts, onOpenAttempt }: { attempts: Session5Attempt[]; onOpenAttempt: (attempt: Session5Attempt) => void }) {
  const summary = revisionSessionSummary(attempts);
  if (!summary.rows.length) return null;
  const progressPercent = Math.round(100 * summary.successful / summary.total);
  const bilanPercent = summary.bestBilan ? Math.round(100 * summary.bestBilan.score! / summary.bestBilan.maxScore!) : null;

  return (
    <section className="prof-session2-report" aria-label="Bilan de la séance de révision">
      <div className="prof-session2-head">
        <div><small>SÉANCE 05 · BILAN PÉDAGOGIQUE</small><strong>Révision générale avant les évaluations</strong></div>
        <span>{summary.attempts} envoi(s)</span>
      </div>
      <div className="prof-session2-overview">
        <article className="prof-session2-progress-card">
          <div className="prof-progress-ring" style={{ "--progress": `${progressPercent * 3.6}deg` } as React.CSSProperties}>
            <span><strong>{progressPercent}%</strong><small>maîtrise</small></span>
          </div>
          <div><strong>{summary.successful}/{summary.total}</strong><span>activités différentes réussies</span></div>
        </article>
        <article className="prof-session2-score-card">
          <span className="prof-session2-card-icon"><GraduationCap size={20} /></span>
          <div><small>BILAN DE PRÉPARATION</small><strong>{summary.bestBilan ? `${summary.bestBilan.score}/20` : "—"}</strong><span>{bilanPercent === null ? "Bilan non remis" : `${bilanPercent}% sur la première réponse`}</span></div>
        </article>
        <article className="prof-session2-score-card success">
          <span className="prof-session2-card-icon"><Target size={20} /></span>
          <div><small>RÉUSSITE DES ENVOIS</small><strong>{summary.successRate}%</strong><span>{summary.correct}/{summary.graded} réponses corrigées réussies</span></div>
        </article>
      </div>
      <section className="prof-evaluation-path" aria-label="Bilan de préparation de la révision">
        <header>
          <div><small>PARCOURS DE 60 MINUTES</small><strong>5 missions · 16 activités · bilan sur 20</strong></div>
          <span className={summary.bestBilan ? "complete" : "pending"}>{summary.bestBilan ? `${summary.bestBilan.score}/20` : `${summary.attempted}/${summary.total} activités envoyées`}</span>
        </header>
        <footer>
          <span>Le bilan mesure les premières réponses avant correction ; la maîtrise indique les activités finalement réussies.</span>
          {summary.bestBilan && <button type="button" className="prof-detail-button" onClick={() => onOpenAttempt(summary.bestBilan!)}><Eye size={15} /> Consulter le bilan</button>}
        </footer>
      </section>
      <div className="prof-competency-title"><strong>Maîtrise par mission</strong><span>Chaque activité doit être réussie pour valider la mission.</span></div>
      <div className="prof-competency-grid">
        {summary.competencies.map(item => (
          <article className={item.percentage === 100 ? "acquired" : item.percentage > 0 ? "progress" : "missing"} key={item.mission}>
            <div><strong>{item.mission}</strong><span>{item.percentage}%</span></div>
            <i><b style={{ width: `${item.percentage}%` }} /></i>
            <footer><small>{item.percentage === 100 ? "Acquis" : item.percentage > 0 ? "En cours" : "À travailler"}</small><span>{item.passed}/{item.total} activités</span></footer>
          </article>
        ))}
      </div>
      <details>
        <summary><CheckCircle2 size={16} /> État des 16 activités</summary>
        <ul>{revisionWorkshopTargets.map(target => <li key={target.id}><strong>{target.title}</strong> · {summary.successful && summary.rows.some(row => row.activityId === target.id && Boolean(row.isCorrect)) ? "Acquis" : summary.rows.some(row => row.activityId === target.id) ? "En cours d’acquisition" : "Non évalué"}</li>)}</ul>
      </details>
    </section>
  );
}
