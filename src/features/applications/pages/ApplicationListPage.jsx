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
import {
  createApplication,
  createComponent,
  createEnvironment,
  getApplicationsByCountry,
} from "../../../services/applicationService";

const initialFormState = {
  countryId: "",
  name: "",
  code: "",
  description: "",
  ownerTeam: "",
  documentationUrl: "",
  environmentName: "PRODUCTION",
  baseUrl: "",
  componentName: "",
  componentType: "DATABASE",
  hostName: "",
  port: "5432",
  technology: "",
  version: "",
  isCritical: true,
};

const normalizeApplication = (application) => ({
  ...application,
  id: application.id ?? application.applicationId,
  countryId: Number(application.country_id ?? application.countryId ?? 0),
  ownerTeam: application.owner_team ?? application.ownerTeam ?? application.owner ?? "Operations",
  documentationUrl: application.documentation_url ?? application.documentationUrl ?? "",
  environments: Array.isArray(application.environments) ? application.environments : [],
  isActive: application.is_active ?? application.isActive ?? true,
});

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
  const [formData, setFormData] = useState(initialFormState);

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
      const statusMatches =
        statusFilter === "ALL" ||
        String(application.isActive ? "ACTIVE" : "INACTIVE") === statusFilter;

      return countryMatches && searchMatches && statusMatches;
    });
  }, [applications, countryId, resolvedCountryId, search, statusFilter]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleApplicationSubmit = async (event) => {
    event.preventDefault();

    const requiredFields = [
      formData.name,
      formData.code,
      formData.description,
      formData.ownerTeam,
      formData.documentationUrl,
      formData.baseUrl,
      formData.componentName,
      formData.hostName,
      formData.technology,
      formData.version,
    ];

    if (requiredFields.some((field) => !String(field).trim())) {
      setErrorMessage("Please complete all the required application, environment, and component fields.");
      return;
    }

    if (!resolvedCountryId) {
      setErrorMessage("No country is linked to this user. Please log in again.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const applicationPayload = {
        countryId: Number(resolvedCountryId),
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        ownerTeam: formData.ownerTeam.trim(),
        documentationUrl: formData.documentationUrl.trim(),
      };

      const createdApplication = await createApplication(applicationPayload);
      const applicationId =
        createdApplication?.id ??
        createdApplication?.applicationId ??
        createdApplication?.data?.id ??
        createdApplication?.data?.applicationId;

      if (!applicationId) {
        throw new Error("Application was created without an ID.");
      }

      const createdEnvironment = await createEnvironment({
        applicationId: Number(applicationId),
        name: formData.environmentName,
        baseUrl: formData.baseUrl.trim(),
      });

      const environmentId =
        createdEnvironment?.id ??
        createdEnvironment?.environmentId ??
        createdEnvironment?.data?.id ??
        createdEnvironment?.data?.environmentId;

      if (!environmentId) {
        throw new Error("Environment was created without an ID.");
      }

      await createComponent({
        environmentId: Number(environmentId),
        name: formData.componentName.trim(),
        componentType: formData.componentType,
        hostName: formData.hostName.trim(),
        port: Number(formData.port),
        technology: formData.technology.trim(),
        version: formData.version.trim(),
        isCritical: Boolean(formData.isCritical),
      });

      setSuccessMessage("Application, environment, and component were created successfully.");
      setDialogOpen(false);
      setFormData(initialFormState);
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
          Add application
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
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
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
            const status = application.isActive ? "ACTIVE" : "INACTIVE";

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

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={status} color={application.isActive ? "success" : "default"} size="small" />
                        <IconButton color="primary" onClick={() => navigate(`/applications/${application.id}`)} aria-label="Open application details">
                          <OpenInNew />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2.2, minHeight: 42 }}>
                      {application.description || "No description provided."}
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
                            <Typography variant="caption" color="text.secondary">Environments</Typography>
                          </Stack>
                          <Typography variant="subtitle2" sx={{ mt: 0.6 }}>
                            {environmentCount} configured
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ pb: 1.5 }}>Create application</DialogTitle>

        <DialogContent>
          <Box component="form" id="create-application-form" onSubmit={handleApplicationSubmit} noValidate>
            <Stack spacing={2.8} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.4 }}>
                  Application details
                </Typography>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <TextField label="Application name" name="name" value={formData.name} onChange={handleChange} fullWidth required />
                  <TextField label="Application code" name="code" value={formData.code} onChange={handleChange} fullWidth required />
                </Stack>

                <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={3} required sx={{ mt: 2 }} />

                <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
                  <TextField label="Owner team" name="ownerTeam" value={formData.ownerTeam} onChange={handleChange} fullWidth required />
                  <TextField label="Documentation URL" name="documentationUrl" value={formData.documentationUrl} onChange={handleChange} fullWidth required />
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.4 }}>
                  Environment details
                </Typography>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Environment</InputLabel>
                    <Select label="Environment" name="environmentName" value={formData.environmentName} onChange={handleChange}>
                      <MenuItem value="PRODUCTION">PRODUCTION</MenuItem>
                      <MenuItem value="PRE_PRODUCTION">PRE_PRODUCTION</MenuItem>
                      <MenuItem value="STAGING">STAGING</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField label="Base URL" name="baseUrl" value={formData.baseUrl} onChange={handleChange} fullWidth required />
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.4 }}>
                  Component details
                </Typography>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <TextField label="Component name" name="componentName" value={formData.componentName} onChange={handleChange} fullWidth required />
                  <FormControl fullWidth>
                    <InputLabel>Component type</InputLabel>
                    <Select label="Component type" name="componentType" value={formData.componentType} onChange={handleChange}>
                      <MenuItem value="DATABASE">DATABASE</MenuItem>
                      <MenuItem value="API">API</MenuItem>
                      <MenuItem value="CACHE">CACHE</MenuItem>
                      <MenuItem value="MESSAGE_BROKER">MESSAGE_BROKER</MenuItem>
                      <MenuItem value="FRONTEND">FRONTEND</MenuItem>
                      <MenuItem value="BACKEND">BACKEND</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
                  <TextField label="Host name" name="hostName" value={formData.hostName} onChange={handleChange} fullWidth required />
                  <TextField label="Port" name="port" type="number" value={formData.port} onChange={handleChange} fullWidth required />
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
                  <TextField label="Technology" name="technology" value={formData.technology} onChange={handleChange} fullWidth required />
                  <TextField label="Version" name="version" value={formData.version} onChange={handleChange} fullWidth required />
                </Stack>

                <FormControlLabel
                  control={<Checkbox checked={formData.isCritical} onChange={handleChange} name="isCritical" color="primary" />}
                  label="This is a critical component"
                  sx={{ mt: 1 }}
                />
              </Box>
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