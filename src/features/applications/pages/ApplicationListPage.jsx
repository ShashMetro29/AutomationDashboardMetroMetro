import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
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
  Apps,
  Business,
  DescriptionOutlined,
  OpenInNew,
  Search,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";

import { getStoredAuthSession } from "../../../services/authService";
import { createApplication, getApplicationsByCountry } from "../../../services/applicationService";
import { getHealthStatusMeta, summarizeApplicationHealth } from "../utils/health";

const createEmptyComponent = () => ({
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

const createEmptyEnvironment = () => ({
  name: "PRODUCTION",
  baseUrl: "",
  enabled: true,
  components: [createEmptyComponent()],
});

const normalizeApplication = (application) => ({
  ...application,
  id: application.id ?? application.applicationId,
  countryId: Number(application.country_id ?? application.countryId ?? 0),
  ownerTeam: application.owner_team ?? application.ownerTeam ?? application.owner ?? "Operations",
  documentationUrl: application.documentation_url ?? application.documentationUrl ?? "",
  environments: Array.isArray(application.environments) ? application.environments : [],
  isActive: application.is_active ?? application.isActive ?? true,
});

const componentHasValue = (component) => {
  if (!component) {
    return false;
  }

  return Boolean(
    (component.name || "").trim() ||
      (component.endpoint || "").trim() ||
      (component.hostName || "").trim() ||
      (component.technology || "").trim() ||
      (component.version || "").trim()
  );
};

const environmentHasValue = (environment) => {
  if (!environment) {
    return false;
  }

  const hasEnvironmentData = Boolean((environment.name || "").trim() || (environment.baseUrl || "").trim());
  const hasComponentData = Array.isArray(environment.components)
    ? environment.components.some((component) => componentHasValue(component))
    : false;

  return hasEnvironmentData || hasComponentData;
};

function ApplicationListPage() {
  const navigate = useNavigate();
  const { countryId } = useParams();
  const session = getStoredAuthSession();

  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    countryId: "",
    name: "",
    code: "",
    description: "",
    ownerTeam: "",
    documentationUrl: "",
    environments: [createEmptyEnvironment()],
  });

  const resolvedCountryId = Number(countryId || session?.country?.id || 0);
  const selectedCountry = session?.country?.name || "Country";

  const fetchApplications = async () => {
    if (!resolvedCountryId) {
      setApplications([]);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await getApplicationsByCountry(resolvedCountryId);
      const normalized = Array.isArray(response)
        ? response.map((application) => normalizeApplication(application))
        : [];

      setApplications(normalized);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to load applications for this country."
      );
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [resolvedCountryId]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      countryId: resolvedCountryId ? String(resolvedCountryId) : "",
    }));
  }, [resolvedCountryId]);

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const countryMatches = !countryId || Number(application.countryId) === resolvedCountryId;
      const appName = String(application.name || "").toLowerCase();
      const ownerName = String(application.ownerTeam || "").toLowerCase();
      const searchText = search.toLowerCase();
      const searchMatches = appName.includes(searchText) || ownerName.includes(searchText);
      const healthStatus = summarizeApplicationHealth(application).status;
      const statusMatches = statusFilter === "ALL" || healthStatus === statusFilter;

      return countryMatches && searchMatches && statusMatches;
    });
  }, [applications, countryId, resolvedCountryId, search, statusFilter]);

  const handleMainFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateEnvironmentField = (environmentIndex, fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      environments: prev.environments.map((environment, index) =>
        index === environmentIndex ? { ...environment, [fieldName]: value } : environment
      ),
    }));
  };

  const updateComponentField = (environmentIndex, componentIndex, fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      environments: prev.environments.map((environment, envIndex) => {
        if (envIndex !== environmentIndex) {
          return environment;
        }

        return {
          ...environment,
          components: environment.components.map((component, compIndex) =>
            compIndex === componentIndex ? { ...component, [fieldName]: value } : component
          ),
        };
      }),
    }));
  };

  const addEnvironment = () => {
    setFormData((prev) => ({
      ...prev,
      environments: [...prev.environments, createEmptyEnvironment()],
    }));
  };

  const removeEnvironment = (environmentIndex) => {
    setFormData((prev) => ({
      ...prev,
      environments: prev.environments.filter((_, index) => index !== environmentIndex),
    }));
  };

  const addComponent = (environmentIndex) => {
    setFormData((prev) => ({
      ...prev,
      environments: prev.environments.map((environment, index) =>
        index === environmentIndex
          ? { ...environment, components: [...environment.components, createEmptyComponent()] }
          : environment
      ),
    }));
  };

  const removeComponent = (environmentIndex, componentIndex) => {
    setFormData((prev) => ({
      ...prev,
      environments: prev.environments.map((environment, envIndex) => {
        if (envIndex !== environmentIndex) {
          return environment;
        }

        const nextComponents = environment.components.filter((_, index) => index !== componentIndex);
        return {
          ...environment,
          components: nextComponents.length ? nextComponents : [createEmptyComponent()],
        };
      }),
    }));
  };

  const resetForm = () => {
    setFormData({
      countryId: resolvedCountryId ? String(resolvedCountryId) : "",
      name: "",
      code: "",
      description: "",
      ownerTeam: "",
      documentationUrl: "",
      environments: [createEmptyEnvironment()],
    });
  };

  const handleApplicationSubmit = async (event) => {
    event.preventDefault();

    if (!resolvedCountryId) {
      setErrorMessage("No country is linked to this user. Please log in again.");
      return;
    }

    const trimmedName = formData.name.trim();
    const trimmedCode = formData.code.trim();
    const trimmedDescription = formData.description.trim();
    const trimmedOwnerTeam = formData.ownerTeam.trim();
    const trimmedDocumentation = formData.documentationUrl.trim();

    if (!trimmedName || !trimmedCode || !trimmedDescription || !trimmedOwnerTeam || !trimmedDocumentation) {
      setErrorMessage("Please fill in all application details before creating this record.");
      return;
    }

    const filteredEnvironments = formData.environments
      .map((environment) => {
        const validComponents = (environment.components || []).filter((component) => componentHasValue(component));

        if (!validComponents.length) {
          return null;
        }

        return {
          name: String(environment.name || "PRODUCTION").trim() || "PRODUCTION",
          baseUrl: String(environment.baseUrl || "").trim(),
          enabled: Boolean(environment.enabled),
          components: validComponents.map((component) => ({
            name: String(component.name || "").trim(),
            componentType: component.componentType || "APPLICATION_SERVER",
            endpoint: component.endpoint ? String(component.endpoint).trim() : undefined,
            hostName: component.hostName ? String(component.hostName).trim() : undefined,
            port: component.port ? Number(component.port) : undefined,
            technology: component.technology ? String(component.technology).trim() : undefined,
            version: component.version ? String(component.version).trim() : undefined,
            isCritical: Boolean(component.isCritical),
            enabled: Boolean(component.enabled),
          })),
        };
      })
      .filter(Boolean);

    if (!filteredEnvironments.length) {
      setErrorMessage("Add at least one environment with a valid component before submitting the application.");
      return;
    }

    if (filteredEnvironments.some((environment) => !environment.baseUrl)) {
      setErrorMessage("Each environment needs a base URL so the environment can be monitored.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        countryId: Number(resolvedCountryId),
        name: trimmedName,
        code: trimmedCode,
        description: trimmedDescription,
        ownerTeam: trimmedOwnerTeam,
        documentationUrl: trimmedDocumentation,
        environments: filteredEnvironments,
      };

      await createApplication(payload);
      setSuccessMessage("Application, environments, and components were created successfully.");
      setDialogOpen(false);
      resetForm();
      await fetchApplications();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to create the application. Please review the values and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {selectedCountry ? `${selectedCountry} Applications` : "Applications"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
            Country-scoped application inventory and environment health overview.
          </Typography>
        </Box>

        <Button variant="contained" size="large" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
          New application
        </Button>
      </Stack>

      {errorMessage ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {errorMessage}
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {successMessage}
        </Alert>
      ) : null}

      <Card sx={{ p: 2.2, mb: 3, borderRadius: 3, boxShadow: "0 12px 26px rgba(15, 23, 42, 0.04)" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search application or team name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <MenuItem value="ALL">All statuses</MenuItem>
              <MenuItem value="UP">Healthy</MenuItem>
              <MenuItem value="DEGRADED">Degraded</MenuItem>
              <MenuItem value="DOWN">Down</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {loading ? (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filteredApplications.map((application) => {
            const componentCount = (application.environments || []).reduce(
              (total, environment) => total + (environment.components || []).length,
              0
            );
            const environmentCount = (application.environments || []).length;
            const healthSummary = summarizeApplicationHealth(application);
            const healthMeta = getHealthStatusMeta(healthSummary.status);
            const activeStatus = application.isActive ? "ACTIVE" : "INACTIVE";

            return (
              <Grid key={application.id} size={{ xs: 12, xl: 6 }}>
                <Card sx={{ height: "100%", borderRadius: 3, overflow: "hidden", boxShadow: "0 18px 34px rgba(15, 23, 42, 0.08)", border: "1px solid rgba(148, 163, 184, 0.2)" }}>
                  <CardContent sx={{ p: 2.6 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 52, height: 52, borderRadius: 3, background: "linear-gradient(135deg, #1769aa 0%, #42a5f5 100%)", display: "grid", placeItems: "center", color: "#fff" }}>
                          <Apps />
                        </Box>

                        <Box>
                          <Typography variant="h6" fontWeight={800}>
                            {application.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.ownerTeam}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent="flex-end">
                        <Chip
                          label={healthMeta.label}
                          color={healthMeta.color}
                          size="small"
                          sx={{
                            backgroundColor: healthMeta.backgroundColor,
                            color: healthMeta.textColor,
                            fontWeight: 700,
                          }}
                        />
                        <Chip label={activeStatus} color={application.isActive ? "success" : "default"} size="small" />
                        <IconButton color="primary" onClick={() => navigate(`/applications/${application.id}`)} aria-label="Open application details">
                          <OpenInNew />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2.2, minHeight: 42 }}>
                      {healthSummary.message || application.description || "No description provided."}
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 0.2 }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ p: 1.4, borderRadius: 2, backgroundColor: "rgba(25, 118, 210, 0.05)", border: "1px solid rgba(25,118,210,0.12)" }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Business fontSize="small" color="primary" />
                            <Typography variant="caption" color="text.secondary">Code</Typography>
                          </Stack>
                          <Typography variant="subtitle2" sx={{ mt: 0.6 }}>
                            {application.code || "-"}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ p: 1.4, borderRadius: 2, backgroundColor: "rgba(76, 175, 80, 0.06)", border: "1px solid rgba(76,175,80,0.12)" }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <DescriptionOutlined fontSize="small" color="success" />
                            <Typography variant="caption" color="text.secondary">Environment health</Typography>
                          </Stack>
                          <Typography variant="subtitle2" sx={{ mt: 0.6 }}>
                            {environmentCount} configured · {healthSummary.healthyEnvironmentCount}/{environmentCount} healthy
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mt: 2.2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Components: <strong>{componentCount}</strong>
                      </Typography>

                      {application.documentationUrl ? (
                        <Link href={application.documentationUrl} target="_blank" rel="noreferrer" underline="hover" sx={{ fontSize: 13 }}>
                          View documentation
                        </Link>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No docs link
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {!loading && filteredApplications.length === 0 && (
        <Card sx={{ p: 4, textAlign: "center", borderRadius: 3, border: "1px dashed rgba(148,163,184,0.6)" }}>
          <Typography variant="h6" fontWeight={700}>No applications found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create the first application for this country using the button above.
          </Typography>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle sx={{ pb: 1.5 }}>Create application</DialogTitle>

        <DialogContent>
          <Box component="form" id="create-application-form" onSubmit={handleApplicationSubmit} noValidate>
            <Stack spacing={2.8} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.4 }}>
                  Application details
                </Typography>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <TextField label="Application name" name="name" value={formData.name} onChange={handleMainFieldChange} fullWidth required />
                  <TextField label="Application code" name="code" value={formData.code} onChange={handleMainFieldChange} fullWidth required />
                </Stack>

                <TextField label="Description" name="description" value={formData.description} onChange={handleMainFieldChange} fullWidth multiline rows={3} required sx={{ mt: 2 }} />

                <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
                  <TextField label="Owner team" name="ownerTeam" value={formData.ownerTeam} onChange={handleMainFieldChange} fullWidth required />
                  <TextField label="Documentation URL" name="documentationUrl" value={formData.documentationUrl} onChange={handleMainFieldChange} fullWidth required />
                </Stack>
              </Box>

              {formData.environments.map((environment, environmentIndex) => (
                <Box key={`environment-${environmentIndex}`} sx={{ p: 2, border: "1px solid rgba(148,163,184,0.35)", borderRadius: 3, backgroundColor: "rgba(15, 23, 42, 0.012)" }}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={800}>
                      Environment {environmentIndex + 1}
                    </Typography>
                    {formData.environments.length > 1 ? (
                      <Button color="error" size="small" onClick={() => removeEnvironment(environmentIndex)}>
                        Remove environment
                      </Button>
                    ) : null}
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>Environment</InputLabel>
                      <Select label="Environment" value={environment.name} onChange={(event) => updateEnvironmentField(environmentIndex, "name", event.target.value)}>
                        <MenuItem value="PRODUCTION">PRODUCTION</MenuItem>
                        <MenuItem value="PRE_PRODUCTION">PRE_PRODUCTION</MenuItem>
                        <MenuItem value="STAGING">STAGING</MenuItem>
                        <MenuItem value="QA">QA</MenuItem>
                        <MenuItem value="DEVELOPMENT">DEVELOPMENT</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField label="Base URL" value={environment.baseUrl} onChange={(event) => updateEnvironmentField(environmentIndex, "baseUrl", event.target.value)} fullWidth required />
                  </Stack>

                  <FormControlLabel
                    control={<Checkbox checked={Boolean(environment.enabled)} onChange={(event) => updateEnvironmentField(environmentIndex, "enabled", event.target.checked)} color="primary" />}
                    label="Environment enabled"
                    sx={{ mt: 1 }}
                  />

                  <Box sx={{ mt: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.4 }}>
                      <Typography variant="subtitle2" fontWeight={800}>Components</Typography>
                      <Button size="small" variant="outlined" startIcon={<Add />} onClick={() => addComponent(environmentIndex)}>
                        Add component
                      </Button>
                    </Stack>

                    <Stack spacing={2}>
                      {environment.components.map((component, componentIndex) => (
                        <Box key={`component-${environmentIndex}-${componentIndex}`} sx={{ p: 1.6, border: "1px solid rgba(148,163,184,0.25)", borderRadius: 2, backgroundColor: "rgba(255,255,255,0.7)" }}>
                          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mb: 1.2 }}>
                            <Typography variant="subtitle2" fontWeight={700}>Component {componentIndex + 1}</Typography>
                            {environment.components.length > 1 ? (
                              <Button color="error" size="small" onClick={() => removeComponent(environmentIndex, componentIndex)}>
                                Remove
                              </Button>
                            ) : null}
                          </Stack>

                          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <TextField label="Component name" value={component.name} onChange={(event) => updateComponentField(environmentIndex, componentIndex, "name", event.target.value)} fullWidth required />
                            <FormControl fullWidth>
                              <InputLabel>Component type</InputLabel>
                              <Select label="Component type" value={component.componentType} onChange={(event) => updateComponentField(environmentIndex, componentIndex, "componentType", event.target.value)}>
                                <MenuItem value="APPLICATION_SERVER">APPLICATION_SERVER</MenuItem>
                                <MenuItem value="DATABASE">DATABASE</MenuItem>
                                <MenuItem value="INTERFACE">INTERFACE</MenuItem>
                                <MenuItem value="CACHE">CACHE</MenuItem>
                                <MenuItem value="MESSAGE_BROKER">MESSAGE_BROKER</MenuItem>
                              </Select>
                            </FormControl>
                          </Stack>

                          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
                            <TextField label="Endpoint" value={component.endpoint || ""} onChange={(event) => updateComponentField(environmentIndex, componentIndex, "endpoint", event.target.value)} fullWidth />
                            <TextField label="Host name" value={component.hostName || ""} onChange={(event) => updateComponentField(environmentIndex, componentIndex, "hostName", event.target.value)} fullWidth />
                          </Stack>

                          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
                            <TextField label="Port" type="number" value={component.port || ""} onChange={(event) => updateComponentField(environmentIndex, componentIndex, "port", event.target.value)} fullWidth />
                            <TextField label="Technology" value={component.technology || ""} onChange={(event) => updateComponentField(environmentIndex, componentIndex, "technology", event.target.value)} fullWidth />
                          </Stack>

                          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
                            <TextField label="Version" value={component.version || ""} onChange={(event) => updateComponentField(environmentIndex, componentIndex, "version", event.target.value)} fullWidth />
                            <FormControlLabel
                              control={<Checkbox checked={Boolean(component.isCritical)} onChange={(event) => updateComponentField(environmentIndex, componentIndex, "isCritical", event.target.checked)} color="primary" />}
                              label="Critical"
                            />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              ))}

              <Button variant="outlined" startIcon={<Add />} onClick={addEnvironment}>
                Add environment
              </Button>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-application-form" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={18} color="inherit" /> : "Create application"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ApplicationListPage;
