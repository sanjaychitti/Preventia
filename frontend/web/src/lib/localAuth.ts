/**
 * Local-auth layer — works entirely in localStorage while the backend is offline.
 * When the Spring Boot API is live, swap the register/login functions to hit
 * POST /api/auth/register and POST /api/auth/login instead.
 */

export type UserRole = 'DOCTOR' | 'PATIENT';

export interface LocalUser {
  email: string;
  passwordHash: string;   // stored as btoa(password) — good enough for demo
  role: UserRole;
  name: string;
}

const STORE_KEY = 'preventia_users';

function load(): LocalUser[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function save(users: LocalUser[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(users));
}

export function registerUser(email: string, password: string, role: UserRole, name: string): { ok: true } | { ok: false; message: string } {
  const users = load();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, message: 'Email already registered.' };
  }
  users.push({ email: email.toLowerCase(), passwordHash: btoa(password), role, name });
  save(users);
  return { ok: true };
}

export function loginUser(email: string, password: string): { ok: true; user: LocalUser } | { ok: false; message: string } {
  const users = load();
  if (users.length === 0) {
    return { ok: false, message: 'No account found. Please register first.' };
  }
  const user = users.find(u => u.email === email.toLowerCase());
  if (!user) return { ok: false, message: 'No account found for this email.' };
  if (user.passwordHash !== btoa(password)) return { ok: false, message: 'Incorrect password.' };
  return { ok: true, user };
}

export function currentUser(): LocalUser | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('preventia_current_user') ?? 'null');
  } catch {
    return null;
  }
}

export function setCurrentUser(user: LocalUser | null) {
  if (user) {
    localStorage.setItem('preventia_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('preventia_current_user');
  }
}

export function logout() {
  localStorage.removeItem('preventia_current_user');
  localStorage.removeItem('preventia_token');
}
