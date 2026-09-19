const endpoint = "https://xrwtcyliibooudyoovqo.supabase.co/functions/v1/informatique-2ac-api";
const publishableKey = "sb_publishable_3eVvxtKaHPzZfI4nSMrU-A_iPHGJUWt";
const teacherSessionKey = "lab2ac-teacher-session";

export type StudentProfile = {
  id: string;
  studentOne: string;
  studentTwo: string | null;
  className: string;
  groupName: string;
  isPair: boolean;
};

export type ProfessorFilters = {
  className: string;
  groupName: string;
  sessionId: string;
  search: string;
};

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: publishableKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      const error = new Error(data.error || "Service momentanément indisponible.") as Error & { status?: number };
      error.status = response.status;
      throw error;
    }
    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Le service met trop de temps à répondre. Réessayez.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function registerParticipant(payload: Omit<StudentProfile, "id">) {
  const data = await call<{ participant: StudentProfile }>({ action: "register", ...payload });
  return data.participant;
}

export function submitCourseAttempt(payload: Record<string, unknown>) {
  return call<{ saved: true }>({ action: "submit", ...payload });
}

export async function teacherLogin(password: string) {
  const data = await call<{ token: string; expiresIn: number }>({ action: "login", password });
  window.localStorage.setItem(teacherSessionKey, data.token);
  return data.token;
}

export function teacherToken() {
  return typeof window === "undefined" ? "" : window.localStorage.getItem(teacherSessionKey) || "";
}

export function teacherLogout() {
  if (typeof window !== "undefined") window.localStorage.removeItem(teacherSessionKey);
}

export function teacherDashboard<T>(filters: ProfessorFilters, page: number, token = teacherToken()) {
  return call<T>({ action: "dashboard", token, filters, page });
}

export function teacherExport<T>(filters: ProfessorFilters, token = teacherToken()) {
  return call<T>({ action: "export", token, filters });
}

export function teacherDeleteAllData(token = teacherToken()) {
  return call<{ deleted: true }>({ action: "delete_all_data", token, confirmation: "EFFACER" });
}
