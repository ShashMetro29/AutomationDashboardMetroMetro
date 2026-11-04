import { useMemo, useState } from "react";
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
  RefreshRounded,
  ScheduleRounded,
  TrendingUpRounded,
  WarningAmberRounded,
} from "@mui/icons-material";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useNavigate } from "react-router-dom";
import { applications, countries } from "../../../data/dummyData";

const trendData = [
  { day: "Mon", availability: 98.4 },
  { day: "Tue", availability: 99.1 },
  { day: "Wed", availability: 97.8 },
  { day: "Thu", availability: 99.4 },
  { day: "Fri", availability: 99.7 },
  { day: "Sat", availability: 98.9 },
  { day: "Sun", availability: 99.6 },
];

const statusColors = {
  primary: {
    main: "#2563EB",
    light: "#EFF6FF",
  },
  success: {
    main: "#16A34A",
    light: "#F0FDF4",
  },
  warning: {
    main: "#EA580C",
    light: "#FFF7ED",
  },
  error: {
    main: "#DC2626",
    light: "#FEF2F2",
  },
};

/**
 * Summary card displayed at the top of the dashboard.
 */
function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  mainColor,
  lightColor,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        minHeight: 150,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
        transition: "transform 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.75,
          height: "100%",
          "&:last-child": {
            pb: 2.75,
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
          sx={{ height: "100%" }}
        >
          <Stack justifyContent="space-between" sx={{ minWidth: 0 }}>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748B",
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {title}
              </Typography>

              <Typography
                component="p"
                sx={{
                  mt: 1,
                  color: "#0F172A",
                  fontSize: {
                    xs: "1.8rem",
                    md: "2rem",
                  },
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: "-0.03em",
                }}
              >
                {value}
              </Typography>
            </Box>

            <Typography
              variant="caption"
              sx={{
                mt: 1,
                color: "#94A3B8",
                fontWeight: 500,
              }}
            >
              {subtitle}
            </Typography>
          </Stack>

          <Avatar
            variant="rounded"
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              color: mainColor,
              bgcolor: lightColor,
              borderRadius: 2.5,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * Customized chart tooltip.
 */
function AvailabilityTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <Box
      sx={{
        px: 1.75,
        py: 1.25,
        bgcolor: "#0F172A",
        color: "#FFFFFF",
        borderRadius: 2,
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.18)",
      }}
    >
      <Typography variant="caption" sx={{ color: "#CBD5E1" }}>
        {label}
      </Typography>

      <Typography variant="body2" fontWeight={700}>
        Availability: {payload[0].value}%
      </Typography>
    </Box>
  );
}

/**
 * Reusable compact status item for a country card.
 */
function CountryStatus({ label, value, color }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{ whiteSpace: "nowrap" }}
    >
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: color,
          flexShrink: 0,
        }}
      />

      <Typography
        variant="caption"
        sx={{
          color: "#475569",
          fontWeight: 600,
        }}
      >
        {value} {label}
      </Typography>
    </Stack>
  );
}

function DashboardPage() {
  const navigate = useNavigate();

  const [countryFilter, setCountryFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("Today at 22:28");

  const visibleCountries = useMemo(() => {
    if (countryFilter === "all") {
      return countries;
    }

    return countries.filter(
      (country) => country.id === countryFilter
    );
  }, [countryFilter]);

  const dashboardTotals = useMemo(() => {
    return countries.reduce(
      (totals, country) => ({
        up: totals.up + country.up,
        down: totals.down + country.down,
        degraded: totals.degraded + country.degraded,
      }),
      {
        up: 0,
        down: 0,
        degraded: 0,
      }
    );
  }, []);

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
        minHeight: "100%",
        bgcolor: "#F6F8FC",
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
            top: 64,
            left: {
              xs: 0,
              md: 260,
            },
            right: 0,
            zIndex: 1500,
          }}
        />
      )}

      <Container
        maxWidth={false}
        sx={{
          width: "100%",
          maxWidth: "1680px",
          mx: "auto",
          px: {
            xs: 2,
            sm: 3,
            lg: 4,
          },
        }}
      >
        {/* Page header */}
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
          sx={{ mb: 3 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
            >
              <Avatar
                variant="rounded"
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: "#EAF2FF",
                  color: "#2563EB",
                  borderRadius: 2.5,
                }}
              >
                <TrendingUpRounded />
              </Avatar>

              <Box>
                <Typography
                  component="h1"
                  sx={{
                    color: "#0F172A",
                    fontSize: {
                      xs: "1.65rem",
                      sm: "1.9rem",
                      lg: "2.15rem",
                    },
                    fontWeight: 800,
                    lineHeight: 1.2,
                    letterSpacing: "-0.035em",
                  }}
                >
                  Health Dashboard
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    color: "#64748B",
                    lineHeight: 1.5,
                  }}
                >
                  Monitor application health across all authorized
                  countries.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            alignItems="stretch"
            spacing={1.25}
            sx={{
              width: {
                xs: "100%",
                md: "auto",
              },
              flexShrink: 0,
            }}
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
                borderRadius: 2.25,
                fontWeight: 600,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#DDE3EC",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#94A3B8",
                },
              }}
            >
              <MenuItem value="all">All countries</MenuItem>

              {countries.map((country) => (
                <MenuItem key={country.id} value={country.id}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography component="span">
                      {country.flag}
                    </Typography>
                    <Typography component="span">
                      {country.name}
                    </Typography>
                  </Stack>
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
                borderRadius: 2.25,
                px: 2.5,
                bgcolor: "#1D4ED8",
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "0 5px 12px rgba(37, 99, 235, 0.22)",
                "&:hover": {
                  bgcolor: "#1E40AF",
                  boxShadow: "0 7px 16px rgba(37, 99, 235, 0.28)",
                },
              }}
            >
              {refreshing ? "Refreshing" : "Refresh"}
            </Button>
          </Stack>
        </Stack>

        {/* Summary cards */}
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <SummaryCard
              title="Total applications"
              value={applications.length}
              subtitle="Configured applications"
              mainColor={statusColors.primary.main}
              lightColor={statusColors.primary.light}
              icon={<AppsRounded />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <SummaryCard
              title="Applications up"
              value={dashboardTotals.up}
              subtitle="Currently operating normally"
              mainColor={statusColors.success.main}
              lightColor={statusColors.success.light}
              icon={<CheckCircleRounded />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <SummaryCard
              title="Degraded services"
              value={dashboardTotals.degraded}
              subtitle="Performance requires attention"
              mainColor={statusColors.warning.main}
              lightColor={statusColors.warning.light}
              icon={<WarningAmberRounded />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <SummaryCard
              title="Applications down"
              value={dashboardTotals.down}
              subtitle="Immediate attention required"
              mainColor={statusColors.error.main}
              lightColor={statusColors.error.light}
              icon={<ErrorRounded />}
            />
          </Grid>
        </Grid>

        {/* Chart and operational summary */}
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
                borderRadius: 3,
                border: "1px solid",
                borderColor: "#E5E7EB",
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
                        color: "#0F172A",
                        fontWeight: 800,
                        lineHeight: 1.3,
                      }}
                    >
                      Global availability trend
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        color: "#64748B",
                      }}
                    >
                      Average availability during the last seven days
                    </Typography>
                  </Box>

                  <Chip
                    label="Last 7 days"
                    size="small"
                    sx={{
                      bgcolor: "#EFF6FF",
                      color: "#1D4ED8",
                      fontWeight: 700,
                      borderRadius: 1.5,
                    }}
                  />
                </Stack>

                <Box
                  sx={{
                    width: "100%",
                    height: {
                      xs: 270,
                      sm: 330,
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trendData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="availabilityGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#2563EB"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#2563EB"
                            stopOpacity={0.015}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        stroke="#E2E8F0"
                        strokeDasharray="4 4"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748B",
                          fontSize: 12,
                        }}
                        dy={10}
                      />

                      <YAxis
                        domain={[96, 100]}
                        ticks={[96, 97, 98, 99, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748B",
                          fontSize: 12,
                        }}
                        tickFormatter={(value) => `${value}%`}
                        width={48}
                      />

                      <Tooltip
                        content={<AvailabilityTooltip />}
                        cursor={{
                          stroke: "#94A3B8",
                          strokeDasharray: "4 4",
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="availability"
                        stroke="#2563EB"
                        strokeWidth={3}
                        fill="url(#availabilityGradient)"
                        activeDot={{
                          r: 5,
                          fill: "#2563EB",
                          stroke: "#FFFFFF",
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
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
                minHeight: {
                  xl: 430,
                },
                borderRadius: 3,
                border: "1px solid",
                borderColor: "#E5E7EB",
                bgcolor: "#FFFFFF",
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 2.25,
                    sm: 3,
                  },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&:last-child": {
                    pb: {
                      xs: 2.25,
                      sm: 3,
                    },
                  },
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#0F172A",
                      fontWeight: 800,
                    }}
                  >
                    Operational summary
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      color: "#64748B",
                    }}
                  >
                    Current monitoring alerts and service status
                  </Typography>
                </Box>

                <Divider sx={{ my: 2.5 }} />

                <Stack spacing={1.5}>
                  <Alert
                    severity="error"
                    variant="outlined"
                    sx={{
                      alignItems: "center",
                      borderRadius: 2.25,
                      borderColor: "#FECACA",
                      bgcolor: "#FEF2F2",
                      color: "#991B1B",
                      "& .MuiAlert-icon": {
                        color: "#DC2626",
                      },
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {dashboardTotals.down} application checks require
                      attention.
                    </Typography>
                  </Alert>

                  <Alert
                    severity="warning"
                    variant="outlined"
                    sx={{
                      alignItems: "center",
                      borderRadius: 2.25,
                      borderColor: "#FED7AA",
                      bgcolor: "#FFF7ED",
                      color: "#9A3412",
                      "& .MuiAlert-icon": {
                        color: "#EA580C",
                      },
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {dashboardTotals.degraded} services have degraded
                      performance.
                    </Typography>
                  </Alert>

                  <Alert
                    severity="success"
                    variant="outlined"
                    sx={{
                      alignItems: "center",
                      borderRadius: 2.25,
                      borderColor: "#BBF7D0",
                      bgcolor: "#F0FDF4",
                      color: "#166534",
                      "& .MuiAlert-icon": {
                        color: "#16A34A",
                      },
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      Monitoring is active across {countries.length}{" "}
                      countries.
                    </Typography>
                  </Alert>
                </Stack>

                <Box
                  sx={{
                    mt: "auto",
                    pt: 2.5,
                  }}
                >
                  <Divider sx={{ mb: 2 }} />

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <ScheduleRounded
                      sx={{
                        color: "#94A3B8",
                        fontSize: 18,
                      }}
                    />

                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748B",
                        fontWeight: 500,
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

        {/* Countries title */}
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
          spacing={1.5}
          sx={{
            mt: 4,
            mb: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Avatar
              variant="rounded"
              sx={{
                width: 38,
                height: 38,
                bgcolor: "#EFF6FF",
                color: "#2563EB",
                borderRadius: 2,
              }}
            >
              <FlagRounded fontSize="small" />
            </Avatar>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: "#0F172A",
                  fontWeight: 800,
                  lineHeight: 1.25,
                }}
              >
                Countries
              </Typography>

              <Typography variant="body2" sx={{ color: "#64748B" }}>
                Select a country to view its applications.
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={`${visibleCountries.length} ${
              visibleCountries.length === 1 ? "country" : "countries"
            }`}
            size="small"
            sx={{
              bgcolor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              color: "#475569",
              fontWeight: 700,
            }}
          />
        </Stack>

        {/* Country cards */}
        <Grid container spacing={2.5}>
          {visibleCountries.map((country) => {
            const attentionCount =
              country.degraded + country.down;

            const availabilityColor =
              country.availability >= 99
                ? "#16A34A"
                : country.availability >= 97
                  ? "#EA580C"
                  : "#DC2626";

            return (
              <Grid
                key={country.id}
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4,
                  xl: 3,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "#E5E7EB",
                    bgcolor: "#FFFFFF",
                    overflow: "hidden",
                    transition:
                      "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: "#BFDBFE",
                      boxShadow:
                        "0 14px 28px rgba(15, 23, 42, 0.09)",
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() =>
                      navigate(
                        `/countries/${country.id}/apps`
                      )
                    }
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "stretch",
                    }}
                  >
                    <CardContent
                      sx={{
                        width: "100%",
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
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{ minWidth: 0 }}
                        >
                          <Avatar
                            variant="rounded"
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              borderRadius: 2.25,
                              fontSize: 27,
                              flexShrink: 0,
                            }}
                          >
                            {country.flag}
                          </Avatar>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="h6"
                              noWrap
                              sx={{
                                color: "#0F172A",
                                fontWeight: 800,
                                lineHeight: 1.35,
                              }}
                            >
                              {country.name}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.25,
                                color: "#64748B",
                              }}
                            >
                              {country.applications} applications
                            </Typography>
                          </Box>
                        </Stack>

                        <ArrowForwardRounded
                          sx={{
                            mt: 0.5,
                            color: "#94A3B8",
                            flexShrink: 0,
                          }}
                        />
                      </Stack>

                      <Divider sx={{ my: 2.25 }} />

                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#94A3B8",
                              fontWeight: 600,
                            }}
                          >
                            Availability
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.25,
                              color: availabilityColor,
                              fontSize: "1.35rem",
                              fontWeight: 800,
                              lineHeight: 1.25,
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
                              : `${attentionCount} attention`
                          }
                          sx={{
                            bgcolor:
                              attentionCount === 0
                                ? "#F0FDF4"
                                : "#FFF7ED",
                            color:
                              attentionCount === 0
                                ? "#166534"
                                : "#9A3412",
                            fontWeight: 700,
                          }}
                        />
                      </Stack>

                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        flexWrap="wrap"
                        useFlexGap
                        gap={1}
                        sx={{
                          mt: 2.25,
                          p: 1.5,
                          bgcolor: "#F8FAFC",
                          borderRadius: 2,
                        }}
                      >
                        <CountryStatus
                          label="Up"
                          value={country.up}
                          color="#16A34A"
                        />

                        <CountryStatus
                          label="Degraded"
                          value={country.degraded}
                          color="#EA580C"
                        />

                        <CountryStatus
                          label="Down"
                          value={country.down}
                          color="#DC2626"
                        />
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {visibleCountries.length === 0 && (
          <Card
            elevation={0}
            sx={{
              mt: 2,
              p: 5,
              textAlign: "center",
              borderRadius: 3,
              border: "1px solid #E5E7EB",
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              No country information found
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.75 }}
            >
              Select another country from the filter.
            </Typography>
          </Card>
        )}
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
            fontWeight: 600,
          }}
        >
          Dashboard refreshed successfully.
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DashboardPage;