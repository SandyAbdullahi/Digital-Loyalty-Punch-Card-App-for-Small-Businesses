import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Users, Gift, TrendingUp, ArrowLeft } from 'lucide-react';

type SummaryMetric = {
  label: string;
  value: string;
  accent: 'teal' | 'yellow' | 'coral';
  helper: string;
};

type ActivityItem = {
  id: string;
  type: 'stamp' | 'reward' | 'join';
  message: string;
  timestamp: string;
};

const accentStyles: Record<SummaryMetric['accent'], string> = {
  teal: 'bg-rudi-teal/15 text-rudi-teal',
  yellow: 'bg-rudi-yellow/15 text-rudi-yellow',
  coral: 'bg-rudi-coral/15 text-rudi-coral',
};

const activityAccent: Record<ActivityItem['type'], string> = {
  stamp: 'bg-rudi-teal',
  reward: 'bg-rudi-yellow',
  join: 'bg-rudi-coral',
};

const DemoDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SummaryMetric[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    const mockSummary: SummaryMetric[] = [
      {
        label: 'Active Programs',
        value: '3',
        accent: 'teal',
        helper: 'Loyalty programs running',
      },
      {
        label: 'Total Customers',
        value: '247',
        accent: 'yellow',
        helper: 'Registered customers',
      },
      {
        label: 'Stamps Collected',
        value: '1,429',
        accent: 'coral',
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

    const mockChartData = [12, 19, 15, 25, 22, 30, 28];

    setTimeout(() => {
      setSummary(mockSummary);
      setActivity(mockActivity);
      setChartData(mockChartData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-rudi-sand flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rudi-teal mx-auto mb-4"></div>
          <p className="text-rudi-maroon">Loading demo dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rudi-sand">
      <div className="bg-white shadow-sm border-b border-[#EADCC7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-rudi-maroon/70 hover:text-rudi-maroon transition-colors focus:outline-none focus:ring-2 focus:ring-rudi-teal rounded px-2 py-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </button>
              <div className="flex items-center gap-2">
                <img src="/logo-1.png" alt="Rudi" className="h-8 w-auto" />
                <span className="font-heading text-xl font-bold text-rudi-maroon">rudi</span>
                <span className="text-sm text-rudi-maroon/60 bg-rudi-sand px-2 py-1 rounded">Demo</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="bg-rudi-teal text-white rounded-2xl h-10 px-4 hover:bg-teal-600 transition-colors font-medium text-sm"
              >
                Sign Up for Real
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-rudi-maroon mb-2">
            Welcome to your dashboard
          </h1>
          <p className="text-rudi-maroon/70">
            This is a demo of what your Rudi dashboard would look like with real data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {summary.map((metric, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#EADCC7]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rudi-maroon/70 mb-1">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-rudi-maroon">
                    {metric.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${accentStyles[metric.accent]}`}>
                  {metric.accent === 'teal' && <QrCode className="h-6 w-6" />}
                  {metric.accent === 'yellow' && <Users className="h-6 w-6" />}
                  {metric.accent === 'coral' && <Gift className="h-6 w-6" />}
                </div>
              </div>
              <p className="text-xs text-rudi-maroon/60 mt-2">{metric.helper}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EADCC7]">
            <h2 className="font-heading text-xl font-semibold text-rudi-maroon mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${activityAccent[item.type]}`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-rudi-maroon">{item.message}</p>
                    <p className="text-xs text-rudi-maroon/60">{item.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EADCC7]">
            <h2 className="font-heading text-xl font-semibold text-rudi-maroon mb-4">
              Scans This Week
            </h2>
            <div className="flex items-end gap-2 h-32">
              {chartData.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-rudi-teal rounded-t"
                    style={{ height: `${(value / 30) * 100}%` }}
                  ></div>
                  <span className="text-xs text-rudi-maroon/60 mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-rudi-yellow/10 rounded-2xl p-6 border border-rudi-yellow/20">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-rudi-yellow" />
            <h3 className="font-heading text-lg font-semibold text-rudi-maroon">
              Ready to get started?
            </h3>
          </div>
          <p className="text-rudi-maroon/80 mb-4">
            This demo shows just a glimpse of what Rudi can do for your business. Sign up now to start building customer loyalty.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-rudi-teal text-white rounded-2xl h-12 px-6 hover:bg-teal-600 transition-colors font-medium"
          >
            Create Your Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoDashboard;