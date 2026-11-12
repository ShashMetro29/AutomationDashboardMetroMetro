import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowForward, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { countries } from "../../../data/dummyData";

function CountryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredCountries = useMemo(() => {
    return countries.filter(
      (country) =>
        country.visible !== false &&
        country.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800}>
        Select Country
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Select a country to view configured applications and health status.
      </Typography>

      <TextField
        fullWidth
        placeholder="Search country..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ maxWidth: 500, mb: 3, bgcolor: "white" }}
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

      <Grid container spacing={3}>
        {filteredCountries.map((country) => (
          <Grid key={country.id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card
              sx={{
                borderRadius: 3,
                height: "100%",
                transition: "0.25s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 7,
                },
              }}
            >
              <CardActionArea
                sx={{ height: "100%" }}
                onClick={() => navigate(`/countries/${country.id}/apps`)}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography fontSize={45}>{country.flag}</Typography>
                    <ArrowForward color="action" />
                  </Stack>

                  <Typography variant="h6" fontWeight={800}>
                    {country.name}
                  </Typography>

                  <Typography color="text.secondary" variant="body2">
                    ISO code: {country.code}
                  </Typography>

                  <Stack direction="row" justifyContent="space-between" mt={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Applications
                      </Typography>
                      <Typography fontWeight={800}>
                        {country.applications}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Availability
                      </Typography>
                      <Typography fontWeight={800} color="success.main">
                        {country.availability}%
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Attention
                      </Typography>
                      <Typography fontWeight={800} color="warning.main">
                        {country.down + country.degraded}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredCountries.length === 0 && (
        <Card sx={{ mt: 3, p: 5, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="h6">No country found</Typography>
          <Typography color="text.secondary">
            Change the entered search value and try again.
          </Typography>
        </Card>
      )}
    </Box>
  );
}

export default CountryPage;