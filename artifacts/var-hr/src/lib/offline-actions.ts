export type OfflineActionKind = "attendance" | "work-location";

export type OfflineAction = {
  id: string;
  employeeId: string;
  kind: OfflineActionKind;
  path: string;
  body: Record<string, unknown>;
  createdAt: string;
};

const DATABASE_NAME = "var-hr-offline";
const STORE_NAME = "queued-actions";
const DATABASE_VERSION = 1;

function notifyQueueChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("varhr-offline-queue-updated"));
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("OFFLINE_STORAGE_UNAVAILABLE"));
      return;
    }
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("employeeId", "employeeId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("OFFLINE_STORAGE_FAILED"));
  });
}

export async function enqueueOfflineAction(action: OfflineAction): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(action);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("OFFLINE_QUEUE_FAILED"));
      transaction.onabort = () => reject(transaction.error ?? new Error("OFFLINE_QUEUE_ABORTED"));
    });
  } finally {
    database.close();
  }
  notifyQueueChanged();
}

export async function listOfflineActions(employeeId: string): Promise<OfflineAction[]> {
  const database = await openDatabase();
  try {
    return await new Promise<OfflineAction[]>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).index("employeeId").getAll(employeeId);
      request.onsuccess = () =>
        resolve((request.result as OfflineAction[]).sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      request.onerror = () => reject(request.error ?? new Error("OFFLINE_QUEUE_READ_FAILED"));
    });
  } finally {
    database.close();
  }
}

export async function removeOfflineAction(id: string): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("OFFLINE_QUEUE_DELETE_FAILED"));
    });
  } finally {
    database.close();
  }
  notifyQueueChanged();
}

export async function getOfflineActionCount(employeeId: string): Promise<number> {
  return (await listOfflineActions(employeeId)).length;
}

let syncInProgress: Promise<{ synced: number; remaining: number }> | null = null;
let retryTimer: number | null = null;
let retryEmployeeId: string | null = null;

function ensureAutomaticRetry(employeeId: string): void {
  if (typeof window === "undefined") return;
  retryEmployeeId = employeeId;
  if (retryTimer !== null) return;
  // Network state events are unreliable on some mobile browsers. Keep retrying
  // while the attendance page is open, even if navigator.onLine is stale.
  retryTimer = window.setInterval(() => {
    if (retryEmployeeId) void syncOfflineActions(retryEmployeeId);
  }, 15000);
}

export function syncOfflineActions(
  employeeId: string,
): Promise<{ synced: number; remaining: number }> {
  ensureAutomaticRetry(employeeId);
  if (syncInProgress) return syncInProgress;
  syncInProgress = runOfflineSync(employeeId).finally(() => {
    syncInProgress = null;
  });
  return syncInProgress;
}

async function runOfflineSync(
  employeeId: string,
): Promise<{ synced: number; remaining: number }> {
  const actions = await listOfflineActions(employeeId);
  let synced = 0;
  for (const action of actions) {
    let response: Response;
    try {
      const body = action.kind === "attendance" && !("capturedAt" in action.body)
        ? { ...action.body, capturedAt: action.createdAt }
        : action.body;
      response = await fetch(action.path, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      // Keep the action in IndexedDB. The periodic retry will try again.
      break;
    }
    if (!response.ok) {
      const errorText = await response.clone().text().catch(() => "");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("varhr-offline-sync-error", {
          detail: { status: response.status, message: errorText.slice(0, 500), actionId: action.id },
        }));
      }
      break;
    }
    const result = await response.json().catch(() => null);
    if (action.kind === "work-location" && result?.duplicate !== true && response.status !== 201) {
      break;
    }
    await removeOfflineAction(action.id);
    synced += 1;
  }
  const remaining = await getOfflineActionCount(employeeId);
  if (synced > 0 && typeof window !== "undefined") {
    window.dispatchEvent(new Event("varhr-offline-sync-complete"));
  }
  return { synced, remaining };
}
