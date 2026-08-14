import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useCurrentUser } from "../context/CurrentUserContext";
import useDashboardStats from "../hooks/useDashboardStats";
import useExternalUsers from "../hooks/useExternalUsers";
import EmptyState from "../components/common/EmptyState";
import type { DashboardStats } from "../types";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface StatCardConfig {
  key: keyof DashboardStats;
  label: string;
  icon: SvgIconComponent;
  color: string;
}

const STAT_CARDS: StatCardConfig[] = [
  { key: "total", label: "Total Tasks", icon: AssignmentOutlinedIcon, color: "#4f46e5" },
  { key: "pending", label: "Pending", icon: HourglassEmptyOutlinedIcon, color: "#64748b" },
  { key: "inProgress", label: "In Progress", icon: AutorenewOutlinedIcon, color: "#0284c7" },
  { key: "completed", label: "Completed", icon: CheckCircleOutlineIcon, color: "#16a34a" },
  { key: "blocked", label: "Blocked", icon: BlockOutlinedIcon, color: "#dc2626" },
  { key: "overdue", label: "Overdue", icon: EventBusyOutlinedIcon, color: "#d97706" },
  { key: "assignedToMe", label: "Assigned to Me", icon: PersonOutlineOutlinedIcon, color: "#a855f7" },
];

function StatCard({ config, value, loading }: { config: StatCardConfig; value?: number; loading: boolean }) {
  const Icon = config.icon;
  return (
    <Card
      className="h-full"
      sx={{
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 12px 28px ${alpha(config.color, 0.18)}`,
        },
      }}
    >
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, bgcolor: config.color }} />
      <CardContent sx={{ pt: 2.75 }}>
        <Box className="flex items-start justify-between">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
              {config.label}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={60} height={44} />
            ) : (
              <Typography variant="h4">{value ?? 0}</Typography>
            )}
          </Box>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${alpha(config.color, 0.18)}, ${alpha(config.color, 0.08)})`,
              color: config.color,
              borderRadius: 3,
              width: 46,
              height: 46,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon fontSize="small" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { currentUserId, loading: userLoading } = useCurrentUser();
  const { stats, loading, error } = useDashboardStats(currentUserId ?? undefined);
  const { users: externalUsers, loading: externalLoading, error: externalError } = useExternalUsers();

  const isLoading = loading || userLoading;

  return (
    <Box className="flex flex-col gap-5">
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of all tasks across the team.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
        }}
      >
        {STAT_CARDS.map((config) => (
          <StatCard key={config.key} config={config} value={stats?.[config.key]} loading={isLoading} />
        ))}
      </Box>

      <Card>
        <CardHeader
          avatar={
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: (theme) => alpha(theme.palette.info.main, 0.12),
                color: "info.main",
              }}
            >
              <PublicOutlinedIcon fontSize="small" />
            </Box>
          }
          title="Team Directory"
          titleTypographyProps={{ fontWeight: 700 }}
          subheader="Live data from a public external API (JSONPlaceholder) — demonstrates third-party API integration."
        />
        <Divider />
        <CardContent sx={{ py: 0 }}>
          {externalError && (
            <Alert severity="error" sx={{ my: 2 }}>
              {externalError}
            </Alert>
          )}
          {externalLoading && (
            <List>
              {[0, 1, 2].map((i) => (
                <ListItem key={i}>
                  <ListItemAvatar>
                    <Skeleton variant="circular" width={40} height={40} />
                  </ListItemAvatar>
                  <ListItemText primary={<Skeleton width="40%" />} secondary={<Skeleton width="60%" />} />
                </ListItem>
              ))}
            </List>
          )}
          {!externalLoading && !externalError && externalUsers.length === 0 && (
            <Box sx={{ py: 2 }}>
              <EmptyState message="No external users returned." />
            </Box>
          )}
          {!externalLoading && !externalError && externalUsers.length > 0 && (
            <List disablePadding>
              {externalUsers.slice(0, 5).map((user, index) => (
                <Box key={user.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.14), color: "secondary.main", fontWeight: 700 }}>
                        {initials(user.name)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      primaryTypographyProps={{ fontWeight: 600 }}
                      secondary={`${user.email}${user.company ? ` · ${user.company}` : ""}`}
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default DashboardPage;
