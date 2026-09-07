import {
  Bell,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  ClipboardCheck,
  FileText,
  Info,
  LoaderCircle,
  Megaphone,
  ShieldAlert,
  WalletCards,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Notification } from '@workspace/api-client-react';

import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type SupportedLocale = 'en' | 'ar' | 'fr' | 'de';

interface NotificationCopy {
  title: string;
  markAll: string;
  emptyTitle: string;
  emptyDescription: string;
  loadError: string;
  retry: string;
  previous: string;
  next: string;
  page: string;
  enableTitle: string;
  enableDescription: string;
  enable: string;
  enabled: string;
  disable: string;
  blocked: string;
  secureOnly: string;
  noUnread: string;
  notificationsOn: string;
  notificationEnabled: string;
  notificationDisabled: string;
}

const englishCopy: NotificationCopy = {
  title: 'Notifications',
  markAll: 'Mark all as read',
  emptyTitle: 'You are all caught up',
  emptyDescription: 'New updates from your HR workspace will appear here.',
  loadError: 'We could not load your notifications.',
  retry: 'Try again',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
  enableTitle: 'Stay in the loop',
  enableDescription: 'Get a browser alert when something needs your attention.',
  enable: 'Enable notifications',
  enabled: 'Browser notifications are on.',
  disable: 'Turn off',
  blocked: 'Notifications are blocked in your browser settings.',
  secureOnly: 'Browser notifications need HTTPS or localhost.',
  noUnread: 'No unread notifications',
  notificationsOn: 'Notifications enabled',
  notificationEnabled: 'Browser notifications enabled.',
  notificationDisabled: 'Browser notifications disabled.',
};

const arabicCopy: NotificationCopy = {
  title: 'الإشعارات',
  markAll: 'تحديد الكل كمقروء',
  emptyTitle: 'لا توجد تحديثات جديدة',
  emptyDescription: 'ستظهر تحديثات مساحة عمل الموارد البشرية هنا.',
  loadError: 'تعذر تحميل الإشعارات.',
  retry: 'إعادة المحاولة',
  previous: 'الصفحة السابقة',
  next: 'الصفحة التالية',
  page: 'الصفحة',
  enableTitle: 'ابقَ على اطلاع',
  enableDescription: 'احصل على تنبيه عند وجود شيء يحتاج إلى انتباهك.',
  enable: 'تفعيل الإشعارات',
  enabled: 'إشعارات المتصفح مفعلة.',
  disable: 'إيقاف',
  blocked: 'الإشعارات محظورة من إعدادات المتصفح.',
  secureOnly: 'تحتاج إشعارات المتصفح إلى HTTPS أو localhost.',
  noUnread: 'لا توجد إشعارات غير مقروءة',
  notificationsOn: 'الإشعارات مفعلة',
  notificationEnabled: 'تم تفعيل إشعارات المتصفح.',
  notificationDisabled: 'تم إيقاف إشعارات المتصفح.',
};

const iconByType = {
  attendance: CalendarClock,
  approval: CircleCheck,
  approved: CircleCheck,
  correction: ClipboardCheck,
  document: FileText,
  leave: CalendarClock,
  payroll: WalletCards,
  security: ShieldAlert,
  alert: CircleAlert,
  announcement: Megaphone,
  info: Info,
} as const;

function getCopy(locale: SupportedLocale) {
  return locale === 'ar' ? arabicCopy : englishCopy;
}

function getNotificationIcon(type: string) {
  const normalizedType = type.toLowerCase();
  const Icon = Object.entries(iconByType).find(([key]) =>
    normalizedType.includes(key),
  )?.[1];
  return Icon ?? Bell;
}

function getLocaleTag(locale: SupportedLocale) {
  if (locale === 'ar') return 'ar-EG';
  if (locale === 'fr') return 'fr-FR';
  if (locale === 'de') return 'de-DE';
  return 'en-US';
}

function formatTimestamp(value: string, locale: SupportedLocale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(getLocaleTag(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function errorText(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return fallback;
}

export interface NotificationCenterProps {
  locale?: SupportedLocale;
  pageSize?: number;
  className?: string;
}

export function NotificationCenter({
  locale = 'en',
  pageSize,
  className,
}: NotificationCenterProps) {
  const copy = getCopy(locale);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    page,
    totalPages,
    hasNextPage,
    isLoading,
    isFetching,
    isError,
    queryError,
    unreadCount,
    setPage,
    refetch,
    markAsRead,
    markAllAsRead,
    isMarking,
    supported,
    permission,
    isSubscribed,
    isRegistering,
    isSubscribing,
    subscriptionError,
    subscribe,
    unsubscribe,
  } = useNotifications({ pageSize });

  const statusText = useMemo(() => {
    if (permission === 'denied') return copy.blocked;
    if (!supported) return copy.secureOnly;
    if (isSubscribed) return copy.enabled;
    return copy.enableDescription;
  }, [copy, isSubscribed, permission, supported]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMarkRead = async (notification: Notification) => {
    if (notification.isRead) return;
    const success = await markAsRead(notification.id);
    if (!success) toast.error('Could not update this notification.');
  };

  const handleMarkAll = async () => {
    const success = await markAllAsRead();
    if (!success) toast.error('Could not mark all notifications as read.');
  };

  const handleEnable = async () => {
    const success = await subscribe();
    if (success) toast.success(copy.notificationEnabled);
  };

  const handleDisable = async () => {
    const success = await unsubscribe();
    if (success) toast.success(copy.notificationDisabled);
  };

  return (
    <div
      ref={panelRef}
      className={cn('relative z-30', className)}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      data-testid="notification-center"
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={copy.title}
        onClick={() => setIsOpen((open) => !open)}
        className="relative inline-flex size-10 items-center justify-center rounded-xl border border-sidebar-border/70 bg-sidebar/40 text-sidebar-foreground transition-colors hover:bg-sidebar-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-testid="button-toggle-notifications"
      >
        <Bell className="size-[18px]" strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span
            className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full border-2 border-sidebar bg-destructive px-1 text-[10px] font-bold leading-4 text-destructive-foreground"
            data-testid="badge-unread-notifications"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={copy.title}
          className="fixed inset-x-3 top-16 flex max-h-[calc(100dvh-5rem)] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_20px_60px_hsl(var(--secondary)/.18)] sm:absolute sm:right-0 sm:top-12 sm:w-[min(25rem,calc(100vw-2rem))] sm:inset-x-auto"
          data-testid="panel-notifications"
        >
          <div className="border-b border-border/70 bg-muted/35 px-4 py-3.5 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base font-semibold tracking-tight text-card-foreground">
                    {copy.title}
                  </h2>
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="rounded-full px-2 py-0.5 text-[10px]"
                      data-testid="badge-panel-unread"
                    >
                      {unreadCount} {locale === 'ar' ? 'جديد' : 'new'}
                    </Badge>
                  )}
                </div>
                <p
                  className="mt-1 text-xs text-muted-foreground"
                  data-testid="text-notification-status"
                >
                  {isFetching && !isLoading ? 'Checking for updates…' : statusText}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                    disabled={isMarking}
                    onClick={() => void handleMarkAll()}
                    data-testid="button-mark-all-notifications"
                  >
                    {isMarking ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                    <span className="hidden sm:inline">{copy.markAll}</span>
                  </Button>
                )}
                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  data-testid="button-close-notifications"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {subscriptionError && (
            <div
              className="mx-4 mt-3 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-xs text-destructive sm:mx-5"
              role="alert"
              data-testid="alert-notification-subscription"
            >
              <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
              <span>{subscriptionError}</span>
            </div>
          )}

          {!isSubscribed && permission !== 'denied' && (
            <div className="mx-4 mt-3 flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/10 px-3 py-3 sm:mx-5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bell className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">{copy.enableTitle}</p>
                <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                  {copy.enableDescription}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                className="shrink-0 px-2.5 text-[11px]"
                disabled={!supported || isRegistering || isSubscribing}
                onClick={() => void handleEnable()}
                data-testid="button-enable-notifications"
              >
                {isSubscribing || isRegistering ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  copy.enable
                )}
              </Button>
            </div>
          )}

          {isSubscribed && (
            <div className="flex items-center justify-between gap-3 px-4 pt-3 text-[11px] text-muted-foreground sm:px-5">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" />
                {copy.notificationsOn}
              </span>
              <button
                type="button"
                className="font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                disabled={isSubscribing}
                onClick={() => void handleDisable()}
                data-testid="button-disable-notifications"
              >
                {copy.disable}
              </button>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 sm:px-3">
            {isLoading ? (
              <div className="space-y-2 p-1" data-testid="status-loading-notifications">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-xl border border-border/50 p-3"
                  >
                    <Skeleton className="size-9 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-2.5 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div
                className="flex flex-col items-center px-5 py-10 text-center"
                data-testid="status-error-notifications"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <CircleAlert className="size-5" />
                </div>
                <p className="mt-3 text-sm font-semibold">{copy.loadError}</p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  {errorText(queryError, 'Please try again in a moment.')}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => void refetch()}
                  data-testid="button-retry-notifications"
                >
                  {copy.retry}
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div
                className="flex flex-col items-center px-5 py-10 text-center"
                data-testid="status-empty-notifications"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <Bell className="size-5" />
                </div>
                <p className="mt-3 text-sm font-semibold">{copy.emptyTitle}</p>
                <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                  {copy.emptyDescription}
                </p>
              </div>
            ) : (
              <div className="space-y-1" data-testid="list-notifications">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <button
                      type="button"
                      key={notification.id}
                      onClick={() => void handleMarkRead(notification)}
                      className={cn(
                        'group flex w-full gap-3 rounded-xl border p-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        notification.isRead
                          ? 'border-transparent hover:border-border hover:bg-muted/40'
                          : 'border-primary/15 bg-primary/[0.055] hover:border-primary/30 hover:bg-primary/10',
                      )}
                      data-testid={`button-notification-${notification.id}`}
                    >
                      <span
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-lg',
                          notification.isRead
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary/15 text-primary',
                        )}
                      >
                        <Icon className="size-[17px]" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span
                            className={cn(
                              'line-clamp-1 text-sm leading-5',
                              notification.isRead
                                ? 'font-medium text-foreground/80'
                                : 'font-semibold text-foreground',
                            )}
                            data-testid={`text-notification-title-${notification.id}`}
                          >
                            {notification.title}
                          </span>
                          {!notification.isRead && (
                            <span
                              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive"
                              aria-label="Unread"
                              data-testid={`status-unread-${notification.id}`}
                            />
                          )}
                        </span>
                        <span
                          className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground"
                          data-testid={`text-notification-message-${notification.id}`}
                        >
                          {notification.message}
                        </span>
                        <span
                          className="mt-1.5 block text-[10px] font-medium tracking-wide text-muted-foreground/75"
                          data-testid={`text-notification-time-${notification.id}`}
                        >
                          {formatTimestamp(notification.createdAt, locale)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!isLoading && !isError && notifications.length > 0 && (
            <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-3 py-2.5 sm:px-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage(page - 1)}
                aria-label={copy.previous}
                data-testid="button-previous-notifications"
              >
                <ChevronLeft className="size-3.5 rtl:rotate-180" />
                <span className="hidden sm:inline">{copy.previous}</span>
              </Button>
              <span
                className="text-[11px] font-medium text-muted-foreground"
                data-testid="text-notification-page"
              >
                {copy.page} {page} / {Math.max(1, totalPages)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={!hasNextPage || isFetching}
                onClick={() => setPage(page + 1)}
                aria-label={copy.next}
                data-testid="button-next-notifications"
              >
                <span className="hidden sm:inline">{copy.next}</span>
                <ChevronRight className="size-3.5 rtl:rotate-180" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}