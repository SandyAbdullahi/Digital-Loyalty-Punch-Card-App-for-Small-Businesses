import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { User, QrCode, Stamp, Gift, BarChart3, HelpCircle } from 'lucide-react';

const GetStarted = () => {
  const navigate = useNavigate();

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
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        transition={{ duration: 0.6, delay }}
      >
        {children}
      </motion.div>
    );
  };

  const steps = [
    {
      number: 1,
      icon: <User className="w-6 h-6" />,
      title: "Create Your Account",
      description: "Sign up with your email (no password required). We'll log you in automatically or send a code later.",
      cta: { text: "Sign Up", action: () => navigate('/register') }
    },
    {
      number: 2,
      icon: <QrCode className="w-6 h-6" />,
      title: "Join or Create a Program",
      description: "Customers: scan a merchant QR to join. Merchants: create your first loyalty program from the dashboard.",
      cta: { text: "View Dashboard", action: () => navigate('/dashboard') },
      cta2: { text: "Create Program", action: () => navigate('/programs') }
    },
    {
      number: 3,
      icon: <Stamp className="w-6 h-6" />,
      title: "Collect Stamps",
      description: "Each visit earns you a verified digital stamp. Watch your punch card fill up!",
      illustration: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
    },
    {
      number: 4,
      icon: <Gift className="w-6 h-6" />,
      title: "Redeem Rewards",
      description: "When your card fills, redeem instantly and celebrate with confetti 🎉."
    },
    {
      number: 5,
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Track Your Progress",
      description: "View your rewards and history anytime from your dashboard.",
      cta: { text: "Go to Dashboard", action: () => navigate('/dashboard') }
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--rudi-sand)] font-body">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--rudi-maroon)] mb-4">
            Get Started with Rudi
          </h1>
          <p className="font-body text-[var(--rudi-maroon)]/90 text-center max-w-2xl mx-auto">
            Follow these simple steps to start earning and rewarding loyalty
          </p>
        </div>

        {/* Step Cards */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <AnimatedSection key={step.number} delay={index * 0.1}>
              <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-[#EADCC7] hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--rudi-teal)] text-white font-bold grid place-items-center flex-shrink-0">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-[var(--rudi-teal)]">
                        {step.icon}
                      </div>
                      <h2 className="font-heading text-xl font-semibold text-[var(--rudi-maroon)]">
                        {step.title}
                      </h2>
                    </div>
                    <p className="text-[var(--rudi-maroon)]/80 mb-4">
                      {step.description}
                    </p>
                    {step.illustration && (
                      <div className="mb-4">
                        <img
                          src={step.illustration}
                          alt="Punch card illustration"
                          className="w-full max-w-sm rounded-lg shadow-sm"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex gap-4">
                      {step.cta && (
                        <button
                          onClick={step.cta.action}
                          className="text-[var(--rudi-teal)] font-semibold hover:underline underline-offset-4 transition"
                        >
                          {step.cta.text}
                        </button>
                      )}
                      {step.cta2 && (
                        <button
                          onClick={step.cta2.action}
                          className="text-[var(--rudi-teal)] font-semibold hover:underline underline-offset-4 transition"
                        >
                          {step.cta2.text}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Callout Section */}
        <AnimatedSection delay={0.5}>
          <div className="rounded-2xl bg-[var(--rudi-yellow)] text-[var(--rudi-maroon)] p-6 text-center shadow-lg">
            <HelpCircle className="w-8 h-8 mx-auto mb-4 text-[var(--rudi-maroon)]" />
            <h2 className="font-heading text-xl font-semibold mb-2">Need help setting up?</h2>
            <p className="text-[var(--rudi-maroon)]/80 mb-4">Check our FAQ or contact support.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/#faq')}
                className="bg-transparent border-2 border-[var(--rudi-teal)] text-[var(--rudi-teal)] rounded-2xl h-12 px-6 font-medium hover:bg-[var(--rudi-teal)] hover:text-white transition focus-visible:outline-2 focus-visible:outline-[var(--rudi-teal)]"
              >
                View FAQ
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="bg-[var(--rudi-teal)] text-white rounded-2xl h-12 px-6 font-medium hover:brightness-105 transition focus-visible:outline-2 focus-visible:outline-[var(--rudi-teal)]"
              >
                Contact Us
              </button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default GetStarted;