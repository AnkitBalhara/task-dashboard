import { createTheme, alpha } from "@mui/material/styles";
import type { Shadows } from "@mui/material/styles";

const PRIMARY = "#4f46e5";
const SECONDARY = "#a855f7";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: PRIMARY,
      light: "#818cf8",
      dark: "#3730a3",
      contrastText: "#ffffff",
    },
    secondary: {
      main: SECONDARY,
    },
    background: {
      default: "#f4f5fb",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e1b2e",
      secondary: "#6b7280",
    },
    success: { main: "#16a34a" },
    warning: { main: "#d97706" },
    error: { main: "#dc2626" },
    info: { main: "#0284c7" },
    divider: alpha("#1e1b2e", 0.08),
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
    h4: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontWeight: 700,
    },
    subtitle2: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
    },
  },
  shadows: [
    "none",
    "0 1px 2px rgba(30,27,46,0.06)",
    "0 2px 6px rgba(30,27,46,0.06)",
    "0 4px 10px rgba(30,27,46,0.07)",
    "0 6px 16px rgba(30,27,46,0.08)",
    "0 8px 20px rgba(30,27,46,0.09)",
    "0 10px 24px rgba(30,27,46,0.1)",
    "0 12px 28px rgba(30,27,46,0.1)",
    "0 14px 32px rgba(30,27,46,0.11)",
    "0 16px 36px rgba(30,27,46,0.11)",
    "0 18px 40px rgba(30,27,46,0.12)",
    "0 20px 44px rgba(30,27,46,0.12)",
    "0 22px 48px rgba(30,27,46,0.12)",
    "0 24px 52px rgba(30,27,46,0.13)",
    "0 24px 52px rgba(30,27,46,0.13)",
    "0 24px 52px rgba(30,27,46,0.13)",
    "0 24px 52px rgba(30,27,46,0.13)",
    "0 24px 52px rgba(30,27,46,0.13)",
    "0 24px 52px rgba(30,27,46,0.13)",
    "0 24px 52px rgba(30,27,46,0.13)",
    "0 24px 52px rgba(30,27,46,0.13)",
    "0 24px 52px rgba(30,27,46,0.13)",
    "0 24px 52px rgba(30,27,46,0.13)",
    "0 24px 52px rgba(30,27,46,0.13)",
    "0 24px 52px rgba(30,27,46,0.13)",
  ] as unknown as Shadows,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            "radial-gradient(circle at 0% 0%, rgba(79,70,229,0.06), transparent 40%), radial-gradient(circle at 100% 0%, rgba(168,85,247,0.06), transparent 40%)",
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
        },
        contained: {
          boxShadow: "0 4px 12px rgba(79,70,229,0.25)",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(79,70,229,0.32)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        outlined: {
          borderColor: alpha("#1e1b2e", 0.08),
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${alpha("#1e1b2e", 0.06)}`,
          boxShadow: "0 2px 10px rgba(30,27,46,0.05)",
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(90deg, ${PRIMARY} 0%, #6d28d9 100%)`,
          boxShadow: "0 4px 20px rgba(79,70,229,0.25)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            fontWeight: 700,
            color: "#4b5563",
            backgroundColor: "#f8f8fc",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: alpha(PRIMARY, 0.04),
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
