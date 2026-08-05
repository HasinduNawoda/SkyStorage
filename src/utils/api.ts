/**
 * Real backend auth client — replaces src/utils/localAuth.ts now that a
 * real API exists. Same function names/shapes as before (getSession, login,
 * signUp, logout) so App.tsx's usage barely changes.
 *
 * `credentials: "include"` on every call is required — it's what tells the
 * browser to send/receive the httpOnly session cookies the backend sets.
 * Without it, the backend would issue cookies the browser would just drop.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export type Session = { id: string; name: string; email: string };

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

/** Checks whether the browser currently has a valid session, e.g. on page load. */
export async function getSession(): Promise<Session | null> {
  try {
    return await apiFetch("/auth/me");
  } catch {
    return null; // not logged in, or the token expired — either way, no session
  }
}

export async function signUp(name: string, email: string, password: string): Promise<Session> {
  return apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(email: string, password: string): Promise<Session> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST" });
}

export type ApiFolder = {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  isFavorite: boolean;
  deletedAt: string | null;
  createdAt: string;
};

/** Fetches every folder this user owns, in one call — the frontend keeps the
 *  whole tree in memory for its client-side filtering/search logic. */
export async function getAllFolders(): Promise<ApiFolder[]> {
  return apiFetch("/folders?all=true");
}

export async function createFolder(name: string, parentId: string | null): Promise<ApiFolder> {
  return apiFetch("/folders", {
    method: "POST",
    body: JSON.stringify({ name, parentId }),
  });
}