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
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Apps,
  Dashboard,
  Flag,
  HealthAndSafety,
  Logout,
  Menu as MenuIcon,
  Notifications,
  Person,
  Settings,
} from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 260;

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: <Dashboard /> },
  { label: "Countries", path: "/countries", icon: <Flag /> },
  { label: "Applications", path: "/applications", icon: <Apps /> },
];

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const drawer = (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#101828",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar sx={{ gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "#1976d2" }}>
          <HealthAndSafety />
        </Avatar>

        <Box>
          <Typography fontWeight={800}>Health Checkup</Typography>
          <Typography variant="caption" sx={{ color: "#98a2b3" }}>
            Monitoring Portal
          </Typography>
        </Box>
      </Toolbar>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.map((item) => {
          const selected =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);

          return (
            <ListItemButton
              key={item.label}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                mb: 0.75,
                borderRadius: 2,
                "&.Mui-selected": {
                  bgcolor: "#1976d2",
                  "&:hover": { bgcolor: "#1565c0" },
                },
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 42 }}>
                {item.icon}
              </ListItemIcon>

              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: "auto", p: 2 }}>
        <Divider
          sx={{ mb: 2, borderColor: "rgba(255,255,255,0.1)" }}
        />

        <Typography
          variant="caption"
          sx={{ display: "block", color: "#98a2b3" }}
        >
          Demo environment
        </Typography>

        <Typography variant="caption" sx={{ color: "#12b76a" }}>
          ● Monitoring active
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f7fb" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "white",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 1, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography fontWeight={700}>Automatic Health Checkup</Typography>
            <Typography variant="caption" color="text.secondary">
              Centralized application monitoring
            </Typography>
          </Box>

          <Tooltip title="Notifications">
            <IconButton>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <IconButton
            sx={{ ml: 1 }}
            onClick={(event) => setProfileAnchor(event.currentTarget)}
          >
            <Avatar sx={{ width: 36, height: 36 }}>SK</Avatar>
          </IconButton>

          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={() => setProfileAnchor(null)}
          >
            <MenuItem>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              My profile
            </MenuItem>

            <MenuItem>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>

            <Divider />

            <MenuItem onClick={() => navigate("/")}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            border: 0,
          },
        }}
      >
        {drawer}
      </Drawer>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          p: { xs: 2, sm: 3 },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default AppLayout;