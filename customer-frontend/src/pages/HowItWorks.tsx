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
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FDF6EC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '28rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Logo
          size="xl"
          style={{ transform: 'scale(4.8)', transformOrigin: 'center', marginBottom: '2rem' }}
        />
        <h2
          style={{
            fontFamily: 'var(--mantine-font-family-headings)',
            fontWeight: 'bold',
            fontSize: 'clamp(3rem, 4.8vw, 3.6rem)',
            marginTop: '0',
            marginBottom: '1.5rem',
            color: '#3B1F1E',
          }}
        >
          rudi
        </h2>
        <div style={{ width: '100%', padding: '1rem' }}>
          <header style={{ marginBottom: '2rem' }}>
            <h1
              style={{
                fontFamily: 'var(--mantine-font-family-headings)',
                fontSize: '1.875rem',
                fontWeight: '600',
                color: '#3B1F1E',
                textAlign: 'center',
                marginBottom: '0.5rem',
              }}
            >
              How it works
            </h1>
            <p
              style={{
                color: '#3B1F1E',
                opacity: 0.75,
                textAlign: 'center',
                fontSize: '0.875rem',
              }}
            >
              Rudi makes it easy to earn rewards at local businesses while keeping every stamp verified.
            </p>
          </header>
          <ol className="how-it-works-cards" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transform: 'translateX(-5%)' }}>
            {steps.map((step, index) => (
              <li
                key={step.title}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
                aria-label={step.title}
              >
                <span style={{ fontSize: '1.5rem' }} aria-hidden="true">
                  {step.emoji}
                </span>
                <div style={{ flex: 1 }}>
                  <h2
                    style={{
                      fontFamily: 'var(--mantine-font-family-headings)',
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#3B1F1E',
                    }}
                  >
                    {index + 1}. {step.title}
                  </h2>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#3B1F1E',
                      opacity: 0.8,
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: '4rem' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                width: '100%',
                height: '3rem',
                borderRadius: '0.75rem',
                backgroundColor: '#FF6F61',
                color: 'white',
                fontWeight: 'bold',
                border: 'none',
                transition: 'all 200ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E55A50')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF6F61')}
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
