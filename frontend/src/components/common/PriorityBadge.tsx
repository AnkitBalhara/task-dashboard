import Chip, { ChipProps } from "@mui/material/Chip";
import type { TaskPriority } from "@types";

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const PRIORITY_COLORS: Record<TaskPriority, ChipProps["color"]> = {
  LOW: "default",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "error",
};

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: ChipProps["size"];
}

export function PriorityBadge({ priority, size = "small" }: PriorityBadgeProps) {
  return (
    <Chip
      label={PRIORITY_LABELS[priority]}
      color={PRIORITY_COLORS[priority]}
      size={size}
      variant={priority === "LOW" ? "outlined" : "filled"}
    />
  );
}

export default PriorityBadge;
