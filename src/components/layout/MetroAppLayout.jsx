import { useState } from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  AppsRounded,
  DashboardRounded,
  FlagRounded,
  HealthAndSafetyRounded,
  LogoutRounded,
  MenuRounded,
  NotificationsRounded,
  PersonRounded,
  SettingsRounded,
} from "@mui/icons-material";

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import MakroLogo from "../../assets/Makro_logo.svg";
import {
  clearStoredAuthSession,
  getAuthUser,
  getStoredAuthSession,
  getUserDisplayName,
  getUserInitials,
} from "../../services/authService";

const DRAWER_WIDTH = 260;

const COLORS = {
  metroBlue: "#002D72",
  metroBlueDark: "#001E4D",
  metroYellow: "rgb(255, 237, 0)",
  pageBackground: "#F4F7FB",
  lightBlue: "#EAF2FF",
};

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardRounded />,
  },
  {
    label: "Countries",
    path: "/countries",
    icon: <FlagRounded />,
  },
  {
    label: "Applications",
    path: "/applications",
    icon: <AppsRounded />,
  },
];

function MetroBrand() {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{ minWidth: 0 }}
      justifyContent="center"
    >
      <Box
        component="img"
        src={MakroLogo}
        alt="Makro logo"
        sx={{
          width: 142,
          height: "auto",
          display: "block",
          flexShrink: 0,
          filter: "drop-shadow(0 0 0 rgba(0,0,0,0))",
        }}
      />

      {/* <Box sx={{ minWidth: 0 }}>
        <Typography
          noWrap
          sx={{
            color: "#FFFFFF",
            fontSize: "0.95rem",
            fontWeight: 800,
            lineHeight: 1.25,
          }}
        >
          Application Health Monitor
        </Typography>

        <Typography
          noWrap
          variant="caption"
          sx={{
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.2,
          }}
        >
          Automated Monitoring Portal
        </Typography>
      </Box> */}
    </Stack>
  );
}

function MetroAppLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const currentSession = getStoredAuthSession();
  const currentUser = getAuthUser();
  const profileName = getUserDisplayName(currentUser);
  const profileInitials = getUserInitials(currentUser);
  const userRole = currentSession?.country?.accessLevel
    ? currentSession.country.accessLevel
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : currentUser?.isSuperuser
      ? "Monitoring Administrator"
      : "Operations User";

  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    clearStoredAuthSession();
    setProfileAnchor(null);
    navigate("/login", { replace: true });
  };

  const isSelected = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: COLORS.metroBlue,
        color: "#FFFFFF",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "72px !important",
          px: 2.25,
          bgcolor: COLORS.metroBlueDark,
        }}
      >
        <MetroBrand />
      </Toolbar>

      <Box
        sx={{
          height: 5,
          bgcolor: COLORS.metroYellow,
          flexShrink: 0,
        }}
      />

      <Box sx={{ px: 2, pt: 2.5, pb: 1 }}>
        <Typography
          variant="overline"
          sx={{
            pl: 1.5,
            color: "rgba(255,255,255,0.55)",
            fontWeight: 700,
            letterSpacing: "0.12em",
          }}
        >
          Main navigation
        </Typography>
      </Box>

      <List sx={{ px: 1.5, py: 0.5 }}>
        {navigationItems.map((item) => {
          const selected = isSelected(item.path);

          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => handleNavigate(item.path)}
              sx={{
                minHeight: 48,
                mb: 0.75,
                px: 1.75,
                borderRadius: 2,
                color: selected
                  ? COLORS.metroBlue
                  : "rgba(255,255,255,0.83)",
                bgcolor: selected
                  ? `${COLORS.metroYellow} !important`
                  : "transparent",
                "&:hover": {
                  bgcolor: selected
                    ? COLORS.metroYellow
                    : "rgba(255,255,255,0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: selected ? 800 : 600,
                  fontSize: "0.94rem",
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: "auto", p: 2 }}>
        <Divider
          sx={{
            mb: 2,
            borderColor: "rgba(255,255,255,0.14)",
          }}
        />

        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.07)",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: 12,
              height: 12,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "#22C55E",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                border: "1px solid rgba(34,197,94,0.45)",
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{ color: "#FFFFFF", fontWeight: 700 }}
            >
              Monitoring active
            </Typography>

            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.6)" }}
            >
              All services operational
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: COLORS.pageBackground,
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: {
            xs: "100%",
            md: `calc(100% - ${DRAWER_WIDTH}px)`,
          },
          ml: {
            xs: 0,
            md: `${DRAWER_WIDTH}px`,
          },
          bgcolor: COLORS.metroBlue,
          color: "#FFFFFF",
          borderBottom: `4px solid ${COLORS.metroYellow}`,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            minHeight: "72px !important",
            px: {
              xs: 1.5,
              sm: 2.5,
              lg: 3.5,
            },
          }}
        >
          <IconButton
            color="inherit"
            onClick={() => setMobileOpen(true)}
            sx={{
              display: {
                xs: "inline-flex",
                md: "none",
              },
              mr: 1,
            }}
          >
            <MenuRounded />
          </IconButton>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{ flexGrow: 1, minWidth: 0 }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                display: {
                  xs: "none",
                  sm: "grid",
                },
                placeItems: "center",
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.1)",
                color: COLORS.metroYellow,
              }}
            >
              <HealthAndSafetyRounded />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                sx={{
                  fontSize: {
                    xs: "0.92rem",
                    sm: "1.05rem",
                  },
                  fontWeight: 800,
                }}
              >
                METRO Application Health Monitor
              </Typography>

              <Typography
                noWrap
                variant="caption"
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Centralized operational monitoring
              </Typography>
            </Box>
          </Stack>

          <Tooltip title="Notifications">
            <IconButton
              sx={{
                color: "#FFFFFF",
                mr: {
                  xs: 0.5,
                  sm: 1,
                },
              }}
            >
              <Badge
                badgeContent={3}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: COLORS.metroYellow,
                    color: COLORS.metroBlue,
                    fontWeight: 800,
                  },
                }}
              >
                <NotificationsRounded />
              </Badge>
            </IconButton>
          </Tooltip>

          <Divider
            orientation="vertical"
            flexItem
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
              mx: 1,
              my: 2,
              borderColor: "rgba(255,255,255,0.2)",
            }}
          />

          <IconButton
            onClick={(event) => setProfileAnchor(event.currentTarget)}
            sx={{
              p: 0.5,
              borderRadius: 2,
              color: "#FFFFFF",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: COLORS.metroYellow,
                  color: COLORS.metroBlue,
                  fontSize: "0.85rem",
                  fontWeight: 900,
                }}
              >
                {profileInitials}
              </Avatar>

              <Box
                sx={{
                  display: {
                    xs: "none",
                    lg: "block",
                  },
                  minWidth: 0,
                  textAlign: "left",
                }}
              >
                <Typography
                  noWrap
                  variant="body2"
                  sx={{ color: "#FFFFFF", fontWeight: 700 }}
                >
                  {profileName}
                </Typography>

                <Typography
                  noWrap
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {userRole}
                </Typography>
              </Box>
            </Stack>
          </IconButton>

          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={() => setProfileAnchor(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1.25,
                  minWidth: 220,
                  borderRadius: 2,
                  boxShadow: "0 12px 32px rgba(15,23,42,0.16)",
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.25 }}>
              <Typography variant="body2" fontWeight={800}>
                {profileName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userRole}
              </Typography>
            </Box>

            <Divider />

            <MenuItem>
              <ListItemIcon>
                <PersonRounded fontSize="small" />
              </ListItemIcon>
              My profile
            </MenuItem>

            <MenuItem>
              <ListItemIcon>
                <SettingsRounded fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={handleLogout}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon sx={{ color: "error.main" }}>
                <LogoutRounded fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: {
            md: DRAWER_WIDTH,
          },
          flexShrink: {
            md: 0,
          },
        }}
      >
        <Drawer
          variant={desktop ? "permanent" : "temporary"}
          open={desktop || mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              border: 0,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: {
            xs: "100%",
            md: `calc(100% - ${DRAWER_WIDTH}px)`,
          },
          minHeight: "100vh",
          pt: "72px",
          bgcolor: COLORS.pageBackground,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default MetroAppLayout;