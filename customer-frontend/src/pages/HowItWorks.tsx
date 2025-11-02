import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const steps = [
  {
    title: 'Join a programme',
    description: 'Visit your favourite shop and scan their QR code to connect.',
    emoji: '📲',
  },
  {
    title: 'Collect stamps',
    description: 'Staff approve each visit so your punch card fills up honestly.',
    emoji: '🟢',
  },
  {
    title: 'Redeem rewards',
    description: 'Celebrate progress—confetti and feel-good copy included!',
    emoji: '🎉',
  },
  {
    title: 'Privacy & security',
    description: 'Only validated scans count. Your data stays secure with us.',
    emoji: '🛡️',
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-rudi-sand text-rudi-maroon font-body flex flex-col">
      <div className="px-4 py-8 space-y-8">
        <Logo />
        <header className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold">How it works</h1>
          <p className="text-rudi-maroon/75">
            Rudi makes it easy to earn rewards at local businesses while keeping every stamp verified.
          </p>
        </header>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={step.title} className="rudi-card p-4 flex items-start gap-3" aria-label={step.title}>
              <span className="text-2xl" aria-hidden="true">
                {step.emoji}
              </span>
              <div>
                <h2 className="font-heading text-lg font-semibold">
                  {index + 1}. {step.title}
                </h2>
                <p className="text-sm text-rudi-maroon/80">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="sticky bottom-0 left-0 right-0 px-4 pb-10 pt-6 bg-gradient-to-t from-rudi-sand via-rudi-sand/95 to-transparent">
        <button type="button" className="rudi-btn rudi-btn--primary w-full" onClick={() => navigate(-1)}>
          Back to login
        </button>
      </div>
    </main>
  );
};

export default HowItWorks;
