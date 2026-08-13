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
  { key: "total", label: "Total Tasks", icon: AssignmentOutlinedIcon, color: "#2563eb" },
  { key: "pending", label: "Pending", icon: HourglassEmptyOutlinedIcon, color: "#64748b" },
  { key: "inProgress", label: "In Progress", icon: AutorenewOutlinedIcon, color: "#0284c7" },
  { key: "completed", label: "Completed", icon: CheckCircleOutlineIcon, color: "#16a34a" },
  { key: "blocked", label: "Blocked", icon: BlockOutlinedIcon, color: "#dc2626" },
  { key: "overdue", label: "Overdue", icon: EventBusyOutlinedIcon, color: "#d97706" },
  { key: "assignedToMe", label: "Assigned to Me", icon: PersonOutlineOutlinedIcon, color: "#7c3aed" },
];

function StatCard({ config, value, loading }: { config: StatCardConfig; value?: number; loading: boolean }) {
  const Icon = config.icon;
  return (
    <Card variant="outlined" className="h-full">
      <CardContent>
        <Box className="flex items-start justify-between">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {config.label}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={60} height={40} />
            ) : (
              <Typography variant="h4">{value ?? 0}</Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${config.color}1a`,
              color: config.color,
              borderRadius: "50%",
              width: 44,
              height: 44,
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
    <Box className="flex flex-col gap-4">
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

      <Card variant="outlined">
        <CardHeader
          avatar={<PublicOutlinedIcon color="action" />}
          title="Team Directory"
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
                      <Avatar>{initials(user.name)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
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
