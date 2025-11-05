import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--rudi-background)',
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
          style={{ transform: 'scale(4.8)', transformOrigin: 'center', marginTop: '4rem', marginBottom: '2rem' }}
        />
        <h2
          style={{
            fontFamily: 'var(--mantine-font-family-headings)',
            fontWeight: 'bold',
            fontSize: 'clamp(3rem, 4.8vw, 3.6rem)',
            marginTop: '0',
            marginBottom: '1rem',
            color: 'var(--rudi-text)',
          }}
        >
          rudi
        </h2>
        <div style={{ width: '100%', padding: '0.25rem' }}>
          <header style={{ marginBottom: '1rem' }}>
            <h1
              style={{
                fontFamily: 'var(--mantine-font-family-headings)',
                fontSize: '1.875rem',
                fontWeight: '600',
                color: 'var(--rudi-text)',
                textAlign: 'center',
                marginBottom: '0.5rem',
              }}
            >
              Terms and Conditions
            </h1>
            <p
              style={{
                color: 'var(--rudi-text)',
                opacity: 0.75,
                textAlign: 'center',
                fontSize: '0.875rem',
              }}
            >
              Please read these terms carefully before using our service.
            </p>
          </header>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '1rem',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--mantine-font-family-headings)',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--rudi-text)',
                  marginBottom: '0.5rem',
                }}
              >
                1. Acceptance of Terms
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--rudi-text)',
                  opacity: 0.8,
                }}
              >
                By accessing and using Rudi, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, you should not access or use the app.
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '1rem',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--mantine-font-family-headings)',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--rudi-text)',
                  marginBottom: '0.5rem',
                }}
              >
                2. Eligibility
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--rudi-text)',
                  opacity: 0.8,
                }}
              >
                The app is not targeted towards, nor intended for use by, anyone under the age of 13. You must be at least 13 years old to use Rudi. If you are between 13 and 18, you may only use the app under the supervision of a parent or legal guardian.
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '1rem',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--mantine-font-family-headings)',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--rudi-text)',
                  marginBottom: '0.5rem',
                }}
              >
                3. Use License
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--rudi-text)',
                  opacity: 0.8,
                }}
              >
                Permission is granted to temporarily use Rudi for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to decompile or reverse engineer any software contained in Rudi; remove any copyright or other proprietary notations from the materials.
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '1rem',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--mantine-font-family-headings)',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--rudi-text)',
                  marginBottom: '0.5rem',
                }}
              >
                4. Privacy Policy
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--rudi-text)',
                  opacity: 0.8,
                }}
              >
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of Rudi, to understand our practices.
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '1rem',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--mantine-font-family-headings)',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--rudi-text)',
                  marginBottom: '0.5rem',
                }}
              >
                5. Acceptable Use
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--rudi-text)',
                  opacity: 0.8,
                }}
              >
                You may not use Rudi in any way that violates applicable local, state, national, or international law or regulation. You agree not to transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '1rem',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--mantine-font-family-headings)',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--rudi-text)',
                  marginBottom: '0.5rem',
                }}
              >
                6. Warranties; Disclaimers
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--rudi-text)',
                  opacity: 0.8,
                }}
              >
                Rudi is provided on an 'as is' basis. To the fullest extent permitted by law, we exclude all representations, warranties, conditions and terms whether express or implied, by statute, common law or otherwise, including without limitation warranties as to satisfactory quality, fitness for purpose, non-infringement, compatibility, security and accuracy.
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '1rem',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--mantine-font-family-headings)',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--rudi-text)',
                  marginBottom: '0.5rem',
                }}
              >
                7. Limitation of Liability
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--rudi-text)',
                  opacity: 0.8,
                }}
              >
                In no event shall Rudi or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use Rudi, even if Rudi or our authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '1rem',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--mantine-font-family-headings)',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--rudi-text)',
                  marginBottom: '0.5rem',
                }}
              >
                8. Governing Law
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--rudi-text)',
                  opacity: 0.8,
                }}
              >
                These terms and conditions are governed by and construed in accordance with the laws of England and Wales, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '1rem',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--mantine-font-family-headings)',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--rudi-text)',
                  marginBottom: '0.5rem',
                }}
              >
                9. Changes to Terms
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--rudi-text)',
                  opacity: 0.8,
                }}
              >
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </div>
          </div>
          <div style={{ marginTop: '4rem' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                width: '100%',
                height: '3rem',
                borderRadius: '0.75rem',
                backgroundColor: 'var(--rudi-primary)',
                color: 'white',
                fontWeight: 'bold',
                border: 'none',
                transition: 'all 200ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00A67E')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--rudi-primary)')}
            >
              Back
            </button>
          </div>
        </div>
        <footer style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--rudi-text)', opacity: 0.6 }}>
          &copy; 2025 Rudi. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Terms;