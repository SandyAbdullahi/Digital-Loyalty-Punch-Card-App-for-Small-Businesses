import { useNavigate } from "react-router-dom";
import { Button } from "@mantine/core";
import { QrCode02, ClipboardCheck, Gift01, ShieldTick } from "@untitled-ui/icons-react";
import Logo from "../components/Logo";

type Step = {
  title: string;
  description: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const steps: Step[] = [
  {
    title: "Join a programme",
    description: "Visit your favourite shop and scan their QR code to connect instantly.",
    Icon: QrCode02,
  },
  {
    title: "Collect stamps",
    description: "Staff approve each visit so your punch card fills up honestly.",
    Icon: ClipboardCheck,
  },
  {
    title: "Redeem rewards",
    description: "Celebrate progress—confetti and feel-good copy included!",
    Icon: Gift01,
  },
  {
    title: "Privacy & security",
    description: "Only validated scans count. Your data stays secure with us.",
    Icon: ShieldTick,
  },
];

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#F5F5F5",
  display: "flex",
  flexDirection: "column",
};

const contentWrapperStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.25rem",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "28rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      <div style={contentWrapperStyle}>
        <div style={cardStyle}>
          <Logo
            size="xl"
            style={{
              transform: "scale(4.5)",
              transformOrigin: "center",
              marginTop: "3.75rem",
              marginBottom: "2rem",
            }}
          />
          <h2
            style={{
              fontFamily: "Poppins",
              fontWeight: "bold",
              fontSize: "clamp(3rem, 4.8vw, 3.6rem)",
              marginTop: 0,
              marginBottom: "1rem",
              color: "#1A1A1A",
            }}
          >
            rudi
          </h2>
          <div style={{ width: "100%", padding: "0.25rem" }}>
            <header style={{ marginBottom: "1.5rem", textAlign: "center" }}>
              <h1
                style={{
                  fontFamily: "Poppins",
                  fontSize: "1.875rem",
                  fontWeight: 600,
                  color: "#1A1A1A",
                  marginBottom: "0.5rem",
                }}
              >
                How it works
              </h1>
              <p
                style={{
                  color: "#1A1A1A",
                  opacity: 0.75,
                  fontSize: "0.9rem",
                  margin: 0,
                }}
              >
                Rudi makes it easy to earn rewards at local businesses while keeping every stamp verified.
              </p>
            </header>
            <ol style={{ display: "flex", flexDirection: "column", gap: "1rem", margin: 0, padding: 0 }}>
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  style={{
                    listStyle: "none",
                    backgroundColor: "white",
                    borderRadius: "1rem",
                    boxShadow: "0 12px 32px -18px rgba(17, 24, 39, 0.2)",
                    padding: "1rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.85rem",
                    border: "1px solid #EEF1F6",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "#E6FCF5",
                      color: "#00A47A",
                      flexShrink: 0,
                    }}
                  >
                    <step.Icon width={20} height={20} strokeWidth={1.8} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <h2
                      style={{
                        fontFamily: "Poppins",
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        color: "#1A1A1A",
                        margin: 0,
                      }}
                    >
                      {index + 1}. {step.title}
                    </h2>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#1A1A1A",
                        opacity: 0.8,
                        margin: "0.35rem 0 0",
                      }}
                    >
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div style={{ marginTop: "2.5rem" }}>
              <Button
                type="button"
                fullWidth
                size="md"
                onClick={() => navigate(-1)}
                styles={{
                  root: {
                    height: "3rem",
                    borderRadius: "0.85rem",
                    backgroundColor: "#00C896",
                    fontWeight: 600,
                  },
                }}
              >
                Back to login
              </Button>
            </div>
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: "0.75rem",
            color: "#1A1A1A",
            opacity: 0.6,
            padding: "1rem",
            marginTop: "2rem",
          }}
        >
          © 2025 Rudi. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
