const STORAGE_KEY = "twc_client_id";

function generateId() {
  // Prefer crypto.randomUUID when available
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback
  return `cid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getOrCreateClientId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = generateId();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    // If storage is blocked, still provide a session id (won't persist)
    return generateId();
  }
}

export function resetClientId() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
