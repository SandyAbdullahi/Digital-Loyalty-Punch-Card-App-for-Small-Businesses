import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Play, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

const Landing = () => {
  const navigate = useNavigate();
  const [demoStamps, setDemoStamps] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);



  const addStamp = () => {
    if (demoStamps < 10) {
      setDemoStamps(demoStamps + 1);
    }
  };

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

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

  return (
    <div className="min-h-screen bg-rudi-sand font-body">
      <NavBar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-rudi-sand to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-rudi-maroon tracking-tight mb-4">
                Earn. Return. Reward.
              </h1>
              <p className="text-lg md:text-xl text-rudi-maroon/90 leading-relaxed mb-8">
                Join local shops with one scan, collect stamps, and claim instant rewards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.location.href = 'http://localhost:3002/register'}
                  className="bg-rudi-teal text-white rounded-2xl h-12 px-6 hover:bg-teal-600 transition-colors font-medium"
                >
                  Get the App
                </button>
                <button className="bg-transparent border-2 border-rudi-teal text-rudi-teal rounded-2xl h-12 px-6 hover:bg-rudi-teal hover:text-white transition-colors font-medium flex items-center justify-center gap-2">
                  <Play size={16} />
                  Watch 30s Demo
                </button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                alt="Phone mockup showing punch card"
                className="w-full max-w-md mx-auto rounded-2xl shadow-lg"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rudi-teal/10 to-transparent rounded-2xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-rudi-maroon/70 mb-6">Trusted by local cafés & shops</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection>
              <div className="bg-white rounded-2xl p-6 shadow-rudi-card hover:shadow-rudi-hover transition-shadow">
                <div className="w-12 h-12 bg-rudi-teal/10 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-rudi-maroon mb-2">Simple</h3>
                <p className="text-rudi-maroon/70">Join with one scan.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <div className="bg-white rounded-2xl p-6 shadow-rudi-card hover:shadow-rudi-hover transition-shadow">
                <div className="w-12 h-12 bg-rudi-yellow/10 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🎁</span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-rudi-maroon mb-2">Rewarding</h3>
                <p className="text-rudi-maroon/70">Stamps → instant perks.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="bg-white rounded-2xl p-6 shadow-rudi-card hover:shadow-rudi-hover transition-shadow">
                <div className="w-12 h-12 bg-rudi-coral/10 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-rudi-maroon mb-2">Secure</h3>
                <p className="text-rudi-maroon/70">Merchant-verified, anti-fraud.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 md:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl text-rudi-maroon text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection>
              <div className="text-center">
                <div className="w-16 h-16 bg-rudi-teal rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">1</div>
                <h3 className="font-heading text-xl font-semibold text-rudi-maroon mb-2">Join a program</h3>
                <p className="text-rudi-maroon/70">Scan the QR in-store.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <div className="text-center">
                <div className="w-16 h-16 bg-rudi-yellow rounded-full flex items-center justify-center mx-auto mb-4 text-rudi-maroon font-bold text-xl">2</div>
                <h3 className="font-heading text-xl font-semibold text-rudi-maroon mb-2">Collect stamps</h3>
                <p className="text-rudi-maroon/70">Dot pops with each visit.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="text-center">
                <div className="w-16 h-16 bg-rudi-coral rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">3</div>
                <h3 className="font-heading text-xl font-semibold text-rudi-maroon mb-2">Redeem rewards</h3>
                <p className="text-rudi-maroon/70">Confetti + instant claim.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-rudi-card text-center">
            <h2 className="font-heading text-2xl md:text-3xl text-rudi-maroon mb-4">Try It Out</h2>
            <p className="text-rudi-maroon/70 mb-8">Simulated punch card — tap to add a stamp!</p>
            <div className="flex justify-center mb-6">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }, (_, i) => (
                  <motion.div
                    key={i}
                    className={`w-12 h-12 rounded-full border-2 ${
                      i < demoStamps ? 'bg-rudi-teal border-rudi-teal' : 'border-rudi-maroon/20'
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
              className="bg-rudi-teal text-white rounded-2xl h-12 px-6 hover:bg-teal-600 transition-colors font-medium disabled:opacity-50"
            >
              {demoStamps >= 10 ? 'Reward Unlocked!' : 'Tap to add a stamp'}
            </button>
          </div>
        </div>
      </section>

      {/* For Merchants */}
      <section id="for-merchants" className="py-12 md:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <div>
                <h2 className="font-heading text-3xl md:text-4xl text-rudi-maroon mb-4">For Merchants</h2>
                <p className="text-rudi-maroon/70 mb-6">
                  Launch a loyalty program in minutes—secure QR stamps, real-time analytics.
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-rudi-teal rounded-full"></span>
                    <span className="text-rudi-maroon/80">Create programs instantly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-rudi-teal rounded-full"></span>
                    <span className="text-rudi-maroon/80">Generate secure QR codes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-rudi-teal rounded-full"></span>
                    <span className="text-rudi-maroon/80">Track redemptions in real-time</span>
                  </li>
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-rudi-yellow text-rudi-maroon rounded-2xl h-12 px-6 hover:bg-amber-400 transition-colors font-medium"
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
          <h2 className="font-heading text-3xl md:text-4xl text-rudi-maroon text-center mb-12">What Merchants Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection>
              <div className="bg-white rounded-2xl p-6 shadow-rudi-card">
                <div className="flex items-center mb-4">
                  <img src="https://via.placeholder.com/40" alt="Avatar" className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <p className="font-semibold text-rudi-maroon">Sarah Chen</p>
                    <div className="flex">
                      {Array(5).fill(0).map((_, i) => <Star key={i} size={12} className="text-rudi-yellow fill-current" />)}
                    </div>
                  </div>
                </div>
                <p className="text-rudi-maroon/70">"Rudi transformed our customer retention. So easy to set up!"</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <div className="bg-white rounded-2xl p-6 shadow-rudi-card">
                <div className="flex items-center mb-4">
                  <img src="https://via.placeholder.com/40" alt="Avatar" className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <p className="font-semibold text-rudi-maroon">Mike Johnson</p>
                    <div className="flex">
                      {Array(5).fill(0).map((_, i) => <Star key={i} size={12} className="text-rudi-yellow fill-current" />)}
                    </div>
                  </div>
                </div>
                <p className="text-rudi-maroon/70">"Our regulars love the stamps. Sales up 20%!"</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="bg-white rounded-2xl p-6 shadow-rudi-card">
                <div className="flex items-center mb-4">
                  <img src="https://via.placeholder.com/40" alt="Avatar" className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <p className="font-semibold text-rudi-maroon">Emma Rodriguez</p>
                    <div className="flex">
                      {Array(5).fill(0).map((_, i) => <Star key={i} size={12} className="text-rudi-yellow fill-current" />)}
                    </div>
                  </div>
                </div>
                <p className="text-rudi-maroon/70">"Secure and reliable. Perfect for our café."</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 md:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl text-rudi-maroon text-center mb-12">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white border-2 border-rudi-sand rounded-2xl p-8 shadow-rudi-card">
              <h3 className="font-heading text-2xl font-semibold text-rudi-maroon mb-2">Starter</h3>
              <p className="text-rudi-maroon/70 mb-6">Free trial</p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-rudi-teal">✓</span>
                  <span className="text-rudi-maroon/80">Up to 100 customers</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rudi-teal">✓</span>
                  <span className="text-rudi-maroon/80">Basic analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rudi-teal">✓</span>
                  <span className="text-rudi-maroon/80">QR code generation</span>
                </li>
              </ul>
              <button className="w-full bg-rudi-teal text-white rounded-2xl h-12 font-medium hover:bg-teal-600 transition-colors">
                Try now
              </button>
            </div>
            <div className="bg-rudi-yellow/5 border-2 border-rudi-yellow rounded-2xl p-8 shadow-rudi-card relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-rudi-yellow text-rudi-maroon px-3 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="font-heading text-2xl font-semibold text-rudi-maroon mb-2">Business</h3>
              <p className="text-rudi-maroon/70 mb-6">KES 2,500/month</p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-rudi-teal">✓</span>
                  <span className="text-rudi-maroon/80">Unlimited customers</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rudi-teal">✓</span>
                  <span className="text-rudi-maroon/80">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rudi-teal">✓</span>
                  <span className="text-rudi-maroon/80">Priority support</span>
                </li>
              </ul>
              <button className="w-full bg-rudi-teal text-white rounded-2xl h-12 font-medium hover:bg-teal-600 transition-colors">
                Start 14-day trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl text-rudi-maroon text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How does Rudi work?", a: "Customers scan QR codes in-store to join programs and collect stamps." },
              { q: "Is it secure?", a: "Yes, all transactions are verified and anti-fraud measures are in place." },
              { q: "Can I customize rewards?", a: "Absolutely! Set up any reward structure that fits your business." },
              { q: "What about data privacy?", a: "We comply with all privacy regulations and never share customer data." },
              { q: "How do I get started?", a: "Sign up for a free trial and launch your first program in minutes." },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-rudi-card">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-rudi-sand/50 transition-colors"
                >
                  <span className="font-semibold text-rudi-maroon">{item.q}</span>
                  {faqOpen === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {faqOpen === index && (
                  <div className="px-6 pb-4">
                    <p className="text-rudi-maroon/70">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-12 md:py-16 bg-rudi-maroon">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-white mb-4">Turn visits into loyalty.</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of merchants building lasting customer relationships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = 'http://localhost:3002/register'}
              className="bg-rudi-teal text-white rounded-2xl h-12 px-6 hover:bg-teal-600 transition-colors font-medium"
            >
              Get the App
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-rudi-yellow text-rudi-maroon rounded-2xl h-12 px-6 hover:bg-amber-400 transition-colors font-medium"
            >
              Merchant Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-heading text-xl font-semibold text-rudi-maroon mb-4">Rudi</h3>
              <p className="text-rudi-maroon/70">Building loyalty, one stamp at a time.</p>
            </div>
            <div>
              <h4 className="font-semibold text-rudi-maroon mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-rudi-maroon/70 hover:text-rudi-teal">How it works</a></li>
                <li><a href="#pricing" className="text-rudi-maroon/70 hover:text-rudi-teal">Pricing</a></li>
                <li><a href="#faq" className="text-rudi-maroon/70 hover:text-rudi-teal">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-rudi-maroon mb-4">Merchants</h4>
              <ul className="space-y-2">
                <li><a href="#for-merchants" className="text-rudi-maroon/70 hover:text-rudi-teal">Dashboard</a></li>
                <li><a href="#analytics" className="text-rudi-maroon/70 hover:text-rudi-teal">Analytics</a></li>
                <li><a href="#qr" className="text-rudi-maroon/70 hover:text-rudi-teal">QR Codes</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-rudi-maroon mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-rudi-maroon/70 hover:text-rudi-teal">About</a></li>
                <li><a href="#contact" className="text-rudi-maroon/70 hover:text-rudi-teal">Contact</a></li>
                <li><a href="#privacy" className="text-rudi-maroon/70 hover:text-rudi-teal">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-rudi-sand mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-rudi-maroon/70">© 2024 Rudi. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-rudi-maroon/70 hover:text-rudi-teal">Twitter</a>
              <a href="#" className="text-rudi-maroon/70 hover:text-rudi-teal">LinkedIn</a>
              <a href="#" className="text-rudi-maroon/70 hover:text-rudi-teal">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;