import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  EmailRounded,
  LockRounded,
  LoginRounded,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import backgroundImage from "../../../assets/makro-store-background.webp";
import MakroLogo from "../../../assets/Makro_logo.svg";

const COLORS = {
  metroBlue: "#002D72",
  metroBlueDark: "#001E4D",
  metroYellow: "#FFE61C",
  pageBackground: "#F4F7FB",
  lightBlue: "#EAF2FF",
  success: "#168A45",
  warning: "#DB7200",
  error: "#C62828",
  textPrimary: "#172033",
  textSecondary: "#64748B",
  border: "#DEE5EF",
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    sessionStorage.setItem("user", JSON.stringify("india"));
    navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(135deg, rgba(0,45,114,0.88), rgba(0,30,77,0.75)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems="center"
          justifyContent="center"
          spacing={{ xs: 3, md: 5 }}
        >
          <Box
            sx={{
              flex: 1,
              maxWidth: 520,
              color: "#FFFFFF",
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Box
              component="img"
              src={MakroLogo}
              alt="Makro logo"
              sx={{
                width: { xs: 170, md: 220 },
                height: "auto",
                mb: 2,
                filter: "drop-shadow(0 10px 28px rgba(0,0,0,0.18))",
              }}
            />

            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                letterSpacing: "-0.04em",
                mb: 1.5,
                lineHeight: 1.05,
              }}
            >
              Operations at a glance.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.82)",
                maxWidth: 420,
                mx: { xs: "auto", md: 0 },
                fontSize: "1.02rem",
              }}
            >
              Monitor app health, track service quality, and respond to availability issues across all regions from a single command center.
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: { xs: "center", md: "flex-start" } }}>
              <Box sx={{ px: 1.5, py: 0.7, borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  99.9% uptime
                </Typography>
              </Box>

              <Box sx={{ px: 1.5, py: 0.7, borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  24/7 monitoring
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 470,
              borderRadius: 4,
              p: { xs: 2.5, md: 4 },
              border: `1px solid rgba(255,255,255,0.22)`,
              background: "rgba(255,255,255,0.96)",
              boxShadow: "0 20px 55px rgba(0, 11, 33, 0.24)",
            }}
          >
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: COLORS.metroYellow,
                  color: COLORS.metroBlue,
                  boxShadow: "0 8px 18px rgba(255,230,28,0.35)",
                }}
              >
                <LoginRounded sx={{ fontSize: 26 }} />
              </Box>

              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.metroBlue, letterSpacing: "-0.03em" }}>
                  Welcome back
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.8, color: COLORS.textSecondary }}>
                  Sign in to continue monitoring your applications.
                </Typography>
              </Box>
            </Stack>

            <Box component="form" onSubmit={handleLogin} noValidate>
              <TextField
                label="Email address"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailRounded sx={{ color: COLORS.textSecondary, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRounded sx={{ color: COLORS.textSecondary, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                        sx={{ color: COLORS.textSecondary }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                sx={{ my: 2.25 }}
              >
                <FormControlLabel
                  control={<Checkbox defaultChecked sx={{ color: COLORS.metroBlue, '&.Mui-checked': { color: COLORS.metroBlue } }} />}
                  label={<Typography variant="body2" color={COLORS.textSecondary}>Remember me</Typography>}
                />

                <Link href="#" underline="hover" sx={{ color: COLORS.metroBlue, fontWeight: 700, fontSize: "0.85rem" }}>
                  Forgot password?
                </Link>
              </Stack>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  py: 1.4,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${COLORS.metroYellow}, #F8D600)`,
                  color: COLORS.metroBlue,
                  fontWeight: 900,
                  boxShadow: "0 10px 20px rgba(255,230,28,0.35)",
                  '&:hover': { background: `linear-gradient(135deg, #F8D600, ${COLORS.metroYellow})` },
                }}
              >
                Sign in
              </Button>

              <Divider sx={{ my: 2.5, borderColor: "#E7EDF5" }}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, px: 1 }}>or</Typography>
              </Divider>

              <Typography variant="body2" sx={{ textAlign: "center", color: COLORS.textSecondary }}>
                New to Makro Monitoring?{' '}
                <Link component={RouterLink} to="/register" underline="hover" sx={{ color: COLORS.metroBlue, fontWeight: 800 }}>
                  Create account
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

export default LoginPage;