import { Mentoria, mentorias } from './mvp-data';

const CREATED_KEY = 'hipatec_mentorias_criadas';
const ENROLL_KEY = 'hipatec_mentorias_inscritas';

export function loadCreatedMentorias(): Mentoria[] {
  try {
    const raw = localStorage.getItem(CREATED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCreatedMentorias(items: Mentoria[]) {
  try { localStorage.setItem(CREATED_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}

export function loadAllMentorias(): Mentoria[] {
  return [...mentorias, ...loadCreatedMentorias()];
}

export function findMentoria(id: number): Mentoria | undefined {
  return loadAllMentorias().find(item => item.id === id);
}

export function loadInscritas(): number[] {
  try {
    const raw = localStorage.getItem(ENROLL_KEY);
    return raw ? JSON.parse(raw) : [1];
  } catch {
    return [1];
  }
}

export function saveInscritas(ids: number[]) {
  try { localStorage.setItem(ENROLL_KEY, JSON.stringify(ids)); } catch { /* ignore */ }
}

export function upsertMentoria(mentoria: Mentoria) {
  const created = loadCreatedMentorias();
  const exists = created.some(item => item.id === mentoria.id);
  saveCreatedMentorias(exists ? created.map(item => item.id === mentoria.id ? mentoria : item) : [mentoria, ...created]);
}
