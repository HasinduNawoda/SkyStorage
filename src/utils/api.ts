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

export type Session = { id: string; name: string; email: string; profilePhoto?: string | null };

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

export async function updateFolder(
  id: string,
  data: { name?: string; parentId?: string | null; isFavorite?: boolean; deletedAt?: string | null }
): Promise<ApiFolder> {
  return apiFetch(`/folders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteFolder(id: string): Promise<void> {
  await apiFetch(`/folders/${id}`, { method: "DELETE" });
}

export type ApiFile = {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  folderId: string | null;
  ownerId: string;
  isFavorite: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getAllFiles(): Promise<ApiFile[]> {
  return apiFetch("/files?all=true");
}

export async function createFile(data: {
  name: string;
  sizeBytes: number;
  mimeType: string;
  folderId?: string | null;
}): Promise<ApiFile & { storageKey: string; uploadUrl: string }> {
  return apiFetch("/files", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFile(
  id: string,
  data: { name?: string; folderId?: string | null; isFavorite?: boolean; deletedAt?: string | null }
): Promise<ApiFile> {
  return apiFetch(`/files/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteFile(id: string): Promise<void> {
  await apiFetch(`/files/${id}`, { method: "DELETE" });
}

/** Upload raw file bytes to our backend proxy (which forwards to Oracle).
 *  Uses application/octet-stream so express.raw() on the server can parse it. */
export async function uploadFileBytes(fileId: string, file: File): Promise<void> {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const res = await fetch(`${API_BASE}/files/${fileId}/upload`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/octet-stream" },
    body: file,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Upload failed.");
  }
}

/** Download file bytes from our backend proxy (which streams from Oracle). */
export async function downloadFileBlob(fileId: string): Promise<Blob> {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const res = await fetch(`${API_BASE}/files/${fileId}/download`, {
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Download failed.");
  }
  return res.blob();
}

export type ApiShare = {
  id: string;
  fileId: string | null;
  folderId: string | null;
  ownerId: string;
  sharedWith: string | null;
  role: string;
  message: string | null;
  token: string;
  createdAt: string;
  file?: ApiFile;
  folder?: ApiFolder;
  owner?: { name: string; email: string };
};

export async function createShare(data: { fileId?: string; folderId?: string; sharedWith?: string; role?: string; message?: string }): Promise<ApiShare> {
  return apiFetch("/shares", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMyShares(): Promise<ApiShare[]> {
  return apiFetch("/shares/mine");
}

export async function getSharesWithMe(): Promise<ApiShare[]> {
  return apiFetch("/shares/with-me");
}

export async function deleteShare(id: string): Promise<void> {
  await apiFetch(`/shares/${id}`, { method: "DELETE" });
}