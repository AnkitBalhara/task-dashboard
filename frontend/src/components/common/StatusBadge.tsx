import Chip, { ChipProps } from "@mui/material/Chip";
import type { TaskStatus } from "@types";

const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  BLOCKED: "Blocked",
};

const STATUS_COLORS: Record<TaskStatus, ChipProps["color"]> = {
  PENDING: "default",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  BLOCKED: "error",
};

interface StatusBadgeProps {
  status: TaskStatus;
  size?: ChipProps["size"];
}

export function StatusBadge({ status, size = "small" }: StatusBadgeProps) {
  return (
    <Chip
      label={STATUS_LABELS[status]}
      color={STATUS_COLORS[status]}
      size={size}
      variant={status === "PENDING" ? "outlined" : "filled"}
    />
  );
}

export default StatusBadge;
