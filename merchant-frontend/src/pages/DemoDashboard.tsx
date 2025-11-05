import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Zap, MessageSquare, BarChart3 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

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

const DemoDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary, setSummary] = useState<SummaryMetric[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<{ stamps: number[]; redemptions: number[] }>({ stamps: [], redemptions: [] });
  const [loading, setLoading] = useState(true);
  const barPalette = ['#009688', '#FFB300', '#FF6F61', '#3B1F1E', '#7C3AED', '#0EA5E9', '#F97316'];

  useEffect(() => {
    // Mock data
    const mockSummary: SummaryMetric[] = [
      {
        label: 'Active programs',
        value: '3',
        accent: 'primary',
        helper: 'All systems humming',
      },
      {
        label: 'Total customers',
        value: '247',
        accent: 'secondary',
        helper: 'Growing community momentum',
      },
      {
        label: 'Rewards redeemed',
        value: '89',
        accent: 'accent',
        helper: 'Keep delighting your regulars',
      },
      {
        label: "Today's scans",
        value: '12',
        accent: 'primary',
        helper: 'Another round of smiles',
      },
    ];

    const mockActivity: ActivityItem[] = [
      {
        id: '1',
        type: 'join',
        message: 'Sarah joined your Coffee Rewards program',
        timestamp: '2 minutes ago',
      },
      {
        id: '2',
        type: 'stamp',
        message: 'Mike collected 3 stamps at your café',
        timestamp: '15 minutes ago',
      },
      {
        id: '3',
        type: 'reward',
        message: 'Emma redeemed a free coffee',
        timestamp: '1 hour ago',
      },
      {
        id: '4',
        type: 'stamp',
        message: 'David collected 2 stamps',
        timestamp: '2 hours ago',
      },
      {
        id: '5',
        type: 'join',
        message: 'Lisa joined your Loyalty Club',
        timestamp: '3 hours ago',
      },
    ];

    const mockChartData = {
      stamps: [18, 24, 20, 32, 28, 35, 30],
      redemptions: [3, 4, 2, 5, 4, 6, 5]
    };

    setSummary(mockSummary);
    setActivity(mockActivity);
    setChartData(mockChartData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading demo dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:ml-60">
        <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto px-4 pb-10 pt-4 sm:px-6 lg:px-8">
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
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                    (day) => (
                      <div
                        key={day}
                        className="flex flex-col items-center gap-2 flex-1"
                      >
                        <div
                          className="w-full bg-primary/10 rounded-t animate-pulse"
                          style={{ height: '40%' }}
                        ></div>
                        <span className="text-xs text-muted-foreground">{day}</span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="h-64 flex items-end justify-between gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const max = Math.max(...chartData.stamps, 1);
                    const containerHeight = 256; // tailwind h-64
                    const minHeight = 52;
                    const barHeight =
                      (chartData.stamps[index] / max) * (containerHeight - minHeight) + minHeight;

                    return (
                      <div key={day} className="relative flex-1 h-full">
                        <div className="absolute inset-x-1 bottom-6">
                          <div
                            className="group cursor-help rounded-t transition-all hover:opacity-80"
                            style={{
                              height: `${barHeight}px`,
                              backgroundColor: barPalette[index % barPalette.length],
                            }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">
                              {chartData.stamps[index]} scans
                            </div>
                          </div>
                        </div>
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                          {day}
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
                      No activity yet - your first customer interaction will appear here
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
        </main>
      </div>
    </div>
  );
};

export default DemoDashboard;
