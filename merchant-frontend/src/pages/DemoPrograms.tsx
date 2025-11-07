import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Users, Gift, Calendar, Target } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

type Program = {
  id: string;
  name: string;
  description: string;
  type: 'stamp' | 'points' | 'tiered';
  status: 'active' | 'draft' | 'paused';
  customers: number;
  stampsRedeemed: number;
  createdAt: string;
  reward: string;
  targetStamps?: number;
};

const statusStyles = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  paused: 'bg-gray-100 text-gray-800',
};

const typeIcons = {
  stamp: Target,
  points: Gift,
  tiered: Users,
};

const DemoPrograms = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock programs data
    const mockPrograms: Program[] = [
      {
        id: '1',
        name: 'Coffee Loyalty Club',
        description: 'Buy 9 coffees, get the 10th free. Perfect for daily coffee drinkers.',
        type: 'stamp',
        status: 'active',
        customers: 156,
        stampsRedeemed: 89,
        createdAt: '2024-01-15',
        reward: 'Free Coffee',
        targetStamps: 10,
      },
      {
        id: '2',
        name: 'Weekend Brunch Special',
        description: 'Collect stamps on weekend brunch orders for a free weekend breakfast.',
        type: 'stamp',
        status: 'active',
        customers: 78,
        stampsRedeemed: 23,
        createdAt: '2024-02-01',
        reward: 'Free Brunch',
        targetStamps: 5,
      },
      {
        id: '3',
        name: 'VIP Dessert Club',
        description: 'Points-based system for our dessert lovers. 500 points = free dessert.',
        type: 'points',
        status: 'draft',
        customers: 0,
        stampsRedeemed: 0,
        createdAt: '2024-02-10',
        reward: 'Free Dessert',
      },
      {
        id: '4',
        name: 'Seasonal Pastry Rewards',
        description: 'Limited time: Collect 3 pastry stamps for a free seasonal special.',
        type: 'stamp',
        status: 'paused',
        customers: 45,
        stampsRedeemed: 12,
        createdAt: '2024-01-20',
        reward: 'Free Seasonal Pastry',
        targetStamps: 3,
      },
      {
        id: '5',
        name: 'Gold Member Tier',
        description: 'Exclusive tier for our most loyal customers with premium rewards.',
        type: 'tiered',
        status: 'active',
        customers: 23,
        stampsRedeemed: 156,
        createdAt: '2024-01-01',
        reward: 'Premium Benefits',
      },
    ];

    setPrograms(mockPrograms);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading demo programs...</p>
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
                  Loyalty Programs
                </h1>
                <p className="text-sm text-muted-foreground">
                  Create and manage your customer loyalty programs
                </p>
              </div>
              <button
                onClick={() => navigate('/demo')}
                className="btn-primary w-full sm:w-auto group"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </button>
            </header>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map((program, index) => {
                const TypeIcon = typeIcons[program.type];
                return (
                  <div
                    key={program.id}
                    className="card-hover group relative rounded-2xl bg-card p-6 shadow-lg animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-2">
                          <TypeIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold text-foreground">
                            {program.name}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              statusStyles[program.status]
                            }`}
                          >
                            {program.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {program.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Customers</span>
                        <span className="font-medium text-foreground">{program.customers}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Redemptions</span>
                        <span className="font-medium text-foreground">{program.stampsRedeemed}</span>
                      </div>
                      {program.targetStamps && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Target</span>
                          <span className="font-medium text-foreground">{program.targetStamps} stamps</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(program.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Create new program card */}
              <div className="card-hover group relative rounded-2xl border-2 border-dashed border-primary/20 bg-card/50 p-6 shadow-lg hover:border-primary/40 hover:bg-card transition-colors">
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                  <div className="rounded-xl bg-primary/10 p-3 mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">
                    Create New Program
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Design a loyalty program to engage your customers
                  </p>
                  <button className="btn-primary">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DemoPrograms;