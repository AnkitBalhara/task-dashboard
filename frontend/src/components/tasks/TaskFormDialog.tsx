import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import tasksApi from "@api/tasksApi";
import useUsers from "@hooks/useUsers";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type CreateTaskInput,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@types";

interface TaskFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initialTask?: Task;
  onClose: () => void;
  onSaved: (task: Task) => void;
}

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  dueDate: string;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  BLOCKED: "Blocked",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

function toDateInputValue(dueDate: string | null | undefined): string {
  if (!dueDate) return "";
  return dueDate.slice(0, 10);
}

function emptyForm(): FormState {
  return {
    title: "",
    description: "",
    status: "PENDING",
    priority: "MEDIUM",
    assignedTo: "",
    dueDate: "",
  };
}

function formFromTask(task: Task): FormState {
  return {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    assignedTo: task.assignedTo ?? "",
    dueDate: toDateInputValue(task.dueDate),
  };
}

export function TaskFormDialog({ open, mode, initialTask, onClose, onSaved }: TaskFormDialogProps) {
  const { users, loading: usersLoading } = useUsers();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [titleError, setTitleError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(mode === "edit" && initialTask ? formFromTask(initialTask) : emptyForm());
    setTitleError(null);
    setSubmitError(null);
  }, [open, mode, initialTask]);

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "title" && titleError) setTitleError(null);
  };

  const validate = (): boolean => {
    if (!form.title.trim()) {
      setTitleError("Title is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const input: CreateTaskInput = {
        title: form.title.trim(),
        description: form.description.trim() ? form.description.trim() : null,
        status: form.status,
        priority: form.priority,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      };

      const saved =
        mode === "edit" && initialTask
          ? await tasksApi.update(initialTask.id, input)
          : await tasksApi.create(input);

      onSaved(saved);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === "edit" ? "Edit Task" : "New Task"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {submitError && <Alert severity="error">{submitError}</Alert>}

          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            error={Boolean(titleError)}
            helperText={titleError}
            required
            autoFocus
            fullWidth
          />

          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value as TaskStatus)}
              fullWidth
            >
              {TASK_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Priority"
              value={form.priority}
              onChange={(e) => handleChange("priority", e.target.value as TaskPriority)}
              fullWidth
            >
              {TASK_PRIORITIES.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label="Assignee"
              value={form.assignedTo}
              onChange={(e) => handleChange("assignedTo", e.target.value)}
              fullWidth
              disabled={usersLoading}
            >
              <MenuItem value="">
                <em>Unassigned</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? <CircularProgress size={20} color="inherit" /> : mode === "edit" ? "Save Changes" : "Create Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TaskFormDialog;
