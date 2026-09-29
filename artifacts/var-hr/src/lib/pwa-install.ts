export type PwaInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

let deferredInstallPrompt: PwaInstallPromptEvent | null = null;
let initialized = false;
const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach((subscriber) => subscriber());
}

export function initializePwaInstall() {
  if (
    initialized ||
    typeof window === "undefined" ||
    !("addEventListener" in window)
  ) {
    return;
  }

  initialized = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event as PwaInstallPromptEvent;
    notifySubscribers();
  });
}

export function getPwaInstallPrompt() {
  return deferredInstallPrompt;
}

export function subscribeToPwaInstall(subscriber: () => void) {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}

export function clearPwaInstallPrompt() {
  deferredInstallPrompt = null;
  notifySubscribers();
}