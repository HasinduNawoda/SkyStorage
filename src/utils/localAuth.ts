/**
 * Temporary, frontend-only auth store.
 *
 * There is no backend yet, so this persists accounts and the active
 * session in `localStorage` — purely so sign up -> sign out -> sign back
 * in (and refreshing the page) actually works end-to-end while the rest
 * of the app is being built.
 *
 * TODO(backend): delete this file once real auth endpoints exist (e.g.
 * POST /auth/signup, POST /auth/login) and have App.tsx call those
 * instead — see the TODO(backend) comments there. Passwords here are only
 * hashed client-side with SHA-256, not securely salted/hashed server-side,
 * so this must never be used to store real user data.
 */

type StoredUser = { name: string; email: string; passwordHash: string };
export type Session = { name: string; email: string };

const USERS_KEY = "skystorage_users";
const SESSION_KEY = "skystorage_session";

async function hash(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Returns the signed-in user, if any — used to keep the user signed in across page refreshes. */
export function getSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export async function signUp(name: string, email: string, password: string): Promise<Session> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  if (users.some((u) => u.email === normalizedEmail)) {
    throw new Error("An account with that email already exists.");
  }
  const passwordHash = await hash(password);
  users.push({ name: name.trim(), email: normalizedEmail, passwordHash });
  saveUsers(users);

  const session: Session = { name: name.trim(), email: normalizedEmail };
  saveSession(session);
  return session;
}

export async function login(email: string, password: string): Promise<Session> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const user = users.find((u) => u.email === normalizedEmail);
  const passwordHash = await hash(password);

  if (!user || user.passwordHash !== passwordHash) {
    throw new Error("Incorrect email or password.");
  }

  const session: Session = { name: user.name, email: user.email };
  saveSession(session);
  return session;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
