import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Anchor, Button, Paper, Stack, TextInput } from "@mantine/core";
import { Mail01, Lock01, ArrowNarrowRight, Stars02, Award02, ShieldTick } from "@untitled-ui/icons-react";
import Logo from "../components/Logo";
import { useAuth } from "../contexts/AuthContext";

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background: "radial-gradient(circle at top left, #E0FFF5 0%, transparent 55%), linear-gradient(135deg, #FFFFFF 0%, #F5F7FB 100%)",
};

const contentWrapperStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.5rem",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "28rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5rem",
};

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
                <Stars02 width={16} height={16} strokeWidth={1.8} /> Seamless check-ins, verified rewards
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
                  leftSection={<Mail01 width={18} height={18} strokeWidth={1.8} />}
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
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  leftSection={<Lock01 width={18} height={18} strokeWidth={1.8} />}
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
                    rightSection={<ArrowNarrowRight width={18} height={18} />}
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Stars02 width={18} height={18} strokeWidth={1.8} color="#F97316" />
              <span style={{ fontSize: "0.9rem", color: "#1A1A1A" }}>
                Collect verified stamps in seconds—no flimsy paper cards.
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Award02 width={18} height={18} strokeWidth={1.8} color="#0091FF" />
              <span style={{ fontSize: "0.9rem", color: "#1A1A1A" }}>
                Unlock irresistible rewards tailored to loyal guests.
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <ShieldTick width={18} height={18} strokeWidth={1.8} color="#12A150" />
              <span style={{ fontSize: "0.9rem", color: "#1A1A1A" }}>
                Bank-grade security keeps every account safe.
              </span>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <Link
              to="/how-it-works"
              style={{ fontSize: "0.85rem", color: "#1A1A1A", textDecoration: "none", fontWeight: "bold" }}
            >
              Explore how Rudi works ?
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
        © 2025 Rudi. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
