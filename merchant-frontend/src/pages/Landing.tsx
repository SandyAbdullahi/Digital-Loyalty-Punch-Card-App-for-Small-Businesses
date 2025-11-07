import {
  Award02,
  BarChartSquare02,
  CheckCircle,
  Gift01,
  QrCode02,
  ShieldTick,
  ShoppingBag02,
  Stars02,
  Users01,
} from '@untitled-ui/icons-react';
import {
  AnimatePresence,
  motion,
  useAnimation,
  useReducedMotion,
} from 'framer-motion';
import { ChevronDown, ChevronUp, Play, Star, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

// Demo Stamp Card Component - Isolated to prevent re-renders affecting page animations
const DemoStampCard = () => {
  const [demoStamps, setDemoStamps] = React.useState(0);
  const [animatingStamp, setAnimatingStamp] = React.useState<number | null>(
    null
  );
  const shouldReduceMotion = useReducedMotion();

  const addStamp = () => {
    if (demoStamps < 10) {
      const stampIndex = demoStamps;
      setDemoStamps(demoStamps + 1);
      // Animate only this specific stamp
      setAnimatingStamp(stampIndex);
      // Clear animation after it completes
      setTimeout(() => {
        setAnimatingStamp(null);
      }, 400);
    }
  };

  return (
    <>
      <div className="mt-8 flex justify-center">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => (
            <motion.div
              key={i}
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                i < demoStamps
                  ? 'border-rudi-teal bg-rudi-teal/10 text-rudi-teal'
                  : 'border-rudi-maroon/20 bg-white text-rudi-maroon/30'
              }`}
              animate={
                i === animatingStamp && !shouldReduceMotion
                  ? { scale: [1, 1.15, 1] }
                  : undefined
              }
              transition={{ duration: 0.4 }}
            >
              <span className="text-2xl" aria-hidden="true">
                ☕
              </span>
              <span className="sr-only">
                {i < demoStamps ? 'Stamp earned' : 'Stamp slot available'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={addStamp}
          disabled={demoStamps >= 10}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-rudi-teal px-5 font-medium text-white shadow-md shadow-rudi-teal/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-rudi-teal/40 disabled:text-white/70"
        >
          {demoStamps >= 10 ? 'Reward unlocked!' : 'Tap to add a stamp'}
        </button>
        <button
          type="button"
          onClick={() => {
            setDemoStamps(0);
            setAnimatingStamp(null);
          }}
          className="flex h-11 items-center justify-center rounded-2xl border border-rudi-maroon/20 px-5 text-sm font-semibold text-rudi-maroon transition hover:bg-rudi-sand"
        >
          Reset demo
        </button>
      </div>
    </>
  );
};

type AnimatedSectionProps = {
  children: React.ReactNode;
  delay?: number;
  reduceMotion: boolean;
};

const AnimatedSection = ({
  children,
  delay = 0,
  reduceMotion,
}: AnimatedSectionProps) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (inView && !hasAnimated.current) {
      controls.start({ opacity: 1, y: 0 });
      hasAnimated.current = true;
    }
  }, [controls, inView]);

  const initialState =
    reduceMotion || hasAnimated.current
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 20 };

  return (
    <motion.div
      ref={ref}
      initial={initialState}
      animate={reduceMotion ? undefined : controls}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

type FAQItem = {
  question: string;
  answer: string;
};

const FAQSection = ({
  items,
  reduceMotion,
}: {
  items: FAQItem[];
  reduceMotion: boolean;
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection reduceMotion={reduceMotion}>
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-rudi-teal/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rudi-teal">
              FAQs
            </span>
            <h2 className="mt-4 font-heading text-3xl text-rudi-maroon sm:text-4xl">
              Questions we hear often
            </h2>
          </div>
        </AnimatedSection>

        <div className="mt-10 space-y-4">
          {items.map((item, index) => (
            <AnimatedSection
              key={item.question}
              delay={0.05 * index}
              reduceMotion={reduceMotion}
            >
              <div className="overflow-hidden rounded-2xl border border-rudi-maroon/15 bg-white shadow-[0_20px_50px_-35px_rgba(59,31,30,0.65)]">
                <button
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
                >
                  <span className="font-heading text-lg text-rudi-maroon">
                    {item.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-rudi-maroon" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-rudi-maroon" />
                  )}
                </button>
                <motion.div
                  initial={false}
                  animate={openIndex === index ? 'open' : 'collapsed'}
                  variants={{
                    open: { height: 'auto', opacity: 1 },
                    collapsed: { height: 0, opacity: 0 },
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.3 }}
                >
                  <div className="px-6 pb-6 text-sm text-rudi-maroon/70">
                    {item.answer}
                  </div>
                </motion.div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

const faqItems: FAQItem[] = [
  {
    question: 'How long does it take to launch a loyalty programme with Rudi?',
    answer:
      'Most merchants launch in under a week. Choose a template, import your branding, define rewards, and our success team reviews before go-live. We offer guided onboarding if you prefer a helping hand.',
  },
  {
    question: 'Can staff award stamps offline?',
    answer:
      'Yes. Staff can award stamps using a rotating QR or a secure PIN entry when connectivity dips. Once back online, activity syncs automatically to keep analytics precise.',
  },
  {
    question: 'What customer data can I see?',
    answer:
      'Rudi surfaces consented purchase behaviour, visit cadence, favourite locations, and reward history. You can segment audiences but personal data remains encrypted to keep compliance airtight.',
  },
  {
    question: 'Do you support integrations with POS or CRM tools?',
    answer:
      'We integrate with leading POS providers and offer a secure API. For bespoke workflows, our Growth and Enterprise plans include integration support and sandbox environments.',
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const closeDemoModal = () => {
    setDemoModalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && demoModalOpen) {
        closeDemoModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [demoModalOpen]);

  const AnimatedSection = ({
    children,
    delay = 0,
  }: {
    children: React.ReactNode;
    delay?: number;
  }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
    const hasAnimated = useRef(false);

    useEffect(() => {
      if (inView && !hasAnimated.current) {
        controls.start({ opacity: 1, y: 0 });
        hasAnimated.current = true;
      }
    }, [controls, inView]);

    const initialState =
      shouldReduceMotion || hasAnimated.current
        ? { opacity: 1, y: 0 }
        : { opacity: 0, y: 20 };

    return (
      <motion.div
        ref={ref}
        initial={initialState}
        animate={shouldReduceMotion ? undefined : controls}
        transition={
          shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay }
        }
      >
        {children}
      </motion.div>
    );
  };

  const AnimatedCounter = ({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) => {
    const [count, setCount] = useState(0);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
      if (shouldReduceMotion) {
        setCount(target);
        return;
      }

      const duration = 2000; // 2 seconds
      const steps = 60; // 60 fps
      const increment = target / steps;
      const interval = duration / steps;

      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, interval);

      return () => clearInterval(timer);
    }, [target, shouldReduceMotion]);

    const formatValue = (value: number) => {
      if (suffix === 'k+') {
        return value >= 1000 ? `${(value / 1000).toFixed(1)}k+` : `${value}`;
      }
      if (suffix === 'k') {
        return value >= 1000 ? `${value / 1000}k` : `${value}`;
      }
      return `${value}${suffix}`;
    };

    return <span>{prefix}{formatValue(count)}</span>;
  };

  const parseStatValue = (value: string) => {
    if (value === '1.2k+') return 1200;
    if (value === '48k') return 48000;
    if (value === '22%') return 22;
    return 0;
  };

  const getStatSuffix = (value: string) => {
    if (value === '1.2k+') return 'k+';
    if (value === '48k') return 'k';
    if (value === '22%') return '%';
    return '';
  };

  const heroStats = [
    { label: 'Merchants launched', value: '1.2k+' },
    { label: 'Rewards issued', value: '48k' },
    { label: 'Retention lift', value: '22%' },
  ];

  const heroSnapshotStats = [
    { title: 'Repeat', stat: '3.4x' },
    { title: 'Upsell', stat: 'KES 890K' },
    { title: 'Members', stat: '18.2K' },
  ];

  const heroFeed = [
    {
      customer: 'Amina · CBD',
      action: 'Redeemed latte reward',
      value: '+1 perk',
    },
    {
      customer: 'Mwende · Kilimani',
      action: 'Completed 8-stamp card',
      value: '+KES 500 avg spend',
    },
    {
      customer: 'Luis · Karen',
      action: 'Shared referral',
      value: '+3 new members',
    },
  ];

  const socialProofIcons = [
    { icon: ShoppingBag02, label: 'Neighborhood retail' },
    { icon: Users01, label: 'Community hubs' },
    { icon: QrCode02, label: 'QR-first checkout' },
    { icon: BarChartSquare02, label: 'Data-driven teams' },
  ];

  const featureHighlights = [
    {
      title: 'Design signature programs',
      description:
        'Spin up multi-location stamp cards, limited-time perks, and VIP tiers without engineering tickets.',
      icon: Stars02,
      tags: ['Drag-and-drop templates', 'Tiered rewards'],
    },
    {
      title: 'Automate reward moments',
      description:
        'Trigger boosts by visit frequency, spend bands, or staff code entry—Rudi handles the workflows.',
      icon: ShieldTick,
      tags: ['Advanced rules', 'Staff-friendly'],
    },
    {
      title: 'Delight with personalisation',
      description:
        'Send targeted offers, birthday boosts, and surprise delights that keep customers returning.',
      icon: Gift01,
      tags: ['Audience segments', 'Lifecycle journeys'],
    },
  ];

  const operatingHighlights = [
    {
      title: 'Precision audience logic',
      description:
        'Segment by loyalty streaks, average spend, or visit cadence and deliver relevant experiences automatically.',
      icon: Users01,
    },
    {
      title: 'Unified merchant dashboard',
      description:
        'Monitor live redemptions, queue bottlenecks, and campaign performance from a single canvas.',
      icon: BarChartSquare02,
    },
    {
      title: 'Secure compliance & fraud guard',
      description:
        'Unique QR windows, staff pin verification, and anomaly alerts keep every reward honest.',
      icon: ShieldTick,
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Launch your programme',
      description:
        'Choose a template, add brand colours, define rewards, and publish across every location in minutes.',
    },
    {
      step: '02',
      title: 'Grow loyal communities',
      description:
        'Customers join via QR, receive digital wallets instantly, and collect smart stamps every visit.',
    },
    {
      step: '03',
      title: 'Optimise with insights',
      description:
        'See what drives return visits, experiment with boosters, and iterate using real-time feedback.',
    },
  ];

  const insightCards = [
    {
      title: 'Customer lifetime value',
      stat: 'KES 18,450',
      delta: '+12% vs last month',
      description: 'Measure impact by cohort, spend band, and loyalty stage.',
    },
    {
      title: 'Reward redemption window',
      stat: '36 hrs',
      delta: 'Faster by 9 hrs',
      description: 'See the precise time between reward unlock and redemption.',
    },
    {
      title: 'High-performing offers',
      stat: '71%',
      delta: 'Boost conversion',
      description:
        'Limited-time “Double Stamp Friday” leads the pack this week.',
    },
  ];

  const testimonialData = [
    {
      quote:
        'Rudi helped us move past paper cards and create a digital experience customers adore. We grew weekday visits by 27% in under two months.',
      name: 'Njeri Kamau',
      role: 'Founder · Amber & Oak Café',
      initials: 'NK',
      color: 'bg-rudi-teal/20 text-rudi-teal',
      score: 5,
    },
    {
      quote:
        'Our team launches seasonal boosters without developer help. The playbooks and analytics keep us sharp every quarter.',
      name: 'Moses Otieno',
      role: 'Growth Lead · Farm & Pantry',
      initials: 'MO',
      color: 'bg-rudi-yellow/40 text-rudi-maroon',
      score: 5,
    },
    {
      quote:
        'Customers love how fast they can check stamps and redeem rewards. Rudi is now a core part of how we craft brand loyalty.',
      name: 'Salma Gathoni',
      role: 'COO · Atelier Beauty Collective',
      initials: 'SG',
      color: 'bg-rudi-coral/20 text-rudi-coral',
      score: 5,
    },
  ];

  const pricingPlans = [
    {
      title: 'Starter',
      priceLabel: 'Free pilot',
      description: 'Perfect for single-site cafés validating loyalty fit.',
      features: [
        'Up to 150 loyalty members',
        'Branded digital stamp cards',
        'QR + manual stamp awarding',
        'Email support during pilot',
      ],
      cta: 'Start pilot',
      href: '/register',
      highlighted: false,
    },
    {
      title: 'Growth',
      priceLabel: 'KES 2,500/mo',
      description: 'Scale across locations with automations and analytics.',
      features: [
        'Unlimited members & programmes',
        'Automated boosters & journeys',
        'Real-time analytics dashboards',
        'Priority merchant success partner',
      ],
      cta: 'Book onboarding',
      href: '/register',
      highlighted: true,
    },
    {
      title: 'Enterprise',
      priceLabel: 'Custom',
      description: 'Tailored for franchises and multi-brand groups.',
      features: [
        'Dedicated success architect',
        'Advanced API access',
        'White-label progressive web app',
        'Roll-out & training workshops',
      ],
      cta: 'Talk to sales',
      href: '/contact',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6EC] font-body">
      <NavBar />

      <section className="relative -mt-16 flex flex-col justify-center overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:pl-40">
        <div className="relative w-full">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <AnimatedSection reduceMotion={shouldReduceMotion}>
              <div className="mx-auto max-w-xl space-y-6 pt-4 text-center lg:mx-0 lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-rudi-maroon shadow-sm backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-rudi-teal" />
                  Loyalty OS for emerging brands
                </span>
                <h1 className="font-heading text-3xl leading-tight text-rudi-maroon sm:text-4xl lg:text-5xl">
                  Design loyalty journeys your customers feel.
                </h1>
                <p className="text-base text-rudi-maroon/80 sm:text-lg">
                  Rudi helps cafés, grocers, and boutique retailers launch
                  intelligent stamp programmes, personalise offers, and surface
                  real-time insight without a single engineering ticket.
                </p>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:items-start lg:justify-start">
                  <button
                    onClick={() => navigate('/demo/dashboard')}
                    className="flex h-12 w-full items-center justify-center rounded-2xl bg-rudi-teal px-6 font-semibold text-white shadow-lg shadow-rudi-teal/20 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rudi-teal sm:w-auto"
                  >
                    Launch free pilot
                  </button>
                  <button
                    onClick={() => setDemoModalOpen(true)}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rudi-maroon/20 bg-white/80 px-6 font-semibold text-rudi-maroon transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rudi-maroon/40 sm:w-auto"
                  >
                    <Play className="h-4 w-4" />
                    Watch product tour
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-8 sm:grid-cols-3">
                  {heroStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl bg-white/80 p-4 shadow-[0_12px_30px_-12px_rgba(59,31,30,0.25)] backdrop-blur"
                    >
                      <p className="font-heading text-2xl font-semibold text-rudi-maroon">
                        <AnimatedCounter target={parseStatValue(stat.value)} suffix={getStatSuffix(stat.value)} />
                      </p>
                      <p className="text-xs uppercase tracking-wide text-rudi-maroon/60">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.15} reduceMotion={shouldReduceMotion}>
              <div className="relative mt-10 lg:mt-0">
                <div className="absolute -inset-6 hidden rounded-[40px] bg-gradient-to-br from-white via-[#E8FFF7] to-[#FFF5D7] opacity-80 blur-2xl sm:block" />
                <div className="relative mx-auto w-full max-w-md rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_35px_80px_-25px_rgba(59,31,30,0.35)] backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-rudi-maroon/60">
                        Programme health
                      </p>
                      <p className="font-heading text-3xl font-semibold text-rudi-maroon">
                        92%
                      </p>
                    </div>
                    <div className="rounded-full bg-rudi-yellow/40 p-3 text-rudi-maroon">
                      <Gift01 className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="mt-6 text-sm text-rudi-maroon/70">
                    Engagement is up{' '}
                    <span className="font-semibold text-rudi-maroon">18%</span>{' '}
                    this month. Streak boosters are driving second visits within
                    five days.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {heroSnapshotStats.map((snapshot) => (
                      <div
                        key={snapshot.title}
                        className="rounded-2xl bg-[#FDF6EC] p-3 text-center shadow-inner shadow-white"
                      >
                        <p className="font-heading text-xl text-rudi-maroon">
                          {snapshot.stat}
                        </p>
                        <p className="text-[11px] uppercase tracking-wide text-rudi-maroon/60">
                          {snapshot.title}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl border border-rudi-teal/20 bg-rudi-teal/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-rudi-maroon">
                        Live visit feed
                      </span>
                      <span className="text-xs text-rudi-maroon/60">
                        Last 30 min
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {heroFeed.map((entry) => (
                        <div
                          key={entry.customer}
                          className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm shadow-rudi-maroon/5"
                        >
                          <div>
                            <p className="text-sm font-medium text-rudi-maroon">
                              {entry.customer}
                            </p>
                            <p className="text-xs text-rudi-maroon/60">
                              {entry.action}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-rudi-teal">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={
                    shouldReduceMotion
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 20 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: shouldReduceMotion ? 0 : 0.35,
                    duration: shouldReduceMotion ? 0 : 0.6,
                  }}
                  className="mt-6 w-full rounded-3xl border border-white bg-white p-4 shadow-xl sm:absolute sm:-bottom-10 sm:left-6 sm:w-[220px]"
                >
                  <p className="text-xs uppercase tracking-wide text-rudi-maroon/50">
                    Auto-campaign
                  </p>
                  <p className="font-heading text-lg text-rudi-maroon">
                    Birthday boosters live
                  </p>
                  <p className="mt-2 text-xs text-rudi-maroon/60">
                    132 personalised offers go out tomorrow at 9 AM.
                  </p>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection reduceMotion={shouldReduceMotion}>
            <p className="text-center text-sm font-semibold uppercase tracking-[0.35em] text-rudi-maroon/60">
              Trusted by local cafes & shops
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.1} reduceMotion={shouldReduceMotion}>
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4 md:flex md:flex-row md:space-x-12 md:gap-0 justify-center items-center opacity-90">
              {socialProofIcons.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center space-y-3"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rudi-teal/10 text-rudi-teal shadow-sm">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium text-rudi-maroon/80">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection reduceMotion={shouldReduceMotion}>
            <div className="max-w-2xl text-center mx-auto">
              <span className="inline-flex items-center justify-center rounded-full bg-rudi-yellow/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rudi-maroon/80">
                Product pillars
              </span>
              <h2 className="mt-4 font-heading text-3xl text-rudi-maroon sm:text-4xl">
                Everything you need to run a modern loyalty programme
              </h2>
              <p className="mt-4 text-base text-rudi-maroon/70">
                Build experiences that feel handcrafted yet scale across
                multiple locations and customer cohorts.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {featureHighlights.map((feature, index) => (
              <AnimatedSection
                key={feature.title}
                delay={0.1 * index}
                reduceMotion={shouldReduceMotion}
              >
                <div className="h-full rounded-3xl bg-white p-8 shadow-[0_25px_60px_-30px_rgba(59,31,30,0.35)]">
                  <div className="inline-flex items-center justify-center rounded-2xl bg-rudi-teal/10 p-3 text-rudi-teal">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 font-heading text-xl text-rudi-maroon">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm text-rudi-maroon/70">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-rudi-sand px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-rudi-maroon/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-rudi-maroon" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection reduceMotion={shouldReduceMotion}>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                Operating system
              </span>
              <h2 className="mt-4 font-heading text-3xl text-white sm:text-4xl">
                Manage loyalty, rewards, and analytics from one powerful hub.
              </h2>
              <p className="mt-4 text-base text-white/70">
                Rudi turns loyalty, messaging, and insights into a smart system
                that helps every business keep customers coming back.
              </p>
            </div>
          </AnimatedSection>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {operatingHighlights.map((item, index) => (
              <AnimatedSection
                key={item.title}
                delay={0.1 * index}
                reduceMotion={shouldReduceMotion}
              >
                <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-40px_rgba(255,255,255,0.45)] backdrop-blur">
                  <div className="inline-flex items-center justify-center rounded-2xl bg-white/10 p-3 text-white">
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 font-heading text-xl text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-white/70">
                    {item.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection reduceMotion={shouldReduceMotion}>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
              <div>
                <span className="inline-flex items-center rounded-full bg-rudi-teal/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rudi-teal">
                  Experience flow
                </span>
                <h2 className="mt-4 font-heading text-3xl text-rudi-maroon sm:text-4xl">
                  A loyalty journey that feels frictionless for staff and
                  customers.
                </h2>
                <p className="mt-4 text-sm text-rudi-maroon/70">
                  Guide customers from discovery to repeat purchase with
                  meaningful touchpoints at every turn.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                {workflowSteps.map((step) => (
                  <div
                    key={step.step}
                    className="rounded-3xl bg-white p-6 shadow-[0_20px_40px_-30px_rgba(59,31,30,0.45)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rudi-yellow/40 font-heading text-sm font-semibold text-rudi-maroon">
                      {step.step}
                    </div>
                    <h3 className="mt-4 font-heading text-lg text-rudi-maroon">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-rudi-maroon/70">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection reduceMotion={shouldReduceMotion}>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="rounded-[32px] border border-rudi-teal/20 bg-white p-8 shadow-[0_25px_50px_-30px_rgba(0,150,136,0.65)]">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-rudi-teal/10 p-3 text-rudi-teal">
                    <Award02 className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-rudi-maroon/60">
                      Intelligence centre
                    </p>
                    <h3 className="font-heading text-xl text-rudi-maroon">
                      Stay two moves ahead
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-sm text-rudi-maroon/70">
                  Visualise customer performance across locations, track stamp
                  velocity, and uncover the offers that actually move revenue.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {insightCards.map((card) => (
                    <div
                      key={card.title}
                      className="rounded-2xl bg-rudi-sand p-4 shadow-inner shadow-white"
                    >
                      <p className="text-[11px] uppercase tracking-wide text-rudi-maroon/60">
                        {card.title}
                      </p>
                      <p className="mt-2 font-heading text-xl text-rudi-maroon">
                        {card.stat}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-rudi-teal">
                        {card.delta}
                      </p>
                      <p className="mt-2 text-xs text-rudi-maroon/60">
                        {card.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[32px] border border-rudi-maroon/15 bg-white/90 p-8 shadow-[0_30px_70px_-40px_rgba(59,31,30,0.65)] backdrop-blur">
                <h3 className="font-heading text-2xl text-rudi-maroon">
                  Interactive stamp journey
                </h3>
                <p className="mt-3 text-sm text-rudi-maroon/70">
                  Tap the card to award a stamp. Once customers reach 10, they
                  unlock a personalised reward and staff receive a real-time
                  celebration alert.
                </p>
                <DemoStampCard />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection reduceMotion={shouldReduceMotion}>
            <div className="max-w-2xl text-center mx-auto">
              <span className="inline-flex items-center rounded-full bg-rudi-coral/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rudi-coral">
                Stories from the community
              </span>
              <h2 className="mt-4 font-heading text-3xl text-rudi-maroon sm:text-4xl">
                Loved by teams crafting hospitality-led experiences
              </h2>
            </div>
          </AnimatedSection>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonialData.map((testimonial, index) => (
              <AnimatedSection
                key={testimonial.name}
                delay={0.1 * index}
                reduceMotion={shouldReduceMotion}
              >
                <div className="flex h-full flex-col rounded-3xl bg-white p-8 shadow-[0_25px_60px_-40px_rgba(59,31,30,0.65)]">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full font-heading text-sm font-semibold ${testimonial.color}`}
                    >
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-heading text-base text-rudi-maroon">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-rudi-maroon/60">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="mt-6 text-sm text-rudi-maroon/80">
                    {testimonial.quote}
                  </p>
                  <div className="mt-auto pt-6">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: testimonial.score }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-rudi-yellow text-rudi-yellow"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection reduceMotion={shouldReduceMotion}>
            <div className="max-w-2xl text-center mx-auto">
              <span className="inline-flex items-center rounded-full bg-rudi-yellow/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rudi-maroon/80">
                Pricing
              </span>
              <h2 className="mt-4 font-heading text-3xl text-rudi-maroon sm:text-4xl">
                Choose the track that matches your growth
              </h2>
              <p className="mt-3 text-sm text-rudi-maroon/70">
                Start free, scale when you're ready, and unlock advanced
                features and support as your community grows.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <AnimatedSection
                key={plan.title}
                delay={0.1 * index}
                reduceMotion={shouldReduceMotion}
              >
                <div
                  className={`flex h-full flex-col rounded-3xl border p-8 ${
                    plan.highlighted
                      ? 'border-rudi-teal bg-rudi-teal text-white shadow-[0_35px_70px_-30px_rgba(0,150,136,0.55)]'
                      : 'border-rudi-maroon/15 bg-white shadow-[0_25px_60px_-40px_rgba(59,31,30,0.5)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-xl">{plan.title}</h3>
                    {plan.highlighted && (
                      <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                        Most popular
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-2xl font-semibold">
                    {plan.priceLabel}
                  </p>
                  <p
                    className={`mt-3 text-sm ${
                      plan.highlighted ? 'text-white/80' : 'text-rudi-maroon/70'
                    }`}
                  >
                    {plan.description}
                  </p>
                  <ul className="mt-6 space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle
                          className={`mt-1 h-4 w-4 ${
                            plan.highlighted ? 'text-white' : 'text-rudi-teal'
                          }`}
                        />
                        <span
                          className={
                            plan.highlighted
                              ? 'text-white/85'
                              : 'text-rudi-maroon/80'
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6">
                    <button
                      onClick={() => navigate(plan.href)}
                      className={`h-12 w-full rounded-2xl font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        plan.highlighted
                          ? 'bg-white text-rudi-teal shadow-lg focus-visible:outline-white'
                          : 'bg-rudi-teal text-white shadow-md focus-visible:outline-rudi-teal'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection reduceMotion={shouldReduceMotion}>
            <div className="rounded-[32px] border border-rudi-maroon/15 bg-white p-10 shadow-[0_35px_70px_-30px_rgba(59,31,30,0.55)]">
              <div className="flex flex-col gap-6 text-center sm:text-left sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-md">
                  <span className="inline-flex items-center rounded-full bg-rudi-sand px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rudi-maroon/80">
                    Let’s build together
                  </span>
                  <h3 className="mt-3 font-heading text-2xl text-rudi-maroon">
                    Ready to craft a loyalty experience your customers will rave
                    about?
                  </h3>
                  <p className="mt-3 text-sm text-rudi-maroon/70">
                    Book a 30-minute session with our experience architects.
                    We’ll map your vision, share best-practice playbooks, and
                    tailor the ideal launch plan.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:items-end">
                  <button
                    onClick={() => setDemoModalOpen(true)}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-rudi-maroon px-6 font-semibold text-white shadow-lg shadow-rudi-maroon/30 transition hover:-translate-y-0.5"
                  >
                    View product walkthrough
                  </button>
                  <button
                    onClick={() => navigate('/contact')}
                    className="flex h-12 items-center justify-center rounded-2xl border border-rudi-maroon/20 px-6 text-sm font-semibold text-rudi-maroon transition hover:bg-rudi-sand"
                  >
                    Talk to our team
                  </button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <FAQSection items={faqItems} reduceMotion={shouldReduceMotion} />

      <footer className="bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                Rudi
              </h3>
              <p className="text-muted-foreground">
                Building loyalty, one stamp at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#how-it-works"
                    className="text-muted-foreground hover:text-primary"
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-muted-foreground hover:text-primary"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Merchants</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#for-merchants"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#analytics"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Analytics
                  </a>
                </li>
                <li>
                  <a
                    href="#qr"
                    className="text-muted-foreground hover:text-primary"
                  >
                    QR Codes
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#about"
                    className="text-muted-foreground hover:text-primary"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#privacy"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground">
              Copyright 2024 Rudi. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-primary">
                Twitter
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                LinkedIn
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {demoModalOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }
            }
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={closeDemoModal}
          >
            <motion.div
              initial={
                shouldReduceMotion
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0.9, opacity: 0 }
              }
              animate={
                shouldReduceMotion
                  ? { scale: 1, opacity: 1 }
                  : { scale: 1, opacity: 1 }
              }
              exit={
                shouldReduceMotion
                  ? { scale: 0.9, opacity: 0 }
                  : { scale: 0.9, opacity: 0 }
              }
              transition={
                shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }
              }
              className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeDemoModal}
                className="absolute right-4 top-4 rounded-full bg-rudi-maroon/10 p-2 text-rudi-maroon transition hover:bg-rudi-maroon/20"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="aspect-video rounded-2xl bg-muted flex items-center justify-center">
                <div className="text-center">
                  <Play className="mx-auto mb-4 h-12 w-12 text-rudi-teal" />
                  <p className="text-foreground font-medium">
                    Product tour coming soon
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We'll email you the full walkthrough after launch.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
