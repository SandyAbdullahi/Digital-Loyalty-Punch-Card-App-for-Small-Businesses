import { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Play, Star, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

const Landing = () => {
  const navigate = useNavigate();
  const [demoStamps, setDemoStamps] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();



  const addStamp = () => {
    if (demoStamps < 10) {
      setDemoStamps(demoStamps + 1);
    }
  };

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

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

  const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

    useEffect(() => {
      if (inView) {
        controls.start({ opacity: 1, y: 0 });
      }
    }, [controls, inView]);

    return (
      <motion.div
        ref={ref}
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={controls}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay }}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <NavBar />

      {/* Hero Section */}
      <section className="relative -mt-16 pt-0 pb-24 min-h-[110vh] flex items-center justify-center overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C896" />
              <stop offset="100%" stopColor="#2196F3" />
            </linearGradient>
            <linearGradient id="waveGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2196F3" />
              <stop offset="100%" stopColor="#00C896" />
            </linearGradient>
          </defs>
          <path d="M0,0 Q400,-80 720,0 T1440,0 V100 Q1120,200 720,100 Q320,0 0,100 Z" fill="url(#waveGradient1)" opacity="0.7">
            <animate attributeName="d" dur="8s" repeatCount="indefinite" values="M0,0 Q400,-80 720,0 T1440,0 V100 Q1120,200 720,100 Q320,0 0,100 Z;M0,10 Q420,-70 740,10 T1440,10 V110 Q1140,210 740,110 Q340,10 0,110 Z;M0,0 Q400,-80 720,0 T1440,0 V100 Q1120,200 720,100 Q320,0 0,100 Z" />
          </path>
          <path d="M0,50 Q520,-50 960,50 T1440,50 V150 Q1000,250 520,150 Q0,50 0,150 Z" fill="url(#waveGradient2)" opacity="0.5">
            <animate attributeName="d" dur="10s" repeatCount="indefinite" values="M0,50 Q520,-50 960,50 T1440,50 V150 Q1000,250 520,150 Q0,50 0,150 Z;M0,60 Q540,-40 980,60 T1440,60 V160 Q1020,260 540,160 Q20,60 0,160 Z;M0,50 Q520,-50 960,50 T1440,50 V150 Q1000,250 520,150 Q0,50 0,150 Z" />
          </path>
          <path d="M0,100 Q650,0 1200,100 T1440,100 V200 Q1280,300 650,200 Q0,100 0,200 Z" fill="#00C896" opacity="0.3">
            <animate attributeName="d" dur="12s" repeatCount="indefinite" values="M0,100 Q650,0 1200,100 T1440,100 V200 Q1280,300 650,200 Q0,100 0,200 Z;M0,110 Q670,10 1220,110 T1440,110 V210 Q1300,310 670,210 Q20,110 0,210 Z;M0,100 Q650,0 1200,100 T1440,100 V200 Q1280,300 650,200 Q0,100 0,200 Z" />
          </path>
          <path d="M0,630 Q400,730 720,630 T1440,630 V730 Q1100,630 720,730 Q340,830 0,730 Z" fill="url(#waveGradient1)" opacity="0.6">
            <animate attributeName="d" dur="9s" repeatCount="indefinite" values="M0,630 Q400,730 720,630 T1440,630 V730 Q1100,630 720,730 Q340,830 0,730 Z;M0,640 Q420,740 740,640 T1440,640 V740 Q1120,640 740,740 Q360,840 0,740 Z;M0,630 Q400,730 720,630 T1440,630 V730 Q1100,630 720,730 Q340,830 0,730 Z" />
          </path>
          <path d="M0,680 Q520,780 960,680 T1440,680 V780 Q1000,680 520,780 Q0,880 0,780 Z" fill="url(#waveGradient2)" opacity="0.4">
            <animate attributeName="d" dur="11s" repeatCount="indefinite" values="M0,680 Q520,780 960,680 T1440,680 V780 Q1000,680 520,780 Q0,880 0,780 Z;M0,690 Q540,790 980,690 T1440,690 V790 Q1020,690 540,790 Q20,890 0,790 Z;M0,680 Q520,780 960,680 T1440,680 V780 Q1000,680 520,780 Q0,880 0,780 Z" />
          </path>
          <path d="M0,730 Q650,830 1200,730 T1440,730 V830 Q1250,730 650,830 Q0,930 0,830 Z" fill="#00C896" opacity="0.2">
            <animate attributeName="d" dur="13s" repeatCount="indefinite" values="M0,730 Q650,830 1200,730 T1440,730 V830 Q1250,730 650,830 Q0,930 0,830 Z;M0,740 Q670,840 1220,740 T1440,740 V840 Q1270,740 670,840 Q20,940 0,840 Z;M0,730 Q650,830 1200,730 T1440,730 V830 Q1250,730 650,830 Q0,930 0,830 Z" />
          </path>
        </svg>

        <motion.div
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mt-32"
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8 }}
        >
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            Kenya's friendliest digital stamp card
          </h1>
          <p className="font-body text-muted-foreground text-base sm:text-lg mb-6 max-w-md mx-auto">
            Join with one scan, earn stamps, redeem instantly.
          </p>
          <button
            onClick={() => navigate('/get-started')}
            className="bg-primary text-primary-foreground rounded-2xl h-12 px-6 font-semibold hover:opacity-90 active:translate-y-px transition focus-visible:outline-2 focus-visible:ring-ring"
          >
            Get Started
          </button>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="py-8 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground mb-6">Trusted by local cafés & shops</p>
          <div className="flex justify-center items-center space-x-12 opacity-80">
            <svg className="w-20 h-20" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" fill="#00C896" stroke="#00C896" strokeWidth="2"/>
              <path d="M20 24h24v16c0 4-4 8-8 8H28c-4 0-8-4-8-8V24z" fill="white"/>
              <rect x="26" y="20" width="12" height="4" fill="white"/>
              <circle cx="32" cy="36" r="2" fill="white"/>
            </svg>
            <svg className="w-20 h-20" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" fill="#00C896" stroke="#00C896" strokeWidth="2"/>
              <path d="M16 40V24c0-4 4-8 8-8h16c4 0 8 4 8 8v16c0 4-4 8-8 8H24c-4 0-8-4-8-8z" fill="white"/>
              <rect x="24" y="28" width="16" height="2" fill="white"/>
              <rect x="24" y="32" width="12" height="2" fill="white"/>
              <rect x="24" y="36" width="8" height="2" fill="white"/>
            </svg>
            <svg className="w-20 h-20" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" fill="#00C896" stroke="#00C896" strokeWidth="2"/>
              <path d="M20 20h24v20c0 4-4 8-8 8H28c-4 0-8-4-8-8V20z" fill="white"/>
              <circle cx="26" cy="26" r="2" fill="white"/>
              <circle cx="32" cy="26" r="2" fill="white"/>
              <circle cx="38" cy="26" r="2" fill="white"/>
              <circle cx="26" cy="32" r="2" fill="white"/>
              <circle cx="32" cy="32" r="2" fill="white"/>
            </svg>
            <svg className="w-20 h-20" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" fill="#00C896" stroke="#00C896" strokeWidth="2"/>
              <path d="M24 20l8-8 8 8v20c0 4-4 8-8 8s-8-4-8-8V20z" fill="white"/>
              <rect x="28" y="28" width="8" height="2" fill="white"/>
              <rect x="30" y="32" width="4" height="2" fill="white"/>
            </svg>
            <svg className="w-20 h-20" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" fill="#00C896" stroke="#00C896" strokeWidth="2"/>
              <path d="M20 24h24v16c0 4-4 8-8 8H28c-4 0-8-4-8-8V24z" fill="white"/>
              <path d="M24 28h16v4H24v-4z" fill="white"/>
              <circle cx="32" cy="36" r="2" fill="white"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection>
              <div className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Simple</h3>
                <p className="text-muted-foreground">Join with one scan.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <div className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🎁</span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Rewarding</h3>
                <p className="text-muted-foreground">Stamps → instant perks.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Secure</h3>
                <p className="text-muted-foreground">Merchant-verified, anti-fraud.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 md:py-16 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl text-foreground text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">1</div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Join a program</h3>
                <p className="text-muted-foreground">Scan the QR in-store.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-secondary-foreground font-bold text-xl">2</div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Collect stamps</h3>
                <p className="text-muted-foreground">Dot pops with each visit.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 text-accent-foreground font-bold text-xl">3</div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Redeem rewards</h3>
                <p className="text-muted-foreground">Confetti + instant claim.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg text-center">
            <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4">Try It Out</h2>
            <p className="text-muted-foreground mb-8">Simulated punch card — tap to add a stamp!</p>
            <div className="flex justify-center mb-6">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }, (_, i) => (
                  <motion.div
                    key={i}
                    className={`w-12 h-12 rounded-full border-2 ${
                      i < demoStamps ? 'bg-primary border-primary' : 'border-muted-foreground/20'
                    }`}
                    animate={i < demoStamps ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={addStamp}
              disabled={demoStamps >= 10}
              className="bg-primary text-primary-foreground rounded-2xl h-12 px-6 hover:opacity-90 transition-colors font-medium disabled:opacity-50"
            >
              {demoStamps >= 10 ? 'Reward Unlocked!' : 'Tap to add a stamp'}
            </button>
          </div>
        </div>
      </section>

      {/* For Merchants */}
      <section id="for-merchants" className="py-12 md:py-16 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <div>
                <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">For Merchants</h2>
                <p className="text-muted-foreground mb-6">
                  Launch a loyalty program in minutes—secure QR stamps, real-time analytics.
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span className="text-muted-foreground">Create programs instantly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span className="text-muted-foreground">Generate secure QR codes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span className="text-muted-foreground">Track redemptions in real-time</span>
                  </li>
                </ul>
                 <button
                   onClick={() => navigate('/demo')}
                   className="bg-secondary text-secondary-foreground rounded-2xl h-12 px-6 hover:opacity-90 transition-colors font-medium"
                 >
                   Merchant Demo
                 </button>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <img
                src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg"
                alt="Merchant dashboard"
                className="w-full rounded-2xl shadow-lg"
                loading="lazy"
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl text-foreground text-center mb-12">What Merchants Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection>
              <div className="bg-card rounded-2xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mr-3">S</div>
                  <div>
                    <p className="font-semibold text-foreground">Sarah Chen</p>
                    <div className="flex">
                      {Array(5).fill(0).map((_, i) => <Star key={i} size={12} className="text-secondary fill-current" />)}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground">"Rudi transformed our customer retention. So easy to set up!"</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <div className="bg-card rounded-2xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold mr-3">M</div>
                  <div>
                    <p className="font-semibold text-foreground">Mike Johnson</p>
                    <div className="flex">
                      {Array(5).fill(0).map((_, i) => <Star key={i} size={12} className="text-secondary fill-current" />)}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground">"Our regulars love the stamps. Sales up 20%!"</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="bg-card rounded-2xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold mr-3">E</div>
                  <div>
                    <p className="font-semibold text-foreground">Emma Rodriguez</p>
                    <div className="flex">
                      {Array(5).fill(0).map((_, i) => <Star key={i} size={12} className="text-secondary fill-current" />)}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground">"Secure and reliable. Perfect for our café."</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 md:py-16 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl text-foreground text-center mb-12">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-lg">
              <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">Starter</h3>
              <p className="text-muted-foreground mb-6">Free trial</p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span className="text-muted-foreground">Up to 100 customers</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span className="text-muted-foreground">Basic analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span className="text-muted-foreground">QR code generation</span>
                </li>
              </ul>
              <button className="w-full bg-primary text-primary-foreground rounded-2xl h-12 font-medium hover:opacity-90 transition-colors">
                Try now
              </button>
            </div>
            <div className="bg-secondary/5 border-2 border-secondary rounded-2xl p-8 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">Business</h3>
              <p className="text-muted-foreground mb-6">KES 2,500/month</p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span className="text-muted-foreground">Unlimited customers</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span className="text-muted-foreground">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span className="text-muted-foreground">Priority support</span>
                </li>
              </ul>
              <button className="w-full bg-primary text-primary-foreground rounded-2xl h-12 font-medium hover:opacity-90 transition-colors">
                Start 14-day trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl text-foreground text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How does Rudi work?", a: "Customers scan QR codes in-store to join programs and collect stamps." },
              { q: "Is it secure?", a: "Yes, all transactions are verified and anti-fraud measures are in place." },
              { q: "Can I customize rewards?", a: "Absolutely! Set up any reward structure that fits your business." },
              { q: "What about data privacy?", a: "We comply with all privacy regulations and never share customer data." },
              { q: "How do I get started?", a: "Sign up for a free trial and launch your first program in minutes." },
            ].map((item, index) => (
              <div key={index} className="bg-card rounded-2xl shadow-lg">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-foreground">{item.q}</span>
                  {faqOpen === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {faqOpen === index && (
                  <div className="px-6 pb-4">
                    <p className="text-muted-foreground">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-12 md:py-16 bg-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-primary-foreground mb-4">Turn visits into loyalty.</h2>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of merchants building lasting customer relationships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = 'http://localhost:3002/register'}
              className="bg-primary-foreground text-primary rounded-2xl h-12 px-6 hover:opacity-90 transition-colors font-medium"
            >
              Get the App
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-secondary text-secondary-foreground rounded-2xl h-12 px-6 hover:opacity-90 transition-colors font-medium"
            >
              Merchant Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-4">Rudi</h3>
              <p className="text-muted-foreground">Building loyalty, one stamp at a time.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-muted-foreground hover:text-primary">How it works</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-primary">Pricing</a></li>
                <li><a href="#faq" className="text-muted-foreground hover:text-primary">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Merchants</h4>
              <ul className="space-y-2">
                <li><a href="#for-merchants" className="text-muted-foreground hover:text-primary">Dashboard</a></li>
                <li><a href="#analytics" className="text-muted-foreground hover:text-primary">Analytics</a></li>
                <li><a href="#qr" className="text-muted-foreground hover:text-primary">QR Codes</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-muted-foreground hover:text-primary">About</a></li>
                <li><a href="#contact" className="text-muted-foreground hover:text-primary">Contact</a></li>
                <li><a href="#privacy" className="text-muted-foreground hover:text-primary">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground">© 2024 Rudi. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-primary">Twitter</a>
              <a href="#" className="text-muted-foreground hover:text-primary">LinkedIn</a>
              <a href="#" className="text-muted-foreground hover:text-primary">Instagram</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <AnimatePresence>
        {demoModalOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeDemoModal}
          >
            <motion.div
              initial={shouldReduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
              animate={shouldReduceMotion ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
              exit={shouldReduceMotion ? { scale: 0.9, opacity: 0 } : { scale: 0.9, opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeDemoModal}
                className="absolute top-4 right-4 z-10 bg-card/80 backdrop-blur-sm rounded-full p-2 hover:bg-card transition-colors focus-visible:outline-2 focus-visible:ring-ring"
                aria-label="Close demo"
              >
                <X size={20} className="text-foreground" />
              </button>
              <div className="aspect-video bg-muted flex items-center justify-center">
                <div className="text-center">
                  <Play size={48} className="text-primary mx-auto mb-4" />
                  <p className="text-foreground font-medium">Demo Video Placeholder</p>
                  <p className="text-muted-foreground text-sm">30-second overview of Rudi loyalty system</p>
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