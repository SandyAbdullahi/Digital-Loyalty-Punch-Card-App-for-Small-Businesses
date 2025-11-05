import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type SummaryMetric = {
  label: string;
  value: string;
  accent: 'primary' | 'secondary' | 'accent';
  helper: string;
};

type ActivityItem = {
  id: string;
  type: 'stamp' | 'reward' | 'join';
  message: string;
  timestamp: string;
  customer_name?: string | null;
  customer_email?: string | null;
  program_name?: string | null;
  amount?: number;
};

const accentStyles: Record<SummaryMetric['accent'], string> = {
  primary: 'bg-primary/15 text-primary',
  secondary: 'bg-secondary/15 text-secondary',
  accent: 'bg-accent/15 text-accent',
};

const activityAccent: Record<ActivityItem['type'], string> = {
  stamp: 'bg-primary',
  reward: 'bg-secondary',
  join: 'bg-accent',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SummaryMetric[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const barPalette = ['#009688', '#FFB300', '#FF6F61', '#3B1F1E', '#7C3AED', '#0EA5E9', '#F97316'];

  useEffect(() => {
    const fetchSnapshot = async () => {
      setLoadingError(null);
      try {
        const [programsResponse, activityResponse, chartResponse] =
          await Promise.allSettled([
            axios.get('/api/v1/programs/'),
            axios.get('/api/v1/analytics/recent-activity'),
            axios.get('/api/v1/analytics/scans-last-7-days'),
          ]);

        const activePrograms =
          programsResponse.status === 'fulfilled'
            ? programsResponse.value.data.length
            : 0;

        const todayScans =
          activityResponse.status === 'fulfilled'
            ? Number(activityResponse.value.data.today_scans ?? 0)
            : 0;

        const rewardsRedeemed =
          activityResponse.status === 'fulfilled'
            ? Number(activityResponse.value.data.rewards_redeemed ?? 0)
            : 0;

        const totalCustomers =
          activityResponse.status === 'fulfilled'
            ? Number(activityResponse.value.data.unique_customers ?? 0)
            : 0;

        const derivedSummary: SummaryMetric[] = [
          {
            label: 'Active programs',
            value: activePrograms.toString(),
            accent: 'primary',
            helper:
              activePrograms > 0
                ? 'All systems humming'
                : 'Your first program awaits',
          },
          {
            label: 'Total customers',
            value: totalCustomers.toString(),
            accent: 'secondary',
            helper: 'Growing community momentum',
          },
          {
            label: 'Rewards redeemed',
            value: rewardsRedeemed.toString(),
            accent: 'accent',
            helper: 'Keep delighting your regulars',
          },
          {
            label: "Today's scans",
            value: todayScans.toString(),
            accent: 'primary',
            helper: 'Another round of smiles',
          },
        ];

        setSummary(derivedSummary);

        if (chartResponse.status === 'fulfilled') {
          const rawScans = chartResponse.value?.data?.scans;
          const scans = Array.isArray(rawScans)
            ? rawScans.map((value: unknown) => {
                const numeric = Number(value ?? 0);
                return Number.isFinite(numeric) && numeric >= 0 ? numeric : 0;
              })
            : [0, 0, 0, 0, 0, 0, 0];
          setChartData(scans);
          const labels = Array.isArray(chartResponse.value?.data?.labels)
            ? chartResponse.value.data.labels.map((label: unknown) =>
                typeof label === 'string' && label.trim().length > 0 ? label : ''
              )
            : [];
          if (labels.length === scans.length && labels.length > 0) {
            setChartLabels(labels);
          } else {
            setChartLabels(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
          }
        } else {
          setChartData([0, 0, 0, 0, 0, 0, 0]);
          setChartLabels(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
        }

        if (activityResponse.status === 'fulfilled') {
          const records = activityResponse.value.data.items ?? [];
          setActivity(
            records.map((item: any, index: number) => {
              const type = (item.type as ActivityItem['type']) ?? 'stamp';
              const customerName: string | undefined =
                typeof item.customer_name === 'string' && item.customer_name.trim().length > 0
                  ? item.customer_name.trim()
                  : undefined;
              const customerEmail: string | undefined =
                typeof item.customer_email === 'string' && item.customer_email.trim().length > 0
                  ? item.customer_email.trim()
                  : undefined;
              const programName: string | undefined =
                typeof item.program_name === 'string' && item.program_name.trim().length > 0
                  ? item.program_name.trim()
                  : undefined;
              const amount = Number(item.amount ?? 0);
              const displayName = customerName ?? customerEmail ?? 'Customer';
              const resolvedProgram = programName ?? 'Programme';
              let computedMessage = 'Activity recorded';

              if (type === 'reward') {
                const stampWord = amount === 1 ? 'stamp' : 'stamps';
                computedMessage = `${amount} ${stampWord} redeemed by ${displayName}.`;
              } else if (type === 'stamp') {
                const stampWord = amount === 1 ? 'stamp' : 'stamps';
                computedMessage = `${resolvedProgram} added ${amount} ${stampWord} for ${displayName}.`;
              } else if (typeof item.message === 'string') {
                computedMessage = item.message;
              }

              return {
                id: item.id ?? `activity-${index}`,
                type,
                message: computedMessage,
                timestamp: item.timestamp
                  ? new Date(item.timestamp).toLocaleString()
                  : new Date().toLocaleString(),
                customer_name: customerName,
                customer_email: customerEmail,
                program_name: programName,
                amount: amount,
              };
            })
          );
        } else {
          setActivity([
            {
              id: 'placeholder-1',
              type: 'stamp',
              message: 'Olive & Oat added a stamp for Maria G.',
              timestamp: 'Today - 9:12 AM',
            },
            {
              id: 'placeholder-2',
              type: 'reward',
              message: 'Two coffees redeemed by Kai S.',
              timestamp: 'Yesterday - 6:45 PM',
            },
            {
              id: 'placeholder-3',
              type: 'join',
              message: 'New guest Maya K. joined your program.',
              timestamp: 'Yesterday - 3:20 PM',
            },
          ]);
        }
      } catch (error) {
        setLoadingError('Unable to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshot();
  }, []);

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor your loyalty programs and customer engagement
          </p>
        </div>
        <button
          onClick={() => navigate('/programs')}
          className="btn-primary w-full sm:w-auto group"
        >
          Create Program
          <span className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((metric, index) => (
          <div
            key={metric.label}
            className="card-hover rounded-2xl bg-card p-5 shadow-lg animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <p className="font-heading text-xs uppercase tracking-wide text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-2 font-heading text-3xl font-bold text-foreground">
              {metric.value}
            </p>
            <span
              className={`mt-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                accentStyles[metric.accent]
              }`}
            >
              {metric.helper}
            </span>
          </div>
        ))}

        {loading && (
          <>
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl bg-card p-5 shadow-lg"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="h-3 w-20 rounded-full bg-muted"></div>
                <div className="mt-2 h-8 w-16 rounded-lg bg-muted/50"></div>
                <div className="mt-3 h-5 w-32 rounded-full bg-muted/50"></div>
              </div>
            ))}
          </>
        )}

        {!loading && summary.length === 0 && (
          <div className="sm:col-span-2 xl:col-span-4">
            <div className="rounded-2xl bg-card p-6 text-center shadow-lg">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Welcome to Your Dashboard
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No metrics yet - your first happy customer is just a scan away!
              </p>
               <button
                 onClick={() => navigate('/programs')}
                 className="btn-secondary mt-4"
               >
                Create Your First Program
              </button>
            </div>
          </div>
        )}

        {loadingError && (
          <div className="sm:col-span-2 xl:col-span-4">
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-center">
              <p className="text-sm font-medium text-destructive">{loadingError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-destructive hover:text-destructive/80"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <section className="lg:col-span-3">
          <div className="rounded-3xl bg-card p-6 shadow-lg animate-slide-up">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  Analytics Overview
                </h2>
                <p className="text-sm text-muted-foreground">
                  Scans over the last 7 days
                </p>
              </div>
            </div>
            {loading ? (
              <div className="h-64 flex items-end justify-between gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full bg-primary/10 rounded-t animate-pulse" style={{ height: '40%' }}></div>
                    <span className="text-xs text-muted-foreground">{day}</span>
                  </div>
                ))}
              </div>
            ) : chartData.every((value) => !value) ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-primary/20 bg-primary/5 text-center">
                <p className="text-sm font-medium text-primary">No scans recorded yet</p>
                <p className="text-xs text-muted-foreground">
                  Issue a QR scan to populate your weekly analytics.
                </p>
              </div>
            ) : (
              <div className="h-64 flex items-end justify-between gap-2">
                {chartLabels.map((dayLabel, index) => {
                  const max = Math.max(...chartData, 1);
                  const containerHeight = 256; // Tailwind h-64
                  const minHeight = 52;
                  const value = chartData[index] ?? 0;
                  const barHeight =
                    value > 0 ? (value / max) * (containerHeight - minHeight) + minHeight : 0;

                  return (
                    <div key={`${dayLabel}-${index}`} className="relative flex-1 h-full">
                      {barHeight > 0 && (
                        <div className="absolute inset-x-1 bottom-6">
                          <div
                            className="group cursor-help rounded-t transition-all hover:opacity-80"
                            style={{
                              height: `${barHeight}px`,
                              backgroundColor: barPalette[index % barPalette.length],
                            }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">
                              {value} scans
                            </div>
                          </div>
                        </div>
                      )}
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                        {dayLabel || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="rounded-3xl bg-card p-6 shadow-lg animate-slide-up h-full">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  Recent Activity
                </h2>
                <p className="text-sm text-muted-foreground">
                  Latest customer interactions
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate('/qr')}
                  className="btn-secondary text-sm"
                >
                  Generate QR
                </button>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {loading && (
                <>
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 rounded-2xl border border-primary/10 bg-card/80 px-4 py-3 animate-pulse"
                    >
                      <div className="mt-1 h-3 w-3 rounded-full bg-muted"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-muted/50"></div>
                        <div className="h-3 w-1/4 rounded bg-muted/50"></div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {activity.length === 0 && !loading && (
                <div className="rounded-xl bg-muted/60 p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No activity yet - your first customer interaction will
                    appear here
                  </p>
                  <button
                    onClick={() => navigate('/qr')}
                    className="btn-secondary mt-4 text-sm"
                  >
                    Generate Your First QR Code
                  </button>
                </div>
              )}

              {activity.map((entry, index) => (
                <div
                  key={entry.id}
                  className="group flex items-start gap-4 rounded-2xl border border-primary/10 bg-card/80 px-4 py-3 shadow-sm animate-slide-up hover:border-primary/20 hover:bg-card transition-colors"
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <span
                    className={`mt-1 inline-flex h-3 w-3 flex-shrink-0 rounded-full ${
                      activityAccent[entry.type]
                    } transition-transform duration-200 group-hover:scale-110`}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {entry.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
