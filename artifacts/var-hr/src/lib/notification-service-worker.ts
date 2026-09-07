const getBasePath = () => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
};

export const getNotificationServiceWorkerUrl = () =>
  `${getBasePath()}service-worker.js`;

export const registerNotificationServiceWorker =
  async (): Promise<ServiceWorkerRegistration | null> => {
    const isLocalDevelopmentAddress =
      typeof window !== 'undefined' &&
      ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      (!window.isSecureContext && !isLocalDevelopmentAddress)
    ) {
      return null;
    }

    return navigator.serviceWorker.register(getNotificationServiceWorkerUrl(), {
      scope: getBasePath(),
    });
  };