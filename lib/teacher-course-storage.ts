import { clearAnswerSnapshots } from "./learning-storage";
import { teacherDemoProfile } from "./teacher-course-context";

export const teacherDemoResetKey = "lab2ac-teacher-demo-answers-reset";

export function clearTeacherDemoAnswers(clearSaved = true) {
  const { id } = teacherDemoProfile;
  clearAnswerSnapshots(id, clearSaved);
  sessionStorage.removeItem(`lab2ac-session3-bilan-v5-${id}`);

  // Other tabs share localStorage. They only need to discard their in-memory and per-tab answers.
  if (!clearSaved) return;
  for (let sessionId = 1; sessionId <= 3; sessionId++) {
    localStorage.removeItem(`lab2ac-unit1-session-${sessionId}-${id}`);
  }
  localStorage.removeItem(`lab2ac-progress-${id}`);
  localStorage.setItem(teacherDemoResetKey, String(Date.now()));
}
