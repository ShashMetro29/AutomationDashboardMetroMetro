import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  Business,
  Cloud,
  DescriptionOutlined,
  Memory,
  Public,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";

import { getStoredAuthSession } from "../../../services/authService";
import { getApplicationsByCountry } from "../../../services/applicationService";

const normalizeApplication = (application) => ({
  ...application,
  id: application.id ?? application.applicationId,
  countryId: Number(application.country_id ?? application.countryId ?? 0),
  ownerTeam: application.owner_team ?? application.ownerTeam ?? application.owner ?? "Operations",
  documentationUrl: application.documentation_url ?? application.documentationUrl ?? "",
  environments: Array.isArray(application.environments) ? application.environments : [],
  isActive: application.is_active ?? application.isActive ?? true,
});

function MetricCard({ title, value, subtitle, icon, color }) {
  return (
    <Card sx={{ height: "100%", borderRadius: 3, boxShadow: "0 12px 22px rgba(15, 23, 42, 0.05)" }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
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
  const { applicationId } = useParams();
  const session = getStoredAuthSession();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const countryId = Number(session?.country?.id || 0);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!countryId || !applicationId) {
        setApplication(null);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const apps = await getApplicationsByCountry(countryId);
        const allApplications = Array.isArray(apps) ? apps.map((item) => normalizeApplication(item)) : [];
        const selected = allApplications.find((item) => Number(item.id) === Number(applicationId));
        setApplication(selected || allApplications[0] || null);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Unable to load application details.");
        setApplication(null);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId, countryId]);

  const environmentSummary = useMemo(() => {
    const environments = Array.isArray(application?.environments) ? application.environments : [];

    return environments.map((environment) => ({
      id: environment.id,
      name: environment.name || "Environment",
      baseUrl: environment.base_url || environment.baseUrl || "Not available",
      enabled: environment.enabled ?? environment.isActive ?? true,
      components: Array.isArray(environment.components) ? environment.components : [],
    }));
  }, [application]);

  const totalComponents = useMemo(
    () => environmentSummary.reduce((total, environment) => total + (environment.components || []).length, 0),
    [environmentSummary]
  );

  if (loading) {
    return (
      <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorMessage) {
    return (
      <Box>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{errorMessage}</Alert>
      </Box>
    );
  }

  if (!application) {
    return (
      <Box>
        <Alert severity="info" sx={{ borderRadius: 2 }}>No application details are available for this record.</Alert>
      </Box>
    );
  }

  const countryTitle = session?.country?.name || "Country";

  return (
    <Box sx={{ pb: 5 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(`/countries/${countryId}/apps`)} sx={{ mb: 2 }}>
        Back to applications
      </Button>

      <Card sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: "0 18px 34px rgba(15, 23, 42, 0.08)" }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Typography variant="h4" fontWeight={800}>
                {application.name}
              </Typography>
              <Chip label={application.isActive ? "ACTIVE" : "INACTIVE"} color={application.isActive ? "success" : "default"} size="small" />
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {countryTitle} · {application.ownerTeam}
            </Typography>

            <Typography sx={{ mt: 2, maxWidth: 760 }}>
              {application.description || "No description provided."}
            </Typography>
          </Box>

          <Stack alignItems={{ xs: "flex-start", md: "flex-end" }} spacing={1}>
            {application.documentationUrl ? (
              <Link href={application.documentationUrl} target="_blank" rel="noreferrer" underline="none">
                <Button variant="outlined" startIcon={<DescriptionOutlined />}>
                  Documentation
                </Button>
              </Link>
            ) : null}

            <Typography variant="caption" color="text.secondary">
              Code: {application.code || "-"}
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Typography variant="subtitle1" fontWeight={800}>
          Environment overview
        </Typography>
      </Card>

      <Grid container spacing={2.5} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard title="Status" value={application.isActive ? "Active" : "Inactive"} subtitle="Application health state" icon={<Cloud />} color="#2e7d32" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard title="Environments" value={environmentSummary.length} subtitle="Configured environments" icon={<Public />} color="#1976d2" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard title="Components" value={totalComponents} subtitle="Tracked services" icon={<Memory />} color="#7b1fa2" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard title="Owner team" value={application.ownerTeam} subtitle="Assigned team" icon={<Business />} color="#ed6c02" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {environmentSummary.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>No environments are attached to this application yet.</Alert>
          </Grid>
        ) : (
          environmentSummary.map((environment) => (
            <Grid key={environment.id} size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%", borderRadius: 3, boxShadow: "0 14px 26px rgba(15, 23, 42, 0.06)" }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight={800}>
                      {environment.name}
                    </Typography>
                    <Chip label={environment.enabled ? "Enabled" : "Disabled"} color={environment.enabled ? "success" : "default"} size="small" />
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Base URL: {environment.baseUrl}
                  </Typography>

                  {environment.components.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No components have been registered for this environment.</Alert>
                  ) : (
                    <Stack spacing={1.5}>
                      {environment.components.map((component) => (
                        <Box
                          key={component.id}
                          sx={{
                            p: 1.6,
                            border: "1px solid rgba(148, 163, 184, 0.35)",
                            borderRadius: 2,
                            backgroundColor: "rgba(15, 23, 42, 0.015)",
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                            <Typography fontWeight={700}>{component.name}</Typography>
                            <Chip label={component.is_critical ? "Critical" : "Standard"} size="small" color={component.is_critical ? "error" : "default"} />
                          </Stack>

                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {component.component_type || component.componentType} · {component.technology} {component.version}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            {component.host_name || component.hostName}:{component.port}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}

export default ApplicationDetailsPage;
