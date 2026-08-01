//
// Use a unified fetch; must include credentials so HttpOnly cookies are sent.

// Production is served behind one Vercel domain, so API requests must stay
// same-origin. VITE_API_URL is intentionally only honored by the dev server.
export const API = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL || "http://localhost:3000"
  : "";

export async function api(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? { ...(options.headers || {}) }
    : { "Content-Type": "application/json", ...(options.headers || {}) };

  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers,
    ...options
  });
  let data = {};
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    const error = new Error(data?.error || `HTTP ${res.status}: ${res.statusText}`);
    error.status = res.status;
    error.statusText = res.statusText;
    error.data = data;
    throw error;
  }
  return data;
}

export async function getArticles() {
  return await api("/api/articles");
}

export async function getArticleById(id) {
  return await api(`/api/articles/${id}`);
}

export function getResourceUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/avatars/")) {
    return path;
  }
  return `${API}${path}`;
}
