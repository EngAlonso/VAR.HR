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

export function syncOfflineActions(
  employeeId: string,
): Promise<{ synced: number; remaining: number }> {
  if (syncInProgress) return syncInProgress;
  syncInProgress = runOfflineSync(employeeId).finally(() => {
    syncInProgress = null;
  });
  return syncInProgress;
}

async function runOfflineSync(
  employeeId: string,
): Promise<{ synced: number; remaining: number }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { synced: 0, remaining: await getOfflineActionCount(employeeId) };
  }
  const actions = await listOfflineActions(employeeId);
  let synced = 0;
  for (const action of actions) {
    let response: Response;
    try {
      response = await fetch(action.path, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(action.body),
      });
    } catch {
      break;
    }
    if (!response.ok) break;
    const result = await response.json().catch(() => null);
    if (action.kind === "work-location" && result?.duplicate !== true && response.status !== 201) {
      break;
    }
    await removeOfflineAction(action.id);
    synced += 1;
  }
  return { synced, remaining: await getOfflineActionCount(employeeId) };
}
