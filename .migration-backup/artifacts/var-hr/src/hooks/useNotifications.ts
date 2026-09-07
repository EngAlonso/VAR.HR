import {
  getListNotificationsQueryKey,
  type ListNotificationsParams,
  type Notification,
  type NotificationPage,
  type NotificationSubscriptionInput,
  useListNotifications,
  useMarkNotificationRead,
  useSubscribeToNotifications,
  useUnsubscribeFromNotifications,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { registerNotificationServiceWorker } from '@/lib/notification-service-worker';

const SUBSCRIPTION_STORAGE_KEY = 'var-hr:notifications:subscribed';
const DEFAULT_PAGE_SIZE = 8;
const DEFAULT_POLLING_INTERVAL = 30_000;

type NotificationPageWithCursor = NotificationPage & {
  hasNextPage?: boolean;
};

export interface UseNotificationsOptions {
  pageSize?: number;
  initialPage?: number;
  pollingInterval?: number;
}

export interface UseNotificationsResult {
  notifications: Notification[];
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  queryError: unknown;
  unreadCount: number;
  setPage: (page: number) => void;
  refetch: () => Promise<unknown>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  isMarking: boolean;
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  isSubscribed: boolean;
  isRegistering: boolean;
  isSubscribing: boolean;
  subscriptionError: string | null;
  requestPermission: () => Promise<NotificationPermission | null>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  clearErrors: () => void;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return fallback;
}

function readStoredSubscriptionState() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(SUBSCRIPTION_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeStoredSubscriptionState(value: boolean) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, String(value));
  } catch {
    // Private browsing modes can make localStorage unavailable.
  }
}

function isSecureNotificationContext() {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return (
    window.isSecureContext ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1'
  );
}

function toBase64Url(value: ArrayBuffer | null) {
  if (!value) throw new Error('Push subscription keys are unavailable.');
  const bytes = new Uint8Array(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function vapidKeyToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value.replace(/-/g, '+').replace(/_/g, '/')}${padding}`;
  const binary = window.atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function useNotifications(
  options: UseNotificationsOptions = {},
): UseNotificationsResult {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(Math.max(1, options.initialPage ?? 1));
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? DEFAULT_PAGE_SIZE));
  const pollingInterval = Math.max(
    5_000,
    options.pollingInterval ?? DEFAULT_POLLING_INTERVAL,
  );
  const [permission, setPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return window.Notification.permission;
  });
  const [isSubscribed, setIsSubscribed] = useState(readStoredSubscriptionState);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  const queryParams: ListNotificationsParams = { page, pageSize };
  const notificationsQuery = useListNotifications(queryParams, {
    query: {
      queryKey: getListNotificationsQueryKey(queryParams),
      refetchInterval: pollingInterval,
      refetchIntervalInBackground: false,
      retry: 1,
    },
  });
  const markReadMutation = useMarkNotificationRead();
  const subscribeMutation = useSubscribeToNotifications();
  const unsubscribeMutation = useUnsubscribeFromNotifications();

  const supported =
    typeof window !== 'undefined' &&
    isSecureNotificationContext() &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  const refreshNotifications = async () => {
    const queryKey = getListNotificationsQueryKey();
    await queryClient.invalidateQueries({ queryKey });
    return queryClient.refetchQueries({ queryKey });
  };

  useEffect(() => {
    if (!supported) return;

    let active = true;
    setIsRegistering(true);
    registerNotificationServiceWorker()
      .then(async (nextRegistration) => {
        if (!active || !nextRegistration) return;
        setRegistration(nextRegistration);
        const currentSubscription =
          await nextRegistration.pushManager.getSubscription();
        if (active && currentSubscription) {
          setIsSubscribed(true);
          writeStoredSubscriptionState(true);
        } else if (active) {
          setIsSubscribed(false);
          writeStoredSubscriptionState(false);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setSubscriptionError(
            getErrorMessage(error, 'Notification service is unavailable.'),
          );
        }
      })
      .finally(() => {
        if (active) setIsRegistering(false);
      });

    return () => {
      active = false;
    };
  }, [supported]);

  useEffect(() => {
    if (!supported || !('serviceWorker' in navigator)) return;

    const handleServiceWorkerMessage = (event: MessageEvent<unknown>) => {
      const message = event.data;
      if (
        message &&
        typeof message === 'object' &&
        'type' in message &&
        (message.type === 'NOTIFICATIONS_UPDATED' ||
          message.type === 'NEW_NOTIFICATION')
      ) {
        void refreshNotifications();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    return () =>
      navigator.serviceWorker.removeEventListener(
        'message',
        handleServiceWorkerMessage,
      );
  }, [supported, queryClient]);

  const requestPermission = async () => {
    setSubscriptionError(null);
    if (!supported) {
      setSubscriptionError(
        'Browser notifications require HTTPS or a local development address.',
      );
      return null;
    }

    try {
      const nextPermission = await window.Notification.requestPermission();
      setPermission(nextPermission);
      if (nextPermission === 'denied') {
        setSubscriptionError(
          'Notifications are blocked. Allow them in your browser settings to continue.',
        );
      }
      return nextPermission;
    } catch (error: unknown) {
      setSubscriptionError(
        getErrorMessage(error, 'Could not request notification permission.'),
      );
      return null;
    }
  };

  const subscribe = async () => {
    setSubscriptionError(null);
    if (!supported) {
      setSubscriptionError(
        'Browser notifications require HTTPS or a local development address.',
      );
      return false;
    }

    const nextPermission =
      permission === 'granted' ? permission : await requestPermission();
    if (nextPermission !== 'granted') return false;

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as
      | string
      | undefined;
    if (!vapidPublicKey) {
      setSubscriptionError(
        'Push notifications are not configured for this environment.',
      );
      return false;
    }

    try {
      const nextRegistration =
        registration ?? (await registerNotificationServiceWorker());
      if (!nextRegistration) {
        setSubscriptionError('Could not register the notification service.');
        return false;
      }
      setRegistration(nextRegistration);
      const pushSubscription =
        (await nextRegistration.pushManager.getSubscription()) ??
        (await nextRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKeyToUint8Array(vapidPublicKey),
        }));
      const payload: NotificationSubscriptionInput = {
        endpoint: pushSubscription.endpoint,
        p256dh: toBase64Url(pushSubscription.getKey('p256dh')),
        auth: toBase64Url(pushSubscription.getKey('auth')),
        userAgent: window.navigator.userAgent,
      };

      await subscribeMutation.mutateAsync({ data: payload });
      setIsSubscribed(true);
      writeStoredSubscriptionState(true);
      return true;
    } catch (error: unknown) {
      setSubscriptionError(
        getErrorMessage(error, 'Could not enable browser notifications.'),
      );
      return false;
    }
  };

  const unsubscribe = async () => {
    setSubscriptionError(null);
    try {
      const nextRegistration =
        registration ?? (await registerNotificationServiceWorker());
      const pushSubscription =
        await nextRegistration?.pushManager.getSubscription();
      if (pushSubscription) {
        await unsubscribeMutation.mutateAsync({
          data: { endpoint: pushSubscription.endpoint },
        });
        await pushSubscription.unsubscribe();
      }
      setIsSubscribed(false);
      writeStoredSubscriptionState(false);
      return true;
    } catch (error: unknown) {
      setSubscriptionError(
        getErrorMessage(error, 'Could not disable browser notifications.'),
      );
      return false;
    }
  };

  const markAsRead = async (id: string) => {
    setSubscriptionError(null);
    try {
      await markReadMutation.mutateAsync({ id, data: { isRead: true } });
      await refreshNotifications();
      return true;
    } catch (error: unknown) {
      setSubscriptionError(getErrorMessage(error, 'Could not update notification.'));
      return false;
    }
  };

  const pageData = notificationsQuery.data as NotificationPageWithCursor | undefined;
  const notifications = pageData?.items ?? [];
  const totalPages = pageData?.totalPages ?? 1;
  const hasNextPage =
    pageData?.hasNextPage ?? page < Math.max(1, totalPages);
  const unreadCount = notifications.reduce(
    (count, notification) => count + (notification.isRead ? 0 : 1),
    0,
  );

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.isRead,
    );
    if (unreadNotifications.length === 0) return true;

    setSubscriptionError(null);
    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          markReadMutation.mutateAsync({
            id: notification.id,
            data: { isRead: true },
          }),
        ),
      );
      await refreshNotifications();
      return true;
    } catch (error: unknown) {
      setSubscriptionError(
        getErrorMessage(error, 'Could not mark all notifications as read.'),
      );
      return false;
    }
  };

  return {
    notifications,
    page,
    pageSize,
    totalPages,
    hasNextPage,
    isLoading: notificationsQuery.isLoading,
    isFetching: notificationsQuery.isFetching,
    isError: notificationsQuery.isError,
    queryError: notificationsQuery.error,
    unreadCount,
    setPage: (nextPage) => setPage(Math.max(1, Math.min(nextPage, Math.max(1, totalPages)))),
    refetch: notificationsQuery.refetch,
    markAsRead,
    markAllAsRead,
    isMarking: markReadMutation.isPending,
    supported,
    permission,
    isSubscribed,
    isRegistering,
    isSubscribing:
      subscribeMutation.isPending || unsubscribeMutation.isPending,
    subscriptionError,
    requestPermission,
    subscribe,
    unsubscribe,
    clearErrors: () => setSubscriptionError(null),
  };
}