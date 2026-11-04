import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";

import App from "./app/App";

const theme = createTheme({
  palette: {
    primary: {
      main: "#002D72",
      dark: "#001E4D",
      light: "#EAF2FF",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "rgb(255, 237, 0)",
      dark: "#E6D500",
      contrastText: "#002D72",
    },
    background: {
      default: "#F4F7FB",
      paper: "#FFFFFF",
    },
    success: {
      main: "#168A45",
    },
    warning: {
      main: "#DB7200",
    },
    error: {
      main: "#C62828",
    },
  },

  typography: {
    fontFamily: '"Arial", "Roboto", sans-serif',
    button: {
      textTransform: "none",
      fontWeight: 800,
    },
  },

  shape: {
    borderRadius: 10,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 40,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },

    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          backgroundColor: "#F4F7FB",
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);