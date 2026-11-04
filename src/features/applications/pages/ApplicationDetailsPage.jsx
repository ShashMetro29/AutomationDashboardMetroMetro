import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  Cloud,
  DataUsage,
  Description,
  Speed,
} from "@mui/icons-material";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate, useParams } from "react-router-dom";
import StatusChip from "../../../components/StatusChip";
import {
  applications,
  countries,
  incidents,
  statusDistribution,
} from "../../../data/dummyData";

function MetricCard({ title, value, subtitle, icon, color }) {
  return (
    <Card sx={{ height: "100%", borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              bgcolor: `${color}18`,
              color,
              display: "grid",
              placeItems: "center",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ApplicationDetailsPage() {
  const navigate = useNavigate();
  const { appId } = useParams();

  const [environment, setEnvironment] = useState(0);
  const [timeRange, setTimeRange] = useState("24h");

  const application =
    applications.find((item) => item.id === Number(appId)) ||
    applications[0];

  const country = countries.find(
    (item) => item.id === application.countryId
  );

  const currentStatus =
    environment === 0
      ? application.productionStatus
      : application.preProductionStatus;

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() =>
          navigate(`/countries/${application.countryId}/apps`)
        }
        sx={{ mb: 2 }}
      >
        Back to applications
      </Button>

      <Card sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          gap={2}
        >
          <Box>
            <Stack direction="row" gap={1.5} alignItems="center">
              <Typography variant="h4" fontWeight={800}>
                {application.name}
              </Typography>
              <StatusChip status={currentStatus} />
            </Stack>

            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {country?.flag} {country?.name} · {application.owner}
            </Typography>

            <Typography sx={{ mt: 2 }}>
              {application.description}
            </Typography>
          </Box>

          <Stack alignItems={{ xs: "flex-start", md: "flex-end" }}>
            <Link
              href={application.documentation || "#"}
              target="_blank"
              underline="none"
            >
              <Button
                variant="outlined"
                startIcon={<Description />}
              >
                Documentation
              </Button>
            </Link>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Last refreshed: {application.lastChecked}
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Tabs
          value={environment}
          onChange={(_, value) => setEnvironment(value)}
        >
          <Tab label="Production" />
          <Tab label="Pre-production" />
        </Tabs>
      </Card>

      {currentStatus === "DOWN" && (
        <Alert severity="error" sx={{ mb: 3 }}>
          The selected environment is currently unavailable. An incident
          has been created.
        </Alert>
      )}

      {currentStatus === "DEGRADED" && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          The selected environment is responding, but one or more health
          indicators require attention.
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Application status"
            value={currentStatus}
            subtitle="Latest endpoint result"
            icon={<Cloud />}
            color={
              currentStatus === "UP"
                ? "#2e7d32"
                : currentStatus === "DOWN"
                ? "#d32f2f"
                : "#ed6c02"
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Database status"
            value={application.databaseStatus}
            subtitle="Connectivity check"
            icon={<DataUsage />}
            color="#2e7d32"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Response time"
            value={`${application.responseTime} ms`}
            subtitle="Latest endpoint latency"
            icon={<Speed />}
            color="#1976d2"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Availability"
            value={`${application.uptime}%`}
            subtitle="Selected reporting period"
            icon={<CheckCircle />}
            color="#7b1fa2"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800}>
                Check distribution
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Health-check results for the selected period
              </Typography>

              <Box sx={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={4}
                    >
                      {statusDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    Availability and response time
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Historical health-check performance
                  </Typography>
                </Box>

                <Select
                  size="small"
                  value={timeRange}
                  onChange={(event) => setTimeRange(event.target.value)}
                >
                  <MenuItem value="24h">Last 24 hours</MenuItem>
                  <MenuItem value="7d">Last 7 days</MenuItem>
                  <MenuItem value="30d">Last 30 days</MenuItem>
                </Select>
              </Stack>

              <Box sx={{ width: "100%", height: 320, mt: 2 }}>
                <ResponsiveContainer>
                  <LineChart data={application.history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" domain={[90, 100]} unit="%" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      unit=" ms"
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="availability"
                      stroke="#1976d2"
                      strokeWidth={3}
                      name="Availability"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#ed6c02"
                      strokeWidth={3}
                      name="Response time"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800}>
            Incident history
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Recent failures, warnings and recovery events
          </Typography>

          <Stack spacing={2}>
            {incidents.map((incident) => (
              <Box
                key={incident.id}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2.5,
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  gap={2}
                >
                  <Box>
                    <Stack direction="row" gap={1} alignItems="center">
                      <Typography fontWeight={700}>
                        {incident.title}
                      </Typography>

                      <Chip
                        size="small"
                        label={incident.severity}
                        color={
                          incident.severity === "Critical"
                            ? "error"
                            : incident.severity === "Warning"
                            ? "warning"
                            : "info"
                        }
                      />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      {incident.environment} · Started {incident.started}
                    </Typography>
                  </Box>

                  <Stack alignItems={{ xs: "flex-start", md: "flex-end" }}>
                    <Typography fontWeight={700}>
                      {incident.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Duration: {incident.duration}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ApplicationDetailsPage;