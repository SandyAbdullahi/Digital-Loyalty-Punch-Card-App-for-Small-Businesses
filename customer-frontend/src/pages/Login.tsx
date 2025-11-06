import { useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Anchor, Button, Paper, Stack, TextInput } from "@mantine/core";
import {
  ArrowNarrowRight,
  Gift01,
  Lock01,
  Mail01,
  ShieldTick,
  Star05,
} from "@untitled-ui/icons-react";
import Logo from "../components/Logo";
import { useAuth } from "../contexts/AuthContext";

const containerStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background:
    "radial-gradient(circle at top left, #E0FFF5 0%, transparent 55%), linear-gradient(135deg, #FFFFFF 0%, #F5F7FB 100%)",
};

const contentWrapperStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.5rem",
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "28rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5rem",
};

const benefitItems = [
  {
    icon: <ShieldTick style={{ width: 20, height: 20, color: "#00A47A" }} />,
    text: "Collect verified stamps in seconds—no flimsy paper cards.",
  },
  {
    icon: <Gift01 style={{ width: 20, height: 20, color: "#FFB300" }} />,
    text: "Unlock irresistible rewards tailored to loyal guests.",
  },
  {
    icon: <Lock01 style={{ width: 20, height: 20, color: "#3B1F1E" }} />,
    text: "Bank-grade security keeps every account safe.",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      const message = err?.response?.data?.detail ?? "Unable to log in. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={contentWrapperStyle}>
        <div style={cardStyle}>
          <Logo
            size="xl"
            style={{ transform: "scale(4.2)", transformOrigin: "center", marginTop: "3rem", marginBottom: "1.5rem" }}
          />
          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                fontFamily: "Poppins",
                fontWeight: 700,
                fontSize: "clamp(2.75rem, 4.5vw, 3.5rem)",
                color: "#1A1A1A",
                margin: 0,
              }}
            >
              rudi
            </h2>
            <p style={{ marginTop: "0.5rem", color: "#39424E", opacity: 0.8, fontSize: "0.95rem" }}>
              Trusted by cafes, salons, and local retailers to spark joyful loyalty moments.
            </p>
          </div>

          <Paper
            shadow="md"
            radius="xl"
            p={{ base: "md", md: "lg" }}
            style={{ width: "100%", borderRadius: "1.25rem", border: "1px solid #EEF1F6" }}
          >
            <header style={{ textAlign: "center", marginBottom: "1rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "#E6FCF5",
                  color: "#008566",
                  borderRadius: "999px",
                  padding: "0.35rem 0.85rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                <Star05 className="h-4 w-4" /> Seamless check-ins, verified rewards
              </div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#1A1A1A",
                  marginTop: "1rem",
                  marginBottom: "0.75rem",
                }}
              >
                Log in to your account
              </h3>
              <p style={{ margin: 0, color: "#5B6473", fontSize: "0.9rem" }}>
                Welcome back! Enter your email and password to continue collecting stamps.
              </p>
            </header>

            <form onSubmit={handleSubmit} noValidate>
              <Stack gap="md">
                <TextInput
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  leftSection={<Mail01 className="h-4 w-4 text-[#666666]" />}
                  styles={{
                    input: {
                      height: "3.1rem",
                      borderRadius: "0.85rem",
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E0E6F0",
                      color: "#1A1A1A",
                      fontWeight: 500,
                      paddingLeft: "2.75rem",
                      transition: "border-color 200ms ease, box-shadow 200ms ease",
                    },
                  }}
                />
                <TextInput
                  placeholder="********"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  leftSection={<Lock01 className="h-4 w-4 text-[#666666]" />}
                  styles={{
                    input: {
                      height: "3.1rem",
                      borderRadius: "0.85rem",
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E0E6F0",
                      color: "#1A1A1A",
                      fontWeight: 500,
                      paddingLeft: "2.75rem",
                      transition: "border-color 200ms ease, box-shadow 200ms ease",
                    },
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Anchor
                    component="button"
                    size="sm"
                    style={{ color: "#00A47A", textDecoration: "none", fontWeight: 600 }}
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot password?
                  </Anchor>
                </div>
                {error && (
                  <Alert color="red" variant="light">
                    {error}
                  </Alert>
                )}
                <Stack gap="xs">
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    fullWidth
                    size="md"
                    rightSection={<ArrowNarrowRight className="h-4 w-4" />}
                    styles={{
                      root: {
                        height: "3.1rem",
                        borderRadius: "0.85rem",
                        backgroundColor: "#00C896",
                        fontWeight: 600,
                      },
                    }}
                  >
                    {isSubmitting ? "Logging you in..." : "Log in"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate("/register")}
                    variant="outline"
                    fullWidth
                    size="md"
                    styles={{
                      root: {
                        height: "3.1rem",
                        borderRadius: "0.85rem",
                        borderColor: "#2196F3",
                        color: "#2196F3",
                        fontWeight: 600,
                      },
                    }}
                  >
                    Create a customer account
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Paper>

          <div
            style={{
              width: "100%",
              marginTop: "1.5rem",
              backgroundColor: "#FFFFFF",
              borderRadius: "1rem",
              border: "1px solid #EEF1F6",
              padding: "1rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {benefitItems.map((item) => (
              <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {item.icon}
                <span style={{ fontSize: "0.9rem", color: "#1A1A1A" }}>{item.text}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <Link
              to="/how-it-works"
              style={{ fontSize: "0.85rem", color: "#1A1A1A", textDecoration: "none", fontWeight: "bold" }}
            >
              Explore how Rudi works <ArrowNarrowRight className="inline h-4 w-4 align-middle" />
            </Link>
          </div>
        </div>
      </div>
      <footer
        style={{
          textAlign: "center",
          fontSize: "0.75rem",
          color: "#1A1A1A",
          opacity: 0.6,
          padding: "1rem",
        }}
      >
        Copyright 2025 Rudi. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;

