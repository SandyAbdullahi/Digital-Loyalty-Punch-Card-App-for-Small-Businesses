import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift01, AlertTriangle } from '@untitled-ui/icons-react';
import ProgramCard from '../components/ProgramCard';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';

type Membership = {
  id: string;
  customer_user_id: string;
  program_id: string;
  current_balance: number;
  joined_at: string;
  is_active: boolean;
  program: {
    id: string;
    name: string;
    description?: string;
    logic_type: string;
    earn_rule: any;
    redeem_rule: any;
    terms?: string;
    merchant_id: string;
    is_active: boolean;
    stamp_icon?: string;
    merchant: {
      id: string;
      display_name: string;
      legal_name?: string;
      logo_url?: string;
      category?: string;
      address?: string;
      description?: string;
      website?: string;
      phone?: string;
      owner_user_id: string;
      is_active: boolean;
      locations: any[];
    };
  };
};

type NotificationItem = {
  id: string;
  type: 'manual_issue' | 'manual_revoke';
  message: string;
  timestamp: string;
  program_name: string;
  merchant_name: string;
  amount: number;
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationError, setNotificationError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      setNotificationError('');

      try {
        const [membershipsResult, notificationsResult] = await Promise.allSettled([
          axios.get<Membership[]>('/api/v1/customer/memberships'),
          axios.get<NotificationItem[]>('/api/v1/customer/notifications'),
        ]);

        if (membershipsResult.status === 'fulfilled') {
          setMemberships(membershipsResult.value.data);
        } else {
          const reason: any = membershipsResult.reason;
          const detail =
            reason?.response?.data?.detail ??
            reason?.message ??
            'Could not load your programmes.';
          setError(detail);
        }

        if (notificationsResult.status === 'fulfilled') {
          const payload = Array.isArray(notificationsResult.value.data)
            ? notificationsResult.value.data
            : [];

          const normalized = payload.map((item, index) => {
            const rawType = item?.type === 'manual_revoke' ? 'manual_revoke' : 'manual_issue';
            const rawTimestamp =
              typeof item?.timestamp === 'string'
                ? item.timestamp
                : new Date().toISOString();
            const amountValue =
              typeof item?.amount === 'number'
                ? Math.abs(item.amount)
                : Math.abs(Number(item?.amount ?? 0)) || 0;

            return {
              id: item?.id ?? `notification-${index}`,
              type: rawType as NotificationItem['type'],
              message:
                typeof item?.message === 'string' && item.message.trim().length > 0
                  ? item.message.trim()
                  : rawType === 'manual_issue'
                  ? 'A stamp was manually added to your account.'
                  : 'A stamp was manually removed from your account.',
              timestamp: rawTimestamp,
              program_name:
                typeof item?.program_name === 'string' && item.program_name.trim().length > 0
                  ? item.program_name.trim()
                  : 'Programme',
              merchant_name:
                typeof item?.merchant_name === 'string' && item.merchant_name.trim().length > 0
                  ? item.merchant_name.trim()
                  : 'Merchant',
              amount: amountValue,
            } as NotificationItem;
          });

          setNotifications(normalized);
        } else {
          const reason: any = notificationsResult.reason;
          const detail =
            reason?.response?.data?.detail ??
            reason?.message ??
            'Could not load your notifications right now.';
          const friendlyMessage =
            typeof detail === 'string' && detail.trim().length > 0
              ? detail
              : 'We could not load your updates right now.';
          setNotificationError(friendlyMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMemberships = useMemo(() => {
    if (!query) return memberships;

    return memberships.filter((membership) => {
      const merchantName = membership.program.merchant?.display_name ?? '';
      const programName = membership.program.name ?? '';
      return merchantName.toLowerCase().includes(query.toLowerCase()) ||
             programName.toLowerCase().includes(query.toLowerCase());
    });
  }, [memberships, query]);

  const firstName = user?.name || user?.email?.split('@')[0] || 'Explorer';

  const thresholdFor = (membership: Membership) => {
    if (membership.program.logic_type === 'punch_card') {
      return membership.program.earn_rule?.threshold ?? 10;
    }
    return 10; // default for points or other types
  };

  const actionLabelFor = (membership: Membership) =>
    membership.current_balance >= thresholdFor(membership) ? 'View' : 'Add stamp';

  const actionHandlerFor = (membership: Membership) =>
    membership.current_balance >= thresholdFor(membership)
      ? () => navigate(`/program/${membership.program_id}`, { state: { membership } })
      : () => navigate('/scan');

  const formatTimestamp = (value: string) => {
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return value;
      }
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return value;
    }
  };

  const notificationDecor = {
    manual_issue: {
      icon: Gift01,
      accent: 'bg-[#E0F2F1]',
      iconColor: 'text-[#009688]',
      label: 'Stamp added',
    },
    manual_revoke: {
      icon: AlertTriangle,
      accent: 'bg-[#FFE8E1]',
      iconColor: 'text-[#FF6F61]',
      label: 'Stamp removed',
    },
  } as const;

  return (
    <>
      <main className="min-h-screen bg-[var(--rudi-background)]">
        <header className="bg-white shadow-sm pb-4">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-black text-[var(--rudi-text)]">
              Welcome, {firstName}
            </h1>
            <p className="text-sm text-[var(--rudi-text)]/70 mt-1">
              Discover amazing rewards from local businesses!
            </p>
          </div>
          <img
            src={
              user?.avatar_url
                ? `${user.avatar_url}?t=${Date.now()}`
                : `https://ui-avatars.com/api/?name=${firstName}&background=009688&color=fff&size=40`
            }
            alt="Avatar"
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>
        <div className="mx-4 mb-3 space-y-3">
          {notifications.length > 0 && (
            <div className="rounded-2xl bg-white/95 p-4 shadow-md">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-heading text-base font-semibold text-[var(--rudi-text)]">
                  Updates from your merchants
                </h2>
                <span className="text-xs text-[var(--rudi-text)]/60">
                  We&apos;ll notify you about manual changes
                </span>
              </div>
              <div className="mt-3 max-h-48 space-y-3 overflow-y-auto pr-1">
                {notifications.map((note) => {
                  const decor = notificationDecor[note.type];
                  const Icon = decor.icon;
                  return (
                    <div
                      key={note.id}
                      className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white p-3 shadow-sm"
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${decor.accent}`}
                      >
                        <Icon className={`h-5 w-5 ${decor.iconColor}`} />
                      </span>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--rudi-text)]/70">
                            {decor.label}
                          </span>
                          <time className="text-xs text-[var(--rudi-text)]/60">
                            {formatTimestamp(note.timestamp)}
                          </time>
                        </div>
                        <p className="mt-2 text-sm font-medium text-[var(--rudi-text)]">
                          {note.message}
                        </p>
                        <p className="mt-1 text-xs text-[var(--rudi-text)]/70">
                          {note.merchant_name} · {note.program_name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {notificationError && notifications.length === 0 && !loading && (
            <div className="rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-600">
              {notificationError}
            </div>
          )}

          <input
            type="search"
            placeholder="Search programs..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full h-11 rounded-full bg-white/80 backdrop-blur px-4 py-2 shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--rudi-primary)] focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => navigate('/scan')}
            className="w-full h-12 rounded-xl bg-[var(--rudi-primary)] text-white font-semibold hover:bg-[var(--rudi-primary)]/90 transition-colors mb-6"
          >
            Join program
          </button>
        </div>
        </header>

        <section className="overflow-y-auto">
          <div className="py-4">
            {loading && (
              <p className="text-center text-sm text-[var(--rudi-text)]/70">
                Loading your programmes...
              </p>
            )}
            {error && (
              <div className="mx-4 mb-3">
                <p className="text-sm px-3 py-2 rounded-md bg-red-50 text-red-600">
                  {error}
                </p>
              </div>
            )}
            {!loading && !error && filteredMemberships.length === 0 && (
              <div className="mx-4 mb-3">
                <div className="bg-white p-4 rounded-2xl shadow-md">
                  <h2 className="font-heading text-lg text-[var(--rudi-text)]">
                    No programmes yet
                  </h2>
                  <p className="text-sm text-[var(--rudi-text)]/70 mt-1">
                    Scan a QR code at a participating merchant to start collecting
                    stamps.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/scan')}
                    className="w-full h-12 mt-4 rounded-xl bg-[var(--rudi-secondary)] text-[var(--rudi-text)] font-semibold hover:bg-[var(--rudi-secondary)]/90 transition-colors"
                  >
                    Scan now
                  </button>
                </div>
              </div>
            )}
            {filteredMemberships.map((membership) => (
              <div key={membership.id} className="mx-4 mb-3">
                <ProgramCard
                  id={membership.id}
                  merchantName={
                    membership.program.merchant?.display_name ??
                    `Merchant ${membership.program.merchant_id}`
                  }
                  programName={membership.program.name}
                  merchantAddress={
                    membership.program.merchant?.address ??
                    'Address not available'
                  }
                  earned={membership.current_balance}
                  threshold={thresholdFor(membership)}
                  actionLabel={actionLabelFor(membership)}
                  stampIcon={membership.program.stamp_icon}
                  onAction={actionHandlerFor(membership)}
                  logoUrl={membership.program.merchant?.logo_url}
                />
              </div>
            ))}
        </div>
      </section>
      </main>
      <BottomNav />
    </>
  );
};

export default Dashboard;
