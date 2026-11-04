​import { useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

import {
  AppsRounded,
  ArrowForwardRounded,
  CheckCircleRounded,
  ErrorRounded,
  FlagRounded,
  LockRounded,
  RefreshRounded,
  ScheduleRounded,
  SpeedRounded,
  WarningAmberRounded,
} from "@mui/icons-material";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useNavigate } from "react-router-dom";
import { applications, countries } from "../../../data/dummyData";

import austriaFlag from "../../../assets/austria_new.png";
import belgiumFlag from "../../../assets/belgium.jpg";
import franceFlag from "../../../assets/France_new.png";
import germanyFlag from "../../../assets/germany.png";
import italyFlag from "../../../assets/italy.jpg";
import netherlandsFlag from "../../../assets/netherlands.png";
import portugalFlag from "../../../assets/portugal.png";
import spainFlag from "../../../assets/spain_new.jpg";

const COLORS = {
  metroBlue: "#002D72",
  metroBlueDark: "#001E4D",
  metroYellow: "rgb(255, 237, 0)",
  lightBlue: "#EAF2FF",
  pageBackground: "#F4F7FB",
  success: "#168A45",
  warning: "#DB7200",
  error: "#C62828",
  textPrimary: "#172033",
  textSecondary: "#64748B",
  border: "#DEE5EF",
};

const countryFlagMap = {
  france: franceFlag,
  germany: germanyFlag,
  netherlands: netherlandsFlag,
  portugal: portugalFlag,
  spain: spainFlag,
  italy: italyFlag,
  belgium: belgiumFlag,
  austria: austriaFlag,
};

function SummaryCard({
  title,
  value,
  description,
  icon,
  color,
  background,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 2.5,
        border: `1px solid ${COLORS.border}`,
        borderTop: `4px solid ${color}`,
        bgcolor: "#FFFFFF",
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: COLORS.textSecondary,
                fontWeight: 700,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 0.75,
                color: COLORS.textPrimary,
                fontSize: "2rem",
                lineHeight: 1.15,
                fontWeight: 900,
              }}
            >
              {value}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 1,
                color: COLORS.textSecondary,
              }}
            >
              {description}
            </Typography>
          </Box>

          <Avatar
            variant="rounded"
            sx={{
              width: 46,
              height: 46,
              bgcolor: background,
              color,
              borderRadius: 2,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CountryStatus({ value, label, color, icon }) {
  const Icon = icon;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.7}
      sx={{ minWidth: 0, flex: 1, minHeight: 22 }}
    >
      <Box
        sx={{
          width: 18,
          height: 18,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          bgcolor: `${color}22`,
          color,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 12 }} />
      </Box>

      <Typography
        variant="caption"
        sx={{
          color: COLORS.textPrimary,
          fontWeight: 800,
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
        }}
      >
        {value} {label}
      </Typography>
    </Stack>
  );
}

function CountryCard({ country, onClick }) {
  const attentionCount = country.degraded + country.down;

  const availabilityColor =
    country.availability >= 99
      ? COLORS.success
      : country.availability >= 97
        ? COLORS.warning
        : COLORS.error;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        overflow: "hidden",
        borderRadius: 2.25,
        border: `1.5px solid rgba(0, 45, 114, 0.18)`,
        bgcolor: "#FFFFFF",
        boxShadow: "0 3px 12px rgba(0, 45, 114, 0.06)",
        transition:
          "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "rgba(0, 45, 114, 0.3)",
          boxShadow: "0 10px 22px rgba(0, 45, 114, 0.12)",
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          height: "calc(100% - 5px)",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        <CardContent
          sx={{
            width: "100%",
            p: 2.2,
            "&:last-child": {
              pb: 2.2,
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={1.25}
            sx={{ mb: 1.5 }}
          >
            <Stack direction="row" spacing={1.2} sx={{ minWidth: 0 }}>
              <Box
                component="img"
                src={countryFlagMap[country.id] || country.flag}
                alt={`${country.name} flag`}
                sx={{
                  width: 42,
                  height: 42,
                  objectFit: "cover",
                  borderRadius: 2,
                  flexShrink: 0,
                  border: "1px solid #C8DAF7",
                  boxShadow: "0 2px 8px rgba(0,45,114,0.08)",
                  backgroundColor: COLORS.lightBlue,
                }}
              />

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  noWrap
                  variant="h6"
                  sx={{
                    color: COLORS.metroBlue,
                    fontWeight: 900,
                    lineHeight: 1.25,
                    fontSize: "1.08rem",
                  }}
                >
                  {country.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: COLORS.textSecondary,
                    fontSize: "0.83rem",
                    lineHeight: 1.4,
                  }}
                >
                  {country.applications} monitored applications
                </Typography>
              </Box>
            </Stack>

            <ArrowForwardRounded
              sx={{
                color: COLORS.metroBlue,
                flexShrink: 0,
              }}
            />
          </Stack>

          <Divider sx={{ my: 1.5, borderColor: "#E7EDF5" }} />

          <Stack
            direction="row"
            alignItems="flex-end"
            justifyContent="space-between"
            spacing={2}
            sx={{ minHeight: 70 }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: COLORS.textSecondary,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Availability
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  color: availabilityColor,
                  fontSize: "1.32rem",
                  fontWeight: 900,
                  lineHeight: 1.1,
                }}
              >
                {country.availability}%
              </Typography>
            </Box>

            <Chip
              size="small"
              label={
                attentionCount === 0
                  ? "Healthy"
                  : `${attentionCount} need attention`
              }
              sx={{
                height: 26,
                borderRadius: 1.4,
                bgcolor:
                  attentionCount === 0 ? "#EAF7EF" : "#FFF3E5",
                color:
                  attentionCount === 0
                    ? COLORS.success
                    : COLORS.warning,
                fontWeight: 800,
                fontSize: "0.72rem",
                letterSpacing: "0.01em",
              }}
            />
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            sx={{
              mt: 1.6,
              p: 1,
              borderRadius: 1.5,
              bgcolor: "#F7F9FC",
              border: "1px solid #EEF3F8",
            }}
          >
            <CountryStatus
              value={country.up}
              label="Up"
              color={COLORS.success}
              icon={CheckCircleRounded}
            />

            <CountryStatus
              value={country.degraded}
              label="Degraded"
              color={COLORS.warning}
              icon={WarningAmberRounded}
            />

            <CountryStatus
              value={country.down}
              label="Down"
              color={COLORS.error}
              icon={ErrorRounded}
            />
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{
              mt: 1.3,
              px: 0.5,
              py: 0.45,
              borderRadius: 1.5,
              bgcolor: "rgba(0,45,114,0.02)",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.85} sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  bgcolor: "#EAF7EF",
                  color: COLORS.success,
                  flexShrink: 0,
                }}
              >
                <LockRounded sx={{ fontSize: 13 }} />
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: COLORS.textSecondary,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                SSL cert
              </Typography>
            </Stack>

            <Typography
              variant="caption"
              sx={{
                color: COLORS.success,
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              Valid
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function DashboardTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <Box
      sx={{
        minWidth: 180,
        p: 1.5,
        bgcolor: COLORS.metroBlueDark,
        color: "#FFFFFF",
        borderRadius: 1.5,
        boxShadow: "0 10px 26px rgba(0,0,0,0.2)",
      }}
    >
      <Typography variant="body2" fontWeight={800}>
        {label}
      </Typography>

      {payload.map((item) => (
        <Stack
          key={item.dataKey}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{ mt: 0.75 }}
        >
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.75)" }}
          >
            {item.name}
          </Typography>

          <Typography variant="caption" fontWeight={800}>
            {item.value}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
}

function DashboardPage() {
  const navigate = useNavigate();

  const [countryFilter, setCountryFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("Today at 12:45");

  const visibleCountries = useMemo(() => {
    if (countryFilter === "all") {
      return countries;
    }

    return countries.filter(
      (country) => country.id === countryFilter
    );
  }, [countryFilter]);

  const totals = useMemo(() => {
    return countries.reduce(
      (result, country) => ({
        up: result.up + country.up,
        down: result.down + country.down,
        degraded: result.degraded + country.degraded,
      }),
      {
        up: 0,
        down: 0,
        degraded: 0,
      }
    );
  }, []);

  const chartData = useMemo(() => {
    return visibleCountries.map((country) => ({
      country: country.code || country.name,
      Up: country.up,
      Degraded: country.degraded,
      Down: country.down,
    }));
  }, [visibleCountries]);

  const handleRefresh = () => {
    setRefreshing(true);

    window.setTimeout(() => {
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setLastRefresh(`Today at ${currentTime}`);
      setRefreshing(false);
      setNotification(true);
    }, 700);
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        bgcolor: COLORS.pageBackground,
        py: {
          xs: 2,
          md: 3,
        },
      }}
    >
      {refreshing && (
        <LinearProgress
          sx={{
            position: "fixed",
            top: 72,
            left: {
              xs: 0,
              md: 260,
            },
            right: 0,
            zIndex: 1500,
            bgcolor: "#FFF9B3",
            "& .MuiLinearProgress-bar": {
              bgcolor: COLORS.metroYellow,
            },
          }}
        />
      )}

      <Container
        maxWidth={false}
        sx={{
          maxWidth: "1680px",
          mx: "auto",
          px: {
            xs: 2,
            sm: 3,
            lg: 4,
          },
        }}
      >
        {/* Dashboard heading */}
        <Card
          elevation={0}
          sx={{
            mb: 3,
            overflow: "hidden",
            borderRadius: 2.5,
            bgcolor: COLORS.metroBlue,
            color: "#FFFFFF",
          }}
        >
          <Box
            sx={{
              px: {
                xs: 2.5,
                md: 3.5,
              },
              py: {
                xs: 2.5,
                md: 3,
              },
            }}
          >
            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              alignItems={{
                xs: "stretch",
                md: "center",
              }}
              justifyContent="space-between"
              spacing={2.5}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: COLORS.metroYellow,
                    color: COLORS.metroBlue,
                    borderRadius: 2,
                  }}
                >
                  <SpeedRounded />
                </Avatar>

                <Box>
                  <Typography
                    component="h1"
                    sx={{
                      fontSize: {
                        xs: "1.55rem",
                        md: "2rem",
                      },
                      fontWeight: 900,
                      lineHeight: 1.2,
                    }}
                  >
                    Application Health Dashboard
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      color: "rgba(255,255,255,0.75)",
                    }}
                  >
                    Monitor availability, performance and operational
                    health across METRO countries.
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1.25}
              >
                <Select
                  size="small"
                  value={countryFilter}
                  onChange={(event) =>
                    setCountryFilter(event.target.value)
                  }
                  sx={{
                    minWidth: {
                      xs: "100%",
                      sm: 210,
                    },
                    height: 44,
                    bgcolor: "#FFFFFF",
                    color: COLORS.metroBlue,
                    borderRadius: 1.5,
                    fontWeight: 700,
                  }}
                >
                  <MenuItem value="all">All countries</MenuItem>

                  {countries.map((country) => (
                    <MenuItem
                      key={country.id}
                      value={country.id}
                    >
                      {country.flag} {country.name}
                    </MenuItem>
                  ))}
                </Select>

                <Button
                  variant="contained"
                  startIcon={<RefreshRounded />}
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    minWidth: 120,
                    height: 44,
                    px: 2.5,
                    borderRadius: 1.5,
                    bgcolor: COLORS.metroYellow,
                    color: COLORS.metroBlue,
                    fontWeight: 900,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#F3DF00",
                      boxShadow: "none",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "#E4D400",
                      color: COLORS.metroBlue,
                    },
                  }}
                >
                  {refreshing ? "Refreshing" : "Refresh"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Card>

        {/* Countries first */}
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Avatar
              variant="rounded"
              sx={{
                width: 38,
                height: 38,
                bgcolor: COLORS.metroYellow,
                color: COLORS.metroBlue,
                borderRadius: 1.75,
              }}
            >
              <FlagRounded fontSize="small" />
            </Avatar>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: COLORS.metroBlue,
                  fontWeight: 900,
                }}
              >
                Countries
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: COLORS.textSecondary }}
              >
                Select a country to open the application inventory.
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={`${visibleCountries.length} ${
              visibleCountries.length === 1
                ? "country"
                : "countries"
            }`}
            sx={{
              bgcolor: COLORS.lightBlue,
              color: COLORS.metroBlue,
              fontWeight: 800,
            }}
          />
        </Stack>

        <Grid container spacing={2.5}>
          {visibleCountries.map((country) => (
            <Grid
              key={country.id}
              size={{
                xs: 12,
                sm: 6,
                lg: 4,
                xl: 3,
              }}
            >
              <CountryCard
                country={country}
                onClick={() =>
                  navigate(`/countries/${country.id}/apps`)
                }
              />
            </Grid>
          ))}
        </Grid>

        {/* Metrics after countries */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{
            mt: 4,
            mb: 2,
          }}
        >
          <Avatar
            variant="rounded"
            sx={{
              width: 38,
              height: 38,
              bgcolor: COLORS.metroBlue,
              color: COLORS.metroYellow,
              borderRadius: 1.75,
            }}
          >
            <AppsRounded fontSize="small" />
          </Avatar>

          <Box>
            <Typography
              variant="h5"
              sx={{
                color: COLORS.metroBlue,
                fontWeight: 900,
              }}
            >
              Operational metrics
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: COLORS.textSecondary }}
            >
              Consolidated health information from all configured checks.
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <SummaryCard
              title="Total applications"
              value={applications.length}
              description="Configured monitoring targets"
              color={COLORS.metroBlue}
              background={COLORS.lightBlue}
              icon={<AppsRounded />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <SummaryCard
              title="Applications up"
              value={totals.up}
              description="Operating normally"
              color={COLORS.success}
              background="#EAF7EF"
              icon={<CheckCircleRounded />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <SummaryCard
              title="Degraded services"
              value={totals.degraded}
              description="Performance requires attention"
              color={COLORS.warning}
              background="#FFF3E5"
              icon={<WarningAmberRounded />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <SummaryCard
              title="Applications down"
              value={totals.down}
              description="Immediate attention required"
              color={COLORS.error}
              background="#FDECEC"
              icon={<ErrorRounded />}
            />
          </Grid>
        </Grid>

        {/* Bar graph and summary */}
        <Grid
          container
          spacing={2.5}
          alignItems="stretch"
          sx={{ mt: 0.25 }}
        >
          <Grid size={{ xs: 12, xl: 8 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 2.5,
                border: `1px solid ${COLORS.border}`,
                bgcolor: "#FFFFFF",
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 2.25,
                    sm: 3,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 2.25,
                      sm: 3,
                    },
                  },
                }}
              >
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  justifyContent="space-between"
                  alignItems={{
                    xs: "flex-start",
                    sm: "center",
                  }}
                  spacing={1.5}
                  sx={{ mb: 3 }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: COLORS.metroBlue,
                        fontWeight: 900,
                      }}
                    >
                      Application status by country
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        color: COLORS.textSecondary,
                      }}
                    >
                      Comparison of healthy, degraded and unavailable
                      applications.
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    label="Current status"
                    sx={{
                      bgcolor: COLORS.metroYellow,
                      color: COLORS.metroBlue,
                      fontWeight: 900,
                    }}
                  />
                </Stack>

                <Box
                  sx={{
                    width: "100%",
                    height: {
                      xs: 320,
                      sm: 380,
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 15,
                        left: -10,
                        bottom: 5,
                      }}
                      barGap={5}
                    >
                      <CartesianGrid
                        stroke="#E2E8F0"
                        strokeDasharray="4 4"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="country"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: COLORS.textSecondary,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        dy={8}
                      />

                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: COLORS.textSecondary,
                          fontSize: 12,
                        }}
                      />

                      <Tooltip content={<DashboardTooltip />} />

                      <Legend
                        iconType="circle"
                        wrapperStyle={{
                          paddingTop: "20px",
                          fontSize: "12px",
                        }}
                      />

                      <Bar
                        dataKey="Up"
                        fill={COLORS.success}
                        radius={[5, 5, 0, 0]}
                        maxBarSize={32}
                      />

                      <Bar
                        dataKey="Degraded"
                        fill={COLORS.warning}
                        radius={[5, 5, 0, 0]}
                        maxBarSize={32}
                      />

                      <Bar
                        dataKey="Down"
                        fill={COLORS.error}
                        radius={[5, 5, 0, 0]}
                        maxBarSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, xl: 4 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                minHeight: 465,
                borderRadius: 2.5,
                border: `1px solid ${COLORS.border}`,
                bgcolor: "#FFFFFF",
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2.25,
                  bgcolor: COLORS.metroBlue,
                  color: "#FFFFFF",
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                }}
              >
                <Typography variant="h6" fontWeight={900}>
                  Operational summary
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.72)" }}
                >
                  Current platform monitoring status
                </Typography>
              </Box>

              <CardContent
                sx={{
                  p: 3,
                  height: "calc(100% - 86px)",
                  display: "flex",
                  flexDirection: "column",
                  "&:last-child": {
                    pb: 3,
                  },
                }}
              >
                <Stack spacing={1.5}>
                  <Alert
                    severity="error"
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      bgcolor: "#FFF7F7",
                    }}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      {totals.down} application checks require immediate
                      attention.
                    </Typography>
                  </Alert>

                  <Alert
                    severity="warning"
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      bgcolor: "#FFF9F0",
                    }}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      {totals.degraded} services are reporting degraded
                      performance.
                    </Typography>
                  </Alert>

                  <Alert
                    severity="success"
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      bgcolor: "#F4FBF7",
                    }}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      Monitoring is active across {countries.length}{" "}
                      countries.
                    </Typography>
                  </Alert>
                </Stack>

                <Box sx={{ mt: "auto", pt: 2.5 }}>
                  <Divider sx={{ mb: 2 }} />

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <ScheduleRounded
                      sx={{
                        color: COLORS.metroBlue,
                        fontSize: 19,
                      }}
                    />

                    <Typography
                      variant="caption"
                      sx={{
                        color: COLORS.textSecondary,
                        fontWeight: 600,
                      }}
                    >
                      Last data refresh: {lastRefresh}
                    </Typography>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={notification}
        autoHideDuration={2500}
        onClose={() => setNotification(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setNotification(false)}
          sx={{
            borderRadius: 2,
            bgcolor: COLORS.metroBlue,
            color: "#FFFFFF",
            fontWeight: 700,
            "& .MuiAlert-icon": {
              color: COLORS.metroYellow,
            },
          }}
        >
          Dashboard refreshed successfully.
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DashboardPage;