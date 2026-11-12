import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add,
  ArrowBack,
  Business,
  Cloud,
  Delete,
  DescriptionOutlined,
  Edit,
  Memory,
  Public,
  SaveOutlined,
} from "@mui/icons-material";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { getStoredAuthSession } from "../../../services/authService";
import {
  createComponent,
  createEnvironment,
  deleteApplication,
  deleteComponent,
  deleteEnvironment,
  getApplicationsByCountry,
  updateApplication,
  updateComponent,
  updateEnvironment,
} from "../../../services/applicationService";
import { getHealthStatusMeta, summarizeApplicationHealth } from "../utils/health";

const normalizeApplication = (application) => ({
  ...application,
  id: application.id ?? application.applicationId,
  countryId: Number(application.country_id ?? application.countryId ?? 0),
  ownerTeam: application.owner_team ?? application.ownerTeam ?? application.owner ?? "Operations",
  documentationUrl: application.documentation_url ?? application.documentationUrl ?? "",
  environments: Array.isArray(application.environments) ? application.environments : [],
  isActive: application.is_active ?? application.isActive ?? true,
});

const createDefaultComponentForm = () => ({
  name: "",
  componentType: "APPLICATION_SERVER",
  endpoint: "",
  hostName: "",
  port: "",
  technology: "",
  version: "",
  isCritical: true,
  enabled: true,
});

const createDefaultEnvironmentForm = () => ({
  name: "PRODUCTION",
  baseUrl: "",
  enabled: true,
  componentName: "",
  componentType: "APPLICATION_SERVER",
  endpoint: "",
  hostName: "",
  port: "",
  technology: "",
  version: "",
  isCritical: true,
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
  const location = useLocation();
  const { applicationId } = useParams();
  const session = getStoredAuthSession();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [appDialogOpen, setAppDialogOpen] = useState(false);
  const [environmentDialogOpen, setEnvironmentDialogOpen] = useState(false);
  const [componentDialogOpen, setComponentDialogOpen] = useState(false);
  const [appForm, setAppForm] = useState({
    name: "",
    code: "",
    description: "",
    ownerTeam: "",
    documentationUrl: "",
  });
  const [environmentForm, setEnvironmentForm] = useState(createDefaultEnvironmentForm());
  const [componentForm, setComponentForm] = useState(createDefaultComponentForm());
  const [editingEnvironmentId, setEditingEnvironmentId] = useState(null);
  const [editingComponentId, setEditingComponentId] = useState(null);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const countryIdFromQuery = Number(new URLSearchParams(location.search).get("countryId"));
  const countryId = Number.isFinite(countryIdFromQuery) ? countryIdFromQuery : Number(session?.country?.id || 0);

  const loadApplication = async () => {
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

  useEffect(() => {
    loadApplication();
  }, [applicationId, countryId]);

  const healthSummary = useMemo(() => summarizeApplicationHealth(application), [application]);

  const environmentSummary = useMemo(() => {
    const environments = Array.isArray(application?.environments) ? application.environments : [];

    return environments.map((environment) => {
      const environmentHealth = environment?.health ?? {};
      const componentHealthEntries = (Array.isArray(environment?.components) ? environment.components : []).map(
        (component) => component?.health || {}
      );
      const status = summarizeApplicationHealth({ environments: [environment] }).status;

      return {
        id: environment.id,
        name: environment.name || "Environment",
        baseUrl: environment.base_url || environment.baseUrl || "Not available",
        enabled: environment.enabled ?? environment.isActive ?? true,
        components: Array.isArray(environment.components) ? environment.components : [],
        health: environmentHealth,
        healthStatus: status,
        statusMeta: getHealthStatusMeta(status),
        message: environmentHealth.message || (componentHealthEntries.some((item) => item.message) ? componentHealthEntries.find((item) => item.message)?.message : "No health details reported."),
        latencyMs: environmentHealth.latencyMs ?? componentHealthEntries.reduce((total, item) => total + (Number(item.latencyMs) || 0), 0),
        checkedAt: environmentHealth.checkedAt || null,
      };
    });
  }, [application]);

  const totalComponents = useMemo(
    () => environmentSummary.reduce((total, environment) => total + (environment.components || []).length, 0),
    [environmentSummary]
  );

  const openAppDialog = () => {
    setAppForm({
      name: application?.name || "",
      code: application?.code || "",
      description: application?.description || "",
      ownerTeam: application?.ownerTeam || "",
      documentationUrl: application?.documentationUrl || "",
    });
    setAppDialogOpen(true);
  };

  const openCreateEnvironmentDialog = () => {
    setEditingEnvironmentId(null);
    setEnvironmentForm(createDefaultEnvironmentForm());
    setEnvironmentDialogOpen(true);
  };

  const openEditEnvironmentDialog = (environment) => {
    setEditingEnvironmentId(environment.id);
    setEnvironmentForm({
      name: environment.name || "PRODUCTION",
      baseUrl: environment.base_url || environment.baseUrl || "",
      enabled: environment.enabled ?? environment.isActive ?? true,
      componentName: "",
      componentType: "APPLICATION_SERVER",
      endpoint: "",
      hostName: "",
      port: "",
      technology: "",
      version: "",
      isCritical: true,
    });
    setEnvironmentDialogOpen(true);
  };

  const openCreateComponentDialog = () => {
    if (!application?.environments?.length) {
      setErrorMessage("Create an environment before adding a component.");
      return;
    }

    const firstEnvironment = application.environments[0];
    setEditingComponentId(null);
    setSelectedEnvironmentId(String(firstEnvironment.id || ""));
    setComponentForm({
      ...createDefaultComponentForm(),
      environmentId: String(firstEnvironment.id || ""),
    });
    setComponentDialogOpen(true);
  };

  const openEditComponentDialog = (environmentId, component) => {
    setEditingComponentId(component.id);
    setSelectedEnvironmentId(String(environmentId || ""));
    setComponentForm({
      name: component.name || "",
      componentType: component.component_type || component.componentType || "APPLICATION_SERVER",
      endpoint: component.endpoint || "",
      hostName: component.host_name || component.hostName || "",
      port: component.port ?? "",
      technology: component.technology || "",
      version: component.version || "",
      isCritical: Boolean(component.is_critical ?? component.isCritical),
      enabled: Boolean(component.enabled ?? true),
      environmentId: String(environmentId || ""),
    });
    setComponentDialogOpen(true);
  };

  const handleSaveApplication = async (event) => {
    event.preventDefault();

    if (!application?.id) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      await updateApplication(application.id, {
        name: appForm.name.trim(),
        code: appForm.code.trim(),
        description: appForm.description.trim(),
        ownerTeam: appForm.ownerTeam.trim(),
        documentationUrl: appForm.documentationUrl.trim(),
      });
      setAppDialogOpen(false);
      await loadApplication();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to update the application.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEnvironment = async (event) => {
    event.preventDefault();

    if (!application?.id) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        name: environmentForm.name.trim(),
        baseUrl: environmentForm.baseUrl.trim(),
        enabled: Boolean(environmentForm.enabled),
      };

      if (editingEnvironmentId) {
        await updateEnvironment(editingEnvironmentId, payload);
      } else {
        const environmentPayload = {
          applicationId: Number(application.id),
          ...payload,
          components: [
            {
              name: environmentForm.componentName.trim(),
              componentType: environmentForm.componentType || "APPLICATION_SERVER",
              endpoint: environmentForm.endpoint?.trim() || undefined,
              hostName: environmentForm.hostName?.trim() || undefined,
              port: environmentForm.port ? Number(environmentForm.port) : undefined,
              technology: environmentForm.technology?.trim() || undefined,
              version: environmentForm.version?.trim() || undefined,
              isCritical: Boolean(environmentForm.isCritical),
              enabled: true,
            },
          ].filter((component) => component.name || component.endpoint || component.hostName || component.technology || component.version),
        };

        if (!environmentPayload.components.length) {
          throw new Error("Provide at least one component for the new environment.");
        }

        await createEnvironment(environmentPayload);
      }

      setEnvironmentDialogOpen(false);
      setEditingEnvironmentId(null);
      setEnvironmentForm(createDefaultEnvironmentForm());
      await loadApplication();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error?.message || "Unable to save the environment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveComponent = async (event) => {
    event.preventDefault();

    if (!componentForm.environmentId) {
      setErrorMessage("Choose an environment before adding a component.");
      return;
    }

    const payload = {
      environmentId: Number(componentForm.environmentId),
      name: componentForm.name.trim(),
      componentType: componentForm.componentType || "APPLICATION_SERVER",
      endpoint: componentForm.endpoint?.trim() || undefined,
      hostName: componentForm.hostName?.trim() || undefined,
      port: componentForm.port ? Number(componentForm.port) : undefined,
      technology: componentForm.technology?.trim() || undefined,
      version: componentForm.version?.trim() || undefined,
      isCritical: Boolean(componentForm.isCritical),
      enabled: Boolean(componentForm.enabled),
    };

    if (!payload.name && !payload.endpoint && !payload.hostName && !payload.technology) {
      setErrorMessage("Add at least one valid component field before saving.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      if (editingComponentId) {
        await updateComponent(editingComponentId, payload);
      } else {
        await createComponent(payload);
      }

      setComponentDialogOpen(false);
      setEditingComponentId(null);
      setSelectedEnvironmentId("");
      setComponentForm(createDefaultComponentForm());
      await loadApplication();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error?.message || "Unable to save the component.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!application?.id) {
      return;
    }

    if (!window.confirm(`Delete ${application.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteApplication(application.id);
      navigate(`/countries/${countryId}/apps`);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to delete the application.");
    }
  };

  const handleDeleteEnvironment = async (environmentId) => {
    if (!window.confirm("Delete this environment and all of its registered components?")) {
      return;
    }

    try {
      await deleteEnvironment(environmentId);
      await loadApplication();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to delete the environment.");
    }
  };

  const handleDeleteComponent = async (componentId) => {
    if (!window.confirm("Delete this component?")) {
      return;
    }

    try {
      await deleteComponent(componentId);
      await loadApplication();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to delete the component.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorMessage && !application) {
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
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/countries/${countryId}/apps`)}>
          Back to applications
        </Button>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button variant="outlined" startIcon={<Add />} onClick={openCreateEnvironmentDialog}>
            Add environment
          </Button>
          <Button variant="outlined" startIcon={<Add />} onClick={openCreateComponentDialog}>
            Add component
          </Button>
          <Button variant="contained" startIcon={<Edit />} onClick={openAppDialog}>
            Edit application
          </Button>
          <Button variant="contained" color="error" startIcon={<Delete />} onClick={handleDeleteApplication}>
            Delete
          </Button>
        </Stack>
      </Stack>

      {errorMessage ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{errorMessage}</Alert>
      ) : null}

      <Card sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: "0 18px 34px rgba(15, 23, 42, 0.08)" }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Typography variant="h4" fontWeight={800}>
                {application.name}
              </Typography>
              <Chip
                label={getHealthStatusMeta(healthSummary.status).label}
                color={getHealthStatusMeta(healthSummary.status).color}
                size="small"
                sx={{
                  backgroundColor: getHealthStatusMeta(healthSummary.status).backgroundColor,
                  color: getHealthStatusMeta(healthSummary.status).textColor,
                  fontWeight: 700,
                }}
              />
              <Chip label={application.isActive ? "ACTIVE" : "INACTIVE"} color={application.isActive ? "success" : "default"} size="small" />
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {countryTitle} · {application.ownerTeam}
            </Typography>

            <Typography sx={{ mt: 2, maxWidth: 760 }}>
              {healthSummary.message || application.description || "No description provided."}
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
          <MetricCard title="Application health" value={getHealthStatusMeta(healthSummary.status).label} subtitle={healthSummary.message} icon={<Cloud />} color={getHealthStatusMeta(healthSummary.status).textColor} />
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
                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                      <Chip
                        label={environment.statusMeta.label}
                        color={environment.statusMeta.color}
                        size="small"
                        sx={{
                          backgroundColor: environment.statusMeta.backgroundColor,
                          color: environment.statusMeta.textColor,
                          fontWeight: 700,
                        }}
                      />
                      <Chip label={environment.enabled ? "Enabled" : "Disabled"} color={environment.enabled ? "success" : "default"} size="small" />
                    </Stack>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Base URL: {environment.baseUrl}
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
                    <Button size="small" variant="outlined" startIcon={<Edit />} onClick={() => openEditEnvironmentDialog(application.environments.find((item) => Number(item.id) === Number(environment.id)))}>
                      Edit environment
                    </Button>
                    <Button size="small" variant="outlined" color="error" startIcon={<Delete />} onClick={() => handleDeleteEnvironment(environment.id)}>
                      Delete environment
                    </Button>
                  </Stack>

                  <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, backgroundColor: "rgba(15, 23, 42, 0.03)", border: "1px solid rgba(148, 163, 184, 0.2)" }}>
                    <Typography variant="caption" color="text.secondary">Environment health</Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mt: 0.7 }}>
                      <Typography variant="body2" fontWeight={600}>{environment.message || "No health details reported."}</Typography>
                      {environment.latencyMs ? (
                        <Typography variant="body2" color="text.secondary">{environment.latencyMs} ms</Typography>
                      ) : null}
                    </Stack>
                    {environment.checkedAt ? (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                        Last checked: {new Date(environment.checkedAt).toLocaleString()}
                      </Typography>
                    ) : null}
                  </Box>

                  {environment.components.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No components have been registered for this environment.</Alert>
                  ) : (
                    <Stack spacing={1.5}>
                      {environment.components.map((component) => {
                        const componentHealth = component.health || {};
                        const componentStatusMeta = getHealthStatusMeta(componentHealth.status);

                        return (
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
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  label={componentStatusMeta.label}
                                  size="small"
                                  color={componentStatusMeta.color}
                                  sx={{
                                    backgroundColor: componentStatusMeta.backgroundColor,
                                    color: componentStatusMeta.textColor,
                                    fontWeight: 700,
                                  }}
                                />
                                <Chip label={component.is_critical ?? component.isCritical ? "Critical" : "Standard"} size="small" color={component.is_critical ?? component.isCritical ? "error" : "default"} />
                              </Stack>
                            </Stack>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {component.component_type || component.componentType} · {component.technology || "Technology not set"} {component.version || ""}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              {(component.host_name || component.hostName || "-")}:{component.port || "-"}
                            </Typography>

                            {component.endpoint ? (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Endpoint: {component.endpoint}
                              </Typography>
                            ) : null}

                            {componentHealth.message ? (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Health: {componentHealth.message}
                              </Typography>
                            ) : null}

                            {(componentHealth.latencyMs || componentHealth.code) ? (
                              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1 }}>
                                {componentHealth.code ? (
                                  <Typography variant="caption" color="text.secondary">Code: {componentHealth.code}</Typography>
                                ) : null}
                                {componentHealth.latencyMs ? (
                                  <Typography variant="caption" color="text.secondary">Latency: {componentHealth.latencyMs} ms</Typography>
                                ) : null}
                              </Stack>
                            ) : null}

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }}>
                              <Button size="small" variant="outlined" startIcon={<Edit />} onClick={() => openEditComponentDialog(environment.id, component)}>
                                Edit component
                              </Button>
                              <Button size="small" variant="outlined" color="error" startIcon={<Delete />} onClick={() => handleDeleteComponent(component.id)}>
                                Delete component
                              </Button>
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={appDialogOpen} onClose={() => setAppDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Edit application</DialogTitle>
        <DialogContent>
          <Box component="form" id="application-edit-form" onSubmit={handleSaveApplication} noValidate>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Application name" value={appForm.name} onChange={(event) => setAppForm((prev) => ({ ...prev, name: event.target.value }))} fullWidth required />
              <TextField label="Application code" value={appForm.code} onChange={(event) => setAppForm((prev) => ({ ...prev, code: event.target.value }))} fullWidth required />
              <TextField label="Description" value={appForm.description} onChange={(event) => setAppForm((prev) => ({ ...prev, description: event.target.value }))} fullWidth multiline rows={3} required />
              <TextField label="Owner team" value={appForm.ownerTeam} onChange={(event) => setAppForm((prev) => ({ ...prev, ownerTeam: event.target.value }))} fullWidth required />
              <TextField label="Documentation URL" value={appForm.documentationUrl} onChange={(event) => setAppForm((prev) => ({ ...prev, documentationUrl: event.target.value }))} fullWidth required />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAppDialogOpen(false)} disabled={submitting}>Cancel</Button>
          <Button type="submit" form="application-edit-form" variant="contained" startIcon={<SaveOutlined />} disabled={submitting}>
            {submitting ? "Saving..." : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={environmentDialogOpen} onClose={() => setEnvironmentDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingEnvironmentId ? "Edit environment" : "Add environment"}</DialogTitle>
        <DialogContent>
          <Box component="form" id="environment-form" onSubmit={handleSaveEnvironment} noValidate>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Environment</InputLabel>
                  <Select label="Environment" value={environmentForm.name} onChange={(event) => setEnvironmentForm((prev) => ({ ...prev, name: event.target.value }))}>
                    <MenuItem value="PRODUCTION">PRODUCTION</MenuItem>
                    <MenuItem value="PRE_PRODUCTION">PRE_PRODUCTION</MenuItem>
                    <MenuItem value="STAGING">STAGING</MenuItem>
                    <MenuItem value="QA">QA</MenuItem>
                    <MenuItem value="DEVELOPMENT">DEVELOPMENT</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Base URL" value={environmentForm.baseUrl} onChange={(event) => setEnvironmentForm((prev) => ({ ...prev, baseUrl: event.target.value }))} fullWidth required />
              </Stack>

              <Button variant="outlined" color={environmentForm.enabled ? "success" : "inherit"} onClick={() => setEnvironmentForm((prev) => ({ ...prev, enabled: !prev.enabled }))}>
                {environmentForm.enabled ? "Enabled" : "Disabled"}
              </Button>

              {!editingEnvironmentId ? (
                <Box sx={{ p: 1.8, border: "1px solid rgba(148,163,184,0.25)", borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Initial component</Typography>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField label="Component name" value={environmentForm.componentName} onChange={(event) => setEnvironmentForm((prev) => ({ ...prev, componentName: event.target.value }))} fullWidth required />
                    <FormControl fullWidth>
                      <InputLabel>Component type</InputLabel>
                      <Select label="Component type" value={environmentForm.componentType} onChange={(event) => setEnvironmentForm((prev) => ({ ...prev, componentType: event.target.value }))}>
                        <MenuItem value="APPLICATION_SERVER">APPLICATION_SERVER</MenuItem>
                        <MenuItem value="DATABASE">DATABASE</MenuItem>
                        <MenuItem value="INTERFACE">INTERFACE</MenuItem>
                        <MenuItem value="CACHE">CACHE</MenuItem>
                        <MenuItem value="MESSAGE_BROKER">MESSAGE_BROKER</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
                    <TextField label="Endpoint" value={environmentForm.endpoint} onChange={(event) => setEnvironmentForm((prev) => ({ ...prev, endpoint: event.target.value }))} fullWidth />
                    <TextField label="Host name" value={environmentForm.hostName} onChange={(event) => setEnvironmentForm((prev) => ({ ...prev, hostName: event.target.value }))} fullWidth />
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
                    <TextField label="Port" type="number" value={environmentForm.port} onChange={(event) => setEnvironmentForm((prev) => ({ ...prev, port: event.target.value }))} fullWidth />
                    <TextField label="Technology" value={environmentForm.technology} onChange={(event) => setEnvironmentForm((prev) => ({ ...prev, technology: event.target.value }))} fullWidth />
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
                    <TextField label="Version" value={environmentForm.version} onChange={(event) => setEnvironmentForm((prev) => ({ ...prev, version: event.target.value }))} fullWidth />
                    <Button variant="outlined" color={environmentForm.isCritical ? "error" : "inherit"} onClick={() => setEnvironmentForm((prev) => ({ ...prev, isCritical: !prev.isCritical }))}>
                      {environmentForm.isCritical ? "Critical" : "Standard"}
                    </Button>
                  </Stack>
                </Box>
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnvironmentDialogOpen(false)} disabled={submitting}>Cancel</Button>
          <Button type="submit" form="environment-form" variant="contained" startIcon={<SaveOutlined />} disabled={submitting}>
            {submitting ? "Saving..." : editingEnvironmentId ? "Update environment" : "Create environment"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={componentDialogOpen} onClose={() => setComponentDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingComponentId ? "Edit component" : "Add component"}</DialogTitle>
        <DialogContent>
          <Box component="form" id="component-form" onSubmit={handleSaveComponent} noValidate>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Environment</InputLabel>
                <Select label="Environment" value={componentForm.environmentId} onChange={(event) => setComponentForm((prev) => ({ ...prev, environmentId: event.target.value }))}>
                  {(application?.environments || []).map((environment) => (
                    <MenuItem key={environment.id} value={String(environment.id)}>
                      {environment.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Component name" value={componentForm.name} onChange={(event) => setComponentForm((prev) => ({ ...prev, name: event.target.value }))} fullWidth required />
                <FormControl fullWidth>
                  <InputLabel>Component type</InputLabel>
                  <Select label="Component type" value={componentForm.componentType} onChange={(event) => setComponentForm((prev) => ({ ...prev, componentType: event.target.value }))}>
                    <MenuItem value="APPLICATION_SERVER">APPLICATION_SERVER</MenuItem>
                    <MenuItem value="DATABASE">DATABASE</MenuItem>
                    <MenuItem value="INTERFACE">INTERFACE</MenuItem>
                    <MenuItem value="CACHE">CACHE</MenuItem>
                    <MenuItem value="MESSAGE_BROKER">MESSAGE_BROKER</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Endpoint" value={componentForm.endpoint} onChange={(event) => setComponentForm((prev) => ({ ...prev, endpoint: event.target.value }))} fullWidth />
                <TextField label="Host name" value={componentForm.hostName} onChange={(event) => setComponentForm((prev) => ({ ...prev, hostName: event.target.value }))} fullWidth />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Port" type="number" value={componentForm.port} onChange={(event) => setComponentForm((prev) => ({ ...prev, port: event.target.value }))} fullWidth />
                <TextField label="Technology" value={componentForm.technology} onChange={(event) => setComponentForm((prev) => ({ ...prev, technology: event.target.value }))} fullWidth />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Version" value={componentForm.version} onChange={(event) => setComponentForm((prev) => ({ ...prev, version: event.target.value }))} fullWidth />
                <Button variant="outlined" color={componentForm.isCritical ? "error" : "inherit"} onClick={() => setComponentForm((prev) => ({ ...prev, isCritical: !prev.isCritical }))}>
                  {componentForm.isCritical ? "Critical" : "Standard"}
                </Button>
              </Stack>

              <Button variant="outlined" color={componentForm.enabled ? "success" : "inherit"} onClick={() => setComponentForm((prev) => ({ ...prev, enabled: !prev.enabled }))}>
                {componentForm.enabled ? "Enabled" : "Disabled"}
              </Button>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComponentDialogOpen(false)} disabled={submitting}>Cancel</Button>
          <Button type="submit" form="component-form" variant="contained" startIcon={<SaveOutlined />} disabled={submitting}>
            {submitting ? "Saving..." : editingComponentId ? "Update component" : "Create component"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ApplicationDetailsPage;
