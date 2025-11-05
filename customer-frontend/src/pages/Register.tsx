import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Paper, Stack, TextInput } from "@mantine/core";
import Logo from "../components/Logo";
import { useAuth } from "../contexts/AuthContext";

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
  padding: "1rem",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "28rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
                    {isSubmitting ? "Creating..." : "Create account"}

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await register(email, password, "customer");
      navigate("/dashboard");
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        "We could not create your account. Try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <div style={{
        ...containerStyle,
        backgroundImage: 'linear-gradient(45deg, #00C896, #2196F3, #F5F5F5)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 5s ease infinite',
      }}>
      <div style={contentWrapperStyle}>
        <div style={cardStyle}>
          <Logo
            size="xl"
            style={{
              transform: "scale(4.8)",
              transformOrigin: "center",
              marginTop: "4rem",
              marginBottom: "2rem",
            }}
          />
          <h2
            style={{
              fontFamily: "Poppins",
              fontWeight: "bold",
              fontSize: "clamp(3rem, 4.8vw, 3.6rem)",
              marginTop: 0,
              marginBottom: "1.5rem",
              color: "#1A1A1A",
            }}
          >
            rudi
          </h2>
          <Paper
            shadow="md"
            radius="xl"
            p={{ base: "md", md: "lg" }}
            style={{ width: "100%", borderRadius: "1rem" }}
          >
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#1A1A1A",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              Register
            </h3>
            <form onSubmit={handleSubmit} noValidate>
              <Stack gap="md">
                <TextInput
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  styles={{
                    input: {
                      height: "3rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E0E0E0",
                      color: "#1A1A1A",
                      fontWeight: 600,
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      transition: "all 200ms ease",
                    },
                  }}
                />
                <TextInput
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  styles={{
                    input: {
                      height: "3rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E0E0E0",
                      color: "#1A1A1A",
                      fontWeight: 600,
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      transition: "all 200ms ease",
                    },
                  }}
                />
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
                    style={{
                      height: "3rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "#00C896",
                      transition: "all 200ms ease",
                    }}
                  >
                     {isSubmitting ? "Creating..." : "Create account"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate("/")}
                    variant="filled"
                    fullWidth
                    size="md"
                    style={{
                      height: "3rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "#2196F3",
                      color: "white",
                      transition: "all 200ms ease",
                    }}
                  >
                    Back to login
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Paper>
          <div
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
             <Link
               to="/how-it-works"
               style={{
                 fontSize: "0.875rem",
                 color: "#1A1A1A",
                 textDecoration: "none",
                 fontWeight: "bold",
                 display: "inline-flex",
                 alignItems: "center",
                 gap: "0.5rem",
               }}
             >
               <span
                 style={{
                   backgroundColor: "#FF5252",
                   borderRadius: "50%",
                   width: "1rem",
                   height: "1rem",
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "center",
                   fontSize: "0.75rem",
                   fontWeight: "bold",
                   color: "white",
                 }}
               >
                 !
               </span>
               How it works
             </Link>
             <Link
               to="/terms"
               style={{
                 fontSize: "0.875rem",
                 color: "#1A1A1A",
                 textDecoration: "none",
                 fontWeight: "bold",
               }}
             >
               Terms and Conditions
             </Link>
          </div>
        </div>
         <footer
           style={{
             position: "fixed",
             bottom: 0,
             left: 0,
             right: 0,
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
    </div>
    </>
  );
};

export default Register;
