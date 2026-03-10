import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { kk } from 'date-fns/locale';

const typeIcons: Record<string, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
};

const typeColors: Record<string, string> = {
  info: 'text-primary',
  success: 'text-green-500',
  warning: 'text-yellow-500',
};

export default function Notifications() {
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const title = language === 'kk' ? 'Хабарландырулар' : 'Уведомления';
  const markAllText = language === 'kk' ? 'Барлығын оқылды деп белгілеу' : 'Отметить все прочитанными';
  const emptyText = language === 'kk' ? 'Хабарландырулар жоқ' : 'Нет уведомлений';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bell className="w-6 h-6" />
          {title}
          {unreadCount > 0 && (
            <span className="text-sm bg-destructive text-destructive-foreground rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()} className="gap-1.5">
            <CheckCheck className="w-4 h-4" />
            {markAllText}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type || 'info'] || Info;
            const colorClass = typeColors[n.type || 'info'] || 'text-primary';

            return (
              <div
                key={n.id}
                className={cn(
                  'p-4 rounded-xl border transition-colors cursor-pointer group',
                  n.is_read
                    ? 'bg-card border-border'
                    : 'bg-primary/5 border-primary/20'
                )}
                onClick={() => {
                  if (!n.is_read) markAsRead.mutate(n.id);
                  if (n.link) navigate(n.link);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('mt-0.5', colorClass)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={cn('font-medium text-sm', !n.is_read && 'text-foreground')}>
                        {n.title}
                      </h3>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(n.created_at!), {
                        addSuffix: true,
                        locale: language === 'kk' ? kk : undefined,
                      })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead.mutate(n.id);
                      }}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
