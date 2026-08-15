import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import StatusBadge from "@components/common/StatusBadge";
import PriorityBadge from "@components/common/PriorityBadge";
import ConfirmDialog from "@components/common/ConfirmDialog";
import TaskFormDialog from "@components/tasks/TaskFormDialog";
import TaskCommentsPanel from "@components/tasks/TaskCommentsPanel";
import tasksApi from "@api/tasksApi";
import type { Task } from "@types";

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Box sx={{ mt: 0.5 }}>{children}</Box>
    </Box>
  );
}

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadTask = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    tasksApi
      .getById(id)
      .then(setTask)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const handleSaved = (updated: Task) => {
    setTask(updated);
    setEditOpen(false);
  };

  const handleDelete = async () => {
    if (!task) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await tasksApi.remove(task.id);
      navigate("/tasks");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete task");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !task) {
    return (
      <Box className="flex flex-col gap-4">
        <Alert severity="error">{error ?? "Task not found."}</Alert>
        <Button component={RouterLink} to="/tasks" startIcon={<ArrowBackIcon />} sx={{ alignSelf: "flex-start" }}>
          Back to tasks
        </Button>
      </Box>
    );
  }

  return (
    <Box className="flex flex-col gap-4">
      <Box>
        <Button component={RouterLink} to="/tasks" startIcon={<ArrowBackIcon />} size="small">
          Back to tasks
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3 }}>
        <Box className="flex items-start justify-between flex-wrap gap-3">
          <Box>
            <Typography variant="h5" gutterBottom fontWeight={800}>
              {task.title}
            </Typography>
            <Stack direction="row" spacing={1}>
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {task.isOverdue && <Chip label="Overdue" color="error" size="small" variant="outlined" />}
            </Stack>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit task">
              <IconButton onClick={() => setEditOpen(true)} sx={{ bgcolor: "action.hover" }}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete task">
              <IconButton onClick={() => setDeleteOpen(true)} color="error" sx={{ bgcolor: "action.hover" }}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box
          className="grid gap-4"
          sx={{ gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" } }}
        >
          <Field label="Assignee">
            <Typography variant="body2">{task.assignee?.name ?? "Unassigned"}</Typography>
          </Field>
          <Field label="Due Date">
            <Typography variant="body2" color={task.isOverdue ? "error.main" : "text.primary"}>
              {formatDate(task.dueDate)}
            </Typography>
          </Field>
          <Field label="Created">
            <Typography variant="body2">{formatDateTime(task.createdAt)}</Typography>
          </Field>
          <Field label="Last Updated">
            <Typography variant="body2">{formatDateTime(task.updatedAt)}</Typography>
          </Field>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Field label="Description">
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }} color={task.description ? "text.primary" : "text.secondary"}>
            {task.description || "No description provided."}
          </Typography>
        </Field>
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={700}>
          Comments
        </Typography>
        <TaskCommentsPanel taskId={task.id} />
      </Paper>

      <TaskFormDialog
        open={editOpen}
        mode="edit"
        initialTask={task}
        onClose={() => setEditOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete task"
        message={
          <>
            <Typography variant="body2" gutterBottom>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </Typography>
            {deleteError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {deleteError}
              </Alert>
            )}
          </>
        }
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </Box>
  );
}

export default TaskDetailPage;
