import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from "@mui/material/CircularProgress";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import Container from "@mui/material/Container";
import { useCurrentUser } from "../../context/CurrentUserContext";

interface NavLinkProps {
  to: string;
  label: string;
  icon: ReactNode;
}

function NavLink({ to, label, icon }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Button
      component={Link}
      to={to}
      startIcon={icon}
      color="inherit"
      sx={{
        opacity: isActive ? 1 : 0.75,
        fontWeight: isActive ? 700 : 500,
        borderBottom: isActive ? "2px solid" : "2px solid transparent",
        borderRadius: 0,
        py: 2,
      }}
    >
      {label}
    </Button>
  );
}

function CurrentUserSwitcher() {
  const { users, currentUserId, setCurrentUserId, loading } = useCurrentUser();

  if (loading) {
    return <CircularProgress size={20} sx={{ color: "white" }} />;
  }

  if (users.length === 0) {
    return (
      <Typography variant="body2" sx={{ opacity: 0.8 }}>
        No users found
      </Typography>
    );
  }

  const handleChange = (event: SelectChangeEvent<string>) => {
    setCurrentUserId(event.target.value);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel id="current-user-label" sx={{ color: "rgba(255,255,255,0.8)" }}>
        Acting as
      </InputLabel>
      <Select
        labelId="current-user-label"
        label="Acting as"
        value={currentUserId ?? ""}
        onChange={handleChange}
        sx={{
          color: "white",
          ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.4)" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.7)" },
          ".MuiSvgIcon-root": { color: "white" },
        }}
      >
        {users.map((user) => (
          <MenuItem key={user.id} value={user.id}>
            {user.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Box className="flex flex-col min-h-screen" sx={{ bgcolor: "background.default" }}>
      <AppBar position="sticky" color="primary" enableColorOnDark>
        <Toolbar className="gap-4">
          <Typography variant="h6" component="div" sx={{ mr: 2, whiteSpace: "nowrap" }}>
            Task Dashboard
          </Typography>
          <Box className="flex flex-1 items-stretch">
            <NavLink to="/" label="Dashboard" icon={<DashboardOutlinedIcon />} />
            <NavLink to="/tasks" label="Tasks" icon={<ChecklistOutlinedIcon />} />
          </Box>
          <CurrentUserSwitcher />
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" className="flex-1 w-full" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}

export default AppLayout;
