import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Users, Gift, TrendingUp, ArrowLeft } from 'lucide-react';

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
  const [summary, setSummary] = useState<SummaryMetric[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<{stamps: number[], redemptions: number[]}>({stamps: [], redemptions: []});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    const mockSummary: SummaryMetric[] = [
      {
        label: 'Active Programs',
        value: '3',
        accent: 'primary',
        helper: 'Loyalty programs running',
      },
      {
        label: 'Total Customers',
        value: '247',
        accent: 'secondary',
        helper: 'Registered customers',
      },
      {
        label: 'Stamps Collected',
        value: '1,429',
        accent: 'accent',
        helper: 'This month',
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
      stamps: [12, 19, 15, 25, 22, 30, 28],
      redemptions: [2, 3, 1, 4, 3, 5, 4]
    };

    setTimeout(() => {
      setSummary(mockSummary);
      setActivity(mockActivity);
      setChartData(mockChartData);
      setLoading(false);
    }, 1000);
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
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </button>
              <div className="flex items-center gap-2">
                <img src="/logo-1.png" alt="Rudi" className="h-8 w-auto" />
                <span className="font-heading text-xl font-bold text-foreground">rudi</span>
                <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">Demo</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="bg-primary text-primary-foreground rounded-2xl h-10 px-4 hover:opacity-90 transition-colors font-medium text-sm"
              >
                Sign Up for Real
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            Welcome to your dashboard
          </h1>
          <p className="text-muted-foreground">
            This is a demo of what your Rudi dashboard would look like with real data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {summary.map((metric, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 shadow-sm border border-border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${accentStyles[metric.accent]}`}>
                  {metric.accent === 'teal' && <QrCode className="h-6 w-6" />}
                  {metric.accent === 'yellow' && <Users className="h-6 w-6" />}
                  {metric.accent === 'coral' && <Gift className="h-6 w-6" />}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{metric.helper}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${activityAccent[item.type]}`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{item.message}</p>
                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
              Activity This Week
            </h2>
            <div className="flex items-end gap-2 h-40">
              {chartData.stamps.map((stamps, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="flex flex-col items-end w-full h-32">
                    <div
                      className="w-full bg-primary rounded-t mb-1"
                      style={{ height: `${(stamps / 35) * 100}%` }}
                      title={`Stamps: ${stamps}`}
                    ></div>
                    <div
                      className="w-full bg-secondary rounded-t"
                      style={{ height: `${(chartData.redemptions[index] / 6) * 100}%` }}
                      title={`Redemptions: ${chartData.redemptions[index]}`}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span className="text-xs text-muted-foreground">Stamps</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-secondary rounded"></div>
                <span className="text-xs text-muted-foreground">Redemptions</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-secondary/10 rounded-2xl p-6 border border-secondary/20">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-secondary" />
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Ready to get started?
            </h3>
          </div>
          <p className="text-muted-foreground mb-4">
            This demo shows just a glimpse of what Rudi can do for your business. Sign up now to start building customer loyalty.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-primary text-primary-foreground rounded-2xl h-12 px-6 hover:opacity-90 transition-colors font-medium"
          >
            Create Your Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoDashboard;