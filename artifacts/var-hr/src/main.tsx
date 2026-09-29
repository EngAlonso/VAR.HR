import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import { registerNotificationServiceWorker } from '@/lib/notification-service-worker';
import { initializePwaInstall } from '@/lib/pwa-install';

import './index.css';

if (typeof window !== 'undefined') {
  // Register before React mounts so beforeinstallprompt cannot be missed
  // while authentication and workspace data are loading.
  initializePwaInstall();

  const register = () => {
    void registerNotificationServiceWorker();
  };

  if (document.readyState === 'loading') {
    window.addEventListener('load', register, { once: true });
  } else {
    register();
  }
}

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
