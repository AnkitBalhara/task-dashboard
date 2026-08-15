import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import Container from "@mui/material/Container";
import { alpha } from "@mui/material/styles";
import { useCurrentUser } from "@context/CurrentUserContext";
import UserFormDialog from "@components/users/UserFormDialog";
import type { User } from "@types";

interface NavLinkProps {
  to: string;
  label: string;
  icon: ReactNode;
}

function NavLink({ to, label, icon }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  return (
    <Button
      component={Link}
      to={to}
      startIcon={icon}
      color="inherit"
      sx={{
        px: 2,
        py: 1,
        borderRadius: 999,
        fontWeight: isActive ? 700 : 500,
        bgcolor: isActive ? "rgba(255,255,255,0.18)" : "transparent",
        "&:hover": {
          bgcolor: isActive ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.1)",
        },
      }}
    >
      {label}
    </Button>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function CurrentUserSwitcher() {
  const { users, currentUser, currentUserId, setCurrentUserId, loading, refetchUsers } = useCurrentUser();
  const [addOpen, setAddOpen] = useState(false);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setCurrentUserId(event.target.value);
  };

  const handleCreated = (user: User) => {
    refetchUsers();
    setCurrentUserId(user.id);
    setAddOpen(false);
  };

  return (
    <>
      <Box className="flex items-center gap-1.5">
        {loading ? (
          <CircularProgress size={20} sx={{ color: "white" }} />
        ) : (
          <Box
            className="flex items-center gap-2"
            sx={{
              bgcolor: "rgba(255,255,255,0.14)",
              borderRadius: 999,
              pl: 0.75,
              pr: 1.5,
              py: 0.5,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Avatar sx={{ width: 28, height: 28, fontSize: 13, bgcolor: "rgba(255,255,255,0.9)", color: "primary.dark" }}>
              {currentUser ? initials(currentUser.name) : "?"}
            </Avatar>
            {users.length === 0 ? (
              <Typography variant="body2" sx={{ opacity: 0.8, pr: 0.5 }}>
                No users found
              </Typography>
            ) : (
              <Select
                variant="standard"
                disableUnderline
                value={currentUserId ?? ""}
                onChange={handleChange}
                sx={{
                  color: "white",
                  fontWeight: 600,
                  fontSize: 14,
                  ".MuiSvgIcon-root": { color: "white" },
                }}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          </Box>
        )}
        <Tooltip title="Add person">
          <IconButton
            onClick={() => setAddOpen(true)}
            size="small"
            sx={{ color: "white", bgcolor: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <PersonAddAlt1Icon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <UserFormDialog open={addOpen} onClose={() => setAddOpen(false)} onCreated={handleCreated} />
    </>
  );
}

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Box className="flex flex-col min-h-screen" sx={{ bgcolor: "background.default" }}>
      <AppBar position="sticky" enableColorOnDark elevation={0}>
        <Toolbar className="gap-3" sx={{ minHeight: 68 }}>
          <Box className="flex items-center gap-2" sx={{ mr: 3 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha("#ffffff", 0.16),
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <SpaceDashboardRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="h6" component="div" sx={{ whiteSpace: "nowrap", fontWeight: 800, letterSpacing: "-0.01em" }}>
              Task Dashboard
            </Typography>
          </Box>
          <Box className="flex flex-1 items-center gap-1">
            <NavLink to="/" label="Dashboard" icon={<DashboardOutlinedIcon fontSize="small" />} />
            <NavLink to="/tasks" label="Tasks" icon={<ChecklistOutlinedIcon fontSize="small" />} />
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.75, mr: 0.5, display: { xs: "none", sm: "block" } }}>
            Acting as
          </Typography>
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
