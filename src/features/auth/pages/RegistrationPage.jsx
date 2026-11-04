import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  EmailRounded,
  FlagRounded,
  LockRounded,
  PersonRounded,
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

const countries = [
  "India",
  "Netherlands",
  "Germany",
  "United States",
  "United Kingdom",
  "Canada",
  "France",
  "Spain",
];

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

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
        backgroundImage: `linear-gradient(135deg, rgba(0,45,114,0.9), rgba(0,30,77,0.78)), url(${backgroundImage})`,
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
              maxWidth: 500,
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
              Build a resilient network.
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
              Create your monitoring workspace and gain visibility into regional application health, service availability, and operational performance.
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: { xs: "center", md: "flex-start" } }}>
              <Box sx={{ px: 1.5, py: 0.7, borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Regional visibility
                </Typography>
              </Box>

              <Box sx={{ px: 1.5, py: 0.7, borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Secure access
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 500,
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
                <PersonRounded sx={{ fontSize: 26 }} />
              </Box>

              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.metroBlue, letterSpacing: "-0.03em" }}>
                  Create account
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.8, color: COLORS.textSecondary }}>
                  Set up your monitoring access and start tracking service health instantly.
                </Typography>
              </Box>
            </Stack>

            <Box component="form" onSubmit={handleRegister} noValidate>
              <TextField
                label="Full name"
                name="fullName"
                fullWidth
                value={formData.fullName}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonRounded sx={{ color: COLORS.textSecondary, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Email address"
                name="email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleChange}
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
                select
                label="Country"
                name="country"
                fullWidth
                value={formData.country}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FlagRounded sx={{ color: COLORS.textSecondary, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              >
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
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

              <TextField
                label="Confirm password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                value={formData.confirmPassword}
                onChange={handleChange}
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
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                        sx={{ color: COLORS.textSecondary }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  py: 1.4,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${COLORS.metroYellow}, #F8D600)`,
                  color: COLORS.metroBlue,
                  fontWeight: 900,
                  boxShadow: "0 10px 20px rgba(255,230,28,0.35)",
                  '&:hover': { background: `linear-gradient(135deg, #F8D600, ${COLORS.metroYellow})` },
                }}
              >
                Create account
              </Button>

              <Divider sx={{ my: 2.5, borderColor: "#E7EDF5" }}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, px: 1 }}>already registered</Typography>
              </Divider>

              <Typography variant="body2" sx={{ textAlign: "center", color: COLORS.textSecondary }}>
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" underline="hover" sx={{ color: COLORS.metroBlue, fontWeight: 800 }}>
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

export default RegistrationPage;