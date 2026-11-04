import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  Apps,
  Delete,
  Edit,
  OpenInNew,
  Search,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import StatusChip from "../../../components/StatusChip";
import { applications, countries } from "../../../data/dummyData";

function ApplicationListPage() {
  const navigate = useNavigate();
  const { countryId } = useParams();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedCountry = countries.find(
    (country) => country.id === countryId
  );

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const countryMatches = countryId
        ? application.countryId === countryId
        : true;

      const searchMatches =
        application.name.toLowerCase().includes(search.toLowerCase()) ||
        application.owner.toLowerCase().includes(search.toLowerCase());

      const statusMatches =
        statusFilter === "ALL" ||
        application.productionStatus === statusFilter;

      return countryMatches && searchMatches && statusMatches;
    });
  }, [countryId, search, statusFilter]);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {selectedCountry
              ? `${selectedCountry.flag} ${selectedCountry.name} Applications`
              : "All Applications"}
          </Typography>

          <Typography color="text.secondary">
            View and manage application health configurations.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Add application
        </Button>
      </Stack>

      <Card sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by application or owner..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Production status</InputLabel>
            <Select
              label="Production status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <MenuItem value="ALL">All statuses</MenuItem>
              <MenuItem value="UP">Up</MenuItem>
              <MenuItem value="DEGRADED">Degraded</MenuItem>
              <MenuItem value="DOWN">Down</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      <Grid container spacing={2.5}>
        {filteredApplications.map((application) => (
          <Grid key={application.id} size={{ xs: 12, xl: 6 }}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 3,
                transition: "0.2s",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                gap={2}
              >
                <Stack direction="row" gap={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      bgcolor: "primary.light",
                      color: "primary.contrastText",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Apps />
                  </Box>

                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      {application.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {application.owner}
                    </Typography>
                  </Box>
                </Stack>

                <Box>
                  <Tooltip title="Open details">
                    <IconButton
                      color="primary"
                      onClick={() =>
                        navigate(`/applications/${application.id}`)
                      }
                    >
                      <OpenInNew />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit application">
                    <IconButton>
                      <Edit />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete application">
                    <IconButton color="error">
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>

              <Typography color="text.secondary" sx={{ mt: 2 }}>
                {application.description}
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Production
                  </Typography>
                  <Box mt={0.5}>
                    <StatusChip status={application.productionStatus} />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Pre-production
                  </Typography>
                  <Box mt={0.5}>
                    <StatusChip status={application.preProductionStatus} />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Database
                  </Typography>
                  <Box mt={0.5}>
                    <StatusChip status={application.databaseStatus} />
                  </Box>
                </Grid>
              </Grid>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mt={2.5}
              >
                <Typography variant="body2">
                  Response: <strong>{application.responseTime} ms</strong>
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Checked {application.lastChecked}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredApplications.length === 0 && (
        <Card sx={{ p: 5, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="h6">No applications found</Typography>
          <Typography color="text.secondary">
            Change the search text or status filter.
          </Typography>
        </Card>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add new application</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Application name" fullWidth required />
            <TextField label="Owner or team" fullWidth required />
            <TextField label="Description" fullWidth multiline rows={3} />
            <TextField label="Production health URL" fullWidth />
            <TextField label="Pre-production health URL" fullWidth />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => setDialogOpen(false)}
          >
            Create dummy application
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ApplicationListPage;