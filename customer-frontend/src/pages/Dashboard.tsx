import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Gift01, AlertTriangle } from '@untitled-ui/icons-react';
import ProgramCard from '../components/ProgramCard';
import MerchantModal from '../components/MerchantModal';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import ConfettiOverlay from '../components/ConfettiOverlay';
import { resolveMediaUrl } from '../utils/media';

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
     stamps_required?: number;
     reward_threshold?: number;
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
  type: 'manual_issue' | 'manual_revoke' | 'scan_earn' | 'reward_redeemed';
  message: string;
  timestamp: string;
  program_name: string;
  merchant_name: string;
  amount: number;
  read?: boolean;
};

const Dashboard = () => {
  const { user } = useAuth();
  const { lastMessage } = useWebSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<Membership['program']['merchant'] | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Membership['program'] | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationError, setNotificationError] = useState('');
  const [query, setQuery] = useState('');
  const [redeemSuccessMessage, setRedeemSuccessMessage] = useState<string | null>(null);
  const [redeemConfetti, setRedeemConfetti] = useState(false);

  const unreadCount = notifications.filter((note) => !readNotifications.has(note.id)).length;

  const dismissRedeemSuccess = () => setRedeemSuccessMessage(null);
  const handleConfettiComplete = () => setRedeemConfetti(false);

  useEffect(() => {
    const state = location.state as { rewardRedeemed?: boolean; rewardProgramName?: string } | null;
    if (state?.rewardRedeemed) {
      const message = state.rewardProgramName
        ? `${state.rewardProgramName} reward redeemed!`
        : 'Reward redeemed successfully!';
      const notificationId = `redeem-${Date.now()}`;
      setNotifications((prev) => [
        {
          id: notificationId,
          type: 'reward_redeemed',
          message,
          timestamp: new Date().toISOString(),
          program_name: state.rewardProgramName ?? 'Programme',
          merchant_name: 'Merchant',
          amount: 0,
        },
        ...prev,
      ]);
      setReadNotifications((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
      setRedeemSuccessMessage(message);
      setRedeemConfetti(true);
      const timer = setTimeout(() => setRedeemSuccessMessage(null), 5000);
      navigate(location.pathname, { replace: true, state: {} });
      return () => clearTimeout(timer);
    }
    return;
  }, [location.state, location.pathname, navigate]);

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

  // Handle WebSocket messages for real-time updates
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'stamp_update') {
        // Update the membership balance in real-time
        setMemberships(prevMemberships =>
          prevMemberships.map(membership =>
            membership.program_id === lastMessage.program_id
              ? { ...membership, current_balance: lastMessage.new_balance }
              : membership
          )
        );
      } else if (lastMessage.type === 'notification') {
        // Refresh notifications
        fetchNotifications();
      } else if (lastMessage.type === 'membership_left') {
        const membershipId = lastMessage.membership_id as string | undefined;
        const programId = lastMessage.program_id as string | undefined;
        if (membershipId || programId) {
          let removedProgramId: string | null = null;
          setMemberships((prevMemberships) =>
            prevMemberships.filter((membership) => {
              const shouldRemove = membershipId
                ? membership.id === membershipId
                : programId
                ? membership.program_id === programId
                : false;
              if (shouldRemove) {
                removedProgramId = membership.program_id;
              }
              return !shouldRemove;
            })
          );
          if (
            removedProgramId &&
            selectedProgramId &&
            removedProgramId === selectedProgramId
          ) {
            setIsModalOpen(false);
            setSelectedMerchant(null);
            setSelectedProgram(null);
            setSelectedProgramId(undefined);
          }
        }
      }
    }
  }, [lastMessage, selectedProgramId]);

  const fetchNotifications = async () => {
    try {
      const notificationsResult = await axios.get<NotificationItem[]>('/api/v1/customer/notifications');
      setNotifications(notificationsResult.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

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

  // Load read notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('readNotifications');
    if (stored) {
      try {
        const readIds = JSON.parse(stored);
        setReadNotifications(new Set(readIds));
      } catch (e) {
        // Ignore invalid data
      }
    }
  }, []);

  // Save read notifications to localStorage
  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
    const newRead = new Set(readNotifications);
    newRead.add(notificationId);
    setReadNotifications(newRead);
    localStorage.setItem('readNotifications', JSON.stringify([...newRead]));
  };

  const handleExitProgram = async (programId?: string) => {
    if (programId) {
      setMemberships((prev) =>
        prev.filter((membership) => membership.program_id !== programId)
      );
    }
    // Refresh memberships after exiting (the modal handles the actual deletion)
    try {
      const membershipsResult = await axios.get<Membership[]>('/api/v1/customer/memberships');
      setMemberships(membershipsResult.data);
    } catch (error: any) {
      console.error('Failed to refresh memberships:', error);
    }
  };

  const resolveLogoUrl = (rawValue: unknown): string | undefined => {
    if (!rawValue || typeof rawValue !== 'string') return undefined;
    const resolved = resolveMediaUrl(rawValue);
    return resolved ?? undefined;
  };

  const thresholdFor = (membership: Membership) => {
    const program = membership.program;
    const parsedEarnRule =
      typeof program.earn_rule === 'string'
        ? (() => {
            try {
              return JSON.parse(program.earn_rule);
            } catch {
              return undefined;
            }
          })()
        : program.earn_rule;

    return (
      program.stamps_required ??
      program.reward_threshold ??
      parsedEarnRule?.stamps_needed ??
      parsedEarnRule?.threshold ??
      10
    );
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
    scan_earn: {
      icon: Gift01,
      accent: 'bg-[#E8F5E8]',
      iconColor: 'text-[#4CAF50]',
      label: 'Stamp scanned',
    },
    reward_redeemed: {
      icon: Gift01,
      accent: 'bg-[#F3E5F5]',
      iconColor: 'text-[#9C27B0]',
      label: 'Reward redeemed',
    },
  } as const;

  return (
    <>
      <ConfettiOverlay visible={redeemConfetti} onComplete={handleConfettiComplete} />
      {redeemSuccessMessage && (
        <div className="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
          <div className="flex w-full max-w-lg items-center gap-3 rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-lg">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Gift01 className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-emerald-700">Reward redeemed!</p>
              <p className="text-sm text-emerald-700/80">{redeemSuccessMessage}</p>
            </div>
            <button
              type="button"
              className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700"
              onClick={dismissRedeemSuccess}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <main className="min-h-screen bg-[var(--rudi-background)] pb-16">
        <header className="bg-white shadow-sm pt-4 pb-4">
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
              resolveMediaUrl(user?.avatar_url)
                ? `${resolveMediaUrl(user?.avatar_url)}?t=${Date.now()}`
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
                   Updates from your merchants {unreadCount > 0 && (
                     <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-[var(--rudi-primary)] text-white text-xs font-bold">
                       {unreadCount}
                     </span>
                   )}
                 </h2>
                 <span className="text-xs text-[var(--rudi-text)]/60">
                   Recent activity from your merchants
                 </span>
               </div>
              <div className="mt-3 max-h-48 space-y-3 overflow-y-auto pr-1">
                 {notifications.map((note) => {
                   const decor = notificationDecor[note.type];
                   const Icon = decor.icon;
                   const isUnread = !readNotifications.has(note.id);
                   return (
                     <div
                       key={note.id}
                       onClick={() => markAsRead(note.id)}
                       className={`flex items-start gap-3 rounded-2xl border bg-white p-3 shadow-sm cursor-pointer transition-colors hover:bg-gray-50 ${
                         isUnread
                           ? 'border-[var(--rudi-primary)]/30 bg-[var(--rudi-primary)]/5'
                           : 'border-white/60'
                       }`}
                     >
                       <span
                         className={`flex h-10 w-10 items-center justify-center rounded-xl ${decor.accent} relative`}
                       >
                         <Icon className={`h-5 w-5 ${decor.iconColor}`} />
                         {isUnread && (
                           <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[var(--rudi-primary)] border-2 border-white"></span>
                         )}
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
            className="w-full h-11 rounded-full bg-white/80 backdrop-blur px-4 py-2 shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--rudi-primary)] focus:border-transparent my-4"
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
          <div className="py-4 mb-16">
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
                    membership.program.merchant?.address?.split('\n')[0]?.split(',')[0] ??
                    'Address not available'
                  }
                  earned={membership.current_balance}
                  threshold={thresholdFor(membership)}
                  actionLabel={actionLabelFor(membership)}
                  stampIcon={membership.program.stamp_icon}
                  onAction={actionHandlerFor(membership)}
                   onCardClick={() => {
                     setSelectedMerchant(membership.program.merchant);
                     setSelectedProgram(membership.program);
                     setSelectedProgramId(membership.program_id);
                     setIsModalOpen(true);
                   }}
                  logoUrl={resolveLogoUrl(membership.program.merchant?.logo_url)}
                />
              </div>
            ))}
        </div>
      </section>
      </main>
      <BottomNav />
      <MerchantModal
        merchant={selectedMerchant}
        program={selectedProgram}
        programId={selectedProgramId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMerchant(null);
          setSelectedProgram(null);
          setSelectedProgramId(undefined);
        }}
        onExitProgram={handleExitProgram}
      />
    </>
  );
};

export default Dashboard;
